import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, onValue } from 'firebase/database';
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
            paymentMethod: booking.paymentMethod,
            paymentScreenshot: booking.paymentScreenshot || '', // Add paymentScreenshot field
          });
        });
        setBookings(allBookings);
      }
    });

    const pendingBookingsRef = ref(db, 'pendingBookings');
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
            timeCategory: pendingBooking.timeCategory,
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
            paymentMethod: booking.paymentMethod,
            paymentScreenshot: booking.paymentScreenshot || '', // Add paymentScreenshot field
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
        console.log("Approving booking:", bookingId);
        const pendingBookingData = snapshot.val();
        // if payment method is package, check if the user has enough quota in their package:
          // if yes, check if the user has used the package before:
            //  if yes, deduct 1 quota from the package and approve the booking
            //  if no, set the expiry date of the package to 30 days from now and deduct 1 quota from the package and approve the booking
          // if no, alert the admin that the user does not have enough quota and do not approve the booking
        if (pendingBookingData.paymentMethod === 'package') {
          console.log("Payment method is package");
          const userPackagesRef = ref(db, `userPackages/${pendingBookingData.username}`); // reference to the user's who make the booking, look for his packages
          get(userPackagesRef).then((userPackagesSnapshot) => {
              const packages = userPackagesSnapshot.val();
              console.log("User Packages:", packages);
            if (userPackagesSnapshot.exists()) {
              console.log("User packages data exists");
              const userPackagesData = userPackagesSnapshot.val();
              const peakPackageKey = Object.keys(userPackagesData).find((key) => userPackagesData[key].packageType === 'Peak'); // find the key of the first peak package
              const nonPeakPackageKey = Object.keys(userPackagesData).find((key) => userPackagesData[key].packageType === 'Non-Peak');  // find the key of the first non-peak package
              console.log("Peak Package Key:", peakPackageKey);
              console.log("Non-Peak Package Key:", nonPeakPackageKey);

              // TODO: Check if the booking time is in peak or non-peak time
              let timePeriod;
              // TODO: Now just do checking on PEak/Non-Peak, see Overnight as Non-Peak
              if (pendingBookingData.timeCategory === 'Peak') {
                  timePeriod = 'Peak';
              } else  {
                timePeriod = 'Non-Peak';
              }

              if (timePeriod === 'Peak') {
                if (peakPackageKey && userPackagesData[peakPackageKey].remainingQuota > 0) {
                  console.log("userPackage:", JSON.stringify(userPackagesData[peakPackageKey]));
                  // Create a copy of the package to update for calculating the new remaining quota and possibly the expiry date
                  let updatedPeakPackage={...userPackagesData[peakPackageKey]};
                  // if the user has not used the package before, set the expiry date to according to the effective period from the booking date
                  if (userPackagesData[peakPackageKey].expiryDate==="") {
                    console.log("Setting expiry date for the first time use of the package");
                    const bookingDate = new Date(pendingBookingData.date); // get the date of the booking according to the effective period from the booking data
                    const effectivePeriod = userPackagesData[peakPackageKey].effectivePeriod; // get the number of days for effectivePeriod from the package
                    const expiryDate = new Date(bookingDate.getTime() + effectivePeriod * 24 * 60 * 60 * 1000); // number of days in milliseconds
                    // format the date to YYYY-MM-DD format
                    const formattedExpiryDate = expiryDate.toISOString().split('T')[0];
                    updatedPeakPackage = { ...userPackagesData[peakPackageKey], expiryDate: formattedExpiryDate };
                    set(ref(db, `userPackages/${pendingBookingData.username}/${peakPackageKey}`), updatedPeakPackage);
                    console.log("Expiry Date of the packageset to:", updatedPeakPackage.expiryDate);
                  }

                  const newRemainingQuota = userPackagesData[peakPackageKey].remainingQuota - 1;
                  updatedPeakPackage = { ...updatedPeakPackage, remainingQuota: newRemainingQuota };

                  if (newRemainingQuota === 0) {
                    // Delete the package if the new remaining quota is 0
                    set(ref(db, `userPackages/${pendingBookingData.username}/${peakPackageKey}`), null);

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
                    // Update the package with the new remaining quota and possibly the expiry date
                    set(ref(db, `userPackages/${pendingBookingData.username}/${peakPackageKey}`), updatedPeakPackage);
                  }
                  alert('Use 1 quota from peak package!');
                  return;
                } else {
                  alert('Insufficient peak package quota!');
                  return;
                }
              } else if (timePeriod === 'Non-Peak') {
                if (nonPeakPackageKey && userPackagesData[nonPeakPackageKey].remainingQuota > 0) {
                  console.log("userPackage:", JSON.stringify(userPackagesData[nonPeakPackageKey]));
                  // Create a copy of the package to update for calculating the new remaining quota and possibly the expiry date
                  let updatedNonPeakPackage={...userPackagesData[nonPeakPackageKey]};
                  // if the user has not used the package before, set the expiry date to according to the effective period from the booking date
                  if (userPackagesData[nonPeakPackageKey].expiryDate==="") {
                    console.log("Setting expiry date for the first time use of the package");
                    const bookingDate = new Date(pendingBookingData.date); // get the date of the booking according to the effective period from the booking data
                    const effectivePeriod = userPackagesData[nonPeakPackageKey].effectivePeriod; // get the number of days for effectivePeriod from the package
                    const expiryDate = new Date(bookingDate.getTime() + effectivePeriod * 24 * 60 * 60 * 1000); // number of days in milliseconds
                    // format the date to YYYY-MM-DD format
                    const formattedExpiryDate = expiryDate.toISOString().split('T')[0];
                    updatedNonPeakPackage = { ...userPackagesData[nonPeakPackageKey], expiryDate: formattedExpiryDate };
                    set(ref(db, `userPackages/${pendingBookingData.username}/${nonPeakPackageKey}`), updatedNonPeakPackage);
                    console.log("Expiry Date of the package set to:", updatedNonPeakPackage.expiryDate);
                  }

                  // reduce the remaining quota by 1
                  const newRemainingQuota = userPackagesData[nonPeakPackageKey].remainingQuota - 1;
                  updatedNonPeakPackage = { ...updatedNonPeakPackage, remainingQuota: newRemainingQuota };

                  if (newRemainingQuota === 0) {
                    // Delete the package if the new remaining quota is 0
                    set(ref(db, `userPackages/${pendingBookingData.username}/${nonPeakPackageKey}`), null);

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
                    // Update the package with the new remaining quota and possibly the expiry date
                    set(ref(db, `userPackages/${pendingBookingData.username}/${nonPeakPackageKey}`), updatedNonPeakPackage);
                  }
                  alert('Use 1 quota from Non-Peak package!');
                  return;
                } else {
                  alert('Insufficient Non-Peak package quota!');
                  return;
                }
              } else {
                alert('Error on calculating time period!');
                return;
              }
            }
            else{
              alert("User packages data does not exist");
              return;
            }
          });

          // After checking and deducting the quota, approve the booking by moving it from pendingBookings to bookings
          const newBookingId = bookingId;
          const bookingRef = ref(db, `bookings/${newBookingId}`);
          // Set the booking data to the bookings node
          set(bookingRef, {
            username: pendingBookingData.username,
            date: pendingBookingData.date,
            time: pendingBookingData.time,
            bookingId,
            paymentMethod: pendingBookingData.paymentMethod,
          });
          // Remove the booking from pending bookings
          set(pendingBookingRef, null);
        }
        //else if payment method is Overnight package
        else if (pendingBookingData.paymentMethod === 'Overnight package') {
          //TODO: Approve the booking directly without checking for package quota
          console.log("Payment method is Overnight package");
          const userPackagesRef = ref(db, `userPackages/${pendingBookingData.username}`); // reference to the user's who make the booking, look for his packages
          get(userPackagesRef).then((userPackagesSnapshot) => {
              const packages = userPackagesSnapshot.val();
              console.log("User Packages:", packages);
            if (userPackagesSnapshot.exists()) {
              console.log("User packages data exists");
              const userPackagesData = userPackagesSnapshot.val();
              const overnightPackageKey = Object.keys(userPackagesData).find((key) => userPackagesData[key].packageType === 'Overnight');
              console.log("Overnight Package Key:", overnightPackageKey);

              // Delete the payment screenshot from storage if there is no other Overnight pending timeslot paid by package
              const otherOvernightBookingsRef = ref(db, 'pendingBookings');
              get(otherOvernightBookingsRef).then((snapshot) => {
                if (snapshot.exists()) {
                  // Check if there is any other Overnight pending booking by the same user (now didnt check for the same day, assume user only book for one day)
                  const bookingsData = snapshot.val();
                  const hasOtherOvernight = Object.keys(bookingsData).some((id) => {
                    const booking = bookingsData[id];
                    return (booking.username === pendingBookingData.username) && (booking.paymentMethod === 'Overnight package') && (booking.bookingId !== bookingId);
                  });
                  console.log("HasOtherOvernight pending booking by overnight package:", hasOtherOvernight);
                  // if there is no other Overnight pending booking by package, delete the package and payment screenshot
                  if (!hasOtherOvernight) {
                    console.log("No other Overnight pending booking by overnight package");
                    // Delete the Overnight package 
                    set(ref(db, `userPackages/${pendingBookingData.username}/${overnightPackageKey}`), null);
                    alert('Overnight package used, package deleted!');

                    // Delete the payment screenshot from storage
                    const paymentScreenshot = userPackagesData[overnightPackageKey].paymentScreenshot
                    const filePath = paymentScreenshot.substring(paymentScreenshot.lastIndexOf("%2F") + 3, paymentScreenshot.indexOf("?alt"));
                    console.log("File Path to delete:", filePath);
                    const storage = getStorage();
                    const paymentScreenshotRef = storageRef(storage, `payme-screenshots/${filePath}`);
                    deleteObject(paymentScreenshotRef).then(() => {
                      alert('Payment screenshot deleted successfully');
                    }).catch((error) => {
                      console.error('Error deleting payment screenshot:', error);
                    }
                    );
                  }
                }else{
                  // No other pending bookings, so delete the Overnight package and payment screenshot
                  set(ref(db, `userPackages/${pendingBookingData.username}/${overnightPackageKey}`), null);
                  alert('Overnight package used, package deleted!');

                  // Delete the payment screenshot from storage
                  const paymentScreenshot = userPackagesData[overnightPackageKey].paymentScreenshot
                  const filePath = paymentScreenshot.substring(paymentScreenshot.lastIndexOf("%2F") + 3, paymentScreenshot.indexOf("?alt"));
                  console.log("File Path to delete:", filePath);
                  const storage = getStorage();
                  const paymentScreenshotRef = storageRef(storage, `payme-screenshots/${filePath}`);
                  deleteObject(paymentScreenshotRef).then(() => {
                    alert('Payment screenshot deleted successfully');
                  }).catch((error) => {
                    console.error('Error deleting payment screenshot:', error);
                  }
                  );
                }
              });

              // After checking and deducting the package, approve the booking by moving it from pendingBookings to bookings
              const newBookingId = bookingId;
              const bookingRef = ref(db, `bookings/${newBookingId}`);
              // Set the booking data to the bookings node
              set(bookingRef, {
                username: pendingBookingData.username,
                date: pendingBookingData.date,
                time: pendingBookingData.time,
                bookingId,
                paymentMethod: pendingBookingData.paymentMethod,
              });
              // Remove the booking from pending bookings
              set(pendingBookingRef, null);
            }
            else{
              alert("User packages data does not exist");
            }
          });
        }
        // else if payment method is single payment
        else{
          const paymentScreenshotUrl = pendingBookingData.paymentScreenshot;
          const bookingData = {
            username: pendingBookingData.username,
            date: pendingBookingData.date,
            time: pendingBookingData.time,
            status: 'Approved',
            bookingId,
            paymentMethod: pendingBookingData.paymentMethod,
            paymentScreenshot: paymentScreenshotUrl, // Add paymentScreenshot field
          };
          const newBookingId = bookingId;
          const bookingsRef = ref(db, `bookings/${newBookingId}`);
          // Set the booking data to the bookings node
          set(bookingsRef, bookingData);
          // Remove the booking from pending bookings
          set(pendingBookingRef, null);
        }
        
        const newPendingBookings = [...pendingBookings];
        const index = newPendingBookings.findIndex((booking) => booking.bookingId === bookingId);
        if (index !== -1) {
          newPendingBookings.splice(index, 1);
          setPendingBookings(newPendingBookings);
        }
        alert(`Booking for ${pendingBookingData.username} on ${pendingBookingData.date} at ${pendingBookingData.time} has been approved!`);
        return;
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
      alert('Booking rejected!');
    }
  };

  const handleCancel = async (bookingId) => {
  if (isAdmin) {
    const db = getDatabase();
    const bookingRef = ref(db, `bookings/${bookingId}`);
    get(bookingRef).then((snapshot) => {
      if (snapshot.exists()) {
        const bookingData = snapshot.val();
        const paymentScreenshotUrl = bookingData.paymentScreenshot;
        if (paymentScreenshotUrl) {
          const storage = getStorage();
          const paymentScreenshotRef = storageRef(storage, paymentScreenshotUrl);
          deleteObject(paymentScreenshotRef).then(() => {
            alert('Payment screenshot of the booking has been deleted successfully');
          }).catch((error) => {
            console.error('Error deleting payment screenshot:', error);
          });
        }
        set(bookingRef, null);
        alert(`Booking for ${bookingData.username} on ${bookingData.date} at ${bookingData.time} has been cancelled!`);
        const newBookings = [...bookings];
        const index = newBookings.findIndex((booking) => booking.bookingId === bookingId);
        if (index !== -1) {
          newBookings.splice(index, 1);
          setBookings(newBookings);
        }
      }
    });
  }
};

  const handleShowCapscreenForPedningBooking = (bookingId) => {
    const paymentScreenshotUrl = pendingBookings.find((booking) => booking.bookingId === bookingId).paymentScreenshot;
    if (paymentScreenshotUrl) {
      // Create a modal to display the payment screenshot
      const modal = document.getElementById('capscreen-modal');
      modal.style.display = 'block';
      const image = document.getElementById('capscreen-image');
      const loadingText = document.getElementById('capscreen-loading-text');
      const imagePath = paymentScreenshotUrl.substring(paymentScreenshotUrl.lastIndexOf("%2F") + 3, paymentScreenshotUrl.indexOf("?alt"));
      loadingText.style.display = 'block';
      image.src = paymentScreenshotUrl;
      image.onload = () => {
        loadingText.style.display = 'none';
      };
      const imagePathElement = document.getElementById('capscreen-image-path');
      imagePathElement.textContent = imagePath;
      console.log("Image Path: ", imagePath);
    }
  };

  const handleShowCapscreenForBooking = (bookingId) => {
    const paymentScreenshotUrl = bookings.find((booking) => booking.bookingId === bookingId).paymentScreenshot;
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
      const imagePath = paymentScreenshotUrl.substring(paymentScreenshotUrl.lastIndexOf("%2F") + 3, paymentScreenshotUrl.indexOf("?alt"));
      const imagePathElement = document.getElementById('capscreen-image-path');
      imagePathElement.textContent = imagePath;
      console.log("Image Path: ", imagePath);
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
                  <div>
                    <button onClick={() => handleCancel(booking.bookingId)}>Cancel</button>
                  </div>
                </td>
                <td>{booking.paymentMethod}</td>
                <td>
                {booking.paymentScreenshot ? (
                  <button onClick={() => handleShowCapscreenForBooking(booking.bookingId)}>Show Capscreen</button>
                ) : (
                  <span>No Payment Screenshot</span>
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
                <td>{booking.paymentMethod}</td>
                {booking.paymentMethod !== 'package' && (
                  <td>
                    <button onClick={() => handleShowCapscreenForPedningBooking(booking.bookingId)}>Show Capscreen</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal to display the payment screenshot */}
      <div id="capscreen-modal" style={{ display: 'none', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', border: '1px solid black' }}>
        <p>PaymentScreenshot Path: <span id="capscreen-image-path"></span></p>
        <img id="capscreen-image" src="" alt="Payment Screenshot" style={{ width: '100%', height: '100%' }} />
        <p id="capscreen-loading-text" style={{ display: 'none' }}>Loading...</p>
        <button onClick={() => document.getElementById('capscreen-modal').style.display = 'none'}>Close</button>
      </div>
    </div>
  );
};

export default ViewAllBookingsPage;