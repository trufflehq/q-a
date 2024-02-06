import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "AUTH_DOMAIN",
  projectId: "PROJECT_ID",
  storageBucket: "STORAGE_BUCKET",
  messagingSenderId: "MESSAGE_SENDER_ID",
  appId: "APP_ID",
};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
// connectFirestoreEmulator(db, "127.0.0.1", 8080);

export const auth = getAuth(app);
// connectAuthEmulator(auth, "http://localhost:9099");

export const functions = getFunctions(app);
// connectFunctionsEmulator(functions, "localhost", 5001);
