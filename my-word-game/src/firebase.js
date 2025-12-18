// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import the auth service
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7_zVdxJR6T7TmcJoyKLGwrRA4_bb1Yb4",
  authDomain: "word-game-44858.firebaseapp.com",
  projectId: "word-game-44858",
  storageBucket: "word-game-44858.firebasestorage.app",
  messagingSenderId: "426942603042",
  appId: "1:426942603042:web:14a5c310b086836b3ecf7b",
  measurementId: "G-NQCZPGDEF2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth and EXPORT it
export const auth = getAuth(app);