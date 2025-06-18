import React, { useState } from 'react';
import './BloodStockAvailability.css';
import Footer from './Footer';
import Header from './Header';
const BloodStockAvailability = () => {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  const handleSearch = () => {
  
    alert(`Searching for ${bloodGroup} in ${district}, ${state}`);

  };

  const states = ['Kerala', 'Tamil Nadu', 'Karnataka'];
  const districts = ['Kottayam', 'Chennai', 'Bangalore'];
  const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];

  return (
    <div className="container2">
       <Header/>
      <h1 className="heading">Blood Stock Availability</h1>
      <div className="availability-header">BLOOD AVAILABILITY</div>
      <div className="selectors">
        <select value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">STATE</option>
          {states.map((s, idx) => (
            <option key={idx} value={s}>{s}</option>
          ))}
        </select>
        <select value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">DISTRICT</option>
          {districts.map((d, idx) => (
            <option key={idx} value={d}>{d}</option>
          ))}
        </select>
        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
          <option value="">BLOODGROUP</option>
          {bloodGroups.map((b, idx) => (
            <option key={idx} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <button className="search-button" onClick={handleSearch}>SEARCH</button>
      <Footer/>
    </div>
  );
};

export default BloodStockAvailability;