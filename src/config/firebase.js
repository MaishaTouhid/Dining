import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC6U0ZyxLwOW6MZggGXriLXF4u2NTx-iGw",
  authDomain: "ru-dine.firebaseapp.com",
  projectId: "ru-dine",
  storageBucket: "ru-dine.firebasestorage.app",
  messagingSenderId: "984352980373",
  appId: "1:984352980373:web:a1e42d9b4f5bf6415eca9c",
  measurementId: "G-8TSTDWXKVB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);