import path from 'path';
import { fileURLToPath } from 'url';
import Recipe from '../models/recipe.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../middleware/asynchandler.middleware.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc Create a new recipe
// @route POST /api/v1/recipes
// @access Private
const createRecipe = asyncHandler(async (req, res, next) => {
  const { title, description, category, ingredients, instructions, cookingTime } = req.body;
  const userOwner = req.user._id;

  if (!title || !description || !ingredients || !instructions || !cookingTime) {
    return next(new ApiError(400, "Missing required fields"));
  }

  try {
    const parsedIngredients = JSON.parse(ingredients);

    const newRecipe = await Recipe.create({
      title,
      description,
      category,
      ingredients: parsedIngredients,
      instructions,
      cookingTime,
      userOwner,
      creator: userOwner,
      recipeImg: req.file ? `/uploads/${req.file.filename}` : "",
    });

    res.status(201).json({
      message: "Recipe created successfully",
      recipe: newRecipe,
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    next(new ApiError(500, 'Failed to create recipe'));
  }
});

// @desc Get all recipes
// @route GET /api/v1/recipes
// @access Public
const getRecipes = asyncHandler(async (req, res, next) => {
  try {
    const recipes = await Recipe.find().populate("creator", "name");

    const recipesWithImages = await Promise.all(
      recipes.map(async (recipe) => {
        if (recipe.recipeImg) {
          try {
            const imagePath = path.join(__dirname, '..', recipe.recipeImg);
            const imageData = fs.readFileSync(imagePath);
            recipe.recipeImg = `data:image/jpeg;base64,${imageData.toString('base64')}`;
          } catch (err) {
            console.error('Error reading image file:', err);
            recipe.recipeImg = null;
          }
        }
        return recipe;
      })
    );

    res.json(recipesWithImages);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    next(new ApiError(500, 'Failed to fetch recipes'));
  }
});

// @desc Get a single recipe
// @route GET /api/v1/recipes/:id
// @access Public
const getRecipe = asyncHandler(async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate({
        path: 'reviews.user',
        select: 'name'
      });
    
    if (!recipe) {
      return next(new ApiError(404, "Recipe not found"));
    }

    if (recipe.recipeImg) {
      try {
        const imagePath = path.join(__dirname, '..', recipe.recipeImg);
        const imageData = fs.readFileSync(imagePath);
        recipe.recipeImg = `data:image/jpeg;base64,${imageData.toString('base64')}`;
      } catch (err) {
        console.error('Error reading image file:', err);
        recipe.recipeImg = '';
      }
    }

    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    next(new ApiError(500, 'Failed to fetch recipe'));
  }
});

// @desc Update a recipe
// @route PUT /api/v1/recipes/:id
// @access Private
const updateRecipe = asyncHandler(async (req, res, next) => {
  try {
    console.log(`[INFO] Received request to update recipe with ID: ${req.params.id}`);
    
    // Log the body to see what's being sent
    console.log(`[DEBUG] Request body:`, req.body);

    // Parse ingredients if sent as a string
    if (req.body.ingredients && typeof req.body.ingredients === 'string') {
      try {
        req.body.ingredients = JSON.parse(req.body.ingredients);
        console.log('[INFO] Parsed ingredients:', req.body.ingredients);
      } catch (err) {
        console.error('[ERROR] Failed to parse ingredients:', err);
        return next(new ApiError(400, 'Invalid ingredients format'));
      }
    }

    // If a new image is uploaded, update the image field
    if (req.file) {
      req.body.recipeImg = `/uploads/${req.file.filename}`;
      console.log(`[INFO] Uploaded new image: ${req.file.filename}`);
    }

    // Find the recipe by ID and check if it exists
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      console.warn(`[WARN] Recipe not found with ID: ${req.params.id}`);
      return next(new ApiError(404, "Recipe not found"));
    }

    // Check if the logged-in user owns the recipe
    if (recipe.userOwner.toString() !== req.user._id.toString()) {
      console.warn(`[WARN] Unauthorized update attempt by user: ${req.user._id} on recipe owned by: ${recipe.userOwner}`);
      return next(new ApiError(403, "Not authorized to update this recipe"));
    }

    // If a new image is uploaded, delete the old image file
    if (req.file && recipe.recipeImg) {
      const oldImagePath = path.join(__dirname, '..', recipe.recipeImg);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log(`[INFO] Deleted old image: ${oldImagePath}`);
      } else {
        console.warn(`[WARN] Old image not found for deletion: ${oldImagePath}`);
      }
    }

    // Log what will be updated
    console.log(`[DEBUG] Updating recipe with:`, req.body);

    // Update the recipe with the new data
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,         // Return the updated recipe
        runValidators: true // Ensure validation is run on updates
      }
    ).populate("userOwner", "name");

    // Log the updated recipe to check if changes have been applied
    console.log(`[DEBUG] Updated Recipe:`, updatedRecipe);

    // Check if the update was successful
    if (updatedRecipe) {
      console.log(`[INFO] Recipe updated successfully. ID: ${req.params.id}`);
      res.json({
        message: "Recipe updated successfully",
        recipe: updatedRecipe,
      });
    } else {
      console.error(`[ERROR] Failed to update recipe with ID: ${req.params.id}`);
      next(new ApiError(404, "Recipe not found or user not authorized"));
    }
  } catch (error) {
    console.error(`[ERROR] Error updating recipe with ID: ${req.params.id}`, error);
    next(new ApiError(500, 'Failed to update recipe'));
  }
});



