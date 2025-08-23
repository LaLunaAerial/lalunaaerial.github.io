import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
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

    // Get the image file from the input field
    const imageFile = document.getElementById('image-input').files[0];

    // Check if there is no upload file
    if (!imageFile) {
      alert("You should insert the capscreen of payment for the booking");
      return;
    }

    // Check if the uploaded file size is larger than 5MB
    const fileSize = imageFile.size;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileSize > maxSize) {
      alert("The upload image should not be larger than 5MB");
      return;
    }

    // Create a reference to the Firebase Storage
    const storage = getStorage();

    // Create a reference to the file in the storage bucket
    const fileRef = storageRef(storage, `payme-screenshots/${auth.currentUser.uid}_${new Date().getTime()}`);

    // Upload the image file to Firebase Storage
    const uploadTask = uploadBytes(fileRef, imageFile);

    // Wait for the upload to complete
    uploadTask.then((snapshot) => {
      console.log('Image uploaded successfully');

      // Get the download URL of the uploaded image
      getDownloadURL(fileRef).then((downloadURL) => {
        console.log('Image uploaded successfully:', downloadURL);

        // Create a pending booking record with the image file path
        const db = getDatabase();
        const bookingRequests = cart.map((item) => {
          const pendingBookingRef = ref(db, `pendingBookings/${auth.currentUser.uid}_${item.date}_${item.time}`);
          return set(pendingBookingRef, {
            username: auth.currentUser.displayName,
            date: item.date,
            time: item.time,
            paymentScreenshot: downloadURL,
          });
        });

        // Save the pending booking records
        Promise.all(bookingRequests).then(() => {
          // Clear the cart and show a success message
          setCart([]);
          localStorage.setItem('cart', JSON.stringify([]));
          alert('Booking requests submitted for approval');
        });
      });
    }).catch((error) => {
      console.error('Error uploading image:', error);
    });
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

      <div className="payment-instruction">
        <h6>當您提交預訂之後,請將付款金額傳至以下Payme帳號。</h6>
      </div>
      <div className="payme-code">
        <h2>Payme Code:</h2>
        <img src={require('../assets/PaymeCode.jpg')} alt="Payme Code" />
        <div className="upload-instruction" style={{ display: 'flex', flexDirection: 'row', alignItems: 'left', flex: 3 }}>
          <input type="file" id="image-input" />
          <h6>請上載您的Payme付款截圖</h6>

        </div>
        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default ShoppingCart;