// components/HomePage.jsx
import React from 'react';
import './HomePage.css'; // Create HomePage.css for styling

function HomePage() {
  return (
    <div className="home-container">
      <header>
        <h1>Welcome to Our Room Booking System</h1>
      </header>
      <img src="/LaLUNA_icon.jpg" alt="Room" className="room-image" />
      <p>Place for you to always play aerial!</p>
    </div>
  );
}

export default HomePage;