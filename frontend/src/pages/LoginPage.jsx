import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import loginBackground from '../assets/login.jpg';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors before attempting login

    try {
      await login(email, password);
      navigate('/'); // Redirect to the homepage after successful login
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${loginBackground})`, // Set the background image
        backgroundSize: 'cover', // Ensure the image covers the entire container
        backgroundPosition: 'center', // Center the background image
        backgroundRepeat: 'no-repeat', // Prevent the background from repeating
        backgroundAttachment: 'fixed', // Fixed background for a parallax effect
        filter: 'brightness(0.8)', // Darken the background
      }}
    >
      <div
        className="p-4 rounded shadow-sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slight transparency
          borderWidth: '2px',
          borderColor: '#ddd',
          maxWidth: '400px', // Max width for the form
          width: '55%', // Set width to 60%
          marginLeft: 'auto', // Align to the right
          marginRight: '10%', // Add a bit of space on the right
        }}
      >
        <h1 className="text-center mb-4">Login</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ height: '45px' }}
            />
          </Form.Group>

          <Form.Group className="mb-3 position-relative" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type={showPassword ? 'text' : 'password'} // Toggle password visibility
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ height: '45px', paddingRight: '50px' }} // Add padding to prevent overlap with icon
            />
            <Button
              variant="link"
              className="position-absolute end-0 top-50 translate-middle-x"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                background: 'none',
                border: 'none',
                right: '10px',
              }}
            >
              {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />} {/* Corrected icon order */}
            </Button>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mb-3">
            Login
          </Button>
          <p className="text-center">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </Form>
      </div>
    </Container>
  );
}

export default LoginPage;
