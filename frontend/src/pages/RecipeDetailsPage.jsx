import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Button, Spinner, Alert, Modal, Form, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

function RecipeDetailPage() {
  const { id } = useParams(); // Get the recipe ID from the URL
  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: '', comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false); // State for review submission loading
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`/api/v1/recipe/${id}`);
        setRecipe(response.data);
        setReviews(response.data.reviews || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Failed to fetch recipe details. Please try again later.');
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleEdit = () => {
    navigate(`/edit-recipe/${id}`);
  };

  const handleDeleteClick = () => {
    setRecipeToDelete(id);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    try {
      const token = userInfo.token || localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
  
      await axios.delete(`/api/v1/recipe/${recipeToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      navigate('/my-recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error.response?.data || error.message);
      setError('Failed to delete recipe. Please try again later.');
    }
  };

  const handleCloseConfirmDelete = () => setShowConfirmDelete(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true); // Set loading state
    
    try {
      const token = userInfo.token || localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setSubmittingReview(false); // Reset loading state
        return;
      }
      
      const reviewData = {
        rating: newReview.rating,
        comment: newReview.comment,
      };
      
      const response = await axios.post(`/api/v1/recipe/${id}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure response contains the necessary data
      const newReviewWithUserInfo = {
        ...response.data,
        user: { name: userInfo.name, _id: userInfo._id }, // Include user info
      };

      // Update reviews state
      setReviews((prevReviews) => [...prevReviews, newReviewWithUserInfo]);
      setNewReview({ rating: '', comment: '' }); // Reset the review form
    } catch (error) {
      console.error('Error submitting review:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to submit review. Please try again later.');
    } finally {
      setSubmittingReview(false); // Reset loading state
    }
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
      {recipe && (
        <Card className="mb-4" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
          {recipe.recipeImg && (
            <Card.Img
              variant="top"
              src={recipe.recipeImg}
              alt={recipe.title}
              style={{ width: '550px', height: '550px', objectFit: 'cover', marginRight: '20px', borderRadius: '10px' }}
            />
          )}
          <Card.Body>
            <Card.Title>{recipe.title}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{recipe.category}</Card.Subtitle>
            <Card.Text><strong>Description:</strong> {recipe.description}</Card.Text>
            <Card.Text><strong>Ingredients:</strong> {recipe.ingredients.join(', ')}</Card.Text>
            <Card.Text><strong>Instructions:</strong></Card.Text>
            <ListGroup>
              {recipe.instructions.split('\n').map((step, index) => (
                <ListGroup.Item key={index}>
                  <strong>Step {index + 1}:</strong> {step}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Card.Text><strong>Cooking Time:</strong> {recipe.cookingTime} minutes</Card.Text>
            {userInfo._id === recipe.userOwner ? (
              <div>
                <Button variant="primary" onClick={handleEdit}>Edit Recipe</Button>
                <Button variant="danger" className="ms-2" onClick={handleDeleteClick}>Delete Recipe</Button>
              </div>
            ) : (
              <div>
                <h4>Submit Your Review</h4>
                <Form onSubmit={handleReviewSubmit}>
                  <Form.Group controlId="rating">
                    <Form.Label>Rating</Form.Label>
                    <Form.Control 
                      as="select" 
                      value={newReview.rating} 
                      onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })} 
                      required
                    >
                      <option value="">Select...</option>
                      <option value="1">1 - Poor</option>
                      <option value="2">2 - Fair</option>
                      <option value="3">3 - Good</option>
                      <option value="4">4 - Very Good</option>
                      <option value="5">5 - Excellent</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="comment" className="mt-3">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      value={newReview.comment} 
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} 
                      required 
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="mt-3" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Form>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Reviews Section */}
      <h4>Reviews</h4>
      {reviews.length > 0 ? (
        <ListGroup variant="flush">
          {reviews.map((review, index) => (
            <ListGroup.Item key={index}>
              <strong>{review.user?.name || 'Anonymous'}</strong>
              <span className="ms-3">Rating: {review.rating ? review.rating : 'N/A'} / 5</span>
              <p>{review.comment || 'No comment provided'}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Alert variant="info">No reviews yet. Be the first to review this recipe!</Alert>
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
    </Container>
  );
}

export default RecipeDetailPage;
