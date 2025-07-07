// components/LoginPage.jsx
import React from 'react';
import { auth, provider } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate(); // Initialize useNavigate

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then(result => {
        // Handle successful sign-in.
        console.log('Sign-in successful', result);
        navigate('/booking'); // Redirect to booking page after login
      })
      .catch(error => {
        // Handle errors.
        console.error('Error signing in with Google', error);
      });
  };

  return (
    <div className='login-container'>
      <h2>Login</h2>
      <button onClick={signInWithGoogle} className='login-button'>
        Sign in with Google
      </button>
    </div>
  );
}

export default LoginPage;
