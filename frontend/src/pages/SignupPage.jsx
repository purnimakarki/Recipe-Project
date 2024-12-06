import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import AuthContext from '../context/AuthContext';
import loginBackground from '../assets/login.jpg'; // Import your background image

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for showing/hiding password
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors before attempting signup

    try {
      await signup(name, email, password);
      navigate('/'); // Redirect to home after successful signup
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
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
        filter: 'brightness(0.8)', // Optional: Darken the background to make the form stand out
      }}
    >
      <div
        className="p-4 rounded shadow-sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slight transparency
          borderWidth: '2px',
          borderColor: '#ddd',
          width: '60%', // Set width to 60%
          maxWidth: '400px', // Max width for the form
          marginLeft: 'auto', // Align to the right
          marginRight: '5%', // Add a bit of space on the right
        }}
      >
        <h1 className="text-center mb-4">Signup</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSignup}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ height: '45px' }} // Adjust height of input field
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ height: '45px' }} // Adjust height of input field
            />
          </Form.Group>

          <Form.Group className="mb-3 position-relative" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type={showPassword ? 'text' : 'password'} // Toggle password visibility
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ height: '45px' }} // Adjust height of input field
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
                transform: 'translateY(5px)', // Adjust vertical position
              }}
            >
              {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />} {/* Corrected order */}
            </Button>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mb-3">
            Signup
          </Button>
          <p className="text-center">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </Form>
      </div>
    </Container>
  );
}

export default SignupPage;
