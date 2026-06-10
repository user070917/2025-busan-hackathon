import { Camera, Clock, Heart, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import FoodRecognitionPage from './components/FoodRecognitionPage';
import ProfilePage from './components/ProfilePage';
import HistoryPage from './components/history';
import LoginPage from './components/login';

const HealthManagementApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);

  // 히스토리에 항목 추가
  const addToHistory = (item) => {
    setHistory(prev => [item, ...prev]);
  };

  // 로그인 핸들러
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('main');
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
    setUser(null);
    setHistory([]);
  };

  // 메인 페이지
  const MainPage = () => {
    const getBMICategory = (bmi) => {
      if (bmi === '알수 없음' || isNaN(bmi)) return { category: '정보 없음', color: 'text-gray-600', bg: 'bg-gray-50' };
      if (bmi < 18.5) return { category: '저체중', color: 'text-blue-600', bg: 'bg-blue-50' };
      if (bmi < 23) return { category: '정상', color: 'text-green-600', bg: 'bg-green-50' };
      if (bmi < 25) return { category: '주의 단계', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      if (bmi < 30) return { category: '위험 단계', color: 'text-orange-600', bg: 'bg-orange-50' };
      return { category: '대사증후군 고위험군', color: 'text-red-600', bg: 'bg-red-50' };
    };

    const getRecommendation = (bmi) => {
      if (bmi === '알수 없음' || isNaN(bmi)) {
        return {
          exercise: '신장과 체중을 입력하여 BMI를 계산해주세요.',
          diet: '신장과 체중을 입력하여 BMI를 계산해주세요.',
          warning: 'BMI 정보가 없어 대사증후군 위험도를 판단할 수 없습니다.'
        };
      }
      if (bmi < 18.5) {
        return {
          exercise: '기초체력 향상을 위한 가벼운 근력 운동 (밴드 운동, 걷기)',
          diet: '영양 결핍 방지를 위한 균형 잡힌 식사 필요',
          warning: '체중 증가와 함께 건강한 근육량 확보 필요'
        };
      }
      if (bmi < 23) {
        return {
          exercise: '유산소 운동과 스트레칭 병행 (조깅, 자전거, 요가)',
          diet: '염분과 당분 섭취 줄이기, 채소 섭취 늘리기',
          warning: '현재 건강 상태 유지가 중요합니다'
        };
      }
      if (bmi < 25) {
        return {
          exercise: '매일 30분 이상 유산소 운동, 간헐적 근력 운동',
          diet: '혈당 관리 식단 (복합탄수화물 위주), 트랜스지방 줄이기',
          warning: '고혈압 및 고혈당 위험 가능성 있음'
        };
      }
      if (bmi < 30) {
        return {
          exercise: '고강도 유산소 + 체중 감소용 근력 운동 (인터벌 트레이닝)',
          diet: '지중해식 식단 추천, 당·지방 섭취 제한',
          warning: '대사증후군 진입 가능성 높음, 지속적 관리 필요'
        };
      }
      return {
        exercise: '의학적 지도 아래 맞춤 운동 필요 (걷기부터 시작)',
        diet: '영양사 상담 통한 체계적인 식단 계획',
        warning: '대사증후군 고위험군, 합병증 예방을 위한 전문 관리 필수'
      };
    };

    const sidebarItems = [
      { icon: Camera, label: '영양제 인식', page: 'food-recognition' },
      { icon: Clock, label: '히스토리 검색', page: 'history' },
      { icon: User, label: '프로필', page: 'profile' }
    ];

    // 페이지 콘텐츠를 조건부로 렌더링하는 함수
    const renderPageContent = () => {
      switch (currentPage) {
        case 'main':
          const bmiInfo = user?.bmi ? getBMICategory(parseFloat(user.bmi)) : null;
          const recommendation = user?.bmi ? getRecommendation(parseFloat(user.bmi)) : null;
          return (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">대시보드</h2>
                <p className="text-gray-600">오늘도 건강한 하루를 시작해보세요!</p>
              </div>

              {/* BMI 정보 카드 */}
              {user?.bmi && bmiInfo && (
                <div className={`${bmiInfo.bg} rounded-xl p-6 mb-6 border-l-4 border-blue-500`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">현재 BMI 상태</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${bmiInfo.color} bg-white`}>
                      {bmiInfo.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-800 mb-2">BMI: {user.bmi}</p>
                      <p className="text-sm text-gray-600 mb-4">{recommendation?.warning}</p>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-gray-800">추천 운동:</p>
                        <p className="text-sm text-gray-600">{recommendation?.exercise}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">추천 식단:</p>
                        <p className="text-sm text-gray-600">{recommendation?.diet}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 최근 히스토리 요약 */}
              {history.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-6 mb-6 border-l-4 border-purple-500">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">최근 영양제 인식</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">총 인식 횟수</p>
                      <p className="text-2xl font-bold text-purple-600">{history.length}회</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">최근 인식 영양제</p>
                      <p className="text-lg font-medium text-gray-800">
                        {history[0]?.supplements.map(s => s.name).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 기능 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setCurrentPage('food-recognition')}
                >
                  <div className="flex items-center mb-4">
                    <Camera className="w-8 h-8 text-blue-500 mr-3" />
                    <h3 className="text-lg font-semibold">영양제 인식</h3>
                  </div>
                  <p className="text-gray-600 mb-4">사진으로 영양제를 인식하고 성분을 계산해보세요.</p>
                  <button className="text-blue-500 hover:text-blue-700 font-medium">시작하기 →</button>
                </div>

                <div
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setCurrentPage('history')}
                >
                  <div className="flex items-center mb-4">
                    <Clock className="w-8 h-8 text-purple-500 mr-3" />
                    <h3 className="text-lg font-semibold">히스토리</h3>
                  </div>
                  <p className="text-gray-600 mb-4">과거 인식한 영양제 기록을 확인해보세요.</p>
                  <div className="flex items-center justify-between">
                    <button className="text-purple-500 hover:text-purple-700 font-medium">보기 →</button>
                    <span className="text-sm text-gray-500">{history.length}건</span>
                  </div>
                </div>

                <div
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setCurrentPage('profile')}
                >
                  <div className="flex items-center mb-4">
                    <User className="w-8 h-8 text-orange-500 mr-3" />
                    <h3 className="text-lg font-semibold">프로필</h3>
                  </div>
                  <p className="text-gray-600 mb-4">내 정보를 확인하고 관리합니다.</p>
                  <button className="text-orange-500 hover:text-orange-700 font-medium">보기 →</button>
                </div>
              </div>
            </>
          );

        case 'food-recognition':
          return <FoodRecognitionPage user={user} setUser={setUser} setCurrentPage={setCurrentPage} addToHistory={addToHistory} />;
        case 'history':
          return <HistoryPage setCurrentPage={setCurrentPage} history={history} />;
        case 'profile':
          return <ProfilePage user={user} setUser={setUser} setCurrentPage={setCurrentPage} />;
        default:
          return null;
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 py-4 flex items-center justify-between min-w-0">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div
                className="flex items-center ml-2 lg:ml-0 min-w-0 cursor-pointer"
                onClick={() => setCurrentPage('main')}
              >
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                  헬스케어 매니저
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <span className="text-sm sm:text-base text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis hidden sm:block">
                안녕하세요, {user?.name || '사용자'}님!
              </span>
              <span className="text-sm text-gray-600 whitespace-nowrap sm:hidden">
                {user?.name || '사용자'}님
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 z-30 lg:z-0 w-64 h-screen bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
            <div className="p-4 border-b lg:hidden">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                {sidebarItems.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => {
                        setCurrentPage(item.page);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${currentPage === item.page ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              {renderPageContent()}
            </div>
          </main>
        </div>
      </div>
    );
  };

  return (
    <div>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <MainPage />
      )}
    </div>
  );
};

export default HealthManagementApp;