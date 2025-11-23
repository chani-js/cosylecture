// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 👉 Mets bien tes vraies infos ici (celles de ta console Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyA_HVuR8jWI1_U7-m2hokJd66EWfIztBn8",
  authDomain: "coin-lecture-akiah.firebaseapp.com",
  projectId: "coin-lecture-akiah",
  storageBucket: "coin-lecture-akiah.firebasestorage.app",
  messagingSenderId: "229994097820",
  appId: "1:229994097820:web:95202fc2c328396c659159",
  measurementId: "G-3VNZGV6V76"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
