import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { auth } from '../assets/firebaseConfig';
import './NavBar.css';

function Navbar() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const email = user.email;
        const username = email.split('@')[0];
        setUsername(username);
        setIsLoggedIn(true);
      } else {
        setUsername('');
        setIsLoggedIn(false);
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
        <Link to="/"><img src="/LaLUNA_icon.jpg" alt="Logo" style={{width: 50}}/></Link> {/* Use Link for the brand */}
      </div>
      <div className='navbar-right'>
        <ul className='navbar-links'>
          <li>
            <Link to="/">Home</Link> {/* Use Link for Home */}
          </li>
          <li>
            <Link to="/booking">Booking</Link> {/* Use Link for Booking */}
          </li>
          {isLoggedIn ? (
              <li>
                <Link to="/" onClick={() => {
                  auth.signOut().then(() => {
                    alert("Logged Out");
                  });
                }}>
                  Logout
                </Link>
              </li>
            ) : (
              <li>
                <Link to="/login">Login/Register</Link> {/* Add Login/Register link */}
              </li>
            )}
         
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;