import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './NavBar.css';

function Navbar() {
  return (
    <nav className='navbar'>
      <div className='navbar-brand'>
        <Link to="/">My Booking Website</Link> {/* Use Link for the brand */}
      </div>
      <ul className='navbar-links'>
        <li>
          <Link to="/">Home</Link> {/* Use Link for Home */}
        </li>
        <li>
          <Link to="/booking">Booking</Link> {/* Use Link for Booking */}
        </li>
        <li>
          <Link to="/login">Login/Register</Link> {/* Add Login/Register link */}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;