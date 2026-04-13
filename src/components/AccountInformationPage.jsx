// AccountInformationPage.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile, updatePassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import './AccountInformationPage.css';

const AccountInformationPage = () => {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
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

  const handleSubmitClick = () => {
    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match');
      return;
    }

    updateProfile(user, {
      displayName: newUsername,
    }).then(() => {
      updatePassword(user, newPassword).then(() => {
        setUsername(newUsername);
        setIsEditing(false);
        // Update password in database
        storeUserInDatabase(user, newPassword);
      });
    });

    alert('Account Information updated successfully');
  };

const storeUserInDatabase = async (user, password) => {
  const db = getDatabase();
  const usersRef = ref(db, 'users');
  await set(usersRef, {
    [user.uid]: {
      displayName: user.displayName,
      password: password,
    },
  });
};

  if (!user) {
    return <div>Please log in to view your account information.</div>;
  }

  return (
    <div className="account-information-page">
      <h2>Account Information</h2>
      <div className="account-info">
        <h4>Current Username: {username}</h4>
        <h4>Email: {user.email}</h4>
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