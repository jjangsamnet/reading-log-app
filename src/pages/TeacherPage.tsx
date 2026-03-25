import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getTeacherClasses, createClass } from '../services/classService';
import { ClassData } from '../types';
import Header from '../components/common/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Users, BookOpen, Copy, Check } from 'lucide-react';

export default function TeacherPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [maxStudents, setMaxStudents] = useState(25);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadClasses();
  }, [user]);

  const loadClasses = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getTeacherClasses(user.uid);
    setClasses(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !newClassName.trim()) return;
    setCreating(true);
    try {
      await createClass(user.uid, user.displayName, newClassName.trim(), maxStudents);
      setNewClassName('');
      setShowCreate(false);
      loadClasses();
    } catch (err) {
      alert('반 생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) return <><Header /><LoadingSpinner /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto p-6">
        {/* 상단 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">내 교실</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm
              hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            새 반 만들기
          </button>
        </div>

        {/* 반 생성 모달 */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-4">새 반 만들기</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">반 이름</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="예: 6학년 2반 독서교실"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">최대 인원</label>
                  <select
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                  >
                    <option value={25}>25명 (5×5)</option>
                    <option value={30}>30명 (5×6)</option>
                    <option value={35}>35명 (5×7)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newClassName.trim()}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  {creating ? '생성 중...' : '만들기'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 반 목록 */}
        {classes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-500 mb-2">아직 만든 반이 없습니다.</p>
            <p className="text-gray-400 text-sm">"새 반 만들기" 버튼을 눌러 시작하세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.classId}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/class/${cls.classId}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800">{cls.className}</h3>
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                    {cls.gridLayout}
                  </span>
                </div>

                {/* 반 코드 */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-400">반 코드:</span>
                  <code className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {cls.inviteCode}
                  </code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCode(cls.inviteCode);
                    }}
                    className="text-gray-400 hover:text-indigo-600"
                    title="복사"
                  >
                    {copiedCode === cls.inviteCode ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {cls.students.length}/{cls.maxStudents}명
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {cls.students.reduce((acc, s) => acc + s.logCount, 0)}편
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
