// components/SchedulePage.jsx
import React, { useState, useEffect } from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { get, ref, set, getDatabase } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';
import './SchedulePage.css';
import { useNavigate } from 'react-router-dom';

function SchedulePage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(dayjs());
  const [bookingStatus, setBookingStatus] = useState({});
  const [hours, setHours] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [render, setRender] = useState(false);

  useEffect(() => {
    // check the login status, if the user is not logged in, redirect to login page
    if (!auth.currentUser) {
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart')) || []);
  }, [localStorage.getItem('cart')]);
  
  useEffect(() => {
    const hours = Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minute = (i % 2) * 30;
      const endTime = (hour + (minute === 30 ? 1 : 0)).toString().padStart(2, '0') + ':' + (minute === 30 ? '00' : '30');
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}-${endTime}`;
    });
    setHours(hours);

    const dateKey = date.format('YYYY-MM-DD');
    const bookingRef = ref(getDatabase(), `bookings`);
    get(bookingRef).then((snapshot) => {
      if (snapshot.exists()) {
        const bookings = snapshot.val();
        const bookingStatus = {};
        hours.forEach((hour) => {
          let isBooked = false;
          Object.keys(bookings).forEach((userName) => {
            if (bookings[userName][dateKey] && bookings[userName][dateKey][hour] === 'Booked') {
              isBooked = true;
            }
          });
          bookingStatus[hour] = isBooked ? 'Booked' : 'Free';
        });
        setBookingStatus(bookingStatus);
      } else {
        const bookingStatus = {};
  hours.forEach((hour) => {
    bookingStatus[hour] = 'Free';
  });
  setBookingStatus(bookingStatus);
      }
    });
  }, [date]);



  const handleBook = async (hour) => {
    if (!auth.currentUser) {
      alert('Please log in to book a room');
      return;
    }
  
    const newCart = JSON.parse(localStorage.getItem('cart')) || [];
    const isAlreadyInCart = newCart.find((item) => item.date === date.format('YYYY-MM-DD') && item.time === hour);
  
    if (isAlreadyInCart) {
      alert('Time slot is already in your cart');
      return;
    }
  
    // Add the selected time slot to the shopping cart
    newCart.push({ date: date.format('YYYY-MM-DD'), time: hour });
    localStorage.setItem('cart', JSON.stringify(newCart));
  
    // Update the bookingStatus state to reflect the selected time slot
    const newBookingStatus = { ...bookingStatus };
    newBookingStatus[hour] = 'selected';
    setBookingStatus(newBookingStatus);
  
    // Update the cart state to re-render the component
    setCart(newCart);
  
    alert('Time slot added to cart');
  };
  return (
    <div className='schedule-container'>
      <h2>Room Booking</h2>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar value={date} onChange={newDate => setDate(newDate)} />
      </LocalizationProvider>
      <p>
        Selected date: {date ? date.format('MM/DD/YYYY') : 'No date selected'}
      </p>
      <table class="timetable-table">
        <thead>
          <tr>
            <th class="time-column">Time</th>
            <th class="status-column">Status</th>
            <th class="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
        {hours.map((hour, index) => (
  <tr key={index}>
    <td>{hour}</td>
    <td>
          {bookingStatus[hour] === 'Free' ? (
            <span>Available</span>
          ) : (
            <span>Occupied</span>
          )}
        </td>
    <td>
      {cart.find((item) => item.date === date.format('YYYY-MM-DD') && item.time === hour) ? (
        <button className="selected-grey" disabled>Selected</button>
      ) : bookingStatus[hour] === 'Booked' ? (
        <button className="selected-grey" disabled>Registered</button>
      ) : (
        <button className="book-button" onClick={() => handleBook(hour)} disabled={cart.find((item) => item.date === date.format('YYYY-MM-DD') && item.time === hour) ? true : false}>Book</button>
      )}
    </td>
  </tr>
))}
        </tbody>
      </table>
    </div>
  );
}

export default SchedulePage;