// AccountInformationPage.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile, updatePassword } from 'firebase/auth';
import { get, getDatabase, ref, set, update } from 'firebase/database';
import './AccountInformationPage.css';

const AccountInformationPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);

      // Fetch user data from database
      if (currentUser) {
        const db = getDatabase();
        const usersRef = ref(db, `users/${currentUser.uid}`);
        get(usersRef).then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUsername(userData.displayName);
            setEmail(userData.email);
            setPhone(userData.phone);
            setPassword(userData.password);
          } else {
            console.log('No user data found in database');
          }
        }).catch((error) => {
          console.error('Error fetching user data:', error);
        })
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      setUsername(user.displayName);
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewUsername('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleSubmitClick = async () => {
    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match');
      return;
    }

    await auth.currentUser.getIdToken(true).then((token) => {
      const user = auth.currentUser;
      // Update password in database
      storeUserInDatabase(user, newUsername, newPassword);
      // Use the token for authentication purposes
      updateProfile(user, {
        displayName: newUsername,
      }).then(() => {
        updatePassword(user, newPassword).then(() => {
          setUsername(newUsername);
          setIsEditing(false);
        });
      }).catch((error) => {
        console.error('Error updating profile or password:', error);
      });
    }).catch((error) => {
      console.error('Error refreshing token:', error);
    });

    alert('Account Information updated successfully');

    //refresh the page to show the updated information
    window.location.reload();
  };

    const storeUserInDatabase = async (user,newUsername, newPassword) => {
      const db = getDatabase();
      console.log(user.uid)
      const usersRef = ref(db, `users/${user.uid}`);
      await update(usersRef, {
          email: email,
          phone: newPhone,
          displayName: newUsername,
          password: newPassword,
        },
      );
    };

  if (!user) {
    return <div>Please log in to view your account information.</div>;
  }

  return (
    <div className="account-information-page">
      <h2>Account Information</h2>
      <div className="account-info">
        <h4>Current Username: {username}</h4>
        <h4>Email: {email}</h4>
        <h4>Phone: {phone}</h4>
        <h4>Password: {password}</h4>
      </div>
      {isEditing ? (
        <div className="edit-form">
          <p> New Username:</p>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="New Username"
          />
          <p> New Phone Number:</p>
          <input
            type="text"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="New Phone Number"
          />
          <p>New Password:</p>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
          />
          <p>Confirm New Password:</p>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Confirm New Password"
          />
          <button onClick={handleSubmitClick}>Submit the updates</button>
          <button onClick={handleCancelClick}>Cancel</button>
          <p>Notes: Please save your new password before submit.</p>
        </div>
      ) : (
        <div>
            <button className="edit-button" onClick={handleEditClick}>Edit</button>
            <p>Please contact the admin if you have any issues.</p>
        </div>
      )}
      
    </div>
  );
};

export default AccountInformationPage;