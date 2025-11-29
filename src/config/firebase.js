import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCuhOf2moOETuEPbOamxNPWuoKYtW2RHv0",
  authDomain: "mealsection-b4963.firebaseapp.com",
  projectId: "mealsection-b4963",
  storageBucket: "mealsection-b4963.firebasestorage.app",
  messagingSenderId: "744735761594",
  appId: "1:744735761594:web:3016d14fc42193385fce83",
  measurementId: "G-Q1J5Z3BVBK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Messaging
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
