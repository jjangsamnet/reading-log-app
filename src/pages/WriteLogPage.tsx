import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { createReadingLog, uploadCoverImage } from '../services/readingLogService';
import { ReadingLogInput } from '../types';
import Header from '../components/common/Header';
import LogForm from '../components/reading-log/LogForm';
import { ArrowLeft } from 'lucide-react';

export default function WriteLogPage() {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: ReadingLogInput, coverFile?: File) => {
    if (!user || !classId) return;

    setSubmitting(true);
    setError('');
    try {
      let coverImage = '';
      if (coverFile) {
        coverImage = await uploadCoverImage(coverFile, user.uid);
      }

      await createReadingLog(user.uid, user.displayName, classId, {
        ...data,
        coverImage,
      });

      navigate(`/class/${classId}/student/${user.uid}`);
    } catch (err: any) {
      setError(err.message || '독서록 저장에 실패했습니다. 다시 시도해주세요.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">새 독서록 작성</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <LogForm onSubmit={handleSubmit} disabled={submitting} />
        </div>
      </div>
    </div>
  );
}
