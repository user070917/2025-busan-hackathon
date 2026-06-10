import { AlertCircle, AlertTriangle, Calendar, CheckCircle, Clock, Pill, Search, XCircle } from 'lucide-react';
import { useState } from 'react';

const HistoryPage = ({ setCurrentPage, history }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [expandedItems, setExpandedItems] = useState(new Set());

    const filteredHistory = history.filter(item => {
        const matchesSearch = searchTerm === '' ||
            item.supplements.some(supplement =>
                supplement.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesDate = selectedDate === '' ||
            new Date(item.date).toDateString() === new Date(selectedDate).toDateString();

        return matchesSearch && matchesDate;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSafetyIcon = (safety) => {
        switch (safety) {
            case 'safe':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'caution':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'danger':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <CheckCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getSafetyColor = (safety) => {
        switch (safety) {
            case 'safe':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'caution':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'danger':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getSafetyText = (safety) => {
        switch (safety) {
            case 'safe':
                return '안전';
            case 'caution':
                return '주의';
            case 'danger':
                return '위험';
            default:
                return '미분석';
        }
    };

    const toggleExpanded = (index) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedItems(newExpanded);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex items-center mb-6">
                <Clock className="w-8 h-8 text-purple-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">영양제 검색 히스토리</h2>
            </div>

            {/* 검색 및 필터 */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="영양제 이름으로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {(searchTerm || selectedDate) && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            {filteredHistory.length}개의 결과 찾음
                        </span>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedDate('');
                            }}
                            className="text-sm text-purple-600 hover:text-purple-800"
                        >
                            필터 초기화
                        </button>
                    </div>
                )}
            </div>

            {/* 히스토리 목록 */}
            <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                            {history.length === 0 ? '아직 인식한 영양제가 없습니다' : '검색 결과가 없습니다'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {history.length === 0 ? '영양제 인식 기능을 사용해보세요!' : '다른 검색어나 날짜를 시도해보세요'}
                        </p>
                    </div>
                ) : (
                    filteredHistory.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            {/* 날짜와 이미지 이름이 있는 상단 섹션 */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <Pill className="w-5 h-5 text-purple-500 mr-2" />
                                    <span className="font-medium text-gray-800">
                                        {formatDate(item.date)}
                                    </span>
                                </div>
                                {/* 이미지 이름을 제거하고 사진으로 대체할 경우 이 부분 삭제 */}
                                {/* <span className="text-sm text-gray-500">{item.imageName}</span> */}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* 인식된 영양제 섹션에 사진 추가 */}
                                <div className="flex items-start"> {/* items-start로 변경하여 이미지와 텍스트 정렬 */}
                                    {/* 영양제 사진 표시 (imagePreviewData가 있을 경우) */}
                                    {item.imagePreviewData && (
                                        <img
                                            src={item.imagePreviewData}
                                            alt={item.imageName || '영양제 사진'}
                                            className="w-24 h-24 object-cover rounded-md mr-4 border border-gray-200 flex-shrink-0" // flex-shrink-0 추가
                                        />
                                    )}
                                    <div> {/* 영양제 이름과 신뢰도를 위한 div 추가 */}
                                        <h4 className="font-medium text-gray-800 mb-2">인식된 영양제</h4>
                                        <div className="space-y-1">
                                            {item.supplements.map((supplement, suppIndex) => (
                                                <div key={suppIndex} className="flex justify-between items-center text-sm">
                                                    <span>{supplement.name}</span>
                                                    <span className="text-green-600">{supplement.confidence}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 주요 영양소 섹션 */}
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">주요 영양소</h4>
                                    <div className="space-y-1">
                                        {Object.entries(item.totalNutrients).slice(0, 3).map(([nutrient, amount]) => (
                                            <div key={nutrient} className="flex justify-between text-sm">
                                                <span>{nutrient}</span>
                                                <span className="font-medium">{amount}</span>
                                            </div>
                                        ))}
                                        {Object.keys(item.totalNutrients).length > 3 && (
                                            <div className="text-sm text-gray-500">
                                                +{Object.keys(item.totalNutrients).length - 3}개 더
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 안전성 분석 결과 표시 */}
                            {item.safetyAnalysis && item.safetyAnalysis.length > 0 && (
                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-800">안전성 분석 결과</h4>
                                        <button
                                            onClick={() => toggleExpanded(index)}
                                            className="text-sm text-purple-600 hover:text-purple-800"
                                        >
                                            {expandedItems.has(index) ? '간략히 보기' : '자세히 보기'}
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {item.safetyAnalysis.map((analysis, analysisIndex) => (
                                            <div key={analysisIndex} className={`p-3 rounded-lg border ${getSafetyColor(analysis.overallSafety)}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm">{analysis.supplementName}</span>
                                                    <div className="flex items-center gap-1">
                                                        {getSafetyIcon(analysis.overallSafety)}
                                                        <span className="text-xs font-medium">
                                                            {getSafetyText(analysis.overallSafety)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-xs mb-2">
                                                    <strong>권장사항:</strong> {analysis.recommendation}
                                                </div>

                                                {expandedItems.has(index) && (
                                                    <div className="space-y-2">
                                                        {analysis.benefits.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-medium text-green-700 mb-1">예상 효과:</p>
                                                                <ul className="text-xs text-green-600 space-y-1">
                                                                    {analysis.benefits.map((benefit, i) => (
                                                                        <li key={i}>• {benefit}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {analysis.risks.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-medium text-red-700 mb-1">주의사항:</p>
                                                                <ul className="text-xs text-red-600 space-y-1">
                                                                    {analysis.risks.map((risk, i) => (
                                                                        <li key={i}>• {risk}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
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
};

export default HistoryPage;