import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const bookingsRef = ref(db, 'bookings');
    const pendingBookingsRef = ref(db, 'pendingBookings');
    get(bookingsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const bookingsData = snapshot.val();
        const userBookings = [];
        Object.keys(bookingsData).forEach((userId) => {
          if (userId === auth.currentUser.email.split('@')[0] || userId === auth.currentUser.email) {
            Object.keys(bookingsData[userId]).forEach((date) => {
              Object.keys(bookingsData[userId][date]).forEach((time) => {
                userBookings.push({
                  date,
                  time,
                  status: 'Approved',
                });
              });
            });
          }
        });
        setBookings(userBookings);
      }
    });
    get(pendingBookingsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const pendingBookingsData = snapshot.val();
        const userPendingBookings = [];
        Object.keys(pendingBookingsData).forEach((key) => {
          const pendingBooking = pendingBookingsData[key];
          if (pendingBooking.email === auth.currentUser.email) {
            userPendingBookings.push({
              date: pendingBooking.date,
              time: pendingBooking.time,
              status: 'Pending',
            });
          }
        });
        setPendingBookings(userPendingBookings);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2>My Bookings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...bookings, ...pendingBookings].map((booking, index) => (
              <tr key={index}>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td>
                  {booking.status === 'Approved' ? (
                    <span style={{ color: 'green' }}>Approved</span>
                  ) : (
                    <span style={{ color: 'orange' }}>Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyBookingsPage;