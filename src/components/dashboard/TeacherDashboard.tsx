import { useState, useEffect, useMemo } from 'react';
import { ClassData, ReadingLog, StudentProgress } from '../../types';
import { getClassLogs } from '../../services/readingLogService';
import { getGemLevel } from '../../utils/gemLevels';
import { formatDate } from '../../utils/helpers';
import GemBadge from '../common/GemBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  Users, BookOpen, TrendingUp, Calendar, Award, BarChart3,
  ChevronDown, ChevronUp, Activity
} from 'lucide-react';

interface TeacherDashboardProps {
  classData: ClassData;
}

export default function TeacherDashboard({ classData }: TeacherDashboardProps) {
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'totalLogs' | 'lastLogDate' | 'thisMonthLogs'>('totalLogs');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadLogs();
  }, [classData.classId]);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getClassLogs(classData.classId);
    setLogs(data);
    setLoading(false);
  };

  // 통계 계산
  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const totalStudents = classData.students.length;
    const totalLogs = logs.length;
    const avgLogs = totalStudents > 0 ? (totalLogs / totalStudents).toFixed(1) : '0';

    // 이번 주 활동 학생
    const activeThisWeek = new Set(
      logs.filter((l) => l.createdAt >= weekAgo).map((l) => l.studentId)
    ).size;

    // 이번 달 활동 학생
    const activeThisMonth = new Set(
      logs.filter((l) => l.createdAt >= monthStart.getTime()).map((l) => l.studentId)
    ).size;

    // 이번 달 독서록
    const thisMonthLogs = logs.filter((l) => l.createdAt >= monthStart.getTime()).length;

    // 참여율
    const participationRate = totalStudents > 0
      ? Math.round((activeThisMonth / totalStudents) * 100)
      : 0;

    return {
      totalStudents,
      totalLogs,
      avgLogs,
      activeThisWeek,
      activeThisMonth,
      thisMonthLogs,
      participationRate,
    };
  }, [logs, classData.students]);

  // 학생별 진도 현황
  const studentProgress: StudentProgress[] = useMemo(() => {
    const now = Date.now();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return classData.students.map((student) => {
      const studentLogs = logs.filter((l) => l.studentId === student.uid);
      const totalLogs = studentLogs.length;
      const thisMonthLogs = studentLogs.filter((l) => l.createdAt >= monthStart.getTime()).length;
      const lastLog = studentLogs[0]; // 이미 desc 정렬
      const avgRating = studentLogs.length > 0
        ? studentLogs.reduce((acc, l) => acc + l.rating, 0) / studentLogs.length
        : 0;

      return {
        uid: student.uid,
        displayName: student.displayName,
        photoURL: student.photoURL,
        totalLogs,
        gemLevel: getGemLevel(totalLogs),
        lastLogDate: lastLog?.createdAt || null,
        thisMonthLogs,
        averageRating: Math.round(avgRating * 10) / 10,
      };
    }).sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortDir === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
  }, [logs, classData.students, sortField, sortDir]);

  // 월별 트렌드
  const monthlyTrend = useMemo(() => {
    const months: Record<string, number> = {};
    logs.forEach((log) => {
      const d = new Date(log.createdAt);
      const key = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // 최근 6개월
  }, [logs]);

  // 별점 분포
  const ratingDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    logs.forEach((l) => dist[l.rating - 1]++);
    return dist;
  }, [logs]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  if (loading) return <LoadingSpinner message="대시보드 불러오는 중..." />;

  const maxMonthly = Math.max(...monthlyTrend.map(([, v]) => v), 1);
  const maxRating = Math.max(...ratingDist, 1);

  return (
    <div className="space-y-6">
      {/* 요약 카드들 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="전체 학생" value={`${stats.totalStudents}명`} color="blue" />
        <StatCard icon={<BookOpen className="w-5 h-5" />} label="전체 독서록" value={`${stats.totalLogs}편`} color="emerald" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="1인당 평균" value={`${stats.avgLogs}편`} color="amber" />
        <StatCard icon={<Activity className="w-5 h-5" />} label="이달 참여율" value={`${stats.participationRate}%`} color="purple" />
      </div>

      {/* 이달 활동 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Calendar className="w-4 h-4 text-indigo-500" />
            이번 주 활동
          </div>
          <div className="text-3xl font-bold text-indigo-600">{stats.activeThisWeek}명</div>
          <p className="text-xs text-gray-400 mt-1">최근 7일 독서록 작성 학생</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            이번 달 독서록
          </div>
          <div className="text-3xl font-bold text-emerald-600">{stats.thisMonthLogs}편</div>
          <p className="text-xs text-gray-400 mt-1">{stats.activeThisMonth}명 학생 참여</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Award className="w-4 h-4 text-amber-500" />
            최다 독서왕
          </div>
          {studentProgress[0] && (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-amber-600">{studentProgress[0].displayName}</span>
              <GemBadge logCount={studentProgress[0].totalLogs} size="sm" />
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {studentProgress[0]?.totalLogs || 0}편 작성
          </p>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 월별 트렌드 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            월별 독서록 추이
          </h3>
          <div className="flex items-end gap-2 h-40">
            {monthlyTrend.map(([month, count]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-gray-700">{count}</span>
                <div
                  className="w-full bg-indigo-400 rounded-t-md transition-all duration-500"
                  style={{ height: `${(count / maxMonthly) * 120}px` }}
                />
                <span className="text-[10px] text-gray-400">{month.split('.')[1]}월</span>
              </div>
            ))}
            {monthlyTrend.length === 0 && (
              <div className="flex-1 text-center text-gray-300 text-sm">데이터 없음</div>
            )}
          </div>
        </div>

        {/* 별점 분포 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-4">
            ⭐ 별점 분포
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm w-12 text-right text-gray-600">{star}점</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${(ratingDist[star - 1] / maxRating) * 100}%`, minWidth: ratingDist[star - 1] > 0 ? '32px' : '0' }}
                  >
                    {ratingDist[star - 1] > 0 && (
                      <span className="text-xs font-bold text-amber-800">{ratingDist[star - 1]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 학생별 진도 현황 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            학생별 진도 현황
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500">
                <th className="text-left px-5 py-3 font-semibold">학생</th>
                <th className="text-left px-5 py-3 font-semibold">보석 등급</th>
                <th
                  className="text-center px-5 py-3 font-semibold cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort('totalLogs')}
                >
                  <span className="inline-flex items-center gap-1">
                    전체 편수
                    {sortField === 'totalLogs' && (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </span>
                </th>
                <th
                  className="text-center px-5 py-3 font-semibold cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort('thisMonthLogs')}
                >
                  <span className="inline-flex items-center gap-1">
                    이달
                    {sortField === 'thisMonthLogs' && (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </span>
                </th>
                <th className="text-center px-5 py-3 font-semibold">평균 별점</th>
                <th
                  className="text-center px-5 py-3 font-semibold cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort('lastLogDate')}
                >
                  <span className="inline-flex items-center gap-1">
                    최근 작성
                    {sortField === 'lastLogDate' && (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {studentProgress.map((sp, idx) => (
                <tr key={sp.uid} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5">{idx + 1}</span>
                      {sp.photoURL ? (
                        <img src={sp.photoURL} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                          {sp.displayName.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-sm text-gray-800">{sp.displayName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <GemBadge logCount={sp.totalLogs} size="sm" />
                  </td>
                  <td className="text-center px-5 py-3">
                    <span className="font-bold text-gray-700">{sp.totalLogs}</span>
                    <span className="text-xs text-gray-400"> 편</span>
                  </td>
                  <td className="text-center px-5 py-3">
                    <span className={`font-bold ${sp.thisMonthLogs > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                      {sp.thisMonthLogs}
                    </span>
                    <span className="text-xs text-gray-400"> 편</span>
                  </td>
                  <td className="text-center px-5 py-3">
                    {sp.averageRating > 0 ? (
                      <span className="text-amber-600 font-semibold">{sp.averageRating}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="text-center px-5 py-3 text-sm text-gray-500">
                    {sp.lastLogDate ? formatDate(sp.lastLogDate) : <span className="text-gray-300">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const valueColor = {
    blue: 'text-blue-700',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    purple: 'text-purple-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-semibold ${colorMap[color]} mb-2`}>
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-bold ${valueColor[color]}`}>{value}</div>
    </div>
  );
}
