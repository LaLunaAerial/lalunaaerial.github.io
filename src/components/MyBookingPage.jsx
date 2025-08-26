import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';
import './MyBookingPage.css';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [userPackages, setUserPackages] = useState({});
  const [loading, setLoading] = useState(true);
  const [roomPassword, setRoomPassword] = useState('');

  useEffect(() => {

    //get the bookings and pending bookings from the database
    const db = getDatabase();
    const bookingsRef = ref(db, 'bookings');
    
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
      setLoading(false);
    });

    const pendingBookingsRef = ref(db, 'pendingBookings');
    get(pendingBookingsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const pendingBookingsData = snapshot.val();
        const userPendingBookings = [];
        Object.keys(pendingBookingsData).forEach((key) => {
          const pendingBooking = pendingBookingsData[key];
          if (pendingBooking.username === auth.currentUser.displayName) {
            userPendingBookings.push({
              date: pendingBooking.date,
              paymentMethod: pendingBooking.paymentMethod,
              paymentScreenshot: pendingBooking.paymentScreenshot,
              time: pendingBooking.time,
              status: 'Pending',
            });
          }
        });
        setPendingBookings(userPendingBookings);
        console.log('Pending Bookings:', userPendingBookings);
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

useEffect(() => {
  // Check if any booking's time slot starts within the next hour
  const checkIfTimeSlotStartsWithinOneHour = () => {
    const currentTime = new Date().getTime();
    const oneHourLater = new Date(currentTime).setHours(new Date(currentTime).getHours() + 1);
    const bookingsWithTimeSlotWithinOneHour = bookings.filter((booking) => {
      const [startTime, endTime] = booking.time.split('-');
      const [startHour, startMinute] = startTime.split(':');
      const [endHour, endMinute] = endTime.split(':');
      const bookingStartDate = new Date(`${booking.date}T${startHour}:${startMinute}:00`);
      const bookingStartTime = bookingStartDate.getTime();
      const bookingEndDate = new Date(`${booking.date}T${endHour}:${endMinute}:00`);
      const bookingEndTime = bookingEndDate.getTime();
      console.log(bookingEndTime >= currentTime && bookingStartTime <= oneHourLater)
      return bookingEndTime >= currentTime && bookingStartTime <= oneHourLater;
    });
    if (bookingsWithTimeSlotWithinOneHour.length > 0) {
      const db = getDatabase();
      const roomPasswordRef = ref(db, 'roomPassword');
      get(roomPasswordRef).then((snapshot) => {
        const roomPasswordData = snapshot.val();
        setRoomPassword(roomPasswordData);
      });
    }
  };
  checkIfTimeSlotStartsWithinOneHour();
}, [bookings]);

  return (
    <div className='mybookings-page'>
      <h2>My Bookings</h2>
      {bookings.length > 0 || pendingBookings.length > 0 ? (
      <div className="bookings">
        <h3>Bookings</h3>
        <table>
          <thead>
            <tr>
              <th className="date-column">Date</th>
              <th className="time-column">Time</th>
              <th className="payment-method-column">Payment Method</th>
              <th className="status-column">Status</th>
              <th className="room-password-column">Room Password</th>
            </tr>
          </thead>
          <tbody>
            {[...bookings, ...pendingBookings].map((booking, index) => (
              <tr key={index}>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td>{booking.paymentMethod ? booking.paymentMethod : 'N/A'}</td>
                <td>
                  {booking.status === 'Approved' ? (
                    <span style={{ color: 'green' }}>Approved</span>
                  ) : (
                    <span style={{ color: 'red' }}>Pending</span>
                  )}
                </td>
                <td>{booking.status === 'Approved' && roomPassword ? roomPassword : 'Password can only be seen 1 hours before the booking starts'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>No bookings found for this user.</p>
    )}

    {userPackages && Object.keys(userPackages).length > 0 ? (
      <div className="user-packages">
        <h3>Packages</h3>
        <table>
          <thead>
            <tr>
              <th className="package-name-column">Package Name</th>
              <th className="package-type-column">Package Type</th>
              <th className="number-of-sections-column">Number of Sections</th>
              <th className="expiry-date-column">Expiry Date</th>
              <th className="remaining-quota-column">Remaining Quota</th>
              <th className="status-column">Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(userPackages).map((packageId) => (
              <tr key={packageId}>
                <td>{userPackages[packageId].packageName}</td>
                <td>{userPackages[packageId].packageType}</td>
                <td>{userPackages[packageId].numberOfSections}</td>
                <td>{userPackages[packageId].expiryDate}</td>
                <td>{userPackages[packageId].remainingQuota}</td>
                <td>
                  {userPackages[packageId].status === 'approved' ? (
                    <span style={{ color: 'green' }}>Active</span>
                  ) : (
                    <span style={{ color: 'red' }}>Pending for approval on your payment</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>No packages found for this user.</p>
    )}
    </div>
  );
};

export default MyBookingsPage;