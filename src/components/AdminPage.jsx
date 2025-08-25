// components/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import './AdminPage.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

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
    const fetchUsers = async () => {
      const usersList = [];
      const user = auth.currentUser;
      if (user) {
        usersList.push(user);
      }
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUsername(user.displayName);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      updateProfile(editingUser, {
        displayName: newUsername,
      }).then(() => {
        console.log('Display name updated successfully');
      });
      if (newPassword !== '') {
        if (newPassword === confirmNewPassword) {
          updatePassword(editingUser, newPassword).then(() => {
            console.log('Password updated successfully');
          });
        } else {
          console.log('Passwords do not match');
        }
      }
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (user) => {
    deleteUser(user).then(() => {
      console.log('User deleted successfully');
      setUsers(users.filter((u) => u !== user));
    });
  };

  return (
    <div className="admin-container">
      <h2>Users Management</h2>
      <table>
        <thead>
          <tr>
            <th>Display Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uid}>
              <td>{user.displayName}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleEditUser(user)}>Edit</button>
                <button onClick={() => handleDeleteUser(user)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingUser && (
        <div className="edit-form">
          <h3>Edit User</h3>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="New Display Name"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
          />
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Confirm New Password"
          />
          <button onClick={handleUpdateUser}>Update</button>
          <button onClick={() => setEditingUser(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;