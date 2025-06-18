import './Gallery.css';
import React from 'react';
import Footer from './Footer';
import Header from './Header';
const Gallery = () => {
  return (
    <div className="gallery-container">
       <Header/>
      <h1>GALLERY</h1>

      <div className="gallery-section">
        <h2>Image Gallery</h2>
        <div className="media-grid">
          <img src="https://mgmhealthcare.in/wp-content/uploads/2022/06/Amazing-things-that-happen-to-your-body-when-you-donate-blood-big-1.jpg" alt="image1" className="media-circle" />
          <img src="https://surgmedia.com/wp-content/uploads/2020/10/2171-blood-donation.jpg" alt="image2" className="media-circle" />
          <img src="https://bsols.edu.in/wp-content/uploads/2025/02/Blood-Donation-scaled.jpg" alt="image3" className="media-circle" />
          <img src="https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/05/GettyImages-1129729012_header-1024x575.jpg?w=1155&h=1528" alt="image4" className="media-circle" />
        </div>
      </div>

      <div className="gallery-section">
        <h2>Video Gallery</h2>
        <div className="media-grid">
          <iframe
            width="300"
            height="200"
            src="https://www.youtube.com/embed/kOISEM6L4xk"
            title="YouTube Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>

        </div>
        <Footer/>
      </div>
    </div>
  );
};

export default Gallery;
