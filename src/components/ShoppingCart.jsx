import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth } from '../assets/firebaseConfig';
import './ShoppingCart.css';

const ShoppingCart = () => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart'));
    console.log('Stored cart:', storedCart); // Debugging line to check the stored cart
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
        username: auth.currentUser.email.split('@')[0],
        date: item.date,
        time: item.time,
      });
    });

    await Promise.all(bookingRequests);
    alert('Booking requests submitted for approval');
    setCart([]);
    localStorage.setItem('cart', JSON.stringify([]));
  };

  // Calculate the total price of the items in the cart
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.time}</td>
              <td>${item.price}</td>
              <td>
                <button onClick={() => handleRemove(index)}>Clear</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span>Total: ${totalPrice}</span>
      <br />
      <button className="submit-button" onClick={handleSubmit}>Submit</button>
      <div className="payme-code">
  <img src="/PaymeCode.jpg" alt="Payme Code" />
</div>
    </div>
  );
};

export default ShoppingCart;