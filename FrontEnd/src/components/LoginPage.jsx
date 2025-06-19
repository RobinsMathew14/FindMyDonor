import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './LoginPage.css';
import Footer from './Footer';
import Header from './Header';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const floatingPlatelets = Array.from({ length: 20 }).map((_, index) => {
    const top = `${Math.random() * 100}%`;
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 5}s`;
    const animationDuration = `${5 + Math.random() * 10}s`;

    return (
      <img
        key={index}
        className="platelet"
        src="https://thumbs.dreamstime.com/b/red-blood-cell-isolated-black-background-red-blood-cell-isolated-black-background-d-illustration-355583087.jpg"
        alt="Platelet"
        style={{
          top,
          left,
          animationDelay,
          animationDuration,
          position: 'absolute',
        }}
      />
    );
  });

  return (
    <div className="login-wrapper">
      <Header/>
      <div className="background-animation">
        {floatingPlatelets}
      </div>

      <div id="d1">
        <h1>Login</h1>
        <img
          id="i1"
          src="https://t4.ftcdn.net/jpg/10/08/29/09/360_F_1008290988_URO1T4omQhleLR0Iy0Z2wTLK26BMDwXo.jpg"
          alt="Logo"
        />
        <h2>FindMyDonor</h2>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <input 
            type="text" 
            name="username" 
            placeholder="Email or Username" 
            value={formData.username}
            onChange={handleInputChange}
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password}
            onChange={handleInputChange}
            required 
          />
          
          <div className="demo-credentials">
            <p><strong>Demo Credentials:</strong></p>
            <p>Create an account first using the Sign Up link below, then login with your credentials.</p>
            <p>Or contact admin for test account access.</p>
          </div>
          
          <p className="signup">
            not a member? <Link to="/signup">Sign up now</Link>
          </p>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
