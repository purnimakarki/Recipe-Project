import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RecipeDetailPage from './pages/RecipeDetailsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipe';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/protectedRoute';
import AdminRoute from './components/AdminRoute';
import "bootstrap/dist/css/bootstrap.min.css";
import SavedRecipesPage from './pages/SavedRecipePage';
import MyRecipes from './pages/MyRecipePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDetails from './pages/admin/UserDetails';
import { Navigate } from 'react-router-dom';
import Recommendation from './components/Recommendation';
import UserEdit from './pages/admin/UserEdit';
import RecipeEdit from './pages/admin/RecipeEdit';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/saved-recipes" element={<SavedRecipesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Regular User Routes */}
          <Route path="/my-recipe" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/create-recipe" element={<ProtectedRoute><CreateRecipePage /></ProtectedRoute>} />
          <Route path="/edit-recipe/:id" element={<ProtectedRoute><EditRecipePage /></ProtectedRoute>} />
          <Route path="/recommended" element={<ProtectedRoute><Recommendation /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/user-details/:id" element={<AdminRoute><UserDetails /></AdminRoute>} />
          <Route path="/admin/user-edit/:userId" element={<AdminRoute><UserEdit /></AdminRoute>} /> {/* Add route for UserEdit */}
          <Route path="/admin/recipe-edit/:recipeId" element={<AdminRoute><RecipeEdit /></AdminRoute>} /> 
          
          {/* Redirect for undefined routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
