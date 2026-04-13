// components/LoginPage.jsx
import React, { useState } from 'react';
import { auth } from '../assets/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getDatabase, ref, set,update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
        navigate('/schedule');
      }
    } catch (error) {
      console.error('Error signing in:', error.message);
      alert(`Sign-in failed: ${error.message}`); // Display error to the user
    }
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User registered successfully');
      await updateProfile(auth.currentUser, { displayName: name });
      console.log("Updated the profile with the user.displayName");
      await storeUserInDatabase(user,email,phone,password);
      alert('Registration successful! You can now log in.');
      setIsRegistering(false); // Switch back to login after successful registration
    } catch (error) {
      console.error('Error registering user:', error.message);
      alert(`Registration failed: ${error.message}`); // Display error to the user
    }
  };

  const storeUserInDatabase = async (user,email,phone, password) => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    await update(usersRef, {
      [user.uid]: {
        email: email,
        phone: phone,
        displayName: user.displayName,
        password: password,
      },
    });
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      {isRegistering?(<div className="input-group">
        <label htmlFor="name">Name</label>
        <input
          type="name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <hr />
        <label htmlFor="phone">Phone</label>
        <input
          type="phone"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
        />
      </div>):null}
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