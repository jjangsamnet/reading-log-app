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
      // êµì¬ ê¶í ìì²­ ì¤ì¸ ì¬ì©ì
      const pendingQ = query(collection(db, 'users'), where('pendingTeacher', '==', true));
      const pendingSnap = await getDocs(pendingQ);
      setPendingTeachers(pendingSnap.docs.map((d) => d.data() as UserProfile));

      // íì¬ êµì¬ ëª©ë¡
      const teacherQ = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const teacherSnap = await getDocs(teacherQ);
      setAllTeachers(teacherSnap.docs.map((d) => d.data() as UserProfile));

      // íµê³
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
      console.error('ê´ë¦¬ì ë°ì´í° ë¡ë ì¤í¨:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uid: string) => {
    try {
      setMessage(null);
      await approveTeacherRole(uid);
      setMessage({ type: 'success', text: 'êµì¬ ê¶íì´ ì¹ì¸ëììµëë¤.' });
      loadData();
    } catch (err) {
      console.error('êµì¬ ì¹ì¸ ì¤í¨:', err);
      setMessage({ type: 'error', text: 'ì¹ì¸ ì²ë¦¬ì ì¤í¨íìµëë¤.' });
    }
  };

  const handleReject = async (uid: string) => {
    try {
      setMessage(null);
      await rejectTeacherRole(uid);
      setMessage({ type: 'success', text: 'êµì¬ ìì²­ì´ ê±°ì ëììµëë¤.' });
      loadData();
    } catch (err) {
      console.error('êµì¬ ê±°ì  ì¤í¨:', err);
      setMessage({ type: 'error', text: 'ê±°ì  ì²ë¦¬ì ì¤í¨íìµëë¤.' });
    }
  };

  if (loading) return <><Header /><LoadingSpinner /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-7 h-7 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800">ê´ë¦¬ì í¨ë</h1>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-sm text-center mb-4 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        {/* íµê³ ì¹´ë */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4 text-center">
            <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.teachers}</div>
            <p className="text-xs text-gray-400">êµì¬</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <School className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.classes}</div>
            <p className="text-xs text-gray-400">ë°</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.students}</div>
            <p className="text-xs text-gray-400">íì</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <BookOpen className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.logs}</div>
            <p className="text-xs text-gray-400">ëìë¡</p>
          </div>
        </div>

        {/* êµì¬ ê¶í ìì²­ */}
        <div className="bg-white rounded-xl border mb-6">
          <div className="p-5 border-b">
            <h2 className="font-bold text-gray-700">êµì¬ ê¶í ìì²­ ({pendingTeachers.length})</h2>
          </div>
          {pendingTeachers.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">ëê¸° ì¤ì¸ ìì²­ì´ ììµëë¤.</div>
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
                      <Check className="w-4 h-4" /> ì¹ì¸
                    </button>
                    <button
                      onClick={() => handleReject(teacher.uid)}
                      className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      <X className="w-4 h-4" /> ê±°ì 
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* íì¬ êµì¬ ëª©ë¡ */}
        <div className="bg-white rounded-xl border">
          <div className="p-5 border-b">
            <h2 className="font-bold text-gray-700">ë±ë¡ë êµì¬ ({allTeachers.length})</h2>
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
                  ë° {teacher.classIds?.length || 0}ê°
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
