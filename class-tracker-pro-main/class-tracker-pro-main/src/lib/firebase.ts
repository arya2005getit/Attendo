import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDqa3NndyYxagDaZPVI4f-8p7SYnBrvKTg",
  authDomain: "attendo-9f2c0.firebaseapp.com",
  projectId: "attendo-9f2c0",
  storageBucket: "attendo-9f2c0.firebasestorage.app",
  messagingSenderId: "690694898936",
  appId: "1:690694898936:web:7b20ff4bd0d239a99ae70d",
  measurementId: "G-JT508E96B5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
