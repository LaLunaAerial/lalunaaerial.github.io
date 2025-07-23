import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const bookingsRef = ref(db, 'bookings');
    get(bookingsRef).then((snapshot) => {
      console.log('Bookings snapshot:', snapshot.val());
      console.log('Current user ID:', auth.currentUser.uid);  
      if (snapshot.exists()) {
        const bookingsData = snapshot.val();
        const userBookings = [];
        Object.keys(bookingsData).forEach((username) => {
          if (username === auth.currentUser.email.split('@')[0]) {
            Object.keys(bookingsData[username]).forEach((date) => {
              Object.keys(bookingsData[username][date]).forEach((time) => {
                userBookings.push({
                  date,
                  time,
                  status: bookingsData[username][date][time],
                });
              });
            });
          }
        });
        setBookings(userBookings);
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
            {bookings.map((booking, index) => (
              <tr key={index}>
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

export default MyBookingsPage;