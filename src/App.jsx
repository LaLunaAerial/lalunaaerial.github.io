import React from 'react';
import Navbar from './components/NavBar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SchedulePage from './components/SchedulePage';
import AdminPage from './components/AdminPage';
import ShoppingCart from './components/ShoppingCart';
import MyBookingPage from './components/MyBookingPage';
import ViewAllBookingPage from './components/ViewAllBookingPage';

function New() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/booking' element={<SchedulePage />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/shopping-cart' element={<ShoppingCart />} />
        <Route path="/my-bookings" element={<MyBookingPage />} />
        <Route path="/view-all-bookings" element={<ViewAllBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export function App(props) {
  return (
    <div className='App'>
      <New />
    </div>
  );
}