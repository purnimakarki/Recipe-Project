import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Button, Card, Container, Row, Col, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import Recommendation from '../components/Recommendation';

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserRecipes = async () => {
      const token = userInfo?.token || localStorage.getItem('token');
      try {
        const response = await axios.get('/api/v1/recipe/my-recipes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching user recipes:', error.response?.data || error.message);
      }
    };

    if (userInfo?.token || localStorage.getItem('token')) {
      fetchUserRecipes();
    }
  }, [userInfo?.token]);

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleBackClick = () => {
    setSelectedRecipe(null);
  };

  const handleDeleteClick = (recipeId) => {
    setRecipeToDelete(recipeId);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/recipe/${recipeToDelete}`, {
        headers: { Authorization: `Bearer ${userInfo?.token || localStorage.getItem('token')}` }
      });
      setRecipes(recipes.filter(recipe => recipe._id !== recipeToDelete));
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleCloseConfirmDelete = () => setShowConfirmDelete(false);

  const handleMouseEnter = (id) => setHoveredCard(id);
  const handleMouseLeave = () => setHoveredCard(null);

  const cardStyle = (isHovered) => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.3s, box-shadow 0.3s',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isHovered ? '0 4px 8px rgba(0, 123, 255, 0.5)' : '0 2px 4px rgba(0,0,0,0.1)', // Blue shadow on hover
    backgroundColor: isHovered ? '#e0f7ff' : '#fff', // Light blue background on hover
  });

  return (
    <Container>
      <h1 className="my-4">My Recipes</h1>
      {selectedRecipe ? (
        <div>
          <Button variant="secondary" onClick={handleBackClick} className="mb-4">
            Back to list
          </Button>
          <Card>
            <Card.Header as="h5">{selectedRecipe.title}</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Card.Img className="recipe-img" variant="top" src={selectedRecipe.recipeImg} alt={selectedRecipe.title} />
                </Col>
                <Col md={8}>
                  <Card.Text>
                    <strong>Description:</strong> {selectedRecipe.description}
                  </Card.Text>
                  <Card.Text>
                    <strong>Category:</strong> {selectedRecipe.category}
                  </Card.Text>
                  <Card.Text>
                    <strong>Cooking Time:</strong> {selectedRecipe.cookingTime} minutes
                  </Card.Text>
                  <Card.Text>
                    <strong>Ingredients:</strong> {selectedRecipe.ingredients.join(', ')}
                  </Card.Text>
                  <Card.Text>
                    <strong>Instructions:</strong> {selectedRecipe.instructions}
                  </Card.Text>
                  {userInfo?.userId === selectedRecipe.userOwner && (
                    <div>
                      <Link to={`/edit-recipe/${selectedRecipe._id}`}>
                        <Button variant="primary" className="mt-3">
                          Edit Recipe
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        className="mt-3 ms-2"
                        onClick={() => handleDeleteClick(selectedRecipe._id)}
                      >
                        <DeleteOutlined style={{ fontSize: '18px' }} />
                        Delete Recipe
                      </Button>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      ) : (
        <Row>
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <Col key={recipe._id} md={4} className="mb-4">
                <Card
                  style={cardStyle(hoveredCard === recipe._id)}
                  onMouseEnter={() => handleMouseEnter(recipe._id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Card.Img className="recipe-img" variant="top" src={recipe.recipeImg} alt={recipe.title} style={{ height: '300px', objectFit: 'cover' }} />
                  <Card.Body>
                    <Card.Title>{recipe.title}</Card.Title>
                    <Link to={`/recipes/${recipe._id}`}>
                      <Button variant="primary">View Details</Button>
                    </Link>
                    {userInfo?.userId === recipe.userOwner && (
                      <Button
                        variant="danger"
                        className="ms-2"
                        onClick={() => handleDeleteClick(recipe._id)}
                      >
                        <DeleteOutlined style={{ fontSize: '18px' }} />
                        Delete Recipe
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p>No recipes found.</p>
          )}
        </Row>
      )}

      {/* Confirmation Modal */}
      <Modal show={showConfirmDelete} onHide={handleCloseConfirmDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this recipe?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Recommendation />
    </Container>
  );
};

export default MyRecipes;
