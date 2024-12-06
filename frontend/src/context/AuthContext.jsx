import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Ensure this instance includes the Authorization header setup
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedUser = localStorage.getItem('userInfo');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        setUserInfo(JSON.parse(storedUser));
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
      }
      setLoading(false); // Set loading to false after checking storage
    };
    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/users/login', { email, password });
      const { user, token } = response.data;

      // Save user info and token to localStorage
      localStorage.setItem('userInfo', JSON.stringify(user));
      localStorage.setItem('token', token);

      // Set the default Authorization header for axios
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;

      // Update state
      setUserInfo(user);

      // Redirect based on user role
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      throw err; // Optionally handle error in UI
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/users/logout');
      setUserInfo(null);
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');

      // Remove Authorization header
      delete axiosInstance.defaults.headers['Authorization'];

      navigate('/home'); // Redirect to home page after logout
    } catch (err) {
      console.error('Logout failed:', err.response?.data?.message || err.message);
      throw err; // Optionally handle error in UI
    }
  };

  const signup = async (name, email, password) => {
    try {
      await axiosInstance.post('/users/signup', { name, email, password });
      await login(email, password); // Log in immediately after signup
    } catch (err) {
      console.error('Signup failed:', err.response?.data?.message || err.message);
      throw err; // Optionally handle error in UI
    }
  };

  if (loading) {
    // Optionally render a loading spinner or message
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
