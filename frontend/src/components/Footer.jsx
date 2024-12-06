import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const footerStyle = {
    backgroundColor: '#343a40',
    color: '#ffffff',
    padding: '1rem 0', // Reduced padding
    textAlign: 'left',
  };

  const footerContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 2rem',
  };

  const footerSectionStyle = {
    flex: 1,
    margin: '0 1rem',
  };

  const headingStyle = {
    marginBottom: '0.5rem', // Reduced margin
    fontSize: '1.25rem',
  };

  const paragraphStyle = {
    margin: '0',
    fontSize: '0.9rem',
  };

  const listStyle = {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  };

  const listItemStyle = {
    margin: '0.5rem 0',
  };

  const linkStyle = {
    color: '#ffffff',
    textDecoration: 'none',
  };

  const linkHoverStyle = {
    textDecoration: 'underline',
  };

  const footerBottomStyle = {
    textAlign: 'center',
    padding: '0.5rem 0', // Reduced padding
    borderTop: '1px solid #495057',
  };

  return (
    <footer style={footerStyle}>
      <div style={footerContentStyle}>
        <div style={footerSectionStyle}>
          <h4 style={headingStyle}>About Us</h4>
          <p style={paragraphStyle}>We provide the best recipes and cooking tips to make your meals delightful.</p>
        </div>
        <div style={footerSectionStyle}>
          <h4 style={headingStyle}>Quick Links</h4>
          <ul style={listStyle}>
            <li style={listItemStyle}><Link to="/" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = linkHoverStyle.textDecoration} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>Home</Link></li>
            <li style={listItemStyle}><Link to="/recipes" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = linkHoverStyle.textDecoration} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>Recipes</Link></li>
            <li style={listItemStyle}><Link to="/profile" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = linkHoverStyle.textDecoration} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>Profile</Link></li>
            <li style={listItemStyle}><Link to="/contact" style={linkStyle} onMouseOver={(e) => e.target.style.textDecoration = linkHoverStyle.textDecoration} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>Contact Us</Link></li>
          </ul>
        </div>
        <div style={footerSectionStyle}>
          <h4 style={headingStyle}>Contact Us</h4>
          <p style={paragraphStyle}>Email: support@recipebook.com</p>
          <p style={paragraphStyle}>Phone: (123) 456-7890</p>
        </div>
      </div>
      <div style={footerBottomStyle}>
        <p style={paragraphStyle}>&copy; 2024 Recipe Book. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
