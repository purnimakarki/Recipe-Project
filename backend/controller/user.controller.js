import User from "../models/user.model.js";
import Recipe from "../models/recipe.model.js"; // Import Recipe model if needed
import createToken from "../utils/token.utils.js";
import asyncHandler from "../middleware/asynchandler.middleware.js";
import ApiError from "../utils/ApiError.js";
import { isEmail } from "../utils/validator.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { recommendRecipesTest } from "../utils/recommendationUtil.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc Register a new user
// @route POST /api/v1/users/signup
// @access Public
const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, isAdmin } = req.body;
  if (!isEmail(email)) {
    throw new ApiError(400, "Invalid Email!");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, `User with email ${email} already exists!`);
  }
  const newUser = await User.create({
    name,
    email,
    password,
    isAdmin,
  });
  const token = createToken(res, newUser._id);
  res.status(201).json({
    message: "User registered successfully",
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    },
    token, // Include the token in the response
  });
});


// @desc Login user
// @route POST /api/v1/users/login
// @access Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, `${email} not registered!`);
  }

  const isPasswordCorrect = await user.matchPassword(password);

  if (isPasswordCorrect) {
    // Create the token
    const token = createToken(res, user._id);

    // Return the token in the response
    res.json({
      message: "Login Success",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token, // Include the token in the response
    });
  } else {
    throw new ApiError(400, "Invalid Password");
  }
});


// @desc Get all users
// @route GET /api/v1/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  let users = await User.find({}).select("-password");
  res.send(users);
});

// @desc Fetch user profile
// @route GET /api/v1/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res, next) => {
  try {
    // Ensure that req.user is set
    if (!req.user) {
      // If user is not authenticated, return an error
      return next(new ApiError(401, "User not authenticated"));
    }

    // Fetch user profile information from the database
    const user = await User.findById(req.user._id).select('-password'); // Exclude password

    // If user is not found, return an error
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Send the user profile as response
    res.json(user);
  } catch (error) {
    // Handle unexpected errors
    console.error('Error fetching user profile:', error);
    next(new ApiError(500, 'Failed to fetch user profile'));
  }
});

// @desc Get user by ID
// @route GET /api/v1/users/details/:id
// @access Private/Admin
const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if the user exists
  const user = await User.findById(id).select('-password'); // Exclude password from response

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  res.json(user);
});


// @desc Update user profile
// @route PUT /api/v1/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
      }
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.send({
      message: "User profile updated",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw new ApiError(500, 'Failed to update profile');
  }
});

// @desc Update user details (Admin only)
// @route PUT /api/v1/users/update/:id
// @access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  let id = req.params.id;
  let user = await User.findById(id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);
    let updatedUser = await user.save();
    res.send({ message: "User updated", user: updatedUser });
  } else {
    throw new ApiError(404, "User not found");
  }
});

// @desc Delete user (Admin only)
// @route DELETE /api/v1/users/remove/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  let id = req.params.id;
  let user = await User.findById(id);
  if (user) {
    if (user.isAdmin) {
      throw new ApiError(400, "Cannot remove admin user");
    }
    // Optionally delete the user's recipes
    await Recipe.deleteMany({ creator: id }); // Assuming creator is the field in Recipe model
    await User.findByIdAndDelete(id);
    res.send("User removed!");
  } else {
    throw new ApiError(404, "User not found");
  }
});
// @desc Save a recipe
// @route POST /api/v1/users/:id/saved-recipes
// @access Private
const saveRecipe = asyncHandler(async (req, res, next) => {
  const { recipeId } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (user.savedRecipes.includes(recipeId)) {
      return next(new ApiError(400, 'Recipe already saved'));
    }

    user.savedRecipes.push(recipeId);
    await user.save();

    res.json({ message: 'Recipe saved successfully' });
  } catch (error) {
    console.error('Error saving recipe:', error);
    return next(new ApiError(500, 'Failed to save recipe'));
  }
});

// @desc Unsave a recipe
// @route DELETE /api/v1/users/:id/saved-recipes
// @access Private
const unsaveRecipe = asyncHandler(async (req, res, next) => {
  const { recipeId } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (!user.savedRecipes.includes(recipeId)) {
      return next(new ApiError(400, 'Recipe not found in saved recipes'));
    }

    user.savedRecipes = user.savedRecipes.filter(id => id.toString() !== recipeId.toString());
    await user.save();

    res.json({ message: 'Recipe unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving recipe:', error);
    return next(new ApiError(500, 'Failed to unsave recipe'));
  }
});


// @desc Get saved recipes
// @route GET /api/v1/users/:id/saved-recipes
// @access Private
const getSavedRecipes = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate({
      path: 'savedRecipes',
      populate: { path: 'userOwner', select: 'name' }
    });

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Convert recipe images to Base64 format
    const savedRecipesWithImages = await Promise.all(user.savedRecipes.map(async (recipe) => {
      if (recipe.recipeImg) {
        try {
          const imagePath = path.join(__dirname, '..', '/', recipe.recipeImg);
          const imageData = fs.readFileSync(imagePath);
          recipe.recipeImg = `data:image/jpeg;base64,${imageData.toString('base64')}`;
        } catch (err) {
          console.error('Error reading image file:', err);
          recipe.recipeImg = ''; // Handle the case where the image cannot be read
        }
      }
      return recipe;
    }));

    res.json(savedRecipesWithImages);
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    next(new ApiError(500, 'Failed to fetch saved recipes'));
  }
});


const getRecommendations = async (req, res) => {
  try {
    const recommendations = await recommendRecipesTest(req.user._id);
    if (!Array.isArray(recommendations)) {
      throw new Error('Recommendations are not in the expected format');
    }

    // Convert recipe images to Base64 format for each recommended recipe
    const recommendationsWithImages = await Promise.all(recommendations.map(async (recipe) => {
      if (recipe.recipeImg) {
        try {
          const imagePath = path.join(__dirname, '..', recipe.recipeImg);
          if (fs.existsSync(imagePath)) {
            const imageData = fs.readFileSync(imagePath);
            recipe.recipeImg = `data:image/jpeg;base64,${imageData.toString('base64')}`;
          } else {
            console.error('Image file not found at:', imagePath);
            recipe.recipeImg = ''; // Handle missing image file
          }
        } catch (err) {
          console.error('Error reading image file:', err);
          recipe.recipeImg = ''; // Handle the case where the image cannot be read
        }
      }
      return recipe;
    }));

    res.json(recommendationsWithImages);
  } catch (error) {
    console.error('Error in getRecommendations:', error.message);
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
};

export {
  signup,
  login,
  getUsers,
  getUserProfile,
  updateUserProfile,
  updateUser,
  deleteUser,
  saveRecipe,
  unsaveRecipe,
  getSavedRecipes ,
  getUserById,
  getRecommendations
};
