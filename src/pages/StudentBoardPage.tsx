import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getClassData } from '../services/classService';
import { getStudentLogs } from '../services/readingLogService';
import { ClassData, ReadingLog } from '../types';
import Header from '../components/common/Header';
import LogBoard from '../components/reading-log/LogBoard';
import GemBadge from '../components/common/GemBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function StudentBoardPage() {
  const { classId, studentId } = useParams<{ classId: string; studentId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = user?.uid === studentId;
  const student = classData?.students.find((s) => s.uid === studentId);

  useEffect(() => {
    if (classId && studentId) loadData();
  }, [classId, studentId]);

  const loadData = async () => {
    if (!classId || !studentId) return;
    setLoading(true);
    try {
      const [cls, studentLogs] = await Promise.all([
        getClassData(classId),
        getStudentLogs(studentId, classId),
      ]);
      setClassData(cls);
      setLogs(studentLogs);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <><Header /><LoadingSpinner /></>;
  if (!classData || !student) return <><Header /><div className="text-center py-20 text-gray-500">학생을 찾을 수 없습니다.</div></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        {/* 학생 프로필 헤더 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/class/${classId}`)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {student.photoURL ? (
                <img src={student.photoURL} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">
                  {student.displayName.charAt(0)}
                </div>
              )}

              <div>
                <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {student.displayName}의 독서록
                  {isOwner && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">나</span>}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  총 {logs.length}편
                </p>
              </div>
            </div>

            <GemBadge logCount={logs.length} showProgress size="md" />
          </div>
        </div>

        {/* 독서록 보드 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <LogBoard
            logs={logs}
            classId={classId!}
            studentId={studentId!}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
}
