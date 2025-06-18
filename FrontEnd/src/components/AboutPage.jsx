import './AboutPage.css';
import Footer from './Footer';
import Header from './Header';
function AboutPage() {
  return (
    <div>
      <Header/>
    <div className="about-container">
      <div className="content-wrapper">
        <h1 className="about-title">ABOUT US</h1>
        <p className="about-subtitle">Connecting donors and recipients for a better future</p>
        
        <div className="divider"></div>
        
        <div className="section">
          <h2 className="section-title">FEATURES & FUNCTION</h2>
          <div className="section-content">
            <p>Easy to Search</p>
            <p>Register as a Donor</p>
            <p>Secure Communication</p>
          </div>
        </div>
        
        <div className="section">
          <h2 className="section-title">OUR OBJECTIVE</h2>
          <div className="section-content">
            <p>Raise awareness about blood and organ donation</p>
            <p>Increase registered donors</p>
            <p>Provide a reliable donor matching platform</p>
          </div>     

        </div>
        
        
      </div>
    </div> 
    <Footer/>
</div>
  );
}

export default AboutPage;