// components/OvernightSchedulePage.jsx
import React, { useState, useEffect } from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { get, ref, getDatabase } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';
import './OvernightSchedulePage.css';
import { useNavigate } from 'react-router-dom';
import { getTimeCategoryPrice, getTimeCategory } from '../assets/timeCategoriesPrice';

function OvernightSchedulePage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(dayjs());
  const [bookingStatus, setBookingStatus] = useState({});
  const [pendingBookingStatus, setPendingBookingStatus] = useState({});
  const [overnightTimeSlots, setOvernightTimeSlots] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  useEffect(() => {
    // check the login status, if the user is not logged in, redirect to login page
    if (!auth.currentUser) {
      alert("Please login first.")
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart')) || []);
  }, [localStorage.getItem('cart')]);

  // Function to generate overnight time slots (23:00 - 07:00)
  const generateOvernightTimeSlots = (selectedDate) => {
    const slots = [];

    // Add slots for 23:00 and 23:30 on the selected date
    const selectedDateStr = selectedDate.format('YYYY-MM-DD');
    slots.push({ time: "23:00-23:30", date: selectedDateStr });
    slots.push({ time: "23:30-00:00", date: selectedDateStr });

    // Add slots for 00:00 to 06:30 on the next day
    const nextDay = selectedDate.add(1, 'day');
    const nextDayStr = nextDay.format('YYYY-MM-DD');

    for (let hour = 0; hour < 7; hour++) {
      const nextHour = (hour + 1) % 24;
      const endTime1 = `${hour.toString().padStart(2, '0')}:30`;
      const time1 = `${hour.toString().padStart(2, '0')}:00-${endTime1}`;
      const endTime2 = `${nextHour.toString().padStart(2, '0')}:00`
      const time2 = `${hour.toString().padStart(2, '0')}:30-${endTime2}`;
      slots.push({ time: time1, date: nextDayStr });
      slots.push({ time: time2, date: nextDayStr });
    }
    return slots;
  };

  useEffect(() => {
    const overnightSlots = generateOvernightTimeSlots(date);
    setOvernightTimeSlots(overnightSlots);

    const bookingRef = ref(getDatabase(), `bookings`);
    const pendingBookingRef = ref(getDatabase(), `pendingBookings`);

    const fetchBookingStatus = async () => {
      const bookingStatus = {};
      const pendingBookingStatus = {};

      for (const slot of overnightSlots) {
        bookingStatus[slot.time] = 'Free';
        pendingBookingStatus[slot.time] = 'Free';

        try {
          const bookingSnapshot = await get(bookingRef);
          if (bookingSnapshot.exists()) {
            const bookingsData = bookingSnapshot.val();
            Object.keys(bookingsData).forEach((bookingId) => {
              const booking = bookingsData[bookingId];
              if (booking.date === slot.date && booking.time === slot.time) {
                bookingStatus[slot.time] = 'Booked';
              }
            });
          }

          const pendingBookingSnapshot = await get(pendingBookingRef);
          if (pendingBookingSnapshot.exists()) {
            const pendingBookingsData = pendingBookingSnapshot.val();
            Object.keys(pendingBookingsData).forEach((bookingId) => {
              const pendingBooking = pendingBookingsData[bookingId];
              if (pendingBooking.date === slot.date && pendingBooking.time === slot.time) {
                pendingBookingStatus[slot.time] = 'Booked';
              }
            });
          }
        } catch (error) {
          console.error("Error fetching booking data:", error);
          // Handle error appropriately
        }
      }

      setBookingStatus(bookingStatus);
      setPendingBookingStatus(pendingBookingStatus);
    };

    fetchBookingStatus();
  }, [date]);

  const handleBookOvernight = async (date) => {
    // Check if the user is logged in
    if (!auth.currentUser) {
      alert('Please log in to book a room');
      return;
    }

    const newCart = JSON.parse(localStorage.getItem('cart')) || [];
    let allAvailable = true;

    for (const slot of overnightTimeSlots) {
       // Get the current time
      const currentTime = dayjs();
      const hourStart = dayjs(`${slot.date} ${slot.time.split('-')[0]}`, 'YYYY-MM-DD HH:mm');
      
      // Check if the hour is in the past
      if (hourStart.isBefore(currentTime)) {
        alert('Cannot book for past time sections');
        return;
      }

      const isAlreadyInCart = newCart.find((item) => item.date === slot.date && item.time === slot.time);
      if (isAlreadyInCart) {
        alert('Time slot is already in your cart');
        return;
      }

      if (bookingStatus[slot.time] === 'Booked' || pendingBookingStatus[slot.time] === 'Booked') {
        allAvailable = false;
        break;
      }
    }

    if (!allAvailable) {
      alert('Some time slots in the overnight period are already booked.');
      return;
    }

    // Add all overnight time slots to the cart
    for (const slot of overnightTimeSlots) {
      const dateObject= new Date(slot.date)
      const price = getTimeCategoryPrice(slot.time,dateObject);
      const timeCategory = getTimeCategory(slot.time, dateObject);
      newCart.push({ date: slot.date, time: slot.time, price, timeCategory: timeCategory });
    }

    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);

    // Update booking status (optional - if you want to reflect this in the UI immediately)
    const newBookingStatus = { ...bookingStatus };
    overnightTimeSlots.forEach(slot => newBookingStatus[slot.time] = 'selected');
    setBookingStatus(newBookingStatus);

    alert('Overnight time slots added to cart!');
  };

  // Check if all slots are selected
  const allSlotsSelected = overnightTimeSlots.every(slot => {
    return cart.find(item => item.date === slot.date && item.time === slot.time);
  });

  // Check if all slots are registered
  const allSlotsRegistered = overnightTimeSlots.every(slot => {
    return bookingStatus[slot.time] === 'Booked' || pendingBookingStatus[slot.time] === 'Booked';
  });

  // Check if any slot is expired
  const anySlotExpired = overnightTimeSlots.some(slot => {
    return dayjs(`${slot.date} ${slot.time.split('-')[0]}`, 'YYYY-MM-DD HH:mm').isBefore(dayjs());
  });

  return (
    <div className='schedule-container'>
      <h2>Overnight Room Booking</h2>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar value={date} onChange={newDate => setDate(newDate)} />
      </LocalizationProvider>
      <p>
        Selected date: {date ? date.format('MM/DD/YYYY') : 'No date selected'}
      </p>
      <table className="timetable-table">
        <thead>
          <tr>
            <th className="time-column">Time</th>
            <th className="status-column">Status</th>
            <th className="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>23:00 - 07:00</td>
            <td>
              {anySlotExpired ? (
                <span>Expired</span>
              ) : allSlotsRegistered ? (
                <span>Occupied</span>
              ) : (
                <span>
                  {overnightTimeSlots.every(slot => bookingStatus[slot.time] === 'Free' && pendingBookingStatus[slot.time] === 'Free')
                    ? 'Available'
                    : 'Partially Occupied'}
                </span>
              )}
            </td>
            <td>
              {anySlotExpired ? (
                <button className="selected-grey" disabled>Expired</button>
              ) : allSlotsSelected ? (
                <button className="selected-grey" disabled>Selected</button>
              ) : allSlotsRegistered ? (
                <button className="selected-grey" disabled>Registered</button>
              ) : (
                overnightTimeSlots.every(slot => bookingStatus[slot.time] === 'Free' && pendingBookingStatus[slot.time] === 'Free') ? (
                  <button
                    className="book-button"
                    onClick={() => handleBookOvernight(date)}
                    disabled={allSlotsSelected}
                  >
                  Book Overnight
                </button>
                ) : (
                  <button className="selected-grey" disabled>Partially Occupied</button>
                )
                )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default OvernightSchedulePage;