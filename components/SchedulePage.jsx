// components/SchedulePage.jsx
import React, { useState } from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import './SchedulePage.css';

function SchedulePage() {
  const [date, setDate] = useState(dayjs());

  return (
    <div className='schedule-container'>
      <h2>Book a Room</h2>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar value={date} onChange={newDate => setDate(newDate)} />
      </LocalizationProvider>
      <p>
        Selected date: {date ? date.format('MM/DD/YYYY') : 'No date selected'}
      </p>
      {/* Add booking form and display booking information here */}
    </div>
  );
}

export default SchedulePage;
