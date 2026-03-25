import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getLogDetail, deleteReadingLog } from '../services/readingLogService';
import { ReadingLog } from '../types';
import Header from '../components/common/Header';
import LogDetail from '../components/reading-log/LogDetail';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LogDetailPage() {
  const { classId, logId } = useParams<{ classId: string; logId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [log, setLog] = useState<ReadingLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLog();
  }, [logId]);

  const loadLog = async () => {
    setLoading(true);
    const data = await getLogDetail(logId!);
    setLog(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!log) return;
    await deleteReadingLog(log.logId, log.classId, log.studentId);
    navigate(`/class/${classId}/student/${log.studentId}`);
  };

  if (loading) return <><Header /><LoadingSpinner /></>;
  if (!log) return <><Header /><div className="text-center py-20 text-gray-500">독서록을 찾을 수 없습니다.</div></>;

  const isOwner = user?.uid === log.studentId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <LogDetail
          log={log}
          isOwner={isOwner}
          onBack={() => navigate(`/class/${classId}/student/${log.studentId}`)}
          onEdit={() => {/* TODO: 수정 페이지로 이동 */}}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
