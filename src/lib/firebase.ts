
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFOgYn1PTwllKwRj0fW0c3PD4Er3PEh7U",
  authDomain: "ghrokrealtime.firebaseapp.com",
  databaseURL: "https://ghrokrealtime-default-rtdb.firebaseio.com",
  projectId: "ghrokrealtime",
  storageBucket: "ghrokrealtime.appspot.com",
  messagingSenderId: "536925599617",
  appId: "1:536925599617:web:55a189d7bb29c3ddf71a80",
  measurementId: "G-X2G01WD4PB"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
