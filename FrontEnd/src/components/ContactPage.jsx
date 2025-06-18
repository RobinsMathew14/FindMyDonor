import React, { useState } from 'react';
import './ContactPage.css';
import Footer from './Footer';
import Header from './Header';
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    urgency: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        urgency: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="contact-page">
       <Header/>
      <div className="main-container">
        <div className="header-section">
          <h2 className="main-title2">Get in Touch</h2>
          <p className="main-description">
            Every second counts when someone needs blood. Reach out to us through any of the channels below 
            for immediate assistance or general inquiries.
          </p>
        </div>

        <div className="content-wrapper">
          <div className="contact-info-section">
            <div className="contact-info-card">
              <h3 className="section-title2">Contact Information</h3>
              
              <div className="contact-methods">
                <div className="contact-item emergency">
                  <div className="icon-container">
                    <span className="icon">📞</span>
                  </div>
                  <div className="contact-details">
                    <h4 className="contact-title">Emergency Hotline</h4>
                    <p className="contact-number">+1 (555) BLOOD-HELP</p>
                    <p className="contact-note">Available 24/7 for urgent requests</p>
                  </div>
                </div>

                {/* General Contact */}
                <div className="contact-item general">
                  <div className="icon-container">
                    <span className="icon">☎️</span>
                  </div>
                  <div className="contact-details">
                    <h4 className="contact-title">General Inquiries</h4>
                    <p className="contact-number">+1 (555) 123-4567</p>
                    <p className="contact-note">Mon-Fri: 8 AM - 8 PM</p>
                  </div>
                </div>

                {/* Email */}
                <div className="contact-item email">
                  <div className="icon-container">
                    <span className="icon">📧</span>
                  </div>
                  <div className="contact-details">
                    <h4 className="contact-title">Email Support</h4>
                    <p className="contact-number">help@donorfinder.org</p>
                    <p className="contact-note">Response within 2 hours</p>
                  </div>
                </div>

                {/* Address */}
                <div className="contact-item address">
                  <div className="icon-container">
                    <span className="icon">📍</span>
                  </div>
                  <div className="contact-details">
                    <h4 className="contact-title">Office Address</h4>
                    <p className="contact-address">123 Healthcare Plaza, Suite 456</p>
                    <p className="contact-address">Medical District, City, State 12345</p>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="contact-item hours">
                  <div className="icon-container">
                    <span className="icon">🕐</span>
                  </div>
                  <div className="contact-details">
                    <h4 className="contact-title">Office Hours</h4>
                    <p className="contact-schedule">Monday - Friday: 8:00 AM - 8:00 PM</p>
                    <p className="contact-schedule">Saturday: 9:00 AM - 5:00 PM</p>
                    <p className="contact-schedule">Sunday: Emergency calls only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="emergency-notice">
              <h3 className="emergency-title">🚨 Medical Emergency?</h3>
              <p className="emergency-text">
                If you're experiencing a life-threatening emergency, please call 911 immediately. 
                Our service is for connecting blood donors with recipients who need transfusions.
              </p>
              <div className="emergency-highlight">
                <p className="emergency-label">For urgent blood needs:</p>
                <p className="emergency-instruction">Call our emergency hotline first, then 911 if needed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">
              <span className="icon-large">❤️</span>
            </div>
            <h3 className="info-title">Save Lives</h3>
            <p className="info-description">Every donation can save up to 3 lives. Your contribution makes a difference.</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <span className="icon-large">✅</span>
            </div>
            <h3 className="info-title">Fast Response</h3>
            <p className="info-description">Our network ensures quick matching and response times for urgent needs.</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <span className="icon-large">📞</span>
            </div>
            <h3 className="info-title">24/7 Support</h3>
            <p className="info-description">Emergency hotline available around the clock for critical situations.</p>
           
          </div>
        </div>
         <Footer/>
      </div>
    </div>
  );
}