import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCNjav-LyjYVadHOpJd72E3sxn0VVRKsrk",
  authDomain: "huskthreads1.firebaseapp.com",
  projectId: "huskthreads1",
  storageBucket: "huskthreads1.firebasestorage.app",
  messagingSenderId: "362237659247",
  appId: "1:362237659247:web:9937d673bf7f79974ca59a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
