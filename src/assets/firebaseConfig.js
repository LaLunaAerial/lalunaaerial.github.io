// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQL2r9vwcSwmgNv-70jnogSJGGJ2cHzSM",
  authDomain: "laluna-website.firebaseapp.com",
  databaseURL: "https://laluna-website-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "laluna-website",
  storageBucket: "laluna-website.firebasestorage.app",
  messagingSenderId: "1010305782926",
  appId: "1:1010305782926:web:a3abc05b2d8f3ec89865df",
  measurementId: "G-5H6J69TD7N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth=getAuth(app);
export {auth};