import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get, onValue,push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../assets/firebaseConfig';
import './ShoppingCart.css';

const ShoppingCart = () => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [userPackages, setUserPackages] = useState({});
  const [peakQuota, setPeakQuota] = useState(0);
  const [nonPeakQuota, setNonPeakQuota] = useState(0);
  const [packages, setPackages] = useState({});
  const [packageCart, setPackageCart] = useState([]);
  const [isAllOvernight,setIsAllOvernight]=useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      localStorage.removeItem('cart');
    }
  }, [auth.currentUser]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart'));
    console.log('Stored cart:', storedCart); // Debugging line to check the stored cart
    if (storedCart) {
      setCart(storedCart);
    }

    const packageCartData = localStorage.getItem('packageCart');
    console.log('Package cart data:', packageCartData);
    if (packageCartData) {
      setPackageCart(JSON.parse(packageCartData));
    }
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const packagesRef = ref(db, 'packages');
    get(packagesRef).then((snapshot) => {
      const packagesData = snapshot.val();
      console.log(packagesData);
      setPackages(packagesData);
    });
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const userPackagesRef = ref(db, `userPackages/${auth.currentUser.displayName}`);
    get(userPackagesRef).then((snapshot) => {
      const packages = snapshot.val();
      setUserPackages(packages);
      let peakQuota = 0;
      let nonPeakQuota = 0;
      if (packages) {
        Object.keys(packages).forEach((key) => {
          const packageType = packages[key].packageType;
          const remainingQuota = packages[key].remainingQuota;
          console.log(`Package Type: ${packageType}, Remaining Quota: ${remainingQuota}`); // Debugging line to check package type and remaining quota
          if (packageType === 'Peak') {
            peakQuota += remainingQuota;
          } else if (packageType === 'Non-Peak') {
            nonPeakQuota += remainingQuota;
          }
        });
      }
      setPeakQuota(peakQuota);
      setNonPeakQuota(nonPeakQuota);
    });
  }, [auth.currentUser]);

  // Check if all bookings are overnight
  useEffect(()=>{
    if (
      (cart.every((item) => item.timeCategory === 'Overnight')) &&
      (cart.length === 16) &&
      (cart.every((item, index, array) => {
        if (index === 0) return true;
        if (!item.date || !array[index - 1].date) return false;
        const currentDate = new Date(item.date);
        const previousDate = new Date(array[index - 1].date);
        const currentDay = currentDate.getDate();
        const previousDay = previousDate.getDate();
        return Math.abs(currentDay - previousDay) <= 1;
      }))
    ) {
      setIsAllOvernight(true);
    } else {
      setIsAllOvernight(false);
    }
  },[cart]);

  // handleBuyPackage
  const handleBuyPackage = async (packageItem) => {

    // Check if ther user already buy the package
    const db = getDatabase();
    const userPackageRef = ref(db, `userPackages/${auth.currentUser.displayName}/${packageItem.name}`);
    const snapshot = await get(userPackageRef);
    if (snapshot.exists()) {
      alert(`You have already bought the ${packageItem.name} package! Please wait for admin approval if the status is still pending.`);
      return;
    }

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
    const fileRef = storageRef(storage, `payme-screenshots/${auth.currentUser.displayName}_${new Date().getTime()}`);
  
    // Upload the image file to Firebase Storage
    const uploadTask = uploadBytes(fileRef, imageFile);
    
    // Create a package data with the payment screenshot download URL
    let packageData;
    // Specfial handling for Overnight package
    if(packageItem.type==="Overnight"){
      packageData = {
        packageName: packageItem.name,
        packageType: packageItem.type,
        paymentScreenshot: "",  // to be updated after the image is uploaded
        price: packageItem.price,
        purchaseDate: new Date().toISOString().split('T')[0], // current date in YYYY-MM-DD format
        status: 'pending',
        // No number of sections , effective period, remaining quota or expiry date for overnight package
      }
    }
    else{
      packageData = {
        packageName: packageItem.name,
        packageType: packageItem.type,
        numberOfSections: packageItem.numberOfSection,
        effectivePeriod: packageItem.effectivePeriod,
        expiryDate: "", // set null initially, to be updated by the first booking made using this package
        price: packageItem.price,
        purchaseDate: new Date().toISOString().split('T')[0], // current date in YYYY-MM-DD format
        remainingQuota: packageItem.numberOfSection,
        status: 'pending',
        paymentScreenshot: "",  // to be updated after the image is uploaded
      };
    }
  
    // Wait for the upload to complete
    uploadTask.then((snapshot) => {
      // Get the download URL of the uploaded image
      getDownloadURL(fileRef).then((downloadURL) => {
        console.log('Image uploaded successfully:', downloadURL);
        alert('Payment screenshot image uploaded Successfully')
        // update the packageData.paymentScrrenshot with downloadURL
        packageData.paymentScreenshot = downloadURL;
  
        // Update the user package with the new package data
        const db = getDatabase();
        const newPackageRef = ref(db, `userPackages/${auth.currentUser.displayName}/${packageData.packageName}`);
        set(newPackageRef, packageData);
        console.log(`Package ${packageData.packageName} bought successfully!`);
        alert(`You have successfully submit request for buying the ${packageData.packageName} package! The request is now pending for admin approval.`);
        
        // use fetchAPI to send email to notify the admin
        fetch('https://us-central1-laluna-website.cloudfunctions.net/sendMail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: 'la.luna.aerial@gmail.com', // receiver email
            subject: '(Testing)New Package Buy Request',
            html: `
              <p>A new package buy request has been submitted by ${auth.currentUser.displayName}. Please review the request and take necessary actions.</p>
              <p>Package Name: ${packageData.packageName}</p>
              <p>Package Type: ${packageData.packageType}</p>
              <p>Price: ${packageData.price}</p>
              <p>Payment Screenshot: ${packageData.paymentScreenshot}</p>
              `,
          }),
          }).then((response) => {
            response.json().then((data) => {
              console.log("fetch API res: ",data);
              console.log("Email sent successfully");
            })
          }).catch((error) => {
            console.error("fetch API error: ",error);
          });
        
        // Update the packageCart state
        const newPackageCart = packageCart.filter((item) => item.id !== packageItem.id);
        setPackageCart(newPackageCart);
        localStorage.setItem('packageCart', JSON.stringify(newPackageCart));
      });
    });

    
  };
  
  //TODO: Fix the issue of remove all package when clicking remove
  // Remove package from the package cart
  const handleRemovePackage = (packageId) => {
    const newPackageCart = packageCart.filter((packageItem) => packageItem.id !== packageId);
    setPackageCart(newPackageCart);
    localStorage.setItem('packageCart', JSON.stringify(newPackageCart));
  };

  const handleRemove = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleSubmit = async () => {

    // Get the image file from the input field
    const imageFile = document.getElementById('image-input').files[0];

    //Check if the cart is empty
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

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
    const fileRef = storageRef(storage, `payme-screenshots/${auth.currentUser.displayName}_${new Date().getTime()}`);

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
          const bookingDate=item.date;
          const bookingTime=item.time;
          const pendingBookingRef = ref(db, `pendingBookings/${auth.currentUser.displayName}_${bookingDate}_${bookingTime}`);
          return set(pendingBookingRef, {
            username: auth.currentUser.displayName,
            date: item.date,
            time: item.time,
            paymentMethod: 'payme',
            paymentScreenshot: downloadURL,
            timeCategory: item.timeCategory,
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

  // Handle payment by Overnight package
  const handlePayByOvernightPackage=async()=>{
    let overnightPackage;

    Object.keys(userPackages).forEach((key) => {
      if (userPackages[key].packageType === 'Overnight') {
        overnightPackage = userPackages[key];
      }
    });

    console.log('Overnight Package:', overnightPackage); // Debugging line to check the overnight package

    console.log("isAllOvernight: ",isAllOvernight)

    // if all booking are overnight, check for overnight package
    if (isAllOvernight) {
      if (!overnightPackage) {
        alert('No Overnight package found!');
        return;
      }
    }else{
      alert("The booking item in shopping cart are not all Overnight")
      return;
    }

    // Special handling for Overnight package

      let bookingRequests = [];
    const db = getDatabase();
      bookingRequests = cart.map((item) => {
        const pendingBookingRef = ref(db, `pendingBookings/${auth.currentUser.displayName}_${item.date}_${item.time}`);
        return set(pendingBookingRef, {
          username: auth.currentUser.displayName,
          date: item.date,
          time: item.time,
          timeCategory: item.timeCategory,
          paymentMethod: 'Overnight package',
        });
    });

    // Wait for all booking requests to complete, then clear the cart
    Promise.all(bookingRequests).then(() => {
      setCart([]);
      localStorage.setItem('cart', JSON.stringify([]));
      alert('The request of booking by package has been submitted for approval');
    });

  }

  // Handle payment by package
  const handlePayByPackage = async () => {
    console.log('User Packages:', userPackages);
    let peakPackage;
    let nonPeakPackage;

    // Check if userPackages is null or undefined
    if (!userPackages) {
      alert('Cannot find your packages! Please contact admin for help.');
      return;
    }

    Object.keys(userPackages).forEach((key) => {
      if (userPackages[key].packageType === 'Peak') {
        peakPackage = userPackages[key];
      } else if (userPackages[key].packageType === 'Non-Peak') {
        nonPeakPackage = userPackages[key];
      }
    });

    console.log('Peak Package:', peakPackage); // Debugging line to check the peak package
    console.log('Non-Peak Package:', nonPeakPackage); // Debugging line to check the non-Peak package
    
    const peakSections = cart.filter((item) => item.timeCategory === 'Peak').length;
    const nonPeakSections = cart.filter((item) => item.timeCategory === 'Non-Peak' || item.timeCategory === 'Overnight').length;

    
    // else, check for Peak and Non-Peak package
    if (peakSections > 0) {
      if (!peakPackage) {
        alert('No Peak package found!');
        return;
      }
      if (peakPackage.remainingQuota < peakSections) {
        alert('Insufficient peak package quota!');
        return;
      }
    }

    if (nonPeakSections > 0) {
      if (!nonPeakPackage) {
        alert('No Non-Peak package found!');
        return;
      }
      if (nonPeakPackage.remainingQuota < nonPeakSections) {
        alert('Insufficient Non-Peak package quota!');
        return;
      }
    }
    
    let bookingRequests = [];
    const db = getDatabase();
    
    bookingRequests = cart.map((item) => {
      const pendingBookingRef = ref(db, `pendingBookings/${auth.currentUser.displayName}_${item.date}_${item.time}`);
      return set(pendingBookingRef, {
        username: auth.currentUser.displayName,
        date: item.date,
        time: item.time,
        timeCategory: item.timeCategory,
        paymentMethod: 'package',
      });
    });
  
    // Wait for all booking requests to complete, then clear the cart
    Promise.all(bookingRequests).then(() => {
      setCart([]);
      localStorage.setItem('cart', JSON.stringify([]));
      alert('The request of booking by package has been submitted for approval');
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

      <hr />
      <h3>Packages:</h3>
      <table>
        <thead>
          <tr>
            <th>Package Name</th>
            <th>Package Type</th>
            <th>Number of Sections</th>
            <th>Effective Period</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {packageCart.map((packageItem, index) => (
            <tr key={index}>
              <td>{packageItem.name}</td>
              <td>{packageItem.type}</td>
              <td>{packageItem.numberOfSection}</td>
              <td>{packageItem.effectivePeriod}</td>
              <td>${packageItem.price}</td>
              <td>
                <button onClick={() => handleBuyPackage(packageItem)}>Buy</button>
                <button onClick={() => handleRemovePackage(packageItem.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      
      {auth.currentUser && (
        <div>
          <h4>Package Quota:</h4>
          <p>Peak: {peakQuota}</p>
          <p>Non-Peak: {nonPeakQuota}</p>
        </div>
      )}

      <hr />
      
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
        <button className="submit-button" onClick={handleSubmit}>Submit Booking With Payme Screenshot</button>
        <button className="submit-button" onClick={handlePayByPackage}>Submit Booking By Using Package</button>
        {(isAllOvernight)?(
          <button className="submit-button" onClick={handlePayByOvernightPackage}>Submit Booking By Overnight Package</button>
        ):(
          <button className="disabled-button" disabled >Submit Booking By Overnight Package</button>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;