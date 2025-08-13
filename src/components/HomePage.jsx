// components/HomePage.jsx
import React from 'react';
import './HomePage.css'; // Create HomePage.css for styling


function HomePage() {
  return (
    <div className="home-container">
      <header>
        <h1>Hello! Welcome to La LUNA Aerial Dance Studio</h1>
      </header>
      <img src={require('../assets/LaLUNA_icon.jpg')} alt="Room" className="room-image" />
    </div>
  );
}

export default HomePage;