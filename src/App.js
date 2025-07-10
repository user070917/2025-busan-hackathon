import { Calculator, Camera, Heart, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import BMICalculatorPage from './components/BMICalculatorPage';
import LoginPage from './components/login'; // 분리된 로그인 컴포넌트 임포트


const FoodRecognitionPage = ({ setCurrentPage }) => (
  <div className="p-6 bg-white rounded-xl shadow-md">
    <div className="flex items-center mb-6">
      <Camera className="w-8 h-8 text-blue-500 mr-3" />
      <h2 className="text-2xl font-bold text-gray-800">음식 인식</h2>
    </div>
    <p className="text-gray-600">이곳은 음식 인식 페이지입니다. 음식 사진을 업로드하고 칼로리를 분석할 수 있습니다.</p>
    <div className="mt-4">
      <button
        onClick={() => setCurrentPage('main')}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
      >
        대시보드로 돌아가기
      </button>
    </div>
  </div>
);

const HealthStatusPage = ({ setCurrentPage }) => (
  <div className="p-6 bg-white rounded-xl shadow-md">
    <div className="flex items-center mb-6">
      <Heart className="w-8 h-8 text-red-500 mr-3" />
      <h2 className="text-2xl font-bold text-gray-800">건강 상태 분석</h2>
    </div>
    <p className="text-gray-600">이곳은 건강 상태를 분석하고 관리하는 페이지입니다. 질환 위험도 등을 확인할 수 있습니다.</p>
    <div className="mt-4">
      <button
        onClick={() => setCurrentPage('main')}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
      >
        대시보드로 돌아가기
      </button>
    </div>
  </div>
);

const ProfilePage = ({ user, setCurrentPage }) => (
  <div className="p-6 bg-white rounded-xl shadow-md">
    <div className="flex items-center mb-6">
      <User className="w-8 h-8 text-orange-500 mr-3" />
      <h2 className="text-2xl font-bold text-gray-800">프로필</h2>
    </div>
    <p className="text-gray-600 mb-4">내 정보를 확인하고 관리합니다.</p>
    <div className="space-y-2 text-gray-700">
      <p><strong>이름:</strong> {user?.name}</p>
      <p><strong>이메일:</strong> {user?.email}</p>
      <p><strong>나이:</strong> {user?.age} 세</p>
      <p><strong>성별:</strong> {user?.gender === 'male' ? '남성' : user?.gender === 'female' ? '여성' : ''}</p>
      <p><strong>체중:</strong> {user?.weight} kg</p>
      <p><strong>신장:</strong> {user?.height} cm</p>
      <p><strong>BMI:</strong> {user?.bmi}</p>
      <p><strong>기존 질환:</strong> {user?.diseases?.length > 0 ? user.diseases.join(', ') : '없음'}</p>
      <p><strong>활동 수준:</strong> {user?.activityLevel}</p>
    </div>
    <div className="mt-6">
      <button
        onClick={() => setCurrentPage('main')}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
      >
        대시보드로 돌아가기
      </button>
    </div>
  </div>
);

const HealthManagementApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  };

  // 메인 페이지
  const MainPage = () => {
    const getBMICategory = (bmi) => {
      if (bmi === '알수 없음' || isNaN(bmi)) return { category: '정보 없음', color: 'text-gray-600', bg: 'bg-gray-50' };
      if (bmi < 18.5) return { category: '저체중', color: 'text-blue-600', bg: 'bg-blue-50' };
      if (bmi < 23) return { category: '정상', color: 'text-green-600', bg: 'bg-green-50' };
      if (bmi < 25) return { category: '과체중 전단계', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      if (bmi < 30) return { category: '비만 1단계', color: 'text-orange-600', bg: 'bg-orange-50' };
      return { category: '비만 2단계', color: 'text-red-600', bg: 'bg-red-50' };
    };

    const getRecommendation = (bmi) => {
      if (bmi === '알수 없음' || isNaN(bmi)) {
        return {
          exercise: '신장과 체중을 입력하여 BMI를 계산해주세요.',
          diet: '신장과 체중을 입력하여 BMI를 계산해주세요.',
          warning: 'BMI 정보가 없어 정확한 추천을 드릴 수 없습니다. 프로필에서 정보를 입력해주세요.'
        };
      }
      if (bmi < 18.5) {
        return {
          exercise: '근력 운동 위주 (웨이트 트레이닝, 스쿼트, 푸시업)',
          diet: '고단백 식단, 탄수화물 충분히 섭취',
          warning: '영양 부족 및 근육량 부족 위험'
        };
      }
      if (bmi < 23) {
        return {
          exercise: '유산소 및 근력 운동 (조깅, 플랭크, 요가)',
          diet: '균형 잡힌 식단 (탄:단:지 = 5:3:2)',
          warning: '건강한 상태 유지'
        };
      }
      if (bmi < 25) {
        return {
          exercise: '유산소 위주 + 체중 감량용 근력 운동',
          diet: '저당&저지방, 야식 줄이기, 충분한 물 섭취',
          warning: '체지방 증가 가능성 존재'
        };
      }
      if (bmi < 30) {
        return {
          exercise: '고강도 운동 & 전신 근력운동',
          diet: '저탄수화물 & 고단백 위주, 가공식품 줄이기',
          warning: '생활습관병 (당뇨, 고혈압) 위험 증가'
        };
      }
      return {
        exercise: '전문가 상담 후 운동 시작, 걷기부터 점진적 증가',
        diet: '전문 영양 상담 권장, 철저한 관리 필요',
        warning: '만성질환 확률 증가, 의학적 관리 필요'
      };
    };

    const sidebarItems = [
      { icon: Camera, label: '음식 인식', page: 'food-recognition' },
      { icon: Calculator, label: 'BMI 계산기', page: 'bmi-calculator' },
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
                  onClick={() => setCurrentPage('bmi-calculator')}
                >
                  <div className="flex items-center mb-4">
                    <Calculator className="w-8 h-8 text-purple-500 mr-3" />
                    <h3 className="text-lg font-semibold">BMI 계산기</h3>
                  </div>
                  <p className="text-gray-600 mb-4">정확한 BMI를 계산하고 상태를 확인해보세요.</p>
                  <button className="text-purple-500 hover:text-purple-700 font-medium">시작하기 →</button>
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
        case 'bmi-calculator':
          return <BMICalculatorPage user={user} setUser={setUser} setCurrentPage={setCurrentPage} />;
        case 'food-recognition':
          return <FoodRecognitionPage setCurrentPage={setCurrentPage} />;
        case 'profile':
          return <ProfilePage user={user} setCurrentPage={setCurrentPage} />;
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
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
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