import React from 'react';
import FAQItem from './FAQItem';
import './FAQPage.css';
import Footer from './Footer';
import Header from './Header';

function FAQPage() {
  return (
    <div className="faq-page">
       <Header/>
      <header className="header">
        
       
        <h1 className="faq-title">FAQ'S</h1>
        
      
      </header>

      <main>
        <FAQItem 
          question="Who can donate blood?" 
          answer="Most healthy individuals above 18 years of age and weighing at least 50kg can donate blood." 
        />
        <FAQItem 
          question="How long does a blood donation take?" 
          answer="The entire process takes about 30 minutes, but the actual blood collection takes only 8-10 minutes." 
        />
        <FAQItem 
          question="Is blood donation painful?" 
          answer="You may feel a slight pinch when the needle is inserted, but there is no severe pain." 
        />
        <FAQItem 
          question="What should I do after donating blood?" 
          answer="Rest for a while, drink fluids, avoid heavy activity, and eat a healthy meal." 
        /><Footer/>
      </main>
      
    </div>
  );
}

export default FAQPage;