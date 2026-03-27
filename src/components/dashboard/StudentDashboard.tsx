import { useState, useEffect, useMemo } from 'react';
import { ReadingLog } from '../../types';
import { getAllStudentLogs } from '../../services/readingLogService';
import { getGemLevel, getNextGemLevel, getProgressToNextLevel, GEM_LEVELS } from '../../utils/gemLevels';
import { formatDate } from '../../utils/helpers';
import GemBadge from '../common/GemBadge';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';
import { BookOpen, Target, Flame, Trophy, Star } from 'lucide-react';

interface StudentDashboardProps {
  studentId: string;
  studentName: string;
}

export default function StudentDashboard({ studentId, studentName }: StudentDashboardProps) {
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [studentId]);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getAllStudentLogs(studentId);
    setLogs(data);
    setLoading(false);
  };

  const totalLogs = logs.length;
  const currentGem = getGemLevel(totalLogs);
  const nextGem = getNextGemLevel(totalLogs);
  const progress = getProgressToNextLevel(totalLogs);

  // 이번 달 독서록
  const thisMonthLogs = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return logs.filter((l) => l.createdAt >= monthStart.getTime()).length;
  }, [logs]);

  // 연속 독서 주간 (매주 1편 이상 작성한 연속 주 수)
  const streak = useMemo(() => {
    if (logs.length === 0) return 0;

    // 각 독서록을 주 단위로 그룹핑 (ISO 주 기준)
    const getWeekKey = (timestamp: number) => {
      const d = new Date(timestamp);
      // 해당 주의 월요일 구하기
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    };

    const weekSet = new Set(logs.map((l) => getWeekKey(l.readDate)));
    const sortedWeeks = [...weekSet].sort().reverse();

    // 현재 주부터 연속으로 작성한 주 수 카운트
    const now = new Date();
    const currentWeek = getWeekKey(now.getTime());
    const lastWeek = getWeekKey(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 현재 주 또는 지난 주에 작성이 있어야 스트릭 시작
    if (sortedWeeks[0] !== currentWeek && sortedWeeks[0] !== lastWeek) return 0;

    let count = 1;
    for (let i = 1; i < sortedWeeks.length; i++) {
      const prevMonday = new Date(sortedWeeks[i - 1]);
      const currMonday = new Date(sortedWeeks[i]);
      const diffDays = (prevMonday.getTime() - currMonday.getTime()) / (1000 * 60 * 60 * 24);
      if (Math.abs(diffDays - 7) <= 1) count++; // 정확히 1주 차이 (±1일 허용)
      else break;
    }
    return count;
  }, [logs]);

  // 가장 좋아하는 별점 (최다 5점)
  const fiveStarCount = logs.filter((l) => l.rating === 5).length;

  if (loading) return <LoadingSpinner message="내 독서 현황 불러오는 중..." />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* 보석 등급 메인 카드 */}
      <div
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentGem.bgColor}, white)`,
          border: `2px solid ${currentGem.color}20`,
        }}
      >
        {/* 배경 장식 */}
        <div className="absolute top-4 right-4 text-6xl opacity-20">{currentGem.emoji}</div>
        <div className="absolute bottom-4 left-4 text-4xl opacity-10">{currentGem.emoji}</div>

        <p className="text-sm text-gray-500 mb-2">{studentName}의 독서 등급</p>

        {/* 큰 보석 뱃지 */}
        <div className="text-6xl mb-3">{currentGem.emoji}</div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: currentGem.color }}>
          {currentGem.nameKo}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{currentGem.description}</p>

        {/* 진행 바 */}
        {nextGem ? (
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{totalLogs}편 달성</span>
              <span>다음: {nextGem.emoji} {nextGem.nameKo} ({nextGem.minLogs}편)</span>
            </div>
            <div className="w-full bg-white rounded-full h-4 shadow-inner">
              <div
                className="h-4 rounded-full transition-all duration-1000 flex items-center justify-center"
                style={{
                  width: `${progress}%`,
                  backgroundColor: currentGem.color,
                  minWidth: '24px',
                }}
              >
                <span className="text-[10px] font-bold text-white">{progress}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {nextGem.minLogs - totalLogs}편 더 작성하면 {nextGem.nameKo} 등급!
            </p>
          </div>
        ) : (
          <div className="text-lg font-bold text-indigo-600">
            최고 등급 달성! 대단해요!
          </div>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat
          icon={<BookOpen className="w-5 h-5 text-indigo-500" />}
          label="전체 독서록"
          value={`${totalLogs}편`}
        />
        <MiniStat
          icon={<Target className="w-5 h-5 text-emerald-500" />}
          label="이번 달"
          value={`${thisMonthLogs}편`}
        />
        <MiniStat
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="독서 연속"
          value={`${streak}주`}
        />
        <MiniStat
          icon={<Star className="w-5 h-5 text-amber-500" />}
          label="최고 평점"
          value={`${fiveStarCount}편`}
        />
      </div>

      {/* 보석 등급 로드맵 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          보석 등급 로드맵
        </h3>
        <div className="space-y-3">
          {GEM_LEVELS.map((gem) => {
            const isAchieved = totalLogs >= gem.minLogs;
            const isCurrent = gem.level === currentGem.level;

            return (
              <div
                key={gem.level}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-indigo-50 border border-indigo-200 ring-2 ring-indigo-100'
                    : isAchieved
                    ? 'bg-gray-50'
                    : 'opacity-50'
                }`}
              >
                <span className="text-2xl">{gem.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${isAchieved ? 'text-gray-800' : 'text-gray-400'}`}>
                      Lv.{gem.level} {gem.nameKo}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full">현재</span>
                    )}
                    {isAchieved && !isCurrent && (
                      <span className="text-[10px] text-emerald-600">✓ 달성</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{gem.minLogs}편 이상 · {gem.description}</p>
                </div>
                {isAchieved && (
                  <span className="text-emerald-500 text-lg">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 최근 독서록 */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-700 mb-4">최근 독서록</h3>
          <div className="space-y-3">
            {logs.slice(0, 5).map((log) => (
              <div key={log.logId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {log.bookTitle.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{log.bookTitle}</p>
                  <p className="text-xs text-gray-400">{log.bookAuthor} · {formatDate(log.readDate)}</p>
                </div>
                <StarRating rating={log.rating} size="sm" readonly />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
