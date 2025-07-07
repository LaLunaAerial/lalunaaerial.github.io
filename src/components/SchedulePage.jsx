// components/SchedulePage.jsx
import React, { useState, useEffect } from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { get, ref, set, getDatabase } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';
import './SchedulePage.css';

function SchedulePage() {
  const [date, setDate] = useState(dayjs());
  const [bookingStatus, setBookingStatus] = useState({});
  const [hours, setHours] = useState([]);

  useEffect(() => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00-${(i + 1).toString().padStart(2, '0')}:00`);
    setHours(hours);
  
    const dateKey = date.format('YYYY-MM-DD');
    const bookingRef = ref(getDatabase(), `bookings`);
    get(bookingRef).then((snapshot) => {
      if (snapshot.exists()) {
        const bookings = snapshot.val();
        //TODO: remove this line
        console.log('Bookings snapshot:', JSON.stringify(snapshot.val()));
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
        setBookingStatus({});
      }
    });
  }, [date]);

  const handleBook = async (hour) => {
    if (!auth.currentUser) {
      alert('Please log in to book a room');
      return;
    }

    const pendingBookingRef = ref(getDatabase(), `pendingBookings/${auth.currentUser.uid}_${date.format('YYYY-MM-DD')}_${hour}`);
    await set(pendingBookingRef, {
      email: auth.currentUser.email,
      date: date.format('YYYY-MM-DD'),
      time: hour,
    });

    alert('Booking submitted for approval');
  };

  return (
    <div className='schedule-container'>
      <h2>Book a Room</h2>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar value={date} onChange={newDate => setDate(newDate)} />
      </LocalizationProvider>
      <p>
        Selected date: {date ? date.format('MM/DD/YYYY') : 'No date selected'}
      </p>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {hours.map((hour) => (
    <tr key={hour}>
      <td>{hour}</td>
      <td>{bookingStatus[hour] === 'Booked' ? 'Booked' : 'Free'}</td>
      <td>
        {bookingStatus[hour] === 'Booked' ? (
          <span>Booked</span>
        ) : (
          <button onClick={() => handleBook(hour)}>Book</button>
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