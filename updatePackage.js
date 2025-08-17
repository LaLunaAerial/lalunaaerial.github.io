const firebase = require('firebase/app');
const database = require('firebase/database');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAQL2r9vwcSwmgNv-70jnogSJGGJ2cHzSM",
  authDomain: "laluna-website.firebaseapp.com",
  databaseURL: "https://laluna-website-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "laluna-website",
  storageBucket: "laluna-website.firebasestorage.app",
  messagingSenderId: "1010305782926",
  appId: "1:1010305782926:web:a3abc05b2d8f3ec89865df",
  measurementId: "G-5H6J69TD7N"
});

// Get a reference to the packages node
const packagesRef = database().ref('packages');

// Update the packages data
const packagesData = {
  "package1": {
    "name": "Non-peak package",
    "type": "Non-Peak",
    "numberOfSection": 6,
    "effectiveTime": "2025-12-31"
  },
  "package2": {
    "name": "Peak package",
    "type": "Peak",
    "numberOfSection": 3,
    "effectiveTime": "2025-06-30"
  }
};

packagesRef.set(packagesData).then(() => {
  console.log('Packages data updated successfully!');
}).catch((error) => {
  console.error('Error updating packages data:', error);
});