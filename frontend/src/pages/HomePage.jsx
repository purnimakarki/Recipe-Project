import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { EyeOutlined, HeartOutlined, DeleteOutlined } from '@ant-design/icons';
import { Rate } from 'antd';
import AuthContext from '../context/AuthContext';

function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null); // State to manage hovered card
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const { data } = await axios.get('/api/v1/recipe');
        setRecipes(data);
      } catch (error) {
        setError('Error fetching recipes. Please try again later.');
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedRecipes = async () => {
      if (userInfo) {
        try {
          const { data } = await axios.get('/api/v1/users/me/saved-recipes', {
            headers: { Authorization: `Bearer ${userInfo.token || localStorage.getItem('token')}` }
          });
          setSavedRecipes(data.map(recipe => recipe._id));
        } catch (error) {
          console.error('Error fetching saved recipes:', error);
        }
      }
    };

    fetchRecipes();
    fetchSavedRecipes();
  }, [userInfo]);

  const handleSave = async (recipeId) => {
    if (!userInfo) {
      setShowLoginModal(true);
      return;
    }

    try {
      const isAlreadySaved = savedRecipes.includes(recipeId);

      let response;

      if (isAlreadySaved) {
        response = await axios.delete('/api/v1/users/me/saved-recipes', {
          data: { recipeId },
          headers: { Authorization: `Bearer ${userInfo.token || localStorage.getItem('token')}` }
        });
      } else {
        response = await axios.post('/api/v1/users/me/saved-recipes', { recipeId }, {
          headers: { Authorization: `Bearer ${userInfo.token || localStorage.getItem('token')}` }
        });
      }

      if (response.status === 200) {
        setSavedRecipes(prevSavedRecipes => {
          if (isAlreadySaved) {
            return prevSavedRecipes.filter(id => id !== recipeId);
          } else {
            return [...prevSavedRecipes, recipeId];
          }
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(isAlreadySaved ? 'Recipe already saved.' : 'Recipe not found in saved list.');
      } else {
        setError('Error saving or unsaving recipe. Please try again later.');
      }
      console.error('Error saving or unsaving recipe:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (recipeId) => {
    try {
      await axios.delete(`/api/v1/recipe/${recipeId}`, {
        headers: { Authorization: `Bearer ${userInfo?.token || localStorage.getItem('token')}` }
      });
      setRecipes(recipes.filter(recipe => recipe._id !== recipeId));
    } catch (error) {
      setError('Error deleting recipe. Please try again later.');
      console.error('Error deleting recipe:', error);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Recipe Book</h1>
      <p style={styles.subtitle}>Discover and share amazing recipes from around the world.</p>
      <div style={styles.recipesContainer}>
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <Card
              key={recipe._id}
              style={{
                ...styles.recipeCard,
                ...(hoveredCard === recipe._id ? styles.recipeCardHover : {})
              }}
              onMouseEnter={() => setHoveredCard(recipe._id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {recipe.recipeImg && (
                <Card.Img
                  variant="top"
                  src={recipe.recipeImg}
                  alt={recipe.title}
                  style={styles.recipeImage}
                />
              )}
              <Card.Body style={styles.cardBody}>
                <h2 style={styles.recipeTitle}>{recipe.title}</h2>

                {/* Star Rating */}
                <div style={styles.ratingContainer}>
                  <Rate disabled defaultValue={recipe.rating} />
                  <span style={styles.ratingText}>({recipe.numReviews} reviews)</span>
                </div>

                <div style={styles.buttonContainer}>
                  <Link to={`/recipes/${recipe._id}`}>
                    <Button variant="primary" style={styles.button}>
                      <EyeOutlined style={styles.icon} />
                      View Details
                    </Button>
                  </Link>
                  {userInfo?.userId === recipe.userOwner && (
                    <Button
                      variant="danger"
                      style={styles.button}
                      onClick={() => handleDelete(recipe._id)}
                    >
                      <DeleteOutlined style={styles.icon} />
                      Delete Recipe
                    </Button>
                  )}
                  <Button
                    variant={savedRecipes.includes(recipe._id) ? 'secondary' : 'danger'}
                    style={styles.button}
                    onClick={() => handleSave(recipe._id)}
                  >
                    <HeartOutlined style={styles.icon} />
                    {savedRecipes.includes(recipe._id) ? 'Saved' : 'Save Recipe'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p>No recipes available.</p>
        )}
      </div>

      {/* Modal for prompting login */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton style={modalStyles.header}>
          <Modal.Title style={modalStyles.title}>
            <i className="fas fa-lock" style={modalStyles.icon}></i> Login Required
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={modalStyles.body}>
          <p style={modalStyles.text}>
            To save your favorite recipes and access them later, please log in to your account.
            <br />
            <strong>Don't miss out on delicious recipes!</strong>
          </p>
          <div style={modalStyles.footer}>
            <Button variant="secondary" onClick={() => setShowLoginModal(false)} style={modalStyles.closeButton}>
              <i className="fas fa-times-circle"></i> Close
            </Button>
            <Button variant="primary" onClick={() => navigate('/login')} style={modalStyles.loginButton}>
              <i className="fas fa-sign-in-alt"></i> Go to Login
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '20px auto',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#666',
  },
  recipesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
  },
  recipeCard: {
    border: 'none',
    borderRadius: '8px',
    padding: '0',
    textAlign: 'left',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  recipeCardHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 8px rgba(0, 123, 255, 0.5)', // Blue box-shadow effect
    backgroundColor: '#e0f7ff', // Light blue background color on hover
  },
  recipeImage: {
    height: '200px',
    objectFit: 'cover',
  },
  cardBody: {
    padding: '15px',
  },
  recipeTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  },
  ratingText: {
    marginLeft: '8px',
    color: '#888',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    flexGrow: 1,
    padding: '10px',
  },
  icon: {
    marginRight: '5px',
  },
};

const modalStyles = {
  header: {
    borderBottom: 'none',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  icon: {
    marginRight: '10px',
  },
  body: {
    textAlign: 'center',
  },
  text: {
    fontSize: '1rem',
  },
  footer: {
    marginTop: '15px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  closeButton: {
    marginRight: '15px',
  },
  loginButton: {
    marginLeft: '15px',
  },
};

export default HomePage;
