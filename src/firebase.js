import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// TODO: Replace with your own Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDsbxKC85XqxSbN3hqasJrT_sJhlHKMWTQ",
    authDomain: "aws-tracker.firebaseapp.com",
    projectId: "aws-tracker",
    storageBucket: "aws-tracker.firebasestorage.app",
    messagingSenderId: "847067858142",
    appId: "1:847067858142:web:5f03cb71725ce2b0abee4f",
    measurementId: "G-P2820BRZVV"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);