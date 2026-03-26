import { useState } from 'react';
import { ReadingLog } from '../../types';
import StarRating from '../common/StarRating';
import { formatDate } from '../../utils/helpers';
import { ArrowLeft, Edit, Trash2, BookOpen, Quote, Lightbulb, ThumbsUp, Sparkles, Camera, X } from 'lucide-react';

interface LogDetailProps {
  log: ReadingLog;
  isOwner: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function LogDetail({ log, isOwner, onBack, onEdit, onDelete }: LogDetailProps) {
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const isPhotoLog = log.logType === 'photo';

  return (
    <div className="max-w-2xl mx-auto">
      {/* 사진 확대 보기 모달 */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <button
            onClick={() => setViewingPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={viewingPhoto}
            alt="독서록 사진"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">돌아가기</span>
        </button>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Edit className="w-4 h-4" />
              수정
            </button>
            <button
              onClick={() => {
                if (confirm('정말 삭제하시겠습니까?')) onDelete?.();
              }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 책 정보 카드 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* 커버 이미지 */}
        {log.coverImage ? (
          <div className="h-52 overflow-hidden">
            <img src={log.coverImage} alt={log.bookTitle} className="w-full h-full object-cover" />
          </div>
        ) : isPhotoLog && log.photoImages?.length > 0 ? (
          <div className="h-52 overflow-hidden">
            <img src={log.photoImages[0]} alt={log.bookTitle} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-52 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            {isPhotoLog ? (
              <Camera className="w-16 h-16 text-white/70" />
            ) : (
              <BookOpen className="w-16 h-16 text-white/70" />
            )}
          </div>
        )}

        <div className="p-6">
          {/* 제목 & 메타 */}
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-800">{log.bookTitle}</h1>
            {isPhotoLog && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                사진
              </span>
            )}
          </div>
          <p className="text-gray-500 mb-3">{log.bookAuthor} · {formatDate(log.readDate)}</p>
          <StarRating rating={log.rating} size="md" readonly />

          {/* 구분선 */}
          <hr className="my-6 border-gray-100" />

          {/* 사진 로그일 경우 사진 갤러리 표시 */}
          {isPhotoLog && log.photoImages?.length > 0 && (
            <div className="mb-6">
              <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-3">
                <Camera className="w-5 h-5 text-amber-500" />
                독서록 사진
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {log.photoImages.map((url, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setViewingPhoto(url)}
                  >
                    <img
                      src={url}
                      alt={`독서록 사진 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 텍스트 로그일 경우 기존 필드 표시 */}
          {!isPhotoLog && (
            <>
              <div className="mb-6">
                <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-3">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  줄거리 요약
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{log.summary}</p>
              </div>

              <div className="mb-6">
                <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  인상 깊은 장면
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{log.impressiveScene}</p>
              </div>

              {log.favoriteQuote && (
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-3">
                    <Quote className="w-5 h-5 text-pink-500" />
                    좋아하는 구절
                  </h3>
                  <blockquote className="border-l-4 border-pink-300 pl-4 italic text-gray-600">
                    &ldquo;{log.favoriteQuote}&rdquo;
                  </blockquote>
                </div>
              )}
            </>
          )}

          {/* 나의 생각 (텍스트/사진 공통) */}
          {log.thoughts && (
            <div className="mb-6">
              <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-3">
                <Lightbulb className="w-5 h-5 text-emerald-500" />
                {isPhotoLog ? '한마디' : '나의 생각'}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{log.thoughts}</p>
            </div>
          )}

          {/* 추천 이유 (텍스트만) */}
          {!isPhotoLog && log.recommendation && (
            <div className="mb-4">
              <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-3">
                <ThumbsUp className="w-5 h-5 text-blue-500" />
                추천 이유
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{log.recommendation}</p>
            </div>
          )}

          {/* 작성 정보 */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
            작성: {formatDate(log.createdAt)}
            {log.updatedAt !== log.createdAt && ` · 수정: ${formatDate(log.updatedAt)}`}
          </div>
        </div>
      </div>
    </div>
  );
}
