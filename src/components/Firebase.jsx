// Firebase.jsx
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 설정 - 본인의 Firebase 프로젝트 설정으로 교체하세요
const firebaseConfig = {
    apiKey: "AIzaSyAEHQhRpDVscd0oJHBSrGMRVkmOC9VY-5o",
    authDomain: "health-app-24924.firebaseapp.com",
    projectId: "health-app-24924",
    storageBucket: "health-app-24924.firebasestorage.app",
    messagingSenderId: "960704323428",
    appId: "1:960704323428:web:399ef1e2ecf518736e6471",
    measurementId: "G-5R7WEWK7NV"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Auth 초기화
const auth = getAuth(app);

// Firestore 초기화
const db = getFirestore(app);

export { auth, db };
