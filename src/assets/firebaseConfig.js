// src/assets/firebaseConfig.js

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set,get} from 'firebase/database';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };