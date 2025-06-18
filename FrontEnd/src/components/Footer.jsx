import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-column">
          <h3>Looking for Blood</h3>
          <ul>
            <Link to="/availability">Blood availability</Link>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Want to Donate Blood</h3>
          <ul>
             <Link to="/gallery">About blood donation</Link>
             <br></br>
              <Link to="/login">Donor Login</Link>
              <br></br>
               <Link to="/login">Receiver login</Link>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Blood Center Login</h3>
          <ul>
            <li><Link to ="/login">FindMyDonor</Link></li>
                  

          </ul>
        </div>

        <div className="footer-column">
          <h3>About Us</h3>
          <ul>
            <li><Link to ="/about">About FindMyDonor</Link></li>
            <li><Link to ="/faq">FAQs</Link></li>
            <li><Link to ="/gallery">Gallery</Link></li>
            <li><Link to ="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-logos">
        <img src="/" alt="FindMyDonor" />
        <img src="/ministry_logo.png" alt="Ministry Logo" />
        <img src="/mobileapp_logo.png" alt="Mobile App" />
        <img src="/nhp_logo.png" alt="NHP India" />
        <img src="/india_logo.png" alt="India.gov.in" />
      </div>

      <div className="footer-bottom">
        <p>
          Terms & Conditions | Privacy Policy | Accessibility | Last Updated: 13 June 2025 | Site Map <br />
          © 2016-2025 Ministry of Health and Family Welfare <br />
          Designed & Developed by CDAC
        </p>
      </div>
    </footer>
  );
};

export default Footer;