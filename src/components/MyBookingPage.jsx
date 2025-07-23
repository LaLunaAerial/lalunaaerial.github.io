import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';
import './MyBookingPage.css';

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
      Object.keys(bookingsData).forEach((bookingId) => {
        const booking = bookingsData[bookingId];
        if (booking.username === auth.currentUser.email.split('@')[0]) {
          userBookings.push({
            date: booking.date,
            time: booking.time,
            status: 'Approved'
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
          if (pendingBooking.username === auth.currentUser.email.split('@')[0]) {
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
    <div className='mybookings-page'>
      <h2>My Bookings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th className="date-column">Date</th>
              <th className="time-column">Time</th>
              <th className="status-column">Status</th>
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