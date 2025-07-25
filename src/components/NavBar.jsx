import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { auth } from '../assets/firebaseConfig';
import './NavBar.css';

const adminUid = '796IkiShehcJ4BQFCXEnpe8If7t1';

function Navbar() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const email = user.email;
        const username = email.split('@')[0];
        setUsername(username);
        setIsLoggedIn(true);
        if (user.uid === adminUid) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUsername('');
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });
  }, []);

  return (
    <nav className='navbar'>
      <div className='navbar-left'>
        {isLoggedIn && (
          <span>Welcome, {username}</span>
        )}
      </div>
      <div className='navbar-brand'>
        <Link to="/"><img src="/LaLUNA_icon.jpg" alt="Logo" style={{width: 50}}/></Link>
      </div>
      <div className='navbar-right'>
        <ul className='navbar-links'>
          <li>
            <Link to="/">Home</Link> {/* Use Link for Home */}
          </li>
          <li>
            <Link to="/booking">Booking</Link> {/* Use Link for Booking */}
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link to="/view-all-bookings">View All Bookings</Link>
            </li>
          )}
          
          {isLoggedIn && (
            <li>
              <Link to="/shopping-cart">Shopping Cart</Link>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <Link to="/my-bookings">My Bookings</Link>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <Link to="/login" onClick={() => auth.signOut()}>Logout</Link>
            </li>
          )}
          {!isLoggedIn && (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;