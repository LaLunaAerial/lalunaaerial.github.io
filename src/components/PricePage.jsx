// src/components/PricePage.jsx

import React from 'react';
import './PricePage.css';

function PricePage(){
  return (
    <div className="price-page">
      <img src={require('../assets/SingleBookingPrice.jpg')} alt="Single Booking Price" />
      <img src={require('../assets/RentalPackagePrice.jpg')} alt="Rental Package Price" />
    </div>
  );
};

export default PricePage;