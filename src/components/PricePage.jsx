// src/components/PricePage.jsx

import React from 'react';
import './PricePage.css';

function PricePage(){
  return (
    <div className="price-page">
      <h2>Single Booking Price</h2>
      <img src={require('../assets/SingleBookingPrice.jpg')} alt="Single Booking Price" />
      <h2>Rental Package Price</h2>
      <img src={require('../assets/RentalPackagePrice.jpg')} alt="Rental Package Price" />
    </div>
  );
};

export default PricePage;