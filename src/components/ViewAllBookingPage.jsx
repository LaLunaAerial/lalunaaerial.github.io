import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';

const ViewAllBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const bookingsRef = ref(db, 'bookings');
    get(bookingsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const bookingsData = snapshot.val();
        const bookingsArray = Object.keys(bookingsData).map((userId) => {
          return Object.keys(bookingsData[userId]).map((date) => {
            return Object.keys(bookingsData[userId][date]).map((time) => {
              return {
                userId,
                date,
                time,
                status: bookingsData[userId][date][time] === 'Booked' ? 'Approved' : 'Pending',
              };
            });
          }).flat();
        }).flat();
        setBookings(bookingsArray);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2>View All Bookings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index}>
                <td>{booking.userId}</td>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewAllBookingsPage;