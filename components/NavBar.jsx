import React from 'react';
import './NavBar.css';

function Navbar() {
  return (
    <nav className='navbar'>
      <div className='navbar-brand'>
        <a href='/'>My Booking Website</a>
      </div>
      <ul className='navbar-links'>
        <li>
          <a href='/'>Home</a>
        </li>
        <li>
          <a href='/booking'>Booking</a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
