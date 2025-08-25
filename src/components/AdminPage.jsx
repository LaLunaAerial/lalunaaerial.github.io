// components/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import './AdminPage.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [originalRoomPassword, setOriginalRoomPassword] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');

  const auth = getAuth();
  const adminUid = 'm27guDkDb4dL7NRm0HfEYYI2Ouw1';
  const oldAdminUid='796IkiShehcJ4BQFCXEnpe8If7t1';

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.uid === adminUid) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      alert("You are not authorized to access this page.");
      window.location.href = '/'; // Redirect to home or another page
    }
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const usersList = [];
      for (const userId in usersData) {
        usersList.push({
          displayName: usersData[userId].displayName,
          phone: usersData[userId].phone,
          password: usersData[userId].password,
        });
      }
      setUsers(usersList);
    });
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const roomPasswordRef = ref(db, 'roomPassword');
    onValue(roomPasswordRef, (snapshot) => {
      const roomPasswordData = snapshot.val();
      setOriginalRoomPassword(roomPasswordData);
      setNewRoomPassword(roomPasswordData); // Initialize newRoomPassword with the original value
    });
  }, []);

  const handleUpdateRoomPassword = () => {
    const db = getDatabase();
    const roomPasswordRef = ref(db, 'roomPassword');
    set(roomPasswordRef, newRoomPassword);
    alert('Room password updated successfully!');
  };

  return (
    <div className="admin-page">
      <h2>Admin Page</h2>

      <h3>Room Password</h3>
      <h4>Current Room Password: {originalRoomPassword}</h4>
      <p>New Room Password:</p>
      <input
        type="text"
        value={newRoomPassword}
        onChange={(e) => setNewRoomPassword(e.target.value)}
        placeholder="Enter room password"
      />
      <button onClick={handleUpdateRoomPassword}>Update Room Password</button>

      <hr />
      <h3>Users Information</h3>
      <table>
        <thead>
          <tr>
            <th>Display Name</th>
            <th>Phone</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.displayName}</td>
              <td>{user.phone}</td>
              <td>{user.password}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;