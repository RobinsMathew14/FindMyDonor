import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage.jsx'; 
import Gallery from './components/Gallery.jsx';
import BloodStockAvailability from './components/BloodStockAvailability.jsx';
import LoginPage from './components/LoginPage.jsx';
import AboutPage from './components/AboutPage.jsx';
import FAQPage from './components/FAQPage.jsx';
import ContactPage from './components/ContactPage.jsx';
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/availability" element={<BloodStockAvailability />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/contact" element={<ContactPage />} />  
    </Routes>
  );
}

export default App;
