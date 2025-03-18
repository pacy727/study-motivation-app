// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 先ほどコピーしたあなたの設定を貼り付け
const firebaseConfig = {
    apiKey: "AIzaSyB5ukZG1ptePg0rxhk0P_dqPVbG9Lnj7tQ",
    authDomain: "study-motivation-app-e561a.firebaseapp.com",
    projectId: "study-motivation-app-e561a",
    storageBucket: "study-motivation-app-e561a.firebasestorage.app",
    messagingSenderId: "944960414488",
    appId: "1:944960414488:web:2f729e6bec3cb74676346d",
    measurementId: "G-FMJCX1PMW9"
  };
  

// Firebase初期化
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// 認証とデータベースの設定
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
