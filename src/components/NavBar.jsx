import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { auth } from '../assets/firebaseConfig';
import './NavBar.css';

const adminUid = 'm27guDkDb4dL7NRm0HfEYYI2Ouw1';
const oldAdminUid='796IkiShehcJ4BQFCXEnpe8If7t1';

function Navbar({ onLinkClick }) {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const username = user.displayName;
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

      <div className='navbar-right'>
        <ul className='navbar-links'>
          <li>
            <Link to="/" onClick={onLinkClick}>Home</Link> {/* Use Link for Home */}
          </li>

          <li>
            <Link to="/schedule" onClick={onLinkClick}>Schedule</Link> {/* Use Link for Booking */}
          </li>
          
          <li>
            <Link to="/price" onClick={onLinkClick}>Price</Link>
          </li>

          {!isLoggedIn && (
            <li>
              <Link to="/login" onClick={onLinkClick}>Login</Link>
            </li>
          )}

          {isLoggedIn && (
            <li>
              <Link to="/my-bookings" onClick={onLinkClick}>My Bookings & Packages</Link>
            </li>
          )}

          {isLoggedIn && (
            <li>
              <Link to="/shopping-cart" onClick={onLinkClick}>Shopping Cart</Link>
            </li>
          )}

          {isLoggedIn && (
          <li>
            <Link to="/buy-packages" onClick={onLinkClick}>Purchase Packages</Link> {/* Use Link for Booking */}
          </li>
          )}

          {isAdmin && (
            <li>
              <Link to="/admin" onClick={onLinkClick}>Admin Page</Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link to="/view-all-bookings" onClick={onLinkClick}>View All Bookings</Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link to="/view-all-packages" onClick={onLinkClick}>View All Packages</Link>
            </li>
          )}
          
          {isLoggedIn && (
            <li>
              <Link to="/account-information" onClick={onLinkClick}>Account Information</Link>
            </li>
          )}

          {isLoggedIn && (
            <li>
              <Link to="/home" onClick={() => auth.signOut()}>Logout</Link>
            </li>
          )}

        </ul>
      </div>
    </nav>
  );
}

export default Navbar;