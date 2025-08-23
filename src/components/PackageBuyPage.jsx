// PackageBuyPage.js
import React, { useState, useEffect } from 'react';
import { set, get, getDatabase, ref } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../assets/firebaseConfig';

const PackageBuyPage = () => {
  const [packages, setPackages] = useState({});
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const packagesRef = ref(db, 'packages');
    get(packagesRef).then((snapshot) => {
      const packagesData = snapshot.val();
      console.log(packagesData);
      setPackages(packagesData);
    });
  }, []);

  const handleBuyPackage = async (packageId) => {
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

        // Create a package data with the payment screenshot download URL
        const packageData = {
          packageName: packages[packageId].name,
          packageType: packages[packageId].type,
          numberOfSections: packages[packageId].numberOfSection,
          expiryDate: new Date(Date.now() + packages[packageId].effectivePeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          remainingQuota: packages[packageId].numberOfSection,
          status: 'pending',
          paymentScreenshot: downloadURL,
        };

        // Save the package data
        const db = getDatabase();
        const packageRef = ref(db, `userPackages/${auth.currentUser.displayName}/${packageId}`);
        set(packageRef, packageData).then(() => {
          console.log(`Package ${packageId} bought successfully!`);
          alert(`You have successfully bought the ${packages[packageId].name} package!`);
        }).catch((error) => {
          console.error(`Error buying package ${packageId}:`, error);
        });
      });
    }).catch((error) => {
      console.error('Error uploading image:', error);
    });
  };

  return (
    <div>
      <h2>Buy Packages</h2>
      <input type="file" id="image-input" />
      <ul>
        {Object.keys(packages).map((packageId) => (
          <li key={packageId}>
            <h3>{packages[packageId].name}</h3>
            <p>Type: {packages[packageId].type}</p>
            <p>Number of Sections: {packages[packageId].numberOfSection}</p>
            <p>Effective Period: {packages[packageId].effectivePeriod}</p>
            <button onClick={() => handleBuyPackage(packageId)}>Buy</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PackageBuyPage;