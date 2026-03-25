import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/authService';
import { getUserProfile } from '../services/authService';
import { findClassByCode, joinClass } from '../services/classService';
import { useAuthStore } from '../stores/authStore';
import { BookOpen, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 이미 로그인된 경우 리다이렉트 (useEffect로 안전하게 처리)
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'teacher') navigate('/teacher', { replace: true });
      else navigate('/student', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const firebaseUser = await signInWithGoogle();
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        useAuthStore.getState().setUser(profile);
        if (profile.role === 'admin') navigate('/admin');
        else if (profile.role === 'teacher') navigate('/teacher');
        else navigate('/student');
      }
    } catch (err: any) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) {
      setError('반 코드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 먼저 로그인
      const firebaseUser = await signInWithGoogle();
      const profile = await getUserProfile(firebaseUser.uid);

      if (!profile) throw new Error('프로필을 찾을 수 없습니다.');

      // 반 찾기
      const classData = await findClassByCode(inviteCode.toUpperCase());
      if (!classData) {
        setError('유효하지 않은 반 코드입니다.');
        return;
      }

      // 반에 참여
      await joinClass(
        classData.classId,
        firebaseUser.uid,
        firebaseUser.displayName || '이름없음',
        firebaseUser.photoURL || ''
      );

      useAuthStore.getState().setUser({ ...profile, classIds: [...profile.classIds, classData.classId] });
      navigate(`/class/${classData.classId}`);
    } catch (err: any) {
      setError(err.message || '반 참여에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 로고 */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">우리 반 독서록</h1>
          <p className="text-gray-500">책과 함께 성장하는 우리들의 이야기</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Google 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-6 bg-white border-2 border-gray-200 rounded-xl
            flex items-center justify-center gap-3 text-gray-700 font-semibold
            hover:border-indigo-400 hover:shadow-md transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Google로 로그인
        </button>

        {/* 구분선 */}
        <div className="flex items-center gap-4 my-6">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {/* 반 코드 입력 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-3">반 코드가 있나요?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="반 코드 입력 (예: ABC123)"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm
                focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none
                uppercase tracking-wider text-center font-mono"
              maxLength={6}
            />
            <button
              onClick={handleJoinWithCode}
              disabled={loading || !inviteCode.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-sm
                hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
            >
              입장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
