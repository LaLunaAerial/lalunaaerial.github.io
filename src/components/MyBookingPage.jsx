import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';
import './MyBookingPage.css';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [userPackages, setUserPackages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    //get the bookings and pending bookings from the database
    const db = getDatabase();
    const bookingsRef = ref(db, 'bookings');
    const pendingBookingsRef = ref(db, 'pendingBookings');
    get(bookingsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const bookingsData = snapshot.val();
      const userBookings = [];
      Object.keys(bookingsData).forEach((bookingId) => {
        const booking = bookingsData[bookingId];
        if (booking.username === auth.currentUser.displayName) {
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
          if (pendingBooking.username === auth.currentUser.displayName) {
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

    // get the package information for the user
      const userName = auth.currentUser.displayName;
      const userPackagesRef = ref(db, `userPackages/${userName}`);
      get(userPackagesRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userPackagesData = snapshot.val();
          console.log('User Packages:', userPackagesData);
          setUserPackages(userPackagesData);
        } else {
          console.log('No packages found for the user.');
        }
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
      {userPackages && Object.keys(userPackages).length > 0 ? (
      <div className="user-packages">
        <h3>Packages</h3>
        {Object.keys(userPackages).map((packageId) => (
          <div key={packageId} className="package-info">
            <p>Package Name: {userPackages[packageId].packageName}</p>
            <p>Package Type: {userPackages[packageId].packageType}</p>
            <p>Number of Sections: {userPackages[packageId].numberOfSections}</p>
            <p>Expiry Date: {userPackages[packageId].expiryDate}</p>
            <p>Remaining Quota: {userPackages[packageId].remainingQuota}</p>
          </div>
        ))}
      </div>
      ) : (
        <p>No packages found for this user.</p>
      )}
    </div>
  );
};

export default MyBookingsPage;