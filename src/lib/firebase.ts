// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBwc_lplE79ve5vpbT24i0Hg22zUgy5FIM",
  authDomain: "studio-9473877554-a7a15.firebaseapp.com",
  projectId: "studio-9473877554-a7a15",
  storageBucket: "studio-9473877554-a7a15.firebasestorage.app",
  messagingSenderId: "862074467158",
  appId: "1:862074467158:web:666704689dfd5412a09cf7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
