import { Activity, Bot, Clock, Info, MessageCircle, Play, Send, Target, User } from 'lucide-react';
import { useState } from 'react';

const ExerciseRecommendationsPage = ({ user, setCurrentPage }) => {
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // BMI 기반 운동 추천 데이터
    const getExerciseRecommendations = (bmi) => {
        if (!bmi || bmi === 'N/A') {
            return {
                category: '정보 부족',
                exercises: [
                    {
                        name: '기본 스트레칭',
                        description: '전신 스트레칭으로 몸을 풀어보세요',
                        duration: '10-15분',
                        difficulty: '초급',
                        calories: '20-30',
                        youtubeId: 'L_xrDAtykMM',
                        instructions: [
                            '목과 어깨를 천천히 돌려주세요',
                            '팔을 위로 올려 좌우로 스트레칭',
                            '다리를 앞뒤로 뻗어 허벅지 스트레칭',
                            '허리 비틀기 동작을 부드럽게'
                        ]
                    }
                ]
            };
        }

        const bmiValue = parseFloat(bmi);

        if (bmiValue < 18.5) {
            return {
                category: '저체중 - 근육량 증가 운동',
                exercises: [
                    {
                        name: '푸시업 (무릎 대고)',
                        description: '상체 근력 강화를 위한 기초 운동',
                        duration: '15-20분',
                        difficulty: '초급',
                        calories: '80-120',
                        youtubeId: 'IODxDxX7oi4',
                        instructions: [
                            '무릎을 바닥에 대고 팔을 어깨너비로 벌리기',
                            '몸을 일직선으로 유지하며 천천히 내려가기',
                            '가슴이 바닥에 닿을 때까지 내린 후 올라오기',
                            '10회 3세트, 세트 간 1분 휴식'
                        ]
                    },
                    {
                        name: '스쿼트',
                        description: '하체 근력 강화의 기본 운동',
                        duration: '15-20분',
                        difficulty: '초급',
                        calories: '100-150',
                        youtubeId: 'YaXPRqUwItQ',
                        instructions: [
                            '발을 어깨너비로 벌리고 서기',
                            '무릎이 발끝을 넘지 않게 주의하며 앉기',
                            '허벅지가 바닥과 평행할 때까지 내려가기',
                            '15회 3세트, 세트 간 1분 휴식'
                        ]
                    },
                    {
                        name: '플랭크',
                        description: '코어 근력 강화 운동',
                        duration: '10-15분',
                        difficulty: '초급',
                        calories: '60-90',
                        youtubeId: 'pSHjTRCQxIw',
                        instructions: [
                            '팔꿈치와 발끝으로 몸을 지탱하기',
                            '머리부터 발끝까지 일직선 유지',
                            '30초 유지, 3세트 반복',
                            '세트 간 30초 휴식'
                        ]
                    }
                ]
            };
        } else if (bmiValue < 23) {
            return {
                category: '정상 체중 - 균형 운동',
                exercises: [
                    {
                        name: '버피 테스트',
                        description: '전신 근력과 심폐지구력을 기르는 복합 운동',
                        duration: '20-25분',
                        difficulty: '중급',
                        calories: '200-300',
                        youtubeId: 'qLBImHhCXSw',
                        instructions: [
                            '서있는 자세에서 스쿼트 자세로 앉기',
                            '손을 바닥에 짚고 다리를 뒤로 뻗어 플랭크 자세',
                            '푸시업 한 번 실시',
                            '다리를 다시 당겨와 점프하며 일어서기',
                            '10회 3세트, 세트 간 2분 휴식'
                        ]
                    },
                    {
                        name: '마운틴 클라이머',
                        description: '심폐지구력과 코어 근력 강화',
                        duration: '15-20분',
                        difficulty: '중급',
                        calories: '150-200',
                        youtubeId: 'kLh-uczlPLg',
                        instructions: [
                            '플랭크 자세에서 시작',
                            '한쪽 무릎을 가슴 쪽으로 당기기',
                            '빠르게 다리를 교대하며 실시',
                            '30초 실시, 30초 휴식, 5세트 반복'
                        ]
                    },
                    {
                        name: '런지',
                        description: '하체 근력과 균형감각 향상',
                        duration: '15-20분',
                        difficulty: '중급',
                        calories: '120-180',
                        youtubeId: 'QOVaHwm-Q6U',
                        instructions: [
                            '한 발을 앞으로 크게 내딛기',
                            '앞무릎은 90도, 뒷무릎은 바닥에 닿을 듯 내리기',
                            '다시 서서 다른 쪽 다리 반복',
                            '좌우 각 12회씩 3세트'
                        ]
                    }
                ]
            };
        } else if (bmiValue < 25) {
            return {
                category: '과체중 - 체중 감량 운동',
                exercises: [
                    {
                        name: '유산소 인터벌 트레이닝',
                        description: '효과적인 지방 연소를 위한 고강도 인터벌',
                        duration: '25-30분',
                        difficulty: '중급',
                        calories: '250-350',
                        youtubeId: 'ml6cT4AZdqI',
                        instructions: [
                            '30초 고강도 운동 (점핑잭, 버피 등)',
                            '30초 저강도 운동 (제자리걷기)',
                            '이를 15-20라운드 반복',
                            '운동 전후 5분씩 워밍업과 쿨다운'
                        ]
                    },
                    {
                        name: '점핑잭',
                        description: '전신 유산소 운동',
                        duration: '20분',
                        difficulty: '초중급',
                        calories: '200-280',
                        youtubeId: 'iSSAk4XCsRA',
                        instructions: [
                            '발을 모으고 팔을 옆에 두고 서기',
                            '점프하며 다리를 벌리고 팔을 머리 위로',
                            '다시 점프하며 원위치로 돌아가기',
                            '1분 실시, 30초 휴식, 10세트'
                        ]
                    },
                    {
                        name: '계단 오르기',
                        description: '일상에서 쉽게 할 수 있는 유산소 운동',
                        duration: '20-30분',
                        difficulty: '초중급',
                        calories: '180-250',
                        youtubeId: 'tkG1RgixTMU',
                        instructions: [
                            '일정한 속도로 계단 오르내리기',
                            '2계단씩 올라가며 강도 조절',
                            '10분 연속 후 2분 휴식',
                            '총 3세트 반복'
                        ]
                    }
                ]
            };
        } else {
            return {
                category: '비만 - 저강도 시작 운동',
                exercises: [
                    {
                        name: '걷기 운동',
                        description: '관절에 무리가 적은 기본 유산소 운동',
                        duration: '30-45분',
                        difficulty: '초급',
                        calories: '150-220',
                        youtubeId: 'RBxgDQqo9Po',
                        instructions: [
                            '편안한 속도로 시작하여 점차 속도 증가',
                            '10분 걷기 후 2분 휴식',
                            '총 30-45분 지속',
                            '주 5회 이상 실시 권장'
                        ]
                    },
                    {
                        name: '의자 운동',
                        description: '앉아서 할 수 있는 안전한 운동',
                        duration: '20-25분',
                        difficulty: '초급',
                        calories: '80-120',
                        youtubeId: 'sTANio_2E0Q',
                        instructions: [
                            '의자에 앉아 팔 돌리기 20회',
                            '앉은 상태에서 다리 들어올리기 15회',
                            '어깨 으쓱하기 20회',
                            '목 좌우 돌리기 10회씩'
                        ]
                    },
                    {
                        name: '수중 걷기',
                        description: '관절 부담을 줄인 물속 운동',
                        duration: '30-40분',
                        difficulty: '초급',
                        calories: '200-300',
                        youtubeId: 'F1DbIjzfBEI',
                        instructions: [
                            '허리 깊이 물에서 천천히 걷기',
                            '팔을 크게 흔들며 걷기',
                            '앞으로, 뒤로, 옆으로 다양하게',
                            '물의 저항을 이용한 동작'
                        ]
                    }
                ]
            };
        }
    };

    const exerciseData = getExerciseRecommendations(user?.bmi);

    // OpenAI GPT API 호출 함수
    const callGPTAPI = async (question) => {
        try {
            const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
            // 실제 OpenAI API 호출 코드
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo', // 또는 'gpt-4'
                    messages: [
                        {
                            role: 'system',
                            content: `당신은 전문적인 운동 트레이너입니다. 사용자의 BMI가 ${user?.bmi}이고, 운동에 관한 질문에 대해 안전하고 실용적인 조언을 제공해주세요. 답변은 한국어로 친근하고 이해하기 쉽게 작성해주세요.`
                        },
                        {
                            role: 'user',
                            content: question
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('GPT API 호출 중 오류:', error);

            // 데모용 응답 (실제 API 호출이 실패했을 때)
            return new Promise((resolve) => {
                setTimeout(() => {
                    const responses = [
                        `BMI ${user?.bmi}를 고려할 때, 이 운동이 적합합니다. 점진적으로 강도를 높여가세요.`,
                        '운동 전 충분한 워밍업과 운동 후 스트레칭을 잊지 마세요.',
                        '일주일에 3-4회 정도 꾸준히 하시는 것이 중요합니다.',
                        '운동 중 무릎이나 허리에 통증이 있다면 즉시 중단하고 전문가와 상담하세요.',
                        '개인의 체력 수준에 맞춰 운동 강도를 조절하시기 바랍니다.'
                    ];
                    resolve(responses[Math.floor(Math.random() * responses.length)]);
                }, 1000);
            });
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMessage = newMessage;
        setNewMessage('');
        setChatMessages(prev => [...prev, { type: 'user', content: userMessage, timestamp: new Date() }]);
        setIsLoading(true);

        try {
            const response = await callGPTAPI(userMessage);
            setChatMessages(prev => [...prev, { type: 'bot', content: response, timestamp: new Date() }]);
        } catch (error) {
            setChatMessages(prev => [...prev, {
                type: 'bot',
                content: '죄송합니다. 현재 AI 서비스에 연결할 수 없습니다. 나중에 다시 시도해주세요.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex items-center mb-6">
                <Activity className="w-8 h-8 text-green-500 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">맞춤 운동 추천</h2>
                    <p className="text-gray-600">당신의 BMI({user?.bmi || 'N/A'})에 최적화된 운동을 추천해드립니다.</p>
                </div>
            </div>

            {/* BMI 기반 카테고리 표시 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{exerciseData.category}</h3>
                <p className="text-sm text-gray-600">
                    현재 BMI 상태에 맞는 {exerciseData.exercises.length}가지 운동을 추천합니다.
                </p>
            </div>

            {/* 운동 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {exerciseData.exercises.map((exercise, index) => (
                    <div
                        key={index}
                        className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedExercise(exercise)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">{exercise.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${exercise.difficulty === '초급' ? 'bg-green-100 text-green-800' :
                                exercise.difficulty === '중급' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {exercise.difficulty}
                            </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">{exercise.description}</p>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center text-gray-500">
                                    <Clock className="w-4 h-4 mr-1" />
                                    시간
                                </span>
                                <span className="font-medium">{exercise.duration}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center text-gray-500">
                                    <Target className="w-4 h-4 mr-1" />
                                    칼로리
                                </span>
                                <span className="font-medium">{exercise.calories}kcal</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                            <button className="flex items-center text-red-500 hover:text-red-700 text-sm font-medium">
                                <Play className="w-4 h-4 mr-1" />
                                YouTube 보기
                            </button>
                            <button className="flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium">
                                <Info className="w-4 h-4 mr-1" />
                                자세히 보기
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 상세 운동 정보 모달 */}
            {selectedExercise && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">{selectedExercise.name}</h3>
                                <button
                                    onClick={() => setSelectedExercise(null)}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </div>

                            {/* YouTube 영상 */}
                            <div className="mb-6">
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${selectedExercise.youtubeId}`}
                                        title={selectedExercise.name}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>

                            {/* 운동 설명 */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-3">운동 방법</h4>
                                <ol className="space-y-2">
                                    {selectedExercise.instructions.map((instruction, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-700">{instruction}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* 운동 정보 */}
                            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">소요시간</p>
                                    <p className="font-semibold">{selectedExercise.duration}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">난이도</p>
                                    <p className="font-semibold">{selectedExercise.difficulty}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">칼로리</p>
                                    <p className="font-semibold">{selectedExercise.calories}kcal</p>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setSelectedExercise(null)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
                                >
                                    닫기
                                </button>
                                <button
                                    onClick={() => {
                                        setShowChat(true);
                                        setSelectedExercise(null);
                                    }}
                                    className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-medium flex items-center justify-center"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    질문하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI 채팅 섹션 */}
            <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">운동 상담 AI</h3>
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {showChat ? '채팅 숨기기' : '질문하기'}
                    </button>
                </div>

                {showChat && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        {/* 채팅 메시지 */}
                        <div className="h-64 overflow-y-auto mb-4 space-y-3">
                            {chatMessages.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>운동에 대한 질문이 있으시면 언제든 물어보세요!</p>
                                    <p className="text-sm mt-1">예: "이 운동을 매일 해도 될까요?", "무릎이 아픈데 대체 운동이 있나요?"</p>
                                </div>
                            ) : (
                                chatMessages.map((message, index) => (
                                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex items-start max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user' ? 'bg-blue-500 ml-2' : 'bg-green-500 mr-2'
                                                }`}>
                                                {message.type === 'user' ? (
                                                    <User className="w-4 h-4 text-white" />
                                                ) : (
                                                    <Bot className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                            <div className={`rounded-lg p-3 ${message.type === 'user'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-gray-800 border'
                                                }`}>
                                                <p className="text-sm">{message.content}</p>
                                                <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                                    }`}>
                                                    {message.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-2">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 채팅 입력 */}
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="운동에 대한 질문을 입력하세요..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || isLoading}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 대시보드로 돌아가기 버튼 */}
            <div className="mt-6 pt-6 border-t">
                <button
                    onClick={() => setCurrentPage('main')}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium"
                >
                    대시보드로 돌아가기
                </button>
            </div>
        </div>
    );
};

export default ExerciseRecommendationsPage;