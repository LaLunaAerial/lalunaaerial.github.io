import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get, onValue, push } from 'firebase/database';
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
  const [isAllOvernight, setIsAllOvernight] = useState(false);

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
    if (!auth.currentUser) return;
    const db = getDatabase();
    const userPackagesRef = ref(db, `userPackages/${auth.currentUser.displayName}`);
    get(userPackagesRef).then((snapshot) => {
      const packages = snapshot.val();
      setUserPackages(packages);
      let peakQuota = 0;
      let nonPeakQuota = 0;
      if (packages) {
        Object.keys(packages).forEach((packageName) => {
          Object.keys(packages[packageName]).forEach((purchaseDate) => {
            const packageInstance = packages[packageName][purchaseDate];
            const packageType = packageInstance.packageType;
            const packageStatus = packageInstance.status;
            const remainingQuota = packageInstance.remainingQuota;
            console.log(`Package Type: ${packageType}, packageStatus: ${packageStatus}, Remaining Quota: ${remainingQuota}`); // Debugging line to check package type and remaining quota
            
            // Only count quota for Active packages
            if (packageType === 'Peak' && packageStatus === 'Active') {
              peakQuota += remainingQuota;
            } else if (packageType === 'Non-Peak' && packageStatus === 'Active') {
              nonPeakQuota += remainingQuota;
            }
          });
        });
      }
      setPeakQuota(peakQuota);
      setNonPeakQuota(nonPeakQuota);
    });
  }, [auth.currentUser]);

  // Check if all bookings are overnight
  useEffect(() => {
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
  }, [cart]);

  // handleBuyPackage
  const handleBuyPackage = async (packageItem) => {

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
    if (packageItem.type === "Overnight") {
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
    // Normal handling for Peak and Non-Peak package
    else {
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
        const newPackageRef = ref(db, `userPackages/${auth.currentUser.displayName}/${packageData.packageName}/${packageData.purchaseDate}`);
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
              <p>Purchase Date: ${packageData.purchaseDate}</p>
              <p>Payment Screenshot: ${packageData.paymentScreenshot}</p>
              `,
          }),
        }).then((response) => {
          response.json().then((data) => {
            console.log("fetch API res: ", data);
            console.log("Email sent successfully");
          })
        }).catch((error) => {
          console.error("fetch API error: ", error);
          alert("Email failed to send, please contact admin to notify for your package buy request");
        });

        // Update the packageCart state
        const newPackageCart = packageCart.filter((item) => item.id !== packageItem.id);
        setPackageCart(newPackageCart);
        localStorage.setItem('packageCart', JSON.stringify(newPackageCart));
      });
    });


  };

  // Remove package from the package cart
  const handleRemovePackage = (index) => {
    const newPackageCart = packageCart.filter((_, i) => i !== index);
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
          // Create a pending booking record
          const bookingDate = item.date;
          const bookingTime = item.time;
          const pendingBookingRef = ref(db, `pendingBookings/${auth.currentUser.displayName}_${bookingDate}_${bookingTime}`);
          set(pendingBookingRef, {
            username: auth.currentUser.displayName,
            date: item.date,
            time: item.time,
            paymentMethod: 'payme',
            paymentScreenshot: downloadURL,
            timeCategory: item.timeCategory,
          }).catch((error) => {
            console.error('Error creating pending booking:', error);
            alert('Error creating pending booking. Please try again.');
            return;
          });

          // use fetchAPI to send email to notify the admin
          return fetch('https://us-central1-laluna-website.cloudfunctions.net/sendMail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: 'la.luna.aerial@gmail.com', // receiver email
              subject: '(Testing)New Single Booking Request',
              html: `
                <p>A new Single Booking request has been submitted by ${auth.currentUser.displayName}. Please review the request and take necessary actions.</p>
                <p>Date: ${item.date}</p>
                    <p>Time: ${item.time}</p>
                    <p>Price: ${item.price}</p>
                    <p>Payment Method: payme</p>
                    <p>Payment Screenshot: ${downloadURL}</p>
                    `,
            }),
          }).then((response) => {
            response.json().then((data) => {
              console.log("fetch API res: ", data);
              console.log("Email sent successfully");
            })
          }).catch((error) => {
            console.error("fetch API error: ", error);
            alert("Email failed to send, please contact admin to notify for your package buy request");
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

    // NEW: Submit the package buy requests
    if (packageCart.length > 0) {
      for (let i = 0; i < packageCart.length; i++) {
        await handleBuyPackage(packageCart[i]);
      }
    }
  };

  // Handle payment by Overnight package
  const handlePayByOvernightPackage = async () => {
    let overnightPackage;

    Object.keys(userPackages).forEach((packageName) => {
      Object.keys(userPackages[packageName]).forEach((purchaseDate) => {
        if (userPackages[packageName][purchaseDate].packageType === 'Overnight') {
        overnightPackage = userPackages[packageName][purchaseDate];
      }
      })
      
    });

    console.log('Overnight Package:', overnightPackage); // Debugging line to check the overnight package

    console.log("isAllOvernight: ", isAllOvernight)

    // if all booking are overnight, check for overnight package
    if (isAllOvernight) {
      if (!overnightPackage) {
        alert('No Overnight package found!');
        return;
      }
    } else {
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
      // use fetchAPI to send email to notify the admin
      fetch('https://us-central1-laluna-website.cloudfunctions.net/sendMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'la.luna.aerial@gmail.com', // receiver email
          subject: '(Testing)New Booking Request By Overnight Package',
          html: `
                <p>A new booking request by Overnight Package has been submitted by ${auth.currentUser.displayName}. Please review the request and take necessary actions.</p>
                <p>Date: ${cart[0].date}</p>
                <p>Payment Method: Overnight package</p>
                `,
        }),
      }).then((response) => {
        response.json().then((data) => {
          console.log("fetch API res: ", data);
          console.log("Email sent successfully");
        })
      }).catch((error) => {
        console.error("fetch API error: ", error);
        alert("Email failed to send, please contact admin to notify for your package buy request");
      });
      // Clear the cart
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

    Object.keys(userPackages).forEach((packageName) => {
      Object.keys(userPackages[packageName]).forEach((purchaseDate) => {
        if (userPackages[packageName][purchaseDate].packageType === 'Peak' && userPackages[packageName][purchaseDate].status === 'Active') {
          peakPackage = userPackages[packageName][purchaseDate];
        } else if (userPackages[packageName][purchaseDate].packageType === 'Non-Peak' && userPackages[packageName][purchaseDate].status === 'Active') {
          nonPeakPackage = userPackages[packageName][purchaseDate];
        }
      });
    });

    console.log('Peak Package:', peakPackage); // Debugging line to check the peak package
    console.log('Non-Peak Package:', nonPeakPackage); // Debugging line to check the non-Peak package

    const peakSections = cart.filter((item) => item.timeCategory === 'Peak').length;
    const nonPeakSections = cart.filter((item) => item.timeCategory === 'Non-Peak' || item.timeCategory === 'Overnight').length;


    // else, check for Peak and Non-Peak package
    if (peakSections > 0) {
      if (!peakPackage) {
        alert('No approved Peak package found!');
        return;
      }
      if (peakQuota < peakSections) {
        return;
      }
    }

    if (nonPeakSections > 0) {
      if (!nonPeakPackage) {
        alert('No approved Non-Peak package found!');
        return;
      }
      if (nonPeakQuota < nonPeakSections) {
        alert('Insufficient Non-Peak package quota!');
        return;
      }
    }

    let bookingRequests = [];
    const db = getDatabase();

    bookingRequests = cart.map((item) => {
      const pendingBookingRef = ref(db, `pendingBookings/${auth.currentUser.displayName}_${item.date}_${item.time}`);
      set(pendingBookingRef, {
        username: auth.currentUser.displayName,
        date: item.date,
        time: item.time,
        timeCategory: item.timeCategory,
        paymentMethod: 'package',
      }).catch((error) => {
        console.error('Error creating pending booking:', error);
        alert('Error creating pending booking. Please try again.');
        return;
      });

      // use fetchAPI to send email to notify the admin
      return fetch('https://us-central1-laluna-website.cloudfunctions.net/sendMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'la.luna.aerial@gmail.com', // receiver email
          subject: '(Testing)New Booking Request By Package',
          html: `
              <p>A new Booking request by Package has been submitted by ${auth.currentUser.displayName}. Please review the request and take necessary actions.</p>
              <p>Date: ${item.date}</p>
              <p>Time: ${item.time}</p>
              <p>Price: ${item.price}</p>
              <p>Time Category: ${item.timeCategory}</p>
              <p>Payment Method: package</p>
              `,
        }),
      }).then((response) => {
        response.json().then((data) => {
          console.log("fetch API res: ", data);
          console.log("Email sent successfully");
        })
      }).catch((error) => {
        console.error("fetch API error: ", error);
        alert("Email failed to send, please contact admin to notify for your package buy request");
      });
    });

    // Wait for all booking requests to complete, then clear the cart
    Promise.all(bookingRequests).then(() => {
      // Clear the cart
      setCart([]);
      localStorage.setItem('cart', JSON.stringify([]));
      alert('The request of booking by package has been submitted for approval');
    });
  };

  // Group overnight items
  const overnightItems = cart.filter(item => item.timeCategory === 'Overnight');
  const otherItems = cart.filter(item => item.timeCategory !== 'Overnight');

  // Calculate the total price of the items in the cart
  const packageTotalPrice = packageCart.reduce((acc, item) => acc + item.price, 0);
  const overnightTotalPrice = overnightItems.reduce((acc, item) => acc + item.price, 0);
  const otherItemsTotalPrice = otherItems.reduce((acc, item) => acc + item.price, 0);
  const totalPrice = packageTotalPrice + overnightTotalPrice + otherItemsTotalPrice;

  // Function to remove all overnight items
  const handleRemoveOvernight = () => {
    const newCart = [...cart];
    const overnightIndices = [];
    cart.forEach((item, index) => {
      if (item.timeCategory === 'Overnight') {
        overnightIndices.push(index);
      }
    });
    // Remove from the end to avoid index issues
    overnightIndices.reverse().forEach(index => newCart.splice(index, 1));
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Get the first date from overnightItems
  const overnightDate = overnightItems.length > 0 ? overnightItems[0].date : '';

  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>

      <hr />
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {packageCart.map((packageItem, index) => (
            <tr key={index}>
              {packageItem.type === "Overnight" ?
              <td>{packageItem.name}</td> :
              <td>{packageItem.name}<p>有效期:{packageItem.effectivePeriod}天</p></td>
              }
              <td>${packageItem.price}</td>
              <td><button onClick={() => handleRemovePackage(index)}>Remove</button></td>
            </tr>
          ))}
          {/* Display overnight items as a single row */}
          {overnightItems.length === 16 && overnightTotalPrice === 704 && (
            <tr>
              <td>{overnightDate+" 23:00 - 07:00"}</td>
              <td>${overnightTotalPrice}</td>
              <td>
                <button onClick={handleRemoveOvernight}>Remove</button>
              </td>
            </tr>
          )}
          {!(overnightItems.length === 16 && overnightTotalPrice === 704) && (
          overnightItems.map((item, index) => (
            <tr key={index}>
              <td>{item.date+" "+item.time}</td>
              <td>${item.price}</td>
              <td>
                <button onClick={() => handleRemove(index)}>Remove</button>
              </td>
            </tr>
          ))
          )}

          {/* Display other items normally */}
          {otherItems.map((item, index) => (
            <tr key={index}>
              <td>{item.date+" "+item.time}</td>
              <td>${item.price}</td>
              <td>
                <button onClick={() => handleRemove(index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span>Total: ${totalPrice}</span>
      
      <hr />
      
      {auth.currentUser && (
        <div>
          <h4>Package Quota for booking:</h4>
          <p>Peak: {peakQuota}</p>
          <p>Non-Peak: {nonPeakQuota}</p>
        </div>
      )}

      <hr />

      {/* TODO make sure handleSubmit can process both packages and bookings*/}
      {(packageCart.length > 0 ||
        cart.length > 0) 
        ? (<button className="submit-button" onClick={handleSubmit}>Pay By Uploading Payme/FPS Screenshot</button>)
        :(<div>
          <p>You have not selected any package or booking.</p>
          <button className="disabled-button" disabled>Pay By Uploading Payme/FPS Screenshot</button>
        </div>)
      }
      
      {/* TODO: make sure the button do all bookings with different types of packages */}
      {(packageCart.length === 0 &&
        cart.filter((item) => item.timeCategory === "Peak").length < peakQuota && 
        cart.filter((item) => item.timeCategory === "Non-Peak").length < nonPeakQuota &&
        !isAllOvernight) 
        ? (
          <div>
            <h4>OR</h4>
            <button className="submit-button" onClick={handlePayByPackage}>Submit Booking By Using Package</button>
          </div>
        ) : (
        <></>
        )
      }

      {(isAllOvernight) ? (
        <div>
            <h4>OR</h4>
            <button className="submit-button" onClick={handlePayByOvernightPackage}>Submit Booking By Overnight Package</button>
        </div>
        ) : (
          <></>
        )
      }
      
      <hr />

      <div className="upload-instruction" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 3 }}>
        <h4>如要使用Payme付款購買套票或租借單次時段,請上載您的Payme付款截圖:</h4>
        <input type="file" id="image-input" />
      </div>

      <div className="payment-instruction">
        <h4>當您提交預訂之後,請將付款金額傳至以下Payme帳號。</h4>
      </div>
      <div className="payme-code">
        <h2>Payme Code:</h2>
        <img src={require('../assets/PaymeCode.jpg')} alt="Payme Code" />
      </div>
    </div>
  );
};

export default ShoppingCart;