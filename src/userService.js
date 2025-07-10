// userService.js
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./Firebase.jsx";

// 사용자 정보 저장
export const saveUserData = async (uid, userData) => {
    try {
        await setDoc(doc(db, "users", uid), userData);
        return { success: true };
    } catch (error) {
        console.error("Error saving user data:", error);
        return { success: false, error: error.message };
    }
};

// 사용자 정보 가져오기
export const getUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        } else {
            return { success: false, error: "User not found" };
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        return { success: false, error: error.message };
    }
};

// 사용자 정보 업데이트
export const updateUserData = async (uid, updateData) => {
    try {
        await updateDoc(doc(db, "users", uid), updateData);
        return { success: true };
    } catch (error) {
        console.error("Error updating user data:", error);
        return { success: false, error: error.message };
    }
};

// BMI 계산 함수
export const calculateBMI = (weight, height) => {
    if (!weight || !height || height === 0) return "알수 없음";
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
};