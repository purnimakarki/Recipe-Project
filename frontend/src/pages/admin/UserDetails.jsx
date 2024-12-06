import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function UserDetails() {
  const { id } = useParams(); // Access the user ID from URL parameters
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/users/details/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUserInfo(response.data);
      } catch (err) {
        setError('Failed to fetch user details');
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]); // Dependency on `id` to refetch data if the ID changes

  if (loading) {
    return (
      <Container className="mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Card className="p-4 shadow-sm">
          <Card.Body>
            <h2 className="mb-4">Error</h2>
            <div>{error}</div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow-sm profile-card">
        <Card.Body>
          <h2 className="mb-4 profile-title">User Details</h2>
          <div className="mb-3">
            <strong>Email:</strong> {userInfo?.email}
          </div>
          <div className="mb-3">
            <strong>Username:</strong> {userInfo?.name} {/* Updated to 'name' to match your controller */}
          </div>
          <div className="mb-3">
            <strong>Role:</strong> {userInfo?.isAdmin ? 'Admin' : 'User'}
          </div>
          {/* You can add more fields here if necessary */}
        </Card.Body>
      </Card>

      <style>
        {`
          .profile-card {
            background-color: #f8f9fa;
            border-radius: 8px;
            max-width: 600px;
            margin: 0 auto;
          }

          .profile-title {
            color: #343a40;
          }

          .mb-3 {
            font-size: 1.1rem;
            color: #495057;
          }
        `}
      </style>
    </Container>
  );
}

export default UserDetails;