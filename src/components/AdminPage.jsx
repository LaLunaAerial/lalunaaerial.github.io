// components/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';

const db = getDatabase();
const adminUid = '796IkiShehcJ4BQFCXEnpe8If7t1';

function AdminPage() {
  const [pendingBookings, setPendingBookings] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.uid === adminUid) {
      setIsAdmin(true);
    }

    if (isAdmin) {
      const pendingBookingsRef = ref(db, 'pendingBookings');
      get(pendingBookingsRef).then((snapshot) => {
        if (snapshot.exists()) {
          setPendingBookings(snapshot.val());
        } else {
          setPendingBookings({});
        }
      });
    }
  }, [isAdmin]);

  const handleApprove = async (bookingId) => {
    if (isAdmin) {
      const pendingBookingRef = ref(db, `pendingBookings/${bookingId}`);
      get(pendingBookingRef).then((snapshot) => {
        if (snapshot.exists()) {
          const pendingBookingData = snapshot.val();

          // Create a new booking in the bookings record
          const bookingRef = ref(db, `bookings/${pendingBookingData.email.split('@')[0]}/${pendingBookingData.date}`);
          set(bookingRef, {
            [pendingBookingData.time]: 'Booked',
          });

          // Remove the pending booking
          set(pendingBookingRef, null);

          // Update the pending bookings state
          const newPendingBookings = { ...pendingBookings };
          delete newPendingBookings[bookingId];
          setPendingBookings(newPendingBookings);
        }
      });
    }
  };

  const handleReject = async (bookingId) => {
    if (isAdmin) {
      const pendingBookingRef = ref(db, `pendingBookings/${bookingId}`);
      set(pendingBookingRef, null);

      // Update the pending bookings state
      const newPendingBookings = { ...pendingBookings };
      delete newPendingBookings[bookingId];
      setPendingBookings(newPendingBookings);
    }
  };

  return (
    <div className="admin-container">
      <h2>Pending Bookings</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Date</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(pendingBookings).map((bookingId) => (
            <tr key={bookingId}>
              <td>{pendingBookings[bookingId].email}</td>
              <td>{pendingBookings[bookingId].date}</td>
              <td>{pendingBookings[bookingId].time}</td>
              <td>
                <button onClick={() => handleApprove(bookingId)}>Approve</button>
                <button onClick={() => handleReject(bookingId)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;