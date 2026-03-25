import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getClassData } from '../services/classService';
import { ClassData } from '../types';
import Header from '../components/common/Header';
import StudentGrid from '../components/class/StudentGrid';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeft, Copy, Check, BarChart3, Grid3X3, PenLine } from 'lucide-react';

export default function ClassroomPage() {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'grid' | 'dashboard'>('grid');

  const isTeacher = user?.role === 'teacher' && classData?.teacherId === user.uid;

  useEffect(() => {
    if (classId) loadClass();
  }, [classId]);

  const loadClass = async () => {
    setLoading(true);
    const data = await getClassData(classId!);
    setClassData(data);
    setLoading(false);
  };

  const copyCode = () => {
    if (classData) {
      navigator.clipboard.writeText(classData.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <><Header /><LoadingSpinner /></>;
  if (!classData) return <><Header /><div className="text-center py-20 text-gray-500">ë°ì ì°¾ì ì ììµëë¤.</div></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        {/* ìë¨ ì ë³´ ë° */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{classData.className}</h1>
                <p className="text-sm text-gray-500">{classData.teacherName} ì ìë Â· {classData.students.length}/{classData.maxStudents}ëª</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* ë° ì½ë */}
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg">
                <span className="text-xs text-gray-500">ë° ì½ë</span>
                <code className="font-mono font-bold text-indigo-600">{classData.inviteCode}</code>
                <button onClick={copyCode} className="text-gray-400 hover:text-indigo-600">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* ë·° ì í (êµì¬ë§) */}
              {isTeacher && (
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setView('grid')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                      view === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" /> êµì¤
                  </button>
                  <button
                    onClick={() => setView('dashboard')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                      view === 'dashboard' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> ëìë³´ë
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* êµì¤ ë°ëí ë·° */}
        {view === 'grid' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <StudentGrid classData={classData} currentUserId={user?.uid} />
          </div>
        )}

        {/* ëìë¡ ìì± íë¡í ë²í¼ */}
        <button
          onClick={() => navigate(`/class/${classId}/write`)}
          className="fixed bottom-8 right-8 flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 z-50"
        >
          <PenLine className="w-5 h-5" />
          <span className="font-semibold">ëìë¡ ìì±</span>
        </button>

        {/* êµì¬ ëìë³´ë ë·° */}
        {view === 'dashboard' && isTeacher && (
          <TeacherDashboard classData={classData} />
        )}
      </div>
    </div>
  );
}
