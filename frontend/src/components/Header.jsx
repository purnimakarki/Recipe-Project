import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import logo from "../assets/logo.svg";

function Header() {
  const { userInfo, setUserInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const navStyle = {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" expanded={expanded} className="py-3">
      <Container>
        <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center">
          <img src={logo} alt="Let's Cook Logo" style={{ height: '80px', marginRight: '20px' }} />
          <span className="fs-4 fw-bold">Let's Cook</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(expanded ? false : "expanded")} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav style={navStyle}>
            {!userInfo?.isAdmin && (
              <Nav.Link as={Link} to="/home" onClick={() => setExpanded(false)}>Home</Nav.Link>
            )}
            {userInfo && userInfo.isAdmin ? (
              <>
                <Nav.Link as={Link} to="/admin" onClick={() => setExpanded(false)}>Admin</Nav.Link>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => { handleLogout(); setExpanded(false); }}
                  className="ml-lg-2 mt-2 mt-lg-0"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                
                {userInfo && (
                  <>
                    <Nav.Link as={Link} to="/my-recipe" onClick={() => setExpanded(false)}>My Recipes</Nav.Link>
                    <Nav.Link as={Link} to="/create-recipe" onClick={() => setExpanded(false)}>Create Recipe</Nav.Link>
                    <Nav.Link as={Link} to="/profile" onClick={() => setExpanded(false)}>Profile</Nav.Link>
                    <Nav.Link onClick={() => {
                  if (!userInfo) {
                    navigate('/login', { state: { from: '/saved-recipes' } });
                  } else {
                    navigate('/saved-recipes');
                  }
                  setExpanded(false);
                }}>
                  Saved Recipes
                </Nav.Link>
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={() => { handleLogout(); setExpanded(false); }}
                      className="ml-lg-2 mt-2 mt-lg-0"
                    >
                      Logout
                    </Button>
                  </>
                )}
                {!userInfo && (
                  <>
                    <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)}>Login</Nav.Link>
                    <Nav.Link as={Link} to="/signup" onClick={() => setExpanded(false)}>Signup</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
