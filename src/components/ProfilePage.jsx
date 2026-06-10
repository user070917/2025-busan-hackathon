import { doc, updateDoc } from 'firebase/firestore';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from './Firebase.jsx';

const diseaseList = ["당뇨병", "고혈압", "심장병", "관절염", "신장질환", "통풍", "골다골증", "기타", "없음"];

const ProfilePage = ({ user, setUser, setCurrentPage }) => {
    const [editMode, setEditMode] = useState(false);

    const [editData, setEditData] = useState({
        age: user?.age || '',
        weight: user?.weight || '',
        height: user?.height || '',
        bmi: user?.bmi || '',
        diseases: user?.diseases || [],
        activityLevel: user?.activityLevel || ''
    });

    // BMI 자동 계산
    useEffect(() => {
        const weight = parseFloat(editData.weight);
        const height = parseFloat(editData.height);
        if (weight > 0 && height > 0) {
            const heightM = height / 100;
            const bmi = (weight / (heightM * heightM)).toFixed(1);
            setEditData((prev) => ({ ...prev, bmi }));
        }
    }, [editData.weight, editData.height]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDiseaseChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setEditData((prev) => ({
                ...prev,
                diseases: [...prev.diseases, value]
            }));
        } else {
            setEditData((prev) => ({
                ...prev,
                diseases: prev.diseases.filter((d) => d !== value)
            }));
        }
    };

    const handleSave = async () => {
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                age: editData.age,
                weight: editData.weight,
                height: editData.height,
                bmi: editData.bmi,
                diseases: editData.diseases,
                activityLevel: editData.activityLevel
            });

            // 화면 갱신
            setUser((prevUser) => ({
                ...prevUser,
                age: editData.age,
                weight: editData.weight,
                height: editData.height,
                bmi: editData.bmi,
                diseases: editData.diseases,
                activityLevel: editData.activityLevel
            }));

            alert('프로필이 저장되었습니다.');
            setEditMode(false);
        } catch (error) {
            console.error('프로필 저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex items-center mb-6">
                <User className="w-8 h-8 text-orange-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">프로필</h2>
            </div>
            <p className="text-gray-600 mb-4">내 정보를 확인하고 관리합니다.</p>

            <div className="space-y-4 text-gray-700">
                {/* 읽기 전용 필드 */}
                <p><strong>이름:</strong> {user?.name}</p>
                <p><strong>이메일:</strong> {user?.email}</p>
                {/* <p><strong>나이:</strong> {user?.age} 세</p> */}
                <p><strong>성별:</strong> {user?.gender === 'male' ? '남성' : user?.gender === 'female' ? '여성' : ''}</p>

                {/* 수정 가능한 필드 */}
                {editMode ? (
                    <>
                        <Input label="나이 (세)" name="age" type="number" value={editData.age} onChange={handleChange} />
                        <Input label="체중 (kg)" name="weight" type="number" value={editData.weight} onChange={handleChange} />
                        <Input label="신장 (cm)" name="height" type="number" value={editData.height} onChange={handleChange} />
                        <p><strong>BMI:</strong> {editData.bmi}</p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">기존 질환</label>
                            <div className="grid grid-cols-2 gap-2">
                                {diseaseList.map((disease) => (
                                    <label key={disease} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={disease}
                                            checked={editData.diseases.includes(disease)}
                                            onChange={handleDiseaseChange}
                                            className="mr-2"
                                        />
                                        {disease}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 활동 수준 select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">활동 수준</label>
                            <select
                                name="activityLevel"
                                value={editData.activityLevel}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            >
                                <option value="">선택하세요</option>
                                <option value="낮음">낮음</option>
                                <option value="보통">보통</option>
                                <option value="높음">높음</option>
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        <p><strong>나이:</strong> {user?.age} 세</p>
                        <p><strong>체중:</strong> {user?.weight} kg</p>
                        <p><strong>신장:</strong> {user?.height} cm</p>
                        <p><strong>BMI:</strong> {user?.bmi}</p>
                        <p><strong>기존 질환:</strong> {user?.diseases?.length > 0 ? user.diseases.join(', ') : '없음'}</p>
                        <p><strong>활동 수준:</strong> {user?.activityLevel}</p>
                    </>
                )}
            </div>

            <div className="mt-6 flex space-x-2">
                {editMode ? (
                    <>
                        <button
                            onClick={handleSave}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                            저장
                        </button>
                        <button
                            onClick={() => setEditMode(false)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                        >
                            취소
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setEditMode(true)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                    >
                        수정하기
                    </button>
                )}
                <button
                    onClick={() => setCurrentPage('main')}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                    대시보드로 돌아가기
                </button>
            </div>
        </div>
    );
};

// 공통 Input 컴포넌트
const Input = ({ label, name, value, onChange, type = 'text' }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        />
    </div>
);

export default ProfilePage;
