import React from 'react';
import './FAQPage.css';

function FAQItem({ question, answer }) {
  return (
    <div className="faq-item">
      <div className="question-bar">{question}</div>
      <div className="answer-bar">{answer}</div>
    </div>
  );
}

export default FAQItem;