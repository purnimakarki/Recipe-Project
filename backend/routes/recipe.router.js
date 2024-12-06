import express from 'express';
import {
  createRecipe,
  getRecipes,
  getRecipe,  // Get a single recipe by ID
  updateRecipe,
  deleteRecipe,
  addReview,
  getReviews,
  getUserRecipes
} from '../controller/recipe.controller.js'; // Ensure the path is correct
import { checkAuth } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Protected routes
router.post('/', checkAuth, upload.single('recipeImg'), createRecipe); // Create a new recipe
router.put('/:id', checkAuth, updateRecipe); // Update a recipe by ID
router.delete('/:id', checkAuth, deleteRecipe); // Delete a recipe by ID
router.post('/:id/reviews', checkAuth, addReview); // Add a review to a recipe
router.get('/my-recipes', checkAuth, getUserRecipes); // Get recipes created by the logged-in user

// Public routes
router.get('/', getRecipes); // Get all recipes
router.get('/:id', getRecipe); // Get a single recipe by ID
router.get('/:id/reviews', getReviews); // Get reviews for a specific recipe


export default router;