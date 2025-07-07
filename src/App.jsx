import React from 'react';
import Navbar from './components/NavBar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SchedulePage from './components/SchedulePage';
import AdminPage from './components/AdminPage';

function New() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/booking' element={<SchedulePage />} />
        <Route path='/admin' element={<AdminPage />} />
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