import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function SavedRecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [hoveredCardId, setHoveredCardId] = useState(null);

  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
  const userId = userInfo ? userInfo._id : null;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (!userId) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/users/${userId}/saved-recipes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedRecipes(response.data);
      } catch (error) {
        setError('Failed to fetch saved recipes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [userId, token]);

  const cardStyles = (isHovered) => ({
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: isHovered ? '0 8px 16px rgba(0, 123, 255, 0.5)' : '0 4px 8px rgba(0, 0, 0, 0.1)', // Blue shadow on hover
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    backgroundColor: isHovered ? '#e0f7ff' : '#fff', // Light blue background on hover
    cursor: 'pointer',
  });

  const imgStyles = {
    height: '200px',
    objectFit: 'cover',
    borderBottom: '1px solid #ddd',
  };

  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  };

  const categoryStyles = {
    fontSize: '1rem',
    color: '#6c757d',
  };

  const descriptionStyles = {
    fontSize: '0.875rem',
    color: '#333',
  };

  const buttonStyles = {
    marginTop: '10px',
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Saved Recipes</h1>
      <Row>
        {savedRecipes.length > 0 ? (
          savedRecipes.map((recipe) => (
            <Col md={4} lg={3} className="mb-4" key={recipe._id}>
              <Card
                style={cardStyles(hoveredCardId === recipe._id)}
                onMouseEnter={() => setHoveredCardId(recipe._id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                {recipe.recipeImg && (
                  <Card.Img
                    variant="top"
                    src={recipe.recipeImg}
                    alt={recipe.title}
                    style={imgStyles}
                  />
                )}
                <Card.Body>
                  <Card.Title style={titleStyles}>{recipe.title}</Card.Title>
                  <Card.Subtitle className="mb-2" style={categoryStyles}>
                    {recipe.category}
                  </Card.Subtitle>
                  <Card.Text style={descriptionStyles}>
                    {recipe.description.length > 100
                      ? `${recipe.description.substring(0, 100)}...`
                      : recipe.description}
                  </Card.Text>
                  <Link to={`/recipes/${recipe._id}`}>
                    <Button variant="primary" style={buttonStyles}>View Details</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Container className="text-center mt-5">
            <Alert variant="info">No saved recipes found.</Alert>
          </Container>
        )}
      </Row>
    </Container>
  );
}

export default SavedRecipesPage;
