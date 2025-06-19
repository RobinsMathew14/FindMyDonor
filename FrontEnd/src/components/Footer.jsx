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
             <br></br>
              <Link to="/login">Donor Login</Link>
              <br></br>
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
        <img src="https://t4.ftcdn.net/jpg/10/08/29/09/360_F_1008290988_URO1T4omQhleLR0Iy0Z2wTLK26BMDwXo.jpg" alt="FindMyDonor" />
        <img src="https://pbs.twimg.com/media/FCM8GaZUYAccsV5.jpg:large" alt="Ministry Logo" />
        <img src="https://mir-s3-cdn-cf.behance.net/projects/404/d67f72141526863.Y3JvcCw1NTIwLDQzMTcsMCww.png" alt="Mobile App" />
        <img src="https://www.rvsolutions.in/wp-content/uploads/2024/06/National-Health-Portal.jpg" alt="NHP India" />
        <img src="https://www.logopeople.in/wp-content/uploads/2013/01/government-of-india.jpg" alt="India.gov.in" />
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