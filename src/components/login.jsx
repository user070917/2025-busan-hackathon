import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Heart } from "lucide-react";
import { useState } from "react";
import { auth, db } from "./Firebase.jsx";

const LoginPage = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        weight: "",
        height: "",
        age: "",
        gender: "",
        diseases: [],
        activityLevel: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDiseaseChange = (disease) => {
        setFormData((prev) => {
            let updatedDiseases = [...prev.diseases];

            if (disease === "없음") {
                updatedDiseases = updatedDiseases.includes("없음") ? [] : ["없음"];
            } else {
                updatedDiseases = updatedDiseases.includes(disease)
                    ? updatedDiseases.filter((d) => d !== disease)
                    : [...updatedDiseases.filter((d) => d !== "없음"), disease];
            }

            return {
                ...prev,
                diseases: updatedDiseases,
            };
        });
    };

    const calculateBMI = (weight, height) => {
        if (!weight || !height || height === 0) return "알수 없음";
        const heightInM = height / 100;
        return (weight / (heightInM * heightInM)).toFixed(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                );

                const userData = {
                    uid: userCredential.user.uid,
                    email: formData.email,
                    name: formData.name,
                    weight: parseFloat(formData.weight) || 0,
                    height: parseFloat(formData.height) || 0,
                    age: parseInt(formData.age) || 0,
                    gender: formData.gender,
                    diseases: formData.diseases,
                    activityLevel: formData.activityLevel,
                    bmi: calculateBMI(formData.weight, formData.height),
                    createdAt: new Date().toISOString(),
                };

                await setDoc(doc(db, "users", userCredential.user.uid), userData);

                const savedUserDoc = await getDoc(doc(db, "users", userCredential.user.uid));
                if (savedUserDoc.exists()) {
                    onLogin(savedUserDoc.data());
                } else {
                    onLogin(userData);
                }

                alert("회원가입 성공!");
            } else {
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                );

                const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    onLogin(userData);
                } else {
                    const basicUserData = {
                        uid: userCredential.user.uid,
                        email: userCredential.user.email,
                        name: userCredential.user.email.split("@")[0],
                        bmi: "알수 없음",
                        weight: 0,
                        height: 0,
                        age: 0,
                        gender: "",
                        diseases: [],
                        activityLevel: "",
                        createdAt: new Date().toISOString(),
                    };

                    await setDoc(doc(db, "users", userCredential.user.uid), basicUserData);
                    onLogin(basicUserData);
                }

                alert("로그인 성공!");
            }
        } catch (e) {
            console.error("Authentication error:", e);
            let errorMessage = "오류가 발생했습니다.";

            if (e.code === "auth/email-already-in-use") {
                errorMessage = "이미 사용 중인 이메일입니다.";
            } else if (e.code === "auth/weak-password") {
                errorMessage = "비밀번호는 6자리 이상이어야 합니다.";
            } else if (e.code === "auth/user-not-found") {
                errorMessage = "존재하지 않는 계정입니다.";
            } else if (e.code === "auth/wrong-password") {
                errorMessage = "비밀번호가 틀렸습니다.";
            } else if (e.code === "auth/invalid-email") {
                errorMessage = "유효하지 않은 이메일 형식입니다.";
            } else if (e.code === "permission-denied") {
                errorMessage = "데이터베이스 접근 권한이 없습니다.";
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-red-500 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">헬스케어 매니저</h1>
                    </div>
                    <p className="text-gray-600">
                        {isRegistering ? "건강한 삶의 시작" : "건강 관리의 파트너"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="이메일"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {isRegistering && (
                        <>
                            <div>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="이름"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    name="weight"
                                    placeholder="체중(kg)"
                                    value={formData.weight}
                                    onChange={handleInputChange}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    min="1"
                                    max="500"
                                    step="0.1"
                                />
                                <input
                                    type="number"
                                    name="height"
                                    placeholder="신장(cm)"
                                    value={formData.height}
                                    onChange={handleInputChange}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    min="100"
                                    max="250"
                                    step="1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="나이"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    min="1"
                                    max="120"
                                    step="1"
                                />
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">성별</option>
                                    <option value="male">남성</option>
                                    <option value="female">여성</option>
                                </select>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    기존 질환 (해당사항 선택)
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        "당뇨병",
                                        "고혈압",
                                        "심장병",
                                        "관절염",
                                        "신장질환",
                                        "통풍",
                                        "골다골증",
                                        "기타",
                                        "없음",
                                    ].map((disease) => (
                                        <label key={disease} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.diseases.includes(disease)}
                                                onChange={() => handleDiseaseChange(disease)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm">{disease}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <select
                                    name="activityLevel"
                                    value={formData.activityLevel}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">활동 수준</option>
                                    <option value="low">낮음 (주로 앉아서 생활)</option>
                                    <option value="moderate">보통 (가벼운 운동)</option>
                                    <option value="high">높음 (규칙적인 운동)</option>
                                </select>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 font-semibold disabled:opacity-50"
                    >
                        {isLoading ? "처리 중..." : isRegistering ? "회원가입" : "로그인"}
                    </button>

                    {error && <p className="text-red-500 mt-2 text-center text-sm">{error}</p>}
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => {
                            setError("");
                            setIsRegistering(!isRegistering);
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                        {isRegistering
                            ? "이미 계정이 있으신가요? 로그인"
                            : "계정이 없으신가요? 회원가입"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
