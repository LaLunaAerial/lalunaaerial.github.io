import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';
import "./ViewAllBookingPage.css";

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
        Object.keys(bookingsData).forEach((bookingId) => {
          const booking = bookingsData[bookingId];
          allBookings.push({
            username: booking.username,
            date: booking.date,
            time: booking.time,
            status: 'Approved',
            bookingId,
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
            username: pendingBooking.username,
            date: pendingBooking.date,
            time: pendingBooking.time,
            status: 'Pending',
            bookingId: key,
          });
        });
        setPendingBookings(allPendingBookings);
      }
      setLoading(false);
    });
  }, []);

  // update the bookings state when the pendingBookings state changes due to approving one of the pending bookings
  useEffect(() => {
    const db = getDatabase();
    const bookingsRef = ref(db, 'bookings');
    get(bookingsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const bookingsData = snapshot.val();
        const allBookings = [];
        Object.keys(bookingsData).forEach((bookingId) => {
          const booking = bookingsData[bookingId];
          allBookings.push({
            username: booking.username,
            date: booking.date,
            time: booking.time,
            status: 'Approved',
            bookingId,
          });
        });
        setBookings(allBookings);
      }
    });
  }, [pendingBookings]);

  const handleApprove = async (bookingId) => {
    if (auth.currentUser) {
      const db = getDatabase();
      const pendingBookingRef = ref(db, `pendingBookings/${bookingId}`);
      get(pendingBookingRef).then((snapshot) => {
        if (snapshot.exists()) {
          const pendingBookingData = snapshot.val();
          const newBookingId = bookingId;
          const bookingRef = ref(db, `bookings/${newBookingId}`);
          set(bookingRef, {
            username: pendingBookingData.username,
            date: pendingBookingData.date,
            time: pendingBookingData.time,
          });
          set(pendingBookingRef, null);
          const newPendingBookings = [...pendingBookings];
          const index = newPendingBookings.findIndex((booking) => booking.bookingId === bookingId);
          if (index !== -1) {
            newPendingBookings.splice(index, 1);
            setPendingBookings(newPendingBookings);
          }
        }
      });
    }
  };

  const handleReject = async (bookingId) => {
    if (auth.currentUser) {
      const db = getDatabase();
      const pendingBookingRef = ref(db, `pendingBookings/${bookingId}`);
      set(pendingBookingRef, null);
      const newPendingBookings = [...pendingBookings];
      const index = newPendingBookings.findIndex((booking) => booking.bookingId === bookingId);
      if (index !== -1) {
        newPendingBookings.splice(index, 1);
        setPendingBookings(newPendingBookings);
      }
    }
  };

  const handleCancel = async (bookingId) => {
    if (auth.currentUser) {
      const db = getDatabase();
      const bookingRef = ref(db, `bookings/${bookingId}`);
      set(bookingRef, null);
      const newBookings = [...bookings];
      const index = newBookings.findIndex((booking) => booking.bookingId === bookingId);
      if (index !== -1) {
        newBookings.splice(index, 1);
        setBookings(newBookings);
      }
    }
  };

  return (
    <div className="viewallbookings-page">
      <h2>All Bookings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.bookingId}>
                <td>{booking.username}</td>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td>{booking.status}</td>
                <td>
                  {booking.status === 'Approved' ? (
                    <button onClick={() => handleCancel(booking.bookingId)}>Cancel</button>
                  ) : (
                    <div>
                      <button onClick={() => handleApprove(booking.bookingId)}>Approve</button>
                      <button onClick={() => handleReject(booking.bookingId)}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {pendingBookings.map((booking) => (
              <tr key={booking.bookingId}>
                <td>{booking.username}</td>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td>{booking.status}</td>
                <td>
                  <div>
                    <button onClick={() => handleApprove(booking.bookingId)}>Approve</button>
                    <button onClick={() => handleReject(booking.bookingId)}>Reject</button>
                  </div>
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