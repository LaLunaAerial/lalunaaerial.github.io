import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';
import './ViewAllBookingPage.css';

const ViewAllBookingsPage = () => {
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
        const allBookings = [];
        Object.keys(bookingsData).forEach((userId) => {
          Object.keys(bookingsData[userId]).forEach((date) => {
            Object.keys(bookingsData[userId][date]).forEach((time) => {
              allBookings.push({
                userId,
                date,
                time,
                status: 'Approved',
              });
            });
          });
        });
        setBookings(allBookings);
      }
    });
    get(pendingBookingsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const pendingBookingsData = snapshot.val();
        const allPendingBookings = [];
        Object.keys(pendingBookingsData).forEach((key) => {
          const pendingBooking = pendingBookingsData[key];
          allPendingBookings.push({
            userId: pendingBooking.username,
            date: pendingBooking.date,
            time: pendingBooking.time,
            status: 'Pending',
          });
        });
        setPendingBookings(allPendingBookings);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className='viewallbookings-page'>
      <h2>All Bookings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th className="username-column">User Name</th>
              <th className="date-column">Date</th>
              <th className="time-column">Time</th>
              <th className="status-column">Status</th>
            </tr>
          </thead>
          <tbody>
            {[...bookings, ...pendingBookings].map((booking, index) => (
              <tr key={index}>
                <td>{booking.userId}</td>
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

export default ViewAllBookingsPage;