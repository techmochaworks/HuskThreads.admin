import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCGBDh2B1DE-ENrUEjJQCRWlHf0PPVLenY",
  authDomain: "huskthreadss.firebaseapp.com",
  projectId: "huskthreadss",
  storageBucket: "huskthreadss.firebasestorage.app",
  messagingSenderId: "226432782763",
  appId: "1:226432782763:web:41a3612db6f857e5a5c2ee"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
