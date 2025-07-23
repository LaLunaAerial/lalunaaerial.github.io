import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';
import './ShoppingCart.css';

const ShoppingCart = () => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  useEffect(() => {
    
    const storedCart = JSON.parse(localStorage.getItem('cart'));
    if (storedCart) {
      setCart(storedCart);
    }
  }, []);
  
  useEffect(() => {
    if (!auth.currentUser) {
      localStorage.removeItem('cart');
    }
  }, [auth.currentUser]);
  const handleRemove = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleSubmit = async () => {
    // Create a booking request for each time slot in the cart
    const bookingRequests = cart.map((item) => {
      const pendingBookingRef = ref(getDatabase(), `pendingBookings/${auth.currentUser.uid}_${item.date}_${item.time}`);
      return set(pendingBookingRef, {
        email: auth.currentUser.email,
        date: item.date,
        time: item.time,
      });
    });

    await Promise.all(bookingRequests);
    alert('Booking requests submitted for approval');
    setCart([]);
    localStorage.setItem('cart', JSON.stringify([]));
  };

  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.time}</td>
              <td>
                <button onClick={() => handleRemove(index)}>Clear</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="submit-button" onClick={handleSubmit}>Submit</button>
      <div className="payme-code">
  <img src="/PaymeCode.jpg" alt="Payme Code" />
</div>
    </div>
  );
};

export default ShoppingCart;