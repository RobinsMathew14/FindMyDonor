import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignUpPage.css';
import Footer from './Footer';
import Header from './Header';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    bloodType: '',
    phone: '',
    userType: 'donor' // donor, receiver, or bloodbank
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      alert(data.message);
      
      if (response.ok) {
        // Reset form on successful signup
        setFormData({
          fullName: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          bloodType: '',
          phone: '',
          userType: 'donor'
        });
      }
    } catch (error) {
      alert('Error creating account. Please try again.');
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
    <div className="signup-wrapper">
      <Header/>
      <div className="background-animation">
        {floatingPlatelets}
      </div>

      <div id="signup-container">
        <h1>Sign Up</h1>
        <img
          id="signup-logo"
          src="https://t4.ftcdn.net/jpg/10/08/29/09/360_F_1008290988_URO1T4omQhleLR0Iy0Z2wTLK26BMDwXo.jpg"
          alt="Logo"
        />
        <h2>Join FindMyDonor</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input 
              type="text" 
              name="fullName" 
              placeholder="Full Name" 
              value={formData.fullName}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <div className="form-row">
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleInputChange}
              required 
            />
          </div>

          <div className="form-row">
            <input 
              type="text" 
              name="username" 
              placeholder="Username" 
              value={formData.username}
              onChange={handleInputChange}
              required 
            />
          </div>

          <div className="form-row">
            <input 
              type="tel" 
              name="phone" 
              placeholder="Phone Number" 
              value={formData.phone}
              onChange={handleInputChange}
              required 
            />
          </div>

          <div className="form-row">
            <select 
              name="bloodType" 
              value={formData.bloodType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="form-row">
            <select 
              name="userType" 
              value={formData.userType}
              onChange={handleInputChange}
              required
            >
              <option value="donor">Blood Donor</option>
              <option value="receiver">Blood Receiver</option>
              <option value="bloodbank">Blood Bank</option>
            </select>
          </div>

          <div className="form-row">
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleInputChange}
              required 
            />
          </div>

          <div className="form-row">
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required 
            />
          </div>

          <p className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
          
          <button type="submit">Create Account</button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default SignUpPage;