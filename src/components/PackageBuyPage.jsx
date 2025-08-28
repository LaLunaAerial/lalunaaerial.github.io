import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../assets/firebaseConfig';

const PackageBuyPage = () => {
  const [packages, setPackages] = useState({});
  const [packageCart, setPackageCart] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const packagesRef = ref(db, 'packages');
    get(packagesRef).then((snapshot) => {
      const packagesData = snapshot.val();
      console.log("Package Data: "+JSON.stringify(packagesData));
      setPackages(packagesData);
    });
  }, []);

  useEffect(()=>{
    const packageCartData = localStorage.getItem('packageCart');
    console.log('Package cart data:', packageCartData);
    if (packageCartData) {
      setPackageCart(JSON.parse(packageCartData));
    }
    console.log("PackageCart: "+packageCartData)
  },[])

  const handleAddToPackageCart = (packageId) => {
    const packageData = packages[packageId];
    const packageCart = localStorage.getItem('packageCart');
    if (packageCart) {
      const packageCartArray = JSON.parse(packageCart);
      packageCartArray.push(packageData);
      localStorage.setItem('packageCart', JSON.stringify(packageCartArray));
      setPackageCart(packageCartArray); // Update this line
    } else {
      localStorage.setItem('packageCart', JSON.stringify([packageData]));
      setPackageCart([packageData]); // Update this line
    }
    alert("Added the package into the Shopping Cart!");
  };

  return (
    <div>
      <h2>Buy Packages</h2>
      <ul>
        {Object.keys(packages).map((packageId) => (
          <li key={packageId}>
            <h3>{packages[packageId].name}</h3>
            <p>Type: {packages[packageId].type}</p>
            <p>Price: {packages[packageId].price}</p>
            <p>Number of Sections: {packages[packageId].numberOfSection}</p>
            <p>Effective Period: {packages[packageId].effectivePeriod}</p>
            {packageCart.some((item) => item.type === packages[packageId].type) ? (
              <button disabled style={{backgroundColor: 'grey'}}>Already added into Shopping Cart</button>
            ) : (
              <button onClick={() => handleAddToPackageCart(packageId)}>Add to Package Cart</button>
            )}
            
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PackageBuyPage;