import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const panel = document.getElementById('slidingPanel');
      const trigger = document.querySelector('.sliding-trigger');
      if (panel && !panel.contains(event.target) && !trigger.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <div className="navbar-morph">
        <div className="morph-content">
          <div className="morph-logo">
            <img src="https://t4.ftcdn.net/jpg/10/08/29/09/360_F_1008290988_URO1T4omQhleLR0Iy0Z2wTLK26BMDwXo.jpg" alt="Logo" className="logo-img" />
          </div>
          <div className="morph-logo1">FindMyDonor</div>

          <nav className="morph-menu">
            <div className="dropdown">
              <div className="dropdown-toggle morph-item"> <Link to="/">Home</Link></div>
              <div className="dropdown-content">
                <Link to="/about">About</Link>
                <Link to="/gallery">Gallery</Link>
                <Link to="/faq">FAQ's</Link>
              </div>
            </div>

            <div className="dropdown">
              <div className="dropdown-toggle morph-item">Find Donor</div>
              <div className="dropdown-content">
                <Link to="/availability">Blood Availability</Link>
              </div>
            </div>

            <div className="dropdown">
              <div className="dropdown-toggle morph-item"> <Link to="/contact">Contact</Link></div>
              <div className="dropdown-content">
              </div>
            </div>
          </nav>

          <Link to="/login" className="login-button">Login</Link>
        </div>
      </div>

    </>
  );
};

export default Header;
