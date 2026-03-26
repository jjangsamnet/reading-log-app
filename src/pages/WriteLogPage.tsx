import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { createReadingLog, uploadCoverImage, uploadLogPhotos } from '../services/readingLogService';
import { ReadingLogInput } from '../types';
import Header from '../components/common/Header';
import LogForm from '../components/reading-log/LogForm';
import PhotoLogForm from '../components/reading-log/PhotoLogForm';
import { ArrowLeft, PenLine, Camera } from 'lucide-react';

type WriteMode = 'select' | 'text' | 'photo';

export default function WriteLogPage() {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<WriteMode>('select');

  const handleTextSubmit = async (data: ReadingLogInput, coverFile?: File) => {
    if (!user || !classId) return;

    let coverImage = '';
    if (coverFile) {
      coverImage = await uploadCoverImage(coverFile, user.uid);
    }

    await createReadingLog(user.uid, user.displayName, classId, {
      ...data,
      coverImage,
      logType: 'text',
    });

    navigate(`/class/${classId}/student/${user.uid}`);
  };

  const handlePhotoSubmit = async (data: ReadingLogInput, photoFiles: File[]) => {
    if (!user || !classId) return;

    let photoImages: string[] = [];
    if (photoFiles.length > 0) {
      photoImages = await uploadLogPhotos(photoFiles, user.uid);
    }

    await createReadingLog(user.uid, user.displayName, classId, {
      ...data,
      logType: 'photo',
      photoImages,
    });

    navigate(`/class/${classId}/student/${user.uid}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => mode === 'select' ? navigate(-1) : setMode('select')}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {mode === 'select' ? '새 독서록 작성' : mode === 'text' ? '웹으로 작성하기' : '사진으로 올리기'}
          </h1>
        </div>

        {mode === 'select' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 웹으로 작성하기 */}
            <button
              onClick={() => setMode('text')}
              className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col items-center gap-4
                hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100 transition-all group cursor-pointer"
            >
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center
                group-hover:bg-indigo-200 transition-colors">
                <PenLine className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800 mb-1">웹으로 작성하기</h2>
                <p className="text-sm text-gray-500">
                  키보드로 직접 독서록을 작성해요
                </p>
              </div>
              <span className="text-xs text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full font-medium">
                고학년 추천
              </span>
            </button>

            {/* 사진으로 올리기 */}
            <button
              onClick={() => setMode('photo')}
              className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col items-center gap-4
                hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100 transition-all group cursor-pointer"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center
                group-hover:bg-amber-200 transition-colors">
                <Camera className="w-10 h-10 text-amber-600" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800 mb-1">사진으로 올리기</h2>
                <p className="text-sm text-gray-500">
                  손글씨 독서록을 사진으로 찍어 올려요
                </p>
              </div>
              <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-medium">
                저학년 추천
              </span>
            </button>
          </div>
        )}

        {mode === 'text' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <LogForm onSubmit={handleTextSubmit} />
          </div>
        )}

        {mode === 'photo' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <PhotoLogForm onSubmit={handlePhotoSubmit} />
          </div>
        )}
      </div>
    </div>
  );
}
