import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getStudentClasses, findClassByCode, joinClass } from '../services/classService';
import { requestTeacherRole } from '../services/authService';
import { ClassData } from '../types';
import Header from '../components/common/Header';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BookOpen, LogIn, Users, Loader2, GraduationCap } from 'lucide-react';

export default function StudentPage() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [showDashboard, setShowDashboard] = useState(true);

  useEffect(() => {
    if (user) loadClasses();
  }, [user]);

  const loadClasses = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getStudentClasses(user.uid);
    setClasses(data);
    setLoading(false);
  };

  const handleJoinClass = async () => {
    if (!user || !joinCode.trim()) return;
    setJoining(true);
    setError('');
    try {
      const classData = await findClassByCode(joinCode.toUpperCase());
      if (!classData) {
        setError('유효하지 않은 반 코드입니다.');
        return;
      }
      await joinClass(classData.classId, user.uid, user.displayName, user.photoURL);
      setJoinCode('');
      loadClasses();
    } catch (err: any) {
      setError(err.message || '반 참여에 실패했습니다.');
    } finally {
      setJoining(false);
    }
  };

  const handleRequestTeacher = async () => {
    if (!user) return;
    if (user.pendingTeacher) {
      alert('이미 교사 권한을 요청했습니다. 관리자 승인을 기다려주세요.');
      return;
    }
    await requestTeacherRole(user.uid);
    setUser({ ...user, pendingTeacher: true });
    alert('교사 권한을 요청했습니다. 관리자 승인 후 반을 만들 수 있습니다.');
  };

  if (loading) return <><Header /><LoadingSpinner /></>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto p-6">
        {/* 탭 전환 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowDashboard(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              showDashboard ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'
            }`}
          >
            내 독서 현황
          </button>
          <button
            onClick={() => setShowDashboard(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              !showDashboard ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'
            }`}
          >
            내 반 목록
          </button>

          {/* 교사 권한 요청 */}
          {user.role === 'student' && (
            <button
              onClick={handleRequestTeacher}
              className="ml-auto flex items-center gap-1 px-3 py-2 text-xs text-gray-500 border rounded-lg hover:bg-gray-50"
            >
              <GraduationCap className="w-4 h-4" />
              {user.pendingTeacher ? '교사 승인 대기 중' : '교사 권한 요청'}
            </button>
          )}
        </div>

        {/* 내 독서 현황 (대시보드) */}
        {showDashboard && (
          <StudentDashboard studentId={user.uid} studentName={user.displayName} />
        )}

        {/* 반 목록 */}
        {!showDashboard && (
          <>
            {/* 반 코드 입력 */}
            <div className="bg-white rounded-xl border p-5 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">반 코드로 입장하기</p>
              {error && (
                <p className="text-sm text-red-500 mb-2">{error}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="반 코드 입력 (예: ABC123)"
                  className="flex-1 px-4 py-3 border rounded-lg text-sm uppercase tracking-wider font-mono
                    focus:ring-2 focus:ring-indigo-400 outline-none text-center"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinClass}
                  disabled={joining || !joinCode.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-sm
                    hover:bg-indigo-700 disabled:bg-gray-300 flex items-center gap-2"
                >
                  {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  입장
                </button>
              </div>
            </div>

            {/* 참여 중인 반 */}
            {classes.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📖</div>
                <p className="text-gray-500 mb-2">참여 중인 반이 없습니다.</p>
                <p className="text-gray-400 text-sm">선생님이 알려준 반 코드를 입력하여 입장하세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((cls) => (
                  <div
                    key={cls.classId}
                    onClick={() => navigate(`/class/${cls.classId}`)}
                    className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{cls.className}</h3>
                    <p className="text-sm text-gray-500 mb-3">{cls.teacherName} 선생님</p>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {cls.students.length}명
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {cls.students.find((s) => s.uid === user.uid)?.logCount || 0}편 작성
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
