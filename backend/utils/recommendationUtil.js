import Recipe from '../models/recipe.model.js';
import User from '../models/user.model.js';

/**
 * Calculates the similarity score between two arrays.
 * @param {Array} array1 
 * @param {Array} array2 
 * @returns {Number} Similarity score between 0 and 1
 */
function calculateArraySimilarity(array1, array2) {
  const commonElements = array1.filter(value => array2.includes(value));
  return commonElements.length / Math.max(array1.length, array2.length);
}

/**
 * Get a random subset of recipes, excluding specified recipes.
 * @param {Array} allRecipes - List of all recipes
 * @param {Number} count - Number of random recipes to return
 * @param {Array} excludeRecipes - List of recipe IDs to exclude
 * @returns {Array} List of random recipes
 */
function getRandomRecipes(allRecipes, count, excludeRecipes = []) {
  const filteredRecipes = allRecipes.filter(recipe => !excludeRecipes.includes(recipe._id.toString()));
  const shuffled = filteredRecipes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Recommend recipes based on the user's saved recipes.
 * @param {String} userId - ID of the user
 * @returns {Array} List of recommended recipes
 */
export const recommendRecipesTest = async (userId) => {
  try {
    const user = await User.findById(userId).populate('savedRecipes');
    if (!user) {
      throw new Error('User not found');
    }

    const savedRecipes = user.savedRecipes;
    const savedRecipeIds = savedRecipes.map(r => r._id.toString());

    console.log('User Saved Recipes:', savedRecipes); // Debug: Log saved recipes

    // If no saved recipes, return a random set of recipes
    if (savedRecipes.length === 0) {
      const allRecipes = await Recipe.find({});
      const randomRecipes = getRandomRecipes(allRecipes, 5);
      return randomRecipes.map(recipe => ({ ...recipe.toObject(), recommendedBy: 'random' }));
    }

    // Calculate similarity scores between user's saved recipes and all other recipes
    const allRecipes = await Recipe.find({});
    const recipeScores = [];

    allRecipes.forEach(recipe => {
      if (!savedRecipeIds.includes(recipe._id.toString())) {  // Avoid recommending already saved recipes
        let maxSimilarityScore = 0;
        savedRecipes.forEach(savedRecipe => {
          const score = calculateArraySimilarity(savedRecipe.ingredients, recipe.ingredients);
          maxSimilarityScore = Math.max(maxSimilarityScore, score);
        });
        if (maxSimilarityScore > 0) {  // Only include recipes with a non-zero similarity score
          recipeScores.push({ recipe, score: maxSimilarityScore });
        }
      }
    });

    // Sort recipes by similarity score in descending order
    recipeScores.sort((a, b) => b.score - a.score);

    // Extract recommended recipes based on the highest similarity scores
    let recommendedRecipes = recipeScores.map(r => ({ ...r.recipe.toObject(), recommendedBy: 'similarity' }));

    console.log('Initial Recommendations:', recommendedRecipes); // Debug: Log recommendations

    // If not enough recommendations, fill with random recipes, excluding saved and already recommended recipes
    const alreadyRecommendedIds = recommendedRecipes.map(r => r._id.toString());
    const allExcludedIds = [...savedRecipeIds, ...alreadyRecommendedIds];

    // Calculate how many more recipes are needed
    const neededCount = 5 - recommendedRecipes.length;

    if (neededCount > 0) {
      const additionalRecipes = getRandomRecipes(allRecipes, neededCount, allExcludedIds);
      additionalRecipes.forEach(recipe => {
        recommendedRecipes.push({ ...recipe.toObject(), recommendedBy: 'random' }); // Tag as random
      });
    }

    // Ensure no duplicates by creating a Set of unique recipe IDs
    recommendedRecipes = Array.from(new Set(recommendedRecipes.map(r => r._id.toString())))
      .map(id => recommendedRecipes.find(r => r._id.toString() === id));

    console.log('Final Recommendations:', recommendedRecipes); // Debug: Log final recommendations

    return recommendedRecipes.slice(0, 5); // Return top 5 recommendations

  } catch (error) {
    console.error('Error generating recommendations:', error.message);
    // Return an empty array or handle the error as needed
    return [];
  }
};

