// components/LoginPage.jsx
import React, { useState } from 'react';
import { auth } from '../assets/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // State to toggle between login and register
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign-in successful');
      alert('Sign-in successful!');

      const userId = auth.currentUser.uid;
      if (userId === '796IkiShehcJ4BQFCXEnpe8If7t1') {
        navigate('/admin');
      } else {
        navigate('/booking');
      }
    } catch (error) {
      console.error('Error signing in:', error.message);
      alert(`Sign-in failed: ${error.message}`); // Display error to the user
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered successfully');
      alert('Registration successful! You can now log in.');
      setIsRegistering(false); // Switch back to login after successful registration
    } catch (error) {
      console.error('Error registering user:', error.message);
      alert(`Registration failed: ${error.message}`); // Display error to the user
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <div className="input-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
      </div>

      {isRegistering ? (
        <>
          <button onClick={handleRegister} className="login-button">
            Register
          </button>
          <button onClick={() => setIsRegistering(false)} className="switch-button">
            Already have an account? Login
          </button>
        </>
      ) : (
        <>
          <button onClick={handleSignIn} className="login-button">
            Login
          </button>
          <button onClick={() => setIsRegistering(true)} className="switch-button">
            Need an account? Register
          </button>
        </>
      )}
    </div>
  );
}

export default LoginPage;