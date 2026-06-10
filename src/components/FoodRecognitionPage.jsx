import { doc, getDoc } from 'firebase/firestore';
import { AlertTriangle, Camera, CheckCircle, User, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth, db } from './Firebase.jsx';

const FoodRecognitionPage = ({ setCurrentPage, addToHistory }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [recognitionResult, setRecognitionResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [userConditions, setUserConditions] = useState([]);
    const [userData, setUserData] = useState(null);
    const [safetyAnalysis, setSafetyAnalysis] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');

    // Firebase에서 사용자 기저질환 정보 가져오기
    useEffect(() => {
        fetchUserConditions();
    }, []);

    const fetchUserConditions = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                setError('사용자 정보를 찾을 수 없습니다.');
                return;
            }

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData(data);

                const conditions = data.diseases?.map(disease => ({
                    id: disease,
                    name: disease,
                    severity: 'moderate'
                })) || [];

                setUserConditions(conditions);
            } else {
                setError('사용자 데이터를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('사용자 조건 가져오기 실패:', error);
            setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('파일 크기가 5MB를 초과합니다.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('이미지 파일만 업로드 가능합니다.');
                return;
            }

            setSelectedFile(file);
            setRecognitionResult(null);
            setSafetyAnalysis(null);
            setError('');

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeSupplementsWithGPT = async () => {
        if (!selectedFile) {
            setError('분석할 이미지를 선택해주세요.');
            return;
        }
        if (!userData || userConditions.length === 0) {
            setError('사용자 건강 정보(기저질환)를 불러올 수 없습니다. 다시 로그인하거나 정보를 확인해주세요.');
            return;
        }

        setIsAnalyzing(true);
        setError('');

        try {
            // 1. 이미지를 base64로 변환
            const base64Image = await convertToBase64(selectedFile);

            // 2. ChatGPT Vision API 호출 (영양제 정보 추출)
            const gptRecognitionResponse = await callChatGPTVision(base64Image);
            console.log("GPT Recognition Response:", gptRecognitionResponse);

            if (!gptRecognitionResponse || !gptRecognitionResponse.supplements || gptRecognitionResponse.supplements.length === 0) {
                setError('이미지에서 영양제 정보를 인식할 수 없습니다. 더 선명한 사진을 사용하거나 다른 각도로 시도해보세요.');
                setIsAnalyzing(false);
                return;
            }

            setRecognitionResult(gptRecognitionResponse);

            // 3. 사용자 기저질환과 영양제 정보를 GPT에 보내 안전성 분석 요청
            const safetyResult = await analyzeSafetyWithGPT(
                gptRecognitionResponse.supplements,
                userConditions,
                userData
            );
            console.log("GPT Safety Analysis Result:", safetyResult);
            setSafetyAnalysis(safetyResult);

            // 히스토리에 추가
            // 여기서 imagePreviewData 필드를 추가하여 Base64 이미지 데이터를 함께 저장합니다.
            addToHistory({
                date: new Date().toISOString(),
                supplements: gptRecognitionResponse.supplements,
                totalNutrients: gptRecognitionResponse.totalNutrients,
                imageName: selectedFile.name,
                imagePreviewData: imagePreview, // 추가된 부분
                safetyAnalysis: safetyResult
            });

        } catch (error) {
            console.error('분석 중 오류:', error);
            setError(`분석 중 오류가 발생했습니다: ${error.message}. 다시 시도해주세요.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64Data = reader.result.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = error => reject(error);
        });
    };

    // --- GPT Vision API 호출 (영양제 정보 추출) ---
    const callChatGPTVision = async (base64Image) => {
        const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

        if (!OPENAI_API_KEY) {
            throw new Error('OpenAI API 키가 설정되지 않았습니다.');
        }

        console.log('GPT Vision API 호출 시작 (영양제 정보 추출)...');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `이 이미지에서 영양제/건강기능식품의 성분을 분석해주세요.
                                다음 JSON 형식으로 정확히 응답해주세요:
                                {
                                    "supplements": [
                                        {
                                            "name": "제품명",
                                            "ingredients": ["성분1 함량", "성분2 함량"],
                                            "brand": "브랜드명",
                                            "warnings": ["주의사항1", "주의사항2"]
                                        }
                                    ],
                                    "totalNutrients": {
                                        "비타민A": "함량",
                                        "비타민C": "함량"
                                    }
                                }

                                주의사항:
                                - 반드시 위 JSON 형식으로만 응답하세요
                                - 다른 설명이나 텍스트는 추가하지 마세요
                                - 제품명, 브랜드, 성분과 함량을 정확하게 읽어주세요
                                - 이미지에서 읽을 수 없는 부분은 "정보 없음"으로 표시하세요`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000,
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI Vision API 에러:', errorText);
            throw new Error(`OpenAI Vision API 호출 실패: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsedResult = JSON.parse(jsonMatch[0]);
                return parsedResult;
            } else {
                throw new Error('JSON 형식의 응답을 찾을 수 없습니다.');
            }
        } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            console.error('원본 응답:', content);
            throw new Error('응답을 파싱할 수 없습니다: ' + parseError.message);
        }
    };

    // --- GPT에 안전성 분석 요청 (새로운 함수) ---
    const analyzeSafetyWithGPT = async (supplements, conditions, userData) => {
        const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

        if (!OPENAI_API_KEY) {
            throw new Error('OpenAI API 키가 설정되지 않았습니다.');
        }

        console.log('GPT API 호출 시작 (안전성 분석)...');

        const prompt = `
            다음은 사용자가 섭취하려는 영양제/건강기능식품 정보입니다:
            ${JSON.stringify(supplements, null, 2)}

            다음은 사용자의 건강 정보입니다:
            - 나이: ${userData?.age || '정보 없음'}세
            - 성별: ${userData?.gender === 'male' ? '남성' : userData?.gender === 'female' ? '여성' : '정보 없음'}
            - BMI: ${userData?.bmi || '정보 없음'}
            - 활동량: ${userData?.activityLevel || '정보 없음'}
            - 기저질환: ${conditions.length > 0 ? conditions.map(c => c.name).join(', ') : '없음'}

           [응답 형식 관련 지침]

- 반드시 응답은 JSON 배열 형식으로만 작성하세요. JSON 외의 다른 설명이나 텍스트는 절대 포함하지 마세요.

- 각 영양제별로 하나의 JSON 객체를 생성해야 하며, 다음 필드를 포함해야 합니다:
  - "supplementName": 영양제 제품명
  - "overallSafety": "safe" | "caution" | "danger" 중 하나
  - "risks": 주의사항 배열 (없으면 빈 배열)
  - "benefits": 기대 효과 배열 (없으면 빈 배열)
  - "recommendation":
    - "안전하게 복용 가능합니다."
    - "의사와 상담 후 복용을 권장합니다."
    - "복용을 피하고 반드시 의사와 상담하세요."
    - "전문가와 상담을 권장합니다."

------------------------------------------------------------

[overallSafety 판단 기준]

■ 'safe': 일반적인 조건에서 안전하게 섭취 가능함
- 보충 수준의 비타민, 미네랄 등 일반적으로 건강한 사람에게 안전
- 대사증후군 환자에게도 해가 없거나 오히려 도움이 되는 성분 포함
- 예: 마그네슘, 비타민 B군, 오메가-3(EPA+DHA 저용량), 유산균 등

■ 'caution': 대부분의 경우 안전하지만, 아래 조건 중 하나라도 해당되면 주의 필요
- 고용량 섭취 시 부작용 가능성
- 특정 연령대(소아, 고령자), 임신·수유 중 안전성 검증 부족
- 특정 기저질환(예: 대사증후군, 당뇨, 고혈압 등)과 경미한 상호작용 가능성
- 복용 중인 약물과의 상호작용 가능성은 낮지만 존재할 수 있음
> ⚠️ 예: 고용량 비타민 E, 고용량 식이섬유, 크롬, 일부 항산화물질

■ 'danger': 아래 조건 중 하나라도 해당되면 반드시 위험으로 분류
- 성분이 특정 질환(특히 대사증후군)과 **명확히 상호작용**하거나 **악화**시킬 수 있는 경우
- 당뇨병이 있는데 홍삼을 복용하는 경우
- 고혈압이 있는데 나트륨 성분을 복용하는 경우
- 약물과 중대한 상호작용이 있거나 심각한 부작용 위험
- 생명 위협이나 간·신장 손상, 심혈관계 문제 등을 유발할 가능성이 있는 경우
> 🚨 예: 고혈압 환자에게 인삼·카페인, 신장질환 환자에게 고칼륨 보충제, 트랜스지방 포함 제품 등

------------------------------------------------------------

[대사증후군 환자 대상 추가 고려 사항]

※ 대사증후군 관련 성분 기준:

- ❌ danger로 분류할 성분 예시:
  - 나트륨(소금), 트랜스지방, 단순당(포도당, 말토덱스트린 등)
  - 고용량 카페인, 인삼, 오메가-6, 고지방
  - 혈당 지수를 급격히 올리는 탄수화물류

- ⚠️ caution으로 분류할 성분 예시:
  - 식이섬유 (과다 섭취 시 복부 팽만)
  - 크롬, 코엔자임Q10 (개인차 존재)
  - 고용량 비타민 D 또는 비타민 E

- ✅ safe로 분류할 성분 예시:
  - 비타민 B군, 마그네슘, 저용량 오메가-3, 유산균, 항산화 식물 성분

------------------------------------------------------------

[risks 필드 작성 예시]

- 고용량 섭취 시 간 기능 이상 가능성
- 고혈압 환자에게 혈압 상승 유발
- 당뇨 환자에게 혈당 상승 가능성
- 약물(혈압약, 인슐린 등)과의 상호작용 가능성
- 전문가와 상담을 권장합니다.

[benefits 필드 작성 예시]

- 에너지 대사 개선
- 혈중 중성지방 감소 가능성
- 면역력 강화
- 항산화 작용

[recommendation 필드 결정 기준]

- safe → "안전하게 복용 가능합니다."
- caution → "의사와 상담 후 복용을 권장합니다." 또는 "전문가와 상담을 권장합니다."
- danger → "복용을 피하고 반드시 의사와 상담하세요."


        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o', // 텍스트 기반 분석이므로 gpt-4o 사용
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1500, // 더 많은 토큰 허용
                temperature: 0.2 // 일관성 있는 분석을 위해 낮은 온도 유지
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI Safety Analysis API 에러:', errorText);
            throw new Error(`OpenAI Safety Analysis API 호출 실패: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        try {
            // GPT가 JSON 외 다른 설명을 추가할 수 있으므로, JSON 부분만 추출
            const jsonMatch = content.match(/\[[\s\S]*\]/); // 배열 형태의 JSON을 찾음
            if (jsonMatch) {
                const parsedResult = JSON.parse(jsonMatch[0]);
                // 결과가 배열인지 확인하고, 각 항목이 필요한 키를 가지고 있는지 간단히 검증
                if (Array.isArray(parsedResult) && parsedResult.every(item => item.supplementName && item.overallSafety)) {
                    return parsedResult;
                } else {
                    throw new Error('GPT 응답이 예상된 JSON 배열 형식이 아닙니다.');
                }
            } else {
                throw new Error('GPT 응답에서 JSON 배열을 찾을 수 없습니다.');
            }
        } catch (parseError) {
            console.error('JSON 파싱 오류 (안전성 분석):', parseError);
            console.error('원본 응답 (안전성 분석):', content);
            throw new Error('안전성 분석 응답을 파싱할 수 없습니다: ' + parseError.message);
        }
    };


    const getSafetyIcon = (safety) => {
        switch (safety) {
            case 'safe':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'caution':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'danger':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <CheckCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getSafetyColor = (safety) => {
        switch (safety) {
            case 'safe':
                return 'bg-green-50 border-green-200';
            case 'caution':
                return 'bg-yellow-50 border-yellow-200';
            case 'danger':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Camera className="w-8 h-8 text-blue-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">AI 영양제 안전성 분석</h2>
            </div>

            {/* 에러 메시지 표시 */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* 사용자 기저질환 정보 표시 */}
            {userData && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                        <User className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="font-medium text-blue-800">사용자 건강 정보</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-sm text-blue-700">
                            <span className="font-medium">나이:</span> {userData.age}세
                        </div>
                        <div className="text-sm text-blue-700">
                            <span className="font-medium">성별:</span> {userData.gender === 'male' ? '남성' : '여성'}
                        </div>
                        <div className="text-sm text-blue-700">
                            <span className="font-medium">BMI:</span> {userData.bmi}
                        </div>
                        <div className="text-sm text-blue-700">
                            <span className="font-medium">활동량:</span> {userData.activityLevel}
                        </div>
                    </div>
                    <div>
                        <span className="font-medium text-blue-800">등록된 기저질환:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {userConditions.length > 0 ? (
                                userConditions.map((condition) => (
                                    <span key={condition.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        {condition.name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-blue-600 text-sm">등록된 기저질환이 없습니다.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">영양제 사진을 업로드하세요</p>
                        <p className="text-sm text-gray-500">JPG, PNG 파일을 지원합니다 (최대 5MB)</p>
                    </label>
                </div>

                {/* 이미지 미리보기 */}
                {imagePreview && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">업로드된 이미지:</p>
                        <img src={imagePreview} alt="업로드된 영양제" className="max-w-xs mx-auto rounded-lg shadow-sm" />
                        <p className="font-medium mt-2 text-center">{selectedFile?.name}</p>
                        <button
                            onClick={analyzeSupplementsWithGPT}
                            disabled={isAnalyzing || !userData || userConditions.length === 0}
                            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 w-full"
                        >
                            {isAnalyzing ? 'AI 분석 중...' : 'AI로 영양제 분석하기'}
                        </button>
                        {(!userData || userConditions.length === 0) && (
                            <p className="text-red-500 text-xs mt-2 text-center">
                                정확한 분석을 위해 사용자 건강 정보(특히 기저질환)를 설정해주세요.
                            </p>
                        )}
                    </div>
                )}

                {/* 분석 결과 */}
                {recognitionResult && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">분석 결과</h3>

                        {/* 인식된 영양제 정보 */}
                        <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-medium text-green-800 mb-3">인식된 영양제</h4>
                            <div className="space-y-3">
                                {recognitionResult.supplements.map((supplement, index) => (
                                    <div key={index} className="bg-white p-3 rounded border">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium">{supplement.name}</span>
                                            <span className="text-sm text-green-600">신뢰도: {supplement.confidence}%</span>
                                        </div>
                                        <p className="text-sm text-gray-600">브랜드: {supplement.brand}</p>
                                        <div className="mt-2">
                                            <p className="text-sm font-medium text-gray-700">주요 성분:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {supplement.ingredients.map((ingredient, i) => (
                                                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {ingredient}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 안전성 분석 결과 */}
                        {safetyAnalysis && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-800">개인 맞춤 안전성 분석</h4>
                                {safetyAnalysis.map((analysis, index) => (
                                    <div key={index} className={`p-4 rounded-lg border ${getSafetyColor(analysis.overallSafety)}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h5 className="font-medium text-gray-800">{analysis.supplementName}</h5>
                                            <div className="flex items-center gap-2">
                                                {getSafetyIcon(analysis.overallSafety)}
                                                <span className="text-sm font-medium">
                                                    {analysis.overallSafety === 'safe' ? '안전' :
                                                        analysis.overallSafety === 'caution' ? '주의' : '위험'}
                                                </span>
                                            </div>
                                        </div>

                                        {analysis.benefits.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-sm font-medium text-green-700 mb-1">예상 효과:</p>
                                                <ul className="text-sm text-green-600 space-y-1">
                                                    {analysis.benefits.map((benefit, i) => (
                                                        <li key={i}>• {benefit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {analysis.risks.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-sm font-medium text-red-700 mb-1">주의사항:</p>
                                                <ul className="text-sm text-red-600 space-y-1">
                                                    {analysis.risks.map((risk, i) => (
                                                        <li key={i}>• {risk}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-gray-200">
                                            <p className="text-sm font-medium text-gray-700">권장사항:</p>
                                            <p className="text-sm text-gray-600">{analysis.recommendation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-6 flex gap-3">
                <button
                    onClick={() => setCurrentPage('main')}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                    대시보드로 돌아가기
                </button>
                {recognitionResult && (
                    <button
                        onClick={() => {
                            setSelectedFile(null);
                            setRecognitionResult(null);
                            setSafetyAnalysis(null);
                            setImagePreview(null);
                            setError('');
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        새 분석 시작
                    </button>
                )}
            </div>
        </div>
    );
};

export default FoodRecognitionPage;