import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getStudentClasses, findClassByCode, joinClass } from '../services/classService';
import { requestTeacherRole, signInWithGoogle, getUserProfile } from '../services/authService';
import { ClassData } from '../types';
import Header from '../components/common/Header';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BookOpen, LogIn, Users, Loader2, GraduationCap, RefreshCw, X, UserCircle } from 'lucide-react';

export default function StudentPage() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [showDashboard, setShowDashboard] = useState(true);
  const [showAccountConfirm, setShowAccountConfirm] = useState(false);
  const [pendingClassData, setPendingClassData] = useState<ClassData | null>(null);
  const [switchingAccount, setSwitchingAccount] = useState(false);

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
      // 반을 찾으면 계정 확인 모달을 표시
      setPendingClassData(classData);
      setShowAccountConfirm(true);
    } catch (err: any) {
      setError(err.message || '반 참여에 실패했습니다.');
    } finally {
      setJoining(false);
    }
  };

  // 계정 확인 후 반에 참여
  const handleConfirmJoin = async () => {
    if (!user || !pendingClassData) return;
    setJoining(true);
    try {
      await joinClass(pendingClassData.classId, user.uid, user.displayName, user.photoURL);
      setJoinCode('');
      setShowAccountConfirm(false);
      setPendingClassData(null);
      loadClasses();
    } catch (err: any) {
      setError(err.message || '반 참여에 실패했습니다.');
      setShowAccountConfirm(false);
    } finally {
      setJoining(false);
    }
  };

  // 다른 계정으로 전환
  const handleSwitchAccount = async () => {
    setSwitchingAccount(true);
    try {
      const newUser = await signInWithGoogle();
      const profile = await getUserProfile(newUser.uid);
      if (profile) {
        setUser(profile);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('계정 전환에 실패했습니다.');
      }
    } finally {
      setSwitchingAccount(false);
    }
  };

  // 계정 확인 모달 닫기
  const handleCancelJoin = () => {
    setShowAccountConfirm(false);
    setPendingClassData(null);
  };

  const [teacherMsg, setTeacherMsg] = useState('');

  const handleRequestTeacher = async () => {
    if (!user) return;
    if (user.pendingTeacher) {
      setTeacherMsg('이미 교사 권한을 요청했습니다. 관리자 승인을 기다려주세요.');
      return;
    }
    try {
      await requestTeacherRole(user.uid);
      setUser({ ...user, pendingTeacher: true });
      setTeacherMsg('교사 권한을 요청했습니다. 관리자 승인 후 반을 만들 수 있습니다.');
    } catch (err) {
      setTeacherMsg('교사 권한 요청에 실패했습니다.');
    }
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

          {/* 교사 권한 메시지 */}
          {teacherMsg && (
            <div className="ml-auto px-3 py-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg">
              {teacherMsg}
            </div>
          )}

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
                <div className="mb-4 flex justify-center"><BookOpen className="w-12 h-12 text-indigo-300" /></div>
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

      {/* 계정 확인 모달 */}
      {showAccountConfirm && pendingClassData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">반 참여 확인</h2>
              <button onClick={handleCancelJoin} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 반 정보 */}
            <div className="bg-indigo-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">참여할 반</p>
              <p className="font-bold text-lg text-indigo-700">{pendingClassData.className}</p>
              <p className="text-sm text-gray-500">{pendingClassData.teacherName} 선생님 · {pendingClassData.students.length}명 참여 중</p>
            </div>

            {/* 현재 계정 정보 */}
            <div className="border rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500 mb-3">현재 로그인 계정</p>
              <div className="flex items-center gap-3">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <UserCircle className="w-10 h-10 text-gray-300" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{user?.displayName}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSwitchAccount}
                disabled={switchingAccount}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {switchingAccount ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                다른 계정으로 변경
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-4 text-center">
              위 계정으로 반에 참여합니다. 다른 계정을 사용하려면 먼저 계정을 변경하세요.
            </p>

            {/* 확인/취소 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelJoin}
                className="flex-1 px-4 py-3 border rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirmJoin}
                disabled={joining}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                이 계정으로 참여하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
