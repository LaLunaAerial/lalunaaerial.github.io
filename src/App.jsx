import {useState} from 'react';
import Navbar from './components/NavBar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SchedulePage from './components/SchedulePage';
import AdminPage from './components/AdminPage';
import ShoppingCart from './components/ShoppingCart';
import MyBookingPage from './components/MyBookingPage';
import ViewAllBookingPage from './components/ViewAllBookingPage';
import PricePage from './components/PricePage';
import PackageBuyPage from './components/PackageBuyPage';
import AccountInformationPage from './components/AccountInformationPage';
import ViewAllPackagesPage from './components/ViewAllPackagesPage';
import OvernightSchedulePage from "./components/OvernightSchedulePage";

function New() {
  const [showNavbar, setShowNavbar] = useState(false);

  const handleToggleNavbar = () => {
    setShowNavbar(!showNavbar);
  };
  
  const handleLinkClick = () => {
    setShowNavbar(false);
  };

    return (
    <BrowserRouter>
      <div>
        <div style={{position: 'fixed', top: 0, right: 0, zIndex: 1000}}>
        <button onClick={handleToggleNavbar} style={{ position: 'fixed', top: 0, right: 0}}>
          {(showNavbar)?"X":"Menu"}
        </button>
        {showNavbar && (
        <Navbar style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '300px' }} onLinkClick={handleLinkClick} />
        )}
        </div>
        <div style={{position: 'relative', zIndex: 0, marginLeft: '0', marginRight: '0', filter: showNavbar ? 'blur(8px)' : 'none', pointerEvents: showNavbar ? 'none' : 'auto' }}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/home' element={<HomePage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/schedule' element={<SchedulePage />} />
            <Route path='/admin' element={<AdminPage />} />
            <Route path='/shopping-cart' element={<ShoppingCart />} />
            <Route path="/my-bookings" element={<MyBookingPage />} />
            <Route path="/view-all-bookings" element={<ViewAllBookingPage />} />
            <Route path="/view-all-packages" element={<ViewAllPackagesPage />} />
            <Route path="/price" element={<PricePage />} />
            <Route path="/buy-packages" element={<PackageBuyPage />} />
            <Route path="/account-information" element={<AccountInformationPage />} />
            <Route path="/overnight-schedule" element={<OvernightSchedulePage />} />
          </Routes>
        </div>
      </div>
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