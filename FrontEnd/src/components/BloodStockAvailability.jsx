import React, { useState, useEffect } from 'react';
import './BloodStockAvailability.css';
import Footer from './Footer';
import Header from './Header';
import { 
  getStates, 
  getDistricts, 
  getCities, 
  searchBloodBanks,
  generateBloodStock 
} from '../data/hospitalData';

const BloodStockAvailability = () => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Load states on component mount
  useEffect(() => {
    setStates(getStates());
  }, []);

  // Update districts when state changes
  useEffect(() => {
    if (selectedState) {
      setDistricts(getDistricts(selectedState));
      setSelectedDistrict('');
      setSelectedCity('');
      setCities([]);
    } else {
      setDistricts([]);
      setCities([]);
    }
  }, [selectedState]);

  // Update cities when district changes
  useEffect(() => {
    if (selectedState && selectedDistrict) {
      setCities(getCities(selectedState, selectedDistrict));
      setSelectedCity('');
    } else {
      setCities([]);
    }
  }, [selectedState, selectedDistrict]);

  const handleSearch = async () => {
    if (!selectedState || !selectedDistrict || !selectedCity) {
      alert('Please select State, District, and City to search for blood availability.');
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    // Simulate API call delay
    setTimeout(() => {
      const results = searchBloodBanks(selectedState, selectedDistrict, selectedCity, selectedBloodGroup);
      setSearchResults(results);
      setShowResults(true);
      setIsLoading(false);
    }, 1500);
  };

  const resetSearch = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCity('');
    setSelectedBloodGroup('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getStockStatus = (stock, bloodType) => {
    if (!stock || !stock[bloodType]) return 'unavailable';
    const available = stock[bloodType].available;
    if (available === 0) return 'unavailable';
    if (available < 5) return 'critical';
    if (available < 15) return 'low';
    return 'available';
  };

  const getStockStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'low': return 'Low Stock';
      case 'critical': return 'Critical';
      case 'unavailable': return 'Not Available';
      default: return 'Unknown';
    }
  };

  return (
    <div className="blood-availability-container">
      <Header />
      
      <div className="availability-content">
        <div className="hero-section-availability">
          <h1 className="main-heading">Blood Stock Availability</h1>
          <p className="sub-heading">Find blood banks and check real-time blood availability across India</p>
        </div>

        <div className="search-section">
          <div className="search-header">
            <h2>SEARCH BLOOD AVAILABILITY</h2>
            <p>Select your location and blood group to find nearby blood banks</p>
          </div>

          <div className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label>State *</label>
                <select 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select State</option>
                  {states.map((state, idx) => (
                    <option key={idx} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>District *</label>
                <select 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="form-select"
                  disabled={!selectedState}
                >
                  <option value="">Select District</option>
                  {districts.map((district, idx) => (
                    <option key={idx} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>City *</label>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="form-select"
                  disabled={!selectedDistrict}
                >
                  <option value="">Select City</option>
                  {cities.map((city, idx) => (
                    <option key={idx} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Blood Group</label>
                <select 
                  value={selectedBloodGroup} 
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Blood Groups</option>
                  {bloodGroups.map((group, idx) => (
                    <option key={idx} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="button-group">
              <button 
                className="search-btn" 
                onClick={handleSearch}
                disabled={isLoading || !selectedState || !selectedDistrict || !selectedCity}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="search-icon">🔍</i>
                    Search Blood Banks
                  </>
                )}
              </button>
              
              <button className="reset-btn" onClick={resetSearch}>
                <i className="reset-icon">🔄</i>
                Reset
              </button>
            </div>
          </div>
        </div>

        {showResults && (
          <div className="results-section">
            <div className="results-header">
              <h3>Search Results</h3>
              <p>
                Found {searchResults.length} blood bank{searchResults.length !== 1 ? 's' : ''} 
                {selectedBloodGroup && ` with ${selectedBloodGroup} blood`} in {selectedCity}, {selectedDistrict}, {selectedState}
              </p>
            </div>

            {searchResults.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🏥</div>
                <h4>No Blood Banks Found</h4>
                <p>No blood banks found in the selected location. Please try a different location or contact nearby hospitals directly.</p>
              </div>
            ) : (
              <div className="hospitals-grid">
                {searchResults.map((hospital, index) => (
                  <div key={index} className="hospital-card">
                    <div className="hospital-header">
                      <h4 className="hospital-name">{hospital.name}</h4>
                      <span className={`hospital-type ${hospital.type.toLowerCase()}`}>
                        {hospital.type}
                      </span>
                    </div>

                    <div className="hospital-info">
                      <div className="info-item">
                        <span className="info-label">📍 Address:</span>
                        <span className="info-value">{hospital.address}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">📞 Contact:</span>
                        <span className="info-value">{hospital.contact}</span>
                      </div>
                    </div>

                    <div className="blood-stock-section">
                      <h5>Blood Stock Availability</h5>
                      <div className="blood-stock-grid">
                        {bloodGroups.map(bloodType => {
                          const status = getStockStatus(hospital.bloodStock, bloodType);
                          const stock = hospital.bloodStock[bloodType];
                          
                          return (
                            <div 
                              key={bloodType} 
                              className={`blood-stock-item ${status} ${selectedBloodGroup === bloodType ? 'highlighted' : ''}`}
                            >
                              <div className="blood-type">{bloodType}</div>
                              <div className="stock-info">
                                <div className="stock-units">{stock?.available || 0} units</div>
                                <div className="stock-status">{getStockStatusText(status)}</div>
                              </div>
                              <div className="last-updated">
                                Updated: {stock?.lastUpdated || 'N/A'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="hospital-actions">
                      <button className="contact-btn">
                        📞 Contact Hospital
                      </button>
                      <button className="directions-btn">
                        🗺️ Get Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="info-section">
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">🩸</div>
              <h4>Blood Donation Guidelines</h4>
              <p>Learn about eligibility criteria, preparation tips, and what to expect during blood donation.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🏥</div>
              <h4>Emergency Blood Request</h4>
              <p>For urgent blood requirements, contact the nearest blood bank directly or call emergency services.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📱</div>
              <h4>Mobile Blood Donation</h4>
              <p>Find mobile blood donation camps in your area and schedule your donation appointment.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BloodStockAvailability;