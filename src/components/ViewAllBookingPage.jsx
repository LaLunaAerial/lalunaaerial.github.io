import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getStorage, ref as storageRef, deleteObject,uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../assets/firebaseConfig';
import "./ViewAllBookingPage.css";

import { timeCategories } from '../assets/timeCategoriesPrice';
const adminUid = 'm27guDkDb4dL7NRm0HfEYYI2Ouw1';
const oldAdminUid='796IkiShehcJ4BQFCXEnpe8If7t1';

const ViewAllBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.uid === adminUid) {
      setIsAdmin(true);
    }else{
      setIsAdmin(false);
      alert("You are not authorized to access this page.");
      window.location.href = '/'; // Redirect to home or another page
    }
  }, [isAdmin]);

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
            paymentMethod: pendingBooking.paymentMethod,
            paymentScreenshot: pendingBooking.paymentScreenshot,
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
  if (isAdmin) {
    const db = getDatabase();
    const pendingBookingRef = ref(db, `pendingBookings/${bookingId}`);
    get(pendingBookingRef).then((snapshot) => {
      if (snapshot.exists()) {
        const pendingBookingData = snapshot.val();
        if (pendingBookingData.paymentMethod === 'package') {
          const userPackagesRef = ref(db, `userPackages/${auth.currentUser.uid}`);
          get(userPackagesRef).then((userPackagesSnapshot) => {
            if (userPackagesSnapshot.exists()) {
              const userPackagesData = userPackagesSnapshot.val();
              const peakPackageKey = Object.keys(userPackagesData).find((key) => userPackagesData[key].packageType === 'Peak');
              const nonPeakPackageKey = Object.keys(userPackagesData).find((key) => userPackagesData[key].packageType === 'Non-peak');
              console.log("Peak Package Key:", peakPackageKey);
              console.log("Non-Peak Package Key:", nonPeakPackageKey);

              const bookingStartTimeHour = parseInt(pendingBookingData.time.split('-')[0].split(':')[0]);
              console.log("Booking Start Time Hour:", bookingStartTimeHour);
              console.log("Start Time:",timeCategories.Peak.startTime, "End Time:",timeCategories.Peak.endTime);
              let timePeriod;
              if (bookingStartTimeHour >= timeCategories.Peak.startTime && bookingStartTimeHour <= timeCategories.Peak.endTime) {
                  timePeriod = 'peak';
              } else  {
                timePeriod = 'non-peak';
              }

              if (timePeriod === 'peak') {
                if (peakPackageKey && userPackagesData[peakPackageKey].remainingQuota > 0) {
                  const newRemainingQuota = userPackagesData[peakPackageKey].remainingQuota - 1;
                  if (newRemainingQuota === 0) {
                    // Delete the package if the new remaining quota is 0
                    set(ref(db, `userPackages/${auth.currentUser.uid}/${peakPackageKey}`), null);

                    // Delete the payment screenshot from storage
                    const paymentScreenshot = userPackagesData[peakPackageKey].paymentScreenshot
                    const filePath = paymentScreenshot.substring(paymentScreenshot.lastIndexOf("%2F") + 3, paymentScreenshot.indexOf("?alt"));
                    console.log("File Path to delete:", filePath);
                    const storage = getStorage();
                    const paymentScreenshotRef = storageRef(storage, `payme-screenshots/${filePath}`);
                    deleteObject(paymentScreenshotRef).then(() => {
                      alert('Payment screenshot deleted successfully');
                    }).catch((error) => {
                      console.error('Error deleting payment screenshot:', error);
                    });
                  } else {
                    const updatedPeakPackage = { ...userPackagesData[peakPackageKey], remainingQuota: newRemainingQuota };
                    set(ref(db, `userPackages/${auth.currentUser.uid}/${peakPackageKey}`), updatedPeakPackage);
                  }
                  alert('Use 1 quota from peak package!');
                } else {
                  alert('Insufficient peak package quota!');
                  return;
                }
              } else if (timePeriod === 'non-peak') {
                if (nonPeakPackageKey && userPackagesData[nonPeakPackageKey].remainingQuota > 0) {
                  const newRemainingQuota = userPackagesData[nonPeakPackageKey].remainingQuota - 1;
                  if (newRemainingQuota === 0) {
                    // Delete the package if the new remaining quota is 0
                    set(ref(db, `userPackages/${auth.currentUser.uid}/${nonPeakPackageKey}`), null);

                    // Delete the payment screenshot from storage
                    const paymentScreenshot = userPackagesData[nonPeakPackageKey].paymentScreenshot
                    const filePath = paymentScreenshot.substring(paymentScreenshot.lastIndexOf("%2F") + 3, paymentScreenshot.indexOf("?alt"));
                    console.log("File Path to delete:", filePath);
                    const storage = getStorage();
                    const paymentScreenshotRef = storageRef(storage, `payme-screenshots/${filePath}`);
                    deleteObject(paymentScreenshotRef).then(() => {
                      alert('Payment screenshot deleted successfully');
                    }).catch((error) => {
                      console.error('Error deleting payment screenshot:', error);
                    });
                  } else {
                    const updatedNonPeakPackage = { ...userPackagesData[nonPeakPackageKey], remainingQuota: newRemainingQuota };
                    set(ref(db, `userPackages/${auth.currentUser.uid}/${nonPeakPackageKey}`), updatedNonPeakPackage);
                  }
                  alert('Use 1 quota from non-peak package!');
                } else {
                  alert('Insufficient non-peak package quota!');
                  return;
                }
              } else {
                alert('Error on calculating time period!');
                return;
              }
            }
          });
        }
        const newBookingId = bookingId;
        const bookingRef = ref(db, `bookings/${newBookingId}`);
        // Set the booking data to the bookings node
        set(bookingRef, {
          username: pendingBookingData.username,
          date: pendingBookingData.date,
          time: pendingBookingData.time,
        });
        // Remove the booking from pending bookings
        set(pendingBookingRef, null);
        const newPendingBookings = [...pendingBookings];
        const index = newPendingBookings.findIndex((booking) => booking.bookingId === bookingId);
        if (index !== -1) {
          newPendingBookings.splice(index, 1);
          setPendingBookings(newPendingBookings);
        }
        alert(`Booking for ${pendingBookingData.username} on ${pendingBookingData.date} at ${pendingBookingData.time} has been approved!`);
      }
    });
  }
};

  const handleReject = async (bookingId) => {
    if (isAdmin) {
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
    if (isAdmin) {
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

  const handleShowCapscreen = (bookingId) => {
    const paymentScreenshotUrl = pendingBookings.find((booking) => booking.bookingId === bookingId).paymentScreenshot;
    if (paymentScreenshotUrl) {
      // Create a modal to display the payment screenshot
      const modal = document.getElementById('capscreen-modal');
      modal.style.display = 'block';
      const image = document.getElementById('capscreen-image');
      const loadingText = document.getElementById('capscreen-loading-text');
      loadingText.style.display = 'block';
      image.src = paymentScreenshotUrl;
      image.onload = () => {
        loadingText.style.display = 'none';
      };
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
              <th>Payment Method</th>
              <th>Payment Screenshot</th>
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
                <td></td>
                <td></td>
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
                <td>{booking.paymentMethod}</td>
                {booking.paymentMethod !== 'package' && (
                  <td>
                    <button onClick={() => handleShowCapscreen(booking.bookingId)}>Show Capscreen</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal to display the payment screenshot */}
      <div id="capscreen-modal" style={{ display: 'none', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', border: '1px solid black' }}>
        <img id="capscreen-image" src="" alt="Payment Screenshot" style={{ width: '100%', height: '100%' }} />
        <p id="capscreen-loading-text" style={{ display: 'none' }}>Loading...</p>
        <button onClick={() => document.getElementById('capscreen-modal').style.display = 'none'}>Close</button>
      </div>
    </div>
  );
};

export default ViewAllBookingsPage;