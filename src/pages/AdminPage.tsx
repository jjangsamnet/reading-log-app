import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { approveTeacherRole, rejectTeacherRole } from '../services/authService';
import { UserProfile } from '../types';
import Header from '../components/common/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Shield, Users, BookOpen, School, Check, X } from 'lucide-react';

export default function AdminPage() {
  const [pendingTeachers, setPendingTeachers] = useState<UserProfile[]>([]);
  const [allTeachers, setAllTeachers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({ teachers: 0, classes: 0, students: 0, logs: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 교사 권한 요청 중인 사용자
      const pendingQ = query(collection(db, 'users'), where('pendingTeacher', '==', true));
      const pendingSnap = await getDocs(pendingQ);
      setPendingTeachers(pendingSnap.docs.map((d) => d.data() as UserProfile));

      // 현재 교사 목록
      const teacherQ = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const teacherSnap = await getDocs(teacherQ);
      setAllTeachers(teacherSnap.docs.map((d) => d.data() as UserProfile));

      // 통계
      const classSnap = await getDocs(collection(db, 'classes'));
      const userSnap = await getDocs(collection(db, 'users'));
      const logSnap = await getDocs(collection(db, 'readingLogs'));

      setStats({
        teachers: teacherSnap.size,
        classes: classSnap.size,
        students: userSnap.docs.filter((d) => d.data().role === 'student').length,
        logs: logSnap.size,
      });
    } catch (err) {
      console.error('관리자 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uid: string) => {
    try {
      setMessage(null);
      await approveTeacherRole(uid);
      setMessage({ type: 'success', text: '교사 권한이 승인되었습니다.' });
      loadData();
    } catch (err) {
      console.error('교사 승인 실패:', err);
      setMessage({ type: 'error', text: '승인 처리에 실패했습니다.' });
    }
  };

  const handleReject = async (uid: string) => {
    try {
      setMessage(null);
      await rejectTeacherRole(uid);
      setMessage({ type: 'success', text: '교사 요청이 거절되었습니다.' });
      loadData();
    } catch (err) {
      console.error('교사 거절 실패:', err);
      setMessage({ type: 'error', text: '거절 처리에 실패했습니다.' });
    }
  };

  if (loading) return <><Header /><LoadingSpinner /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-7 h-7 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800">관리자 패널</h1>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-sm text-center mb-4 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4 text-center">
            <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.teachers}</div>
            <p className="text-xs text-gray-400">교사</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <School className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.classes}</div>
            <p className="text-xs text-gray-400">반</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.students}</div>
            <p className="text-xs text-gray-400">학생</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <BookOpen className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.logs}</div>
            <p className="text-xs text-gray-400">독서록</p>
          </div>
        </div>

        {/* 교사 권한 요청 */}
        <div className="bg-white rounded-xl border mb-6">
          <div className="p-5 border-b">
            <h2 className="font-bold text-gray-700">교사 권한 요청 ({pendingTeachers.length})</h2>
          </div>
          {pendingTeachers.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">대기 중인 요청이 없습니다.</div>
          ) : (
            <div className="divide-y">
              {pendingTeachers.map((teacher) => (
                <div key={teacher.uid} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {teacher.photoURL ? (
                      <img src={teacher.photoURL} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                        {teacher.displayName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{teacher.displayName}</p>
                      <p className="text-xs text-gray-400">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(teacher.uid)}
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                    >
                      <Check className="w-4 h-4" /> 승인
                    </button>
                    <button
                      onClick={() => handleReject(teacher.uid)}
                      className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      <X className="w-4 h-4" /> 거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 현재 교사 목록 */}
        <div className="bg-white rounded-xl border">
          <div className="p-5 border-b">
            <h2 className="font-bold text-gray-700">등록된 교사 ({allTeachers.length})</h2>
          </div>
          <div className="divide-y">
            {allTeachers.map((teacher) => (
              <div key={teacher.uid} className="p-4 flex items-center gap-3">
                {teacher.photoURL ? (
                  <img src={teacher.photoURL} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                    {teacher.displayName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">{teacher.displayName}</p>
                  <p className="text-xs text-gray-400">{teacher.email}</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">
                  반 {teacher.classIds?.length || 0}개
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
