import React, { useState, useEffect } from 'react';
import './DonorForm.css';
import Header from './Header';
import Footer from './Footer';
import { getAvailableLanguages, getTranslations } from '../data/languageData';
import { getStates, getDistricts, getCities } from '../data/hospitalData';

const DonorForm = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    surname: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    bloodGroup: '',
    weight: '',
    height: '',
    occupation: '',
    organization: '',
    
    // Contact Information
    address: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    telephone: '',
    mobile: '',
    email: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    
    // Donation History
    donatedBefore: '',
    donationTimes: '',
    lastDonationDate: '',
    previousDiscomfort: '',
    discomfortDetails: '',
    
    // Current Health Status
    feelWellToday: '',
    eatenLast4Hours: '',
    sleptWell: '',
    infectionRisk: '',
    familyJaundice: '',
    
    // Recent Health Issues
    recentSymptoms: [],
    bodyModifications: [],
    
    // Medical History
    medicalConditions: [],
    medicationDetails: '',
    
    // Recent Medications
    recentMedications: [],
    medicationNames: '',
    
    // Recent Procedures
    recentProcedures: [],
    procedureDetails: '',
    
    // Lifestyle
    alcoholLast24hrs: '',
    smoking: '',
    drugUse: '',
    
    // For Women
    isPregnant: '',
    breastfeeding: '',
    hadAbortion: '',
    inMenstruation: '',
    
    // Declaration
    declaration: false,
    consent: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages = getAvailableLanguages();
  const states = getStates();
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const totalSteps = 6;

  // Load translations when language changes
  useEffect(() => {
    setTranslations(getTranslations(currentLanguage));
  }, [currentLanguage]);

  // Update districts when state changes
  useEffect(() => {
    if (formData.state) {
      setDistricts(getDistricts(formData.state));
      setFormData(prev => ({ ...prev, district: '', city: '' }));
      setCities([]);
    } else {
      setDistricts([]);
      setCities([]);
    }
  }, [formData.state]);

  // Update cities when district changes
  useEffect(() => {
    if (formData.state && formData.district) {
      setCities(getCities(formData.state, formData.district));
      setFormData(prev => ({ ...prev, city: '' }));
    } else {
      setCities([]);
    }
  }, [formData.state, formData.district]);

  // Calculate age from date of birth
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFormData(prev => ({ ...prev, age: (age - 1).toString() }));
      } else {
        setFormData(prev => ({ ...prev, age: age.toString() }));
      }
    }
  }, [formData.dateOfBirth]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxArrayChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => {
      const currentValues = [...prev[name]];
      if (checked) {
        currentValues.push(value);
      } else {
        const index = currentValues.indexOf(value);
        if (index > -1) {
          currentValues.splice(index, 1);
        }
      }
      return { ...prev, [name]: currentValues };
    });
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = translations.required || 'Required';
        if (!formData.surname.trim()) newErrors.surname = translations.required || 'Required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = translations.required || 'Required';
        if (!formData.gender) newErrors.gender = translations.required || 'Required';
        if (!formData.bloodGroup) newErrors.bloodGroup = translations.required || 'Required';
        if (!formData.weight || formData.weight < 45) newErrors.weight = translations.weightLimit || 'Weight must be at least 45 kg';
        if (formData.age && (formData.age < 18 || formData.age > 65)) newErrors.age = translations.ageLimit || 'Age must be between 18 and 65';
        break;
        
      case 2: // Contact Information
        if (!formData.mobile.trim()) newErrors.mobile = translations.required || 'Required';
        if (!formData.email.trim()) newErrors.email = translations.required || 'Required';
        if (!formData.state) newErrors.state = translations.required || 'Required';
        if (!formData.district) newErrors.district = translations.required || 'Required';
        if (!formData.city) newErrors.city = translations.required || 'Required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = translations.invalidEmail || 'Invalid email';
        }
        if (formData.mobile && !/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
          newErrors.mobile = translations.invalidPhone || 'Invalid phone number';
        }
        break;
        
      case 3: // Health Status
        if (!formData.feelWellToday) newErrors.feelWellToday = translations.required || 'Required';
        if (!formData.eatenLast4Hours) newErrors.eatenLast4Hours = translations.required || 'Required';
        if (!formData.sleptWell) newErrors.sleptWell = translations.required || 'Required';
        break;
        
      case 6: // Declaration
        if (!formData.declaration) newErrors.declaration = translations.required || 'Required';
        if (!formData.consent) newErrors.consent = translations.required || 'Required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form submitted:', formData);
      alert('Form submitted successfully! Thank you for your donation.');
      
      // Reset form
      setFormData({
        firstName: '', middleName: '', surname: '', dateOfBirth: '', age: '',
        gender: '', bloodGroup: '', weight: '', height: '', occupation: '',
        organization: '', address: '', state: '', district: '', city: '',
        pincode: '', telephone: '', mobile: '', email: '', emergencyName: '',
        emergencyRelation: '', emergencyPhone: '', donatedBefore: '',
        donationTimes: '', lastDonationDate: '', previousDiscomfort: '',
        discomfortDetails: '', feelWellToday: '', eatenLast4Hours: '',
        sleptWell: '', infectionRisk: '', familyJaundice: '', recentSymptoms: [],
        bodyModifications: [], medicalConditions: [], medicationDetails: '',
        recentMedications: [], medicationNames: '', recentProcedures: [],
        procedureDetails: '', alcoholLast24hrs: '', smoking: '', drugUse: '',
        isPregnant: '', breastfeeding: '', hadAbortion: '', inMenstruation: '',
        declaration: false, consent: false
      });
      setCurrentStep(1);
      
    } catch (error) {
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInformation();
      case 2:
        return renderContactInformation();
      case 3:
        return renderHealthStatus();
      case 4:
        return renderMedicalHistory();
      case 5:
        return renderLifestyleQuestions();
      case 6:
        return renderDeclaration();
      default:
        return null;
    }
  };

  const renderPersonalInformation = () => (
    <div className="form-step">
      <h2 className="step-title">{translations.personalInfo || 'Personal Information'}</h2>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            {translations.firstName || 'First Name'} *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`form-input ${errors.firstName ? 'error' : ''}`}
            placeholder={translations.firstName || 'First Name'}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">{translations.middleName || 'Middle Name'}</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleInputChange}
            className="form-input"
            placeholder={translations.middleName || 'Middle Name'}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            {translations.surname || 'Surname'} *
          </label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            className={`form-input ${errors.surname ? 'error' : ''}`}
            placeholder={translations.surname || 'Surname'}
          />
          {errors.surname && <span className="error-message">{errors.surname}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            {translations.dateOfBirth || 'Date of Birth'} *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
          />
          {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">{translations.age || 'Age'}</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            className={`form-input ${errors.age ? 'error' : ''}`}
            placeholder={translations.age || 'Age'}
            readOnly
          />
          {errors.age && <span className="error-message">{errors.age}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            {translations.gender || 'Gender'} *
          </label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.male || 'Male'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.female || 'Female'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="gender"
                value="other"
                checked={formData.gender === 'other'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.other || 'Other'}</span>
            </label>
          </div>
          {errors.gender && <span className="error-message">{errors.gender}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            {translations.bloodGroup || 'Blood Group'} *
          </label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleInputChange}
            className={`form-select ${errors.bloodGroup ? 'error' : ''}`}
          >
            <option value="">{translations.bloodGroup || 'Select Blood Group'}</option>
            {bloodGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          {errors.bloodGroup && <span className="error-message">{errors.bloodGroup}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            {translations.weight || 'Weight (kg)'} *
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            className={`form-input ${errors.weight ? 'error' : ''}`}
            placeholder="45"
            min="45"
            max="200"
          />
          {errors.weight && <span className="error-message">{errors.weight}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">{translations.height || 'Height (cm)'}</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            className="form-input"
            placeholder="170"
            min="100"
            max="250"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{translations.occupation || 'Occupation'}</label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleInputChange}
            className="form-input"
            placeholder={translations.occupation || 'Occupation'}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{translations.organization || 'Organization'}</label>
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleInputChange}
            className="form-input"
            placeholder={translations.organization || 'Organization'}
          />
        </div>
      </div>
    </div>
  );

  const renderContactInformation = () => (
    <div className="form-step">
      <h2 className="step-title">Contact Information</h2>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label className="form-label">{translations.address || 'Address'}</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder={translations.address || 'Complete Address'}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            {translations.state || 'State'} *
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className={`form-select ${errors.state ? 'error' : ''}`}
          >
            <option value="">{translations.state || 'Select State'}</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && <span className="error-message">{errors.state}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            {translations.district || 'District'} *
          </label>
          <select
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className={`form-select ${errors.district ? 'error' : ''}`}
            disabled={!formData.state}
          >
            <option value="">{translations.district || 'Select District'}</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          {errors.district && <span className="error-message">{errors.district}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            {translations.city || 'City'} *
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={`form-select ${errors.city ? 'error' : ''}`}
            disabled={!formData.district}
          >
            <option value="">{translations.city || 'Select City'}</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">{translations.pincode || 'PIN Code'}</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            className="form-input"
            placeholder="123456"
            maxLength="6"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            {translations.mobile || 'Mobile'} *
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className={`form-input ${errors.mobile ? 'error' : ''}`}
            placeholder="+91 9876543210"
          />
          {errors.mobile && <span className="error-message">{errors.mobile}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">{translations.telephone || 'Telephone'}</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleInputChange}
            className="form-input"
            placeholder="080-12345678"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            {translations.email || 'Email'} *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="example@email.com"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
      </div>

      <div className="emergency-contact-section">
        <h3 className="subsection-title">{translations.emergencyContact || 'Emergency Contact'}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">{translations.emergencyName || 'Contact Name'}</label>
            <input
              type="text"
              name="emergencyName"
              value={formData.emergencyName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Emergency contact name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{translations.emergencyRelation || 'Relationship'}</label>
            <input
              type="text"
              name="emergencyRelation"
              value={formData.emergencyRelation}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Father/Mother/Spouse/Friend"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{translations.emergencyPhone || 'Phone Number'}</label>
            <input
              type="tel"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="+91 9876543210"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderHealthStatus = () => (
    <div className="form-step">
      <h2 className="step-title">{translations.currentHealth || 'Current Health Status'}</h2>
      
      <div className="questions-section">
        <div className="question-item">
          <p className="question-text">
            {translations.feelWellToday || 'Do you feel well today?'} *
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="feelWellToday"
                value="yes"
                checked={formData.feelWellToday === 'yes'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.yes || 'Yes'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="feelWellToday"
                value="no"
                checked={formData.feelWellToday === 'no'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.no || 'No'}</span>
            </label>
          </div>
          {errors.feelWellToday && <span className="error-message">{errors.feelWellToday}</span>}
        </div>

        <div className="question-item">
          <p className="question-text">
            {translations.eatenLast4Hours || 'Have you eaten in the last 4 hours?'} *
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="eatenLast4Hours"
                value="yes"
                checked={formData.eatenLast4Hours === 'yes'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.yes || 'Yes'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="eatenLast4Hours"
                value="no"
                checked={formData.eatenLast4Hours === 'no'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.no || 'No'}</span>
            </label>
          </div>
          {errors.eatenLast4Hours && <span className="error-message">{errors.eatenLast4Hours}</span>}
        </div>

        <div className="question-item">
          <p className="question-text">
            {translations.sleptWell || 'Did you sleep well last night?'} *
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="sleptWell"
                value="yes"
                checked={formData.sleptWell === 'yes'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.yes || 'Yes'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="sleptWell"
                value="no"
                checked={formData.sleptWell === 'no'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.no || 'No'}</span>
            </label>
          </div>
          {errors.sleptWell && <span className="error-message">{errors.sleptWell}</span>}
        </div>

        <div className="question-item">
          <p className="question-text">
            {translations.infectionRisk || 'Have you any reason to believe that you may be infected by either Hepatitis, Malaria, HIV/AIDS, Venereal disease?'}
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="infectionRisk"
                value="yes"
                checked={formData.infectionRisk === 'yes'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.yes || 'Yes'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="infectionRisk"
                value="no"
                checked={formData.infectionRisk === 'no'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.no || 'No'}</span>
            </label>
          </div>
        </div>

        <div className="question-item">
          <p className="question-text">
            {translations.familyJaundice || 'Has any of your family member had jaundice in the last 12 months?'}
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="familyJaundice"
                value="yes"
                checked={formData.familyJaundice === 'yes'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.yes || 'Yes'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="familyJaundice"
                value="no"
                checked={formData.familyJaundice === 'no'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.no || 'No'}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="donation-history-section">
        <h3 className="subsection-title">{translations.donationHistory || 'Donation History'}</h3>
        
        <div className="question-item">
          <p className="question-text">
            {translations.donatedBefore || 'Have you donated previously?'}
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="donatedBefore"
                value="yes"
                checked={formData.donatedBefore === 'yes'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.yes || 'Yes'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="donatedBefore"
                value="no"
                checked={formData.donatedBefore === 'no'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.no || 'No'}</span>
            </label>
          </div>
        </div>

        {formData.donatedBefore === 'yes' && (
          <div className="conditional-fields">
            <div className="form-group">
              <label className="form-label">{translations.donationTimes || 'How many times?'}</label>
              <input
                type="number"
                name="donationTimes"
                value={formData.donationTimes}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                max="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{translations.lastDonationDate || 'Last Blood Donation Date'}</label>
              <input
                type="date"
                name="lastDonationDate"
                value={formData.lastDonationDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="question-item">
              <p className="question-text">
                {translations.previousDiscomfort || 'Did you have any discomfort during/after previous donation?'}
              </p>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="previousDiscomfort"
                    value="yes"
                    checked={formData.previousDiscomfort === 'yes'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">{translations.yes || 'Yes'}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="previousDiscomfort"
                    value="no"
                    checked={formData.previousDiscomfort === 'no'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">{translations.no || 'No'}</span>
                </label>
              </div>
            </div>

            {formData.previousDiscomfort === 'yes' && (
              <div className="form-group">
                <label className="form-label">Please describe the discomfort:</label>
                <textarea
                  name="discomfortDetails"
                  value={formData.discomfortDetails}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="3"
                  placeholder="Describe any discomfort experienced..."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderMedicalHistory = () => (
    <div className="form-step">
      <h2 className="step-title">{translations.medicalHistory || 'Medical History'}</h2>
      
      <div className="checkbox-section">
        <h3 className="subsection-title">{translations.recentHealthIssues || 'Recent Health Issues (Last 6 months)'}</h3>
        <div className="checkbox-grid">
          {[
            'Unexplained weight loss',
            'Repeated Diarrhea',
            'Swollen glands',
            'Continuous low-grade fever',
            'Persistent Cough',
            'None of the above'
          ].map(symptom => (
            <label key={symptom} className="checkbox-label">
              <input
                type="checkbox"
                name="recentSymptoms"
                value={symptom}
                checked={formData.recentSymptoms.includes(symptom)}
                onChange={handleCheckboxArrayChange}
              />
              <span className="checkbox-text">{translations[symptom.toLowerCase().replace(/\s+/g, '')] || symptom}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="checkbox-section">
        <h3 className="subsection-title">Body Modifications (Last 6 months)</h3>
        <div className="checkbox-grid">
          {[
            'Tattooing',
            'Body Piercing',
            'None of these'
          ].map(modification => (
            <label key={modification} className="checkbox-label">
              <input
                type="checkbox"
                name="bodyModifications"
                value={modification}
                checked={formData.bodyModifications.includes(modification)}
                onChange={handleCheckboxArrayChange}
              />
              <span className="checkbox-text">{translations[modification.toLowerCase().replace(/\s+/g, '')] || modification}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="checkbox-section">
        <h3 className="subsection-title">Medical Conditions</h3>
        <div className="checkbox-grid">
          {[
            'Cancer/Malignant Disease',
            'Diabetes on Insulin',
            'Heart Disease',
            'Kidney Disease',
            'Liver Disease',
            'Blood Disorder',
            'Epilepsy',
            'Tuberculosis',
            'Asthma',
            'Hypertension',
            'None of the above'
          ].map(condition => (
            <label key={condition} className="checkbox-label">
              <input
                type="checkbox"
                name="medicalConditions"
                value={condition}
                checked={formData.medicalConditions.includes(condition)}
                onChange={handleCheckboxArrayChange}
              />
              <span className="checkbox-text">{translations[condition.toLowerCase().replace(/[^a-z]/g, '')] || condition}</span>
            </label>
          ))}
        </div>
      </div>

      {formData.medicalConditions.length > 0 && !formData.medicalConditions.includes('None of the above') && (
        <div className="form-group">
          <label className="form-label">Please provide details about your medical conditions:</label>
          <textarea
            name="medicationDetails"
            value={formData.medicationDetails}
            onChange={handleInputChange}
            className="form-textarea"
            rows="3"
            placeholder="Provide details about your medical conditions, treatments, medications..."
          />
        </div>
      )}

      <div className="checkbox-section">
        <h3 className="subsection-title">Recent Medications (Last 30 days)</h3>
        <div className="checkbox-grid">
          {[
            'Antibiotics',
            'Pain Killers',
            'Blood Thinners',
            'Vitamins/Supplements',
            'None of the above'
          ].map(medication => (
            <label key={medication} className="checkbox-label">
              <input
                type="checkbox"
                name="recentMedications"
                value={medication}
                checked={formData.recentMedications.includes(medication)}
                onChange={handleCheckboxArrayChange}
              />
              <span className="checkbox-text">{translations[medication.toLowerCase().replace(/[^a-z]/g, '')] || medication}</span>
            </label>
          ))}
        </div>
      </div>

      {formData.recentMedications.length > 0 && !formData.recentMedications.includes('None of the above') && (
        <div className="form-group">
          <label className="form-label">Please list the medication names and dosages:</label>
          <textarea
            name="medicationNames"
            value={formData.medicationNames}
            onChange={handleInputChange}
            className="form-textarea"
            rows="3"
            placeholder="List medication names, dosages, and duration..."
          />
        </div>
      )}

      <div className="checkbox-section">
        <h3 className="subsection-title">Recent Medical Procedures (Last 12 months)</h3>
        <div className="checkbox-grid">
          {[
            'Surgery',
            'Blood Transfusion',
            'Vaccination',
            'Dental Work',
            'Endoscopy',
            'None of the above'
          ].map(procedure => (
            <label key={procedure} className="checkbox-label">
              <input
                type="checkbox"
                name="recentProcedures"
                value={procedure}
                checked={formData.recentProcedures.includes(procedure)}
                onChange={handleCheckboxArrayChange}
              />
              <span className="checkbox-text">{translations[procedure.toLowerCase().replace(/\s+/g, '')] || procedure}</span>
            </label>
          ))}
        </div>
      </div>

      {formData.recentProcedures.length > 0 && !formData.recentProcedures.includes('None of the above') && (
        <div className="form-group">
          <label className="form-label">Please provide details about the procedures:</label>
          <textarea
            name="procedureDetails"
            value={formData.procedureDetails}
            onChange={handleInputChange}
            className="form-textarea"
            rows="3"
            placeholder="Provide details about procedures, dates, hospitals..."
          />
        </div>
      )}
    </div>
  );

  const renderLifestyleQuestions = () => (
    <div className="form-step">
      <h2 className="step-title">{translations.lifestyle || 'Lifestyle Information'}</h2>
      
      <div className="questions-section">
        <div className="question-item">
          <p className="question-text">
            {translations.alcoholLast24hrs || 'Have you consumed alcohol in the last 24 hours?'}
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="alcoholLast24hrs"
                value="yes"
                checked={formData.alcoholLast24hrs === 'yes'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.yes || 'Yes'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="alcoholLast24hrs"
                value="no"
                checked={formData.alcoholLast24hrs === 'no'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.no || 'No'}</span>
            </label>
          </div>
        </div>

        <div className="question-item">
          <p className="question-text">
            {translations.smoking || 'Do you smoke?'}
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="smoking"
                value="yes"
                checked={formData.smoking === 'yes'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.yes || 'Yes'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="smoking"
                value="no"
                checked={formData.smoking === 'no'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.no || 'No'}</span>
            </label>
          </div>
        </div>

        <div className="question-item">
          <p className="question-text">
            {translations.drugUse || 'Have you ever used recreational drugs?'}
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="drugUse"
                value="yes"
                checked={formData.drugUse === 'yes'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.yes || 'Yes'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="drugUse"
                value="no"
                checked={formData.drugUse === 'no'}
                onChange={handleInputChange}
              />
              <span className="radio-text">{translations.no || 'No'}</span>
            </label>
          </div>
        </div>
      </div>

      {formData.gender === 'female' && (
        <div className="women-section">
          <h3 className="subsection-title">{translations.forWomen || 'For Women Only'}</h3>
          
          <div className="questions-section">
            <div className="question-item">
              <p className="question-text">
                {translations.isPregnant || 'Are you pregnant?'}
              </p>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="isPregnant"
                    value="yes"
                    checked={formData.isPregnant === 'yes'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">{translations.yes || 'Yes'}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="isPregnant"
                    value="no"
                    checked={formData.isPregnant === 'no'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">{translations.no || 'No'}</span>
                </label>
              </div>
            </div>

            <div className="question-item">
              <p className="question-text">
                {translations.breastfeeding || 'Are you breastfeeding?'}
              </p>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="breastfeeding"
                    value="yes"
                    checked={formData.breastfeeding === 'yes'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">{translations.yes || 'Yes'}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="breastfeeding"
                    value="no"
                    checked={formData.breastfeeding === 'no'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">{translations.no || 'No'}</span>
                </label>
              </div>
            </div>

            <div className="question-item">
              <p className="question-text">
                {translations.hadAbortion || 'Have you had an abortion/miscarriage in the last 6 months?'}
              </p>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="hadAbortion"
                    value="yes"
                    checked={formData.hadAbortion === 'yes'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">{translations.yes || 'Yes'}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="hadAbortion"
                    value="no"
                    checked={formData.hadAbortion === 'no'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">{translations.no || 'No'}</span>
                </label>
              </div>
            </div>

            <div className="question-item">
              <p className="question-text">
                {translations.inMenstruation || 'Are you currently menstruating?'}
              </p>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="inMenstruation"
                    value="yes"
                    checked={formData.inMenstruation === 'yes'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">{translations.yes || 'Yes'}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="inMenstruation"
                    value="no"
                    checked={formData.inMenstruation === 'no'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-text">{translations.no || 'No'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDeclaration = () => (
    <div className="form-step">
      <h2 className="step-title">{translations.declaration || 'Declaration & Consent'}</h2>
      
      <div className="declaration-section">
        <div className="declaration-content">
          <p className="declaration-text">
            {translations.declarationText || 'I declare that the information given by me is true to the best of my knowledge and I have not withheld any information that might affect my eligibility as a blood donor.'}
          </p>
          
          <p className="declaration-text">
            I understand that:
          </p>
          <ul className="declaration-list">
            <li>Blood donation is voluntary and no payment is made for blood donation</li>
            <li>The blood collected will be tested for transfusion transmissible infections</li>
            <li>If found positive, I will be informed and counseled appropriately</li>
            <li>My personal information will be kept confidential</li>
            <li>I have the right to withdraw my consent at any time before the donation</li>
          </ul>

          <div className="consent-checkboxes">
            <label className={`checkbox-label declaration-checkbox ${errors.declaration ? 'error' : ''}`}>
              <input
                type="checkbox"
                name="declaration"
                checked={formData.declaration}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">
                I declare that all the information provided above is true and accurate *
              </span>
            </label>
            {errors.declaration && <span className="error-message">{errors.declaration}</span>}

            <label className={`checkbox-label declaration-checkbox ${errors.consent ? 'error' : ''}`}>
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">
                {translations.consent || 'I consent to donate blood'} *
              </span>
            </label>
            {errors.consent && <span className="error-message">{errors.consent}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="donor-form-container">
      <Header />
      
      <div className="form-content">
        <div className="form-header">
          <div className="language-selector">
            <label htmlFor="language-select">Language / भाषा:</label>
            <select
              id="language-select"
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="language-select"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="confidential-badge">
            {translations.confidential || 'CONFIDENTIAL'}
          </div>
        </div>

        <div className="form-title-section">
          <h1 className="form-title">
            {translations.formTitle || 'BLOOD DONOR QUESTIONNAIRE & CONSENT FORM'}
          </h1>
          <p className="form-instruction">
            {translations.instruction1 || 'Please answer the questions correctly. This will help to protect you and the patient who receives your blood.'}
          </p>
          <p className="form-instruction">
            {translations.instruction2 || '(✔) Tick wherever applicable'}
          </p>
        </div>

        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="step-indicators">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div 
                key={i + 1} 
                className={`step-indicator ${currentStep >= i + 1 ? 'active' : ''} ${currentStep === i + 1 ? 'current' : ''}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="step-text">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="donor-form">
          {renderStepContent()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="nav-button prev-button"
              >
                ← Previous
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="nav-button next-button"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  translations.submit || 'Submit Form'
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default DonorForm;