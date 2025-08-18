import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { auth } from '../assets/firebaseConfig';
import './NavBar.css';

const adminUid = 'm27guDkDb4dL7NRm0HfEYYI2Ouw1';
const oldAdminUid='796IkiShehcJ4BQFCXEnpe8If7t1';

function Navbar() {
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
            <Link to="/">Home</Link> {/* Use Link for Home */}
          </li>
          <li>
            <Link to="/booking">Booking</Link> {/* Use Link for Booking */}
          </li>
          <li>
            <Link to="/buy-packages">Buy Packages</Link> {/* Use Link for Booking */}
          </li>
          <li>
          <Link to="/price">Price</Link>
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
          {isAdmin && (
            <li>
              <Link to="/view-all-packages">View All Package</Link>
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
              <Link to="/account-information">Account Information</Link>
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
          <li>
            <Link to=".">       </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;