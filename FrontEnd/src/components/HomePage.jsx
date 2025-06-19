import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import './HomePage.css';
import Footer from './Footer';
import Header from './Header';

const bloodInfo = {
  "A+": "A+ can donate to A+ and AB+. Receive from A+, A-, O+, O-.",
  "O+": "O+ can donate to O+, A+, B+, AB+. Receive from O+, O-.",
  "B+": "B+ can donate to B+ and AB+. Receive from B+, B-, O+, O-.",
  "AB+": "Universal recipient. Can receive from all groups. Donate to AB+ only.",
  "A-": "A- can donate to A+, A-, AB+, AB-. Receive from A-, O-.",
  "O-": "Universal donor. Can donate to all. Receive from O- only.",
  "B-": "B- can donate to B+, B-, AB+, AB-. Receive from B-, O-.",
  "AB-": "Can donate to AB+ and AB-. Receive from AB-, A-, B-, O-."
};

export default function HomePage() {
  const [hoveredGroup, setHoveredGroup] = useState("");

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <div className="hero-section">
          <h1 className="main-title">"A HeartBeat Fades Where a Hero Hesitates..."</h1>
          <div className="subtitle-container">
            <p className="subtitle">Every drop counts. Every donation saves lives. Be the hero someone needs today.</p>
          </div>
        </div>
        
        <div className="donation-section">
          <h2 className="section-title">LEARN ABOUT DONATION</h2>
          <p className="section-description">
            Discover your blood type compatibility and learn how you can make a difference
          </p>

          <div className="blood-groups">
            {Object.keys(bloodInfo).map((group, index) => (
              <div key={group} className="platelet-wrapper" style={{animationDelay: `${index * 0.1}s`}}>
                <div
                  className="blood-group"
                  onMouseEnter={() => setHoveredGroup(group)}
                  onMouseLeave={() => setHoveredGroup("")}
                >
                  <span className="blood-type">{group}</span>
                  {hoveredGroup === group && (
                    <div className="tooltip">{bloodInfo[group]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
