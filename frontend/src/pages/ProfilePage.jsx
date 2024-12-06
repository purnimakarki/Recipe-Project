import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';


function ProfilePage() {
  const { userInfo, updateUserProfile } = useContext(AuthContext);

  // State for form fields
  const [email, setEmail] = useState(userInfo?.email || '');
  const [username, setUsername] = useState(userInfo?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      };
  
      // Make the PUT request to update the user profile
      const response = await axios.put(
        '/api/v1/users/profile',
        { name: username, email, password },
        config
      );
  
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow-sm profile-card">
        <Card.Body>
          <h2 className="mb-4 profile-title">User Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3 position-relative" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Enter new password (leave blank to keep current)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle-password"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </Form.Group>

            <Form.Group className="mb-4 position-relative" controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type={confirmPasswordVisible ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="toggle-password"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </Form.Group>

            <Button variant="primary" type="submit" className="update-button">
              Update Profile
            </Button>
          </Form>
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

          .update-button {
            width: 100%;
          }

          .alert {
            margin-bottom: 20px;
          }

          .position-relative {
            position: relative;
          }

          .toggle-password {
            position: absolute;
            top: 50%;
            right: 10px;
            transform: translatex(-50%);
            cursor: pointer;
            font-size: 20px;
            color: #6c757d;
          }
        `}
      </style>
    </Container>
  );
}

export default ProfilePage;
