// PackageBuyPage.js
import React, { useState, useEffect } from 'react';
import { get, getDatabase, ref } from 'firebase/database';

const PackageBuyPage = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const packagesRef = ref(db, 'packages');
    get(packagesRef).then((snapshot) => {
      const packagesData = snapshot.val();
      setPackages(packagesData);
    });
  }, []);

  const handleBuyPackage = (packageId) => {
    // Handle payment processing and update user account information
    // ...
    console.log(`Package ${packageId} purchased!`);
    setSelectedPackage(packageId);
  };

  return (
    <div>
      <h2>Buy Packages</h2>
      <ul>
        {packages.map((packageItem) => (
          <li key={packageItem.id}>
            <h3>{packageItem.name}</h3>
            <p>{packageItem.description}</p>
            <p>Price: {packageItem.price}</p>
            <button onClick={() => handleBuyPackage(packageItem.id)}>Buy</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PackageBuyPage;