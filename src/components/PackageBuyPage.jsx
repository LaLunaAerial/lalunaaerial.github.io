// PackageBuyPage.js
import React, { useState, useEffect } from 'react';
import { set, get, getDatabase, ref } from 'firebase/database';
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

const handleBuyPackage = (packageId) => {
  const userName = auth.currentUser.displayName;
  const packageRef = ref(getDatabase(), `userPackages/${userName}/${packageId}`);
  const packageData = {
    packageName: packages[packageId].name,
    packageType: packages[packageId].type,
    numberOfSections: packages[packageId].numberOfSection,
    expiryDate: new Date(Date.now() + packages[packageId].effectivePeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remainingQuota: packages[packageId].numberOfSection,
    status: 'pending',
  };
  set(packageRef, packageData).then(() => {
    console.log(`Package ${packageId} bought successfully!`);
    alert(`You have successfully bought the ${packages[packageId].name} package!`);
  }).catch((error) => {
    console.error(`Error buying package ${packageId}:`, error);
  });
};

   return (
    <div>
      <h2>Buy Packages</h2>
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