// @desc Delete a recipe
// @route DELETE /api/v1/recipes/:id
// @access Private
const deleteRecipe = asyncHandler(async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return next(new ApiError(404, "Recipe not found"));
    }

    if (recipe.userOwner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError(403, "Not authorized to delete this recipe"));
    }

    // Delete the recipe image file if it exists
    if (recipe.recipeImg) {
      const imagePath = path.join(__dirname, '..', recipe.recipeImg);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await recipe.remove();
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    next(new ApiError(500, 'Failed to delete recipe'));
  }
});

// @desc Add review to a recipe
// @route POST /api/v1/recipes/:id/review
// @access Private
const addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return next(new ApiError(404, "Recipe not found"));
    }

    if (!rating || !comment) {
      return next(new ApiError(400, "Rating and comment are required"));
    }

    const review = {
      name: req.user.name,
      rating,
      comment,
      user: req.user._id,
    };

    recipe.reviews.push(review);
    recipe.numReviews = recipe.reviews.length;
    recipe.rating = recipe.reviews.reduce((acc, review) => review.rating + acc, 0) / recipe.reviews.length;
    await recipe.save();

    res.json({
      message: "Review added successfully",
      recipe,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    next(new ApiError(500, 'Failed to add review'));
  }
});

// @desc Get reviews of a recipe
// @route GET /api/v1/recipes/:id/reviews
// @access Public
const getReviews = asyncHandler(async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("reviews.user", "name");
    if (!recipe) {
      return next(new ApiError(404, "Recipe not found"));
    }
    res.json(recipe.reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    next(new ApiError(500, 'Failed to fetch reviews'));
  }
});

// @desc Get recipes created by the logged-in user
// @route GET /api/v1/recipes/my-recipes
// @access Private
const getUserRecipes = asyncHandler(async (req, res, next) => {
  try {
    const userRecipes = await Recipe.find({ userOwner: req.user._id }).populate("userOwner", "name");

    const recipesWithImages = await Promise.all(userRecipes.map(async (recipe) => {
      if (recipe.recipeImg) {
        try {
          const imagePath = path.join(__dirname, '..', recipe.recipeImg);
          const imageData = fs.readFileSync(imagePath);
          recipe.recipeImg = `data:image/jpeg;base64,${imageData.toString('base64')}`;
        } catch (err) {
          console.error('Error reading image file:', err);
          recipe.recipeImg = '';
        }
      }
      return recipe;
    }));

    res.json(recipesWithImages);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    next(new ApiError(500, 'Failed to fetch user recipes'));
  }
});

export {
  createRecipe,
  getRecipes,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  addReview,
  getReviews,
  getUserRecipes,
};
