import express from 'express';
import {
  getUserProfile,
  getUsers,
  login,
  signup,
  updateUserProfile,
  updateUser,
  deleteUser,
  saveRecipe,
  unsaveRecipe,
  getSavedRecipes,
  getUserById,
  getRecommendations
} from "../controller/user.controller.js"; // Adjust the path if necessary
import { checkAuth, checkAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', checkAuth, getUserProfile);
router.put('/profile', checkAuth, updateUserProfile);

router.get('/details/:id', checkAuth, checkAdmin, getUserById);

router.post('/:id/saved-recipes', checkAuth, saveRecipe);
router.delete('/:id/saved-recipes', checkAuth, unsaveRecipe);
router.get('/:id/saved-recipes', checkAuth, getSavedRecipes);

// Recommendation route
router.get('/recommendations/:id', checkAuth, getRecommendations);

// Admin routes
router.get('/:id', getUserById);
router.get('/', checkAuth, checkAdmin, getUsers);
router.put('/update/:id', checkAuth, checkAdmin, updateUser);
router.delete('/remove/:id', checkAuth, checkAdmin, deleteUser);

export default router;
