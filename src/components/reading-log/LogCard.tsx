import { ReadingLog } from '../../types';
import StarRating from '../common/StarRating';
import { formatDate } from '../../utils/helpers';
import { BookOpen, Camera } from 'lucide-react';

interface LogCardProps {
  log: ReadingLog;
  onClick?: () => void;
}

const gradients = [
  'from-indigo-300 to-indigo-500',
  'from-pink-300 to-rose-500',
  'from-emerald-300 to-green-500',
  'from-amber-300 to-orange-500',
  'from-violet-300 to-purple-500',
  'from-cyan-300 to-teal-500',
  'from-red-300 to-red-500',
  'from-blue-300 to-blue-500',
];

function getGradient(title: string): string {
  const idx = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[idx % gradients.length];
}

export default function LogCard({ log, onClick }: LogCardProps) {
  const isPhotoLog = log.logType === 'photo';
  const thumbnailUrl = log.coverImage || (isPhotoLog && log.photoImages?.length > 0 ? log.photoImages[0] : '');
  const previewText = log.thoughts || log.summary || '';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer
        hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
    >
      {/* 책 커버 / 사진 썸네일 */}
      {thumbnailUrl ? (
        <div className="h-36 overflow-hidden relative">
          <img
            src={thumbnailUrl}
            alt={log.bookTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isPhotoLog && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Camera className="w-3 h-3" />
              사진
            </div>
          )}
        </div>
      ) : (
        <div
          className={`h-36 bg-gradient-to-br ${getGradient(log.bookTitle)} flex items-center justify-center relative`}
        >
          {isPhotoLog ? (
            <Camera className="w-12 h-12 text-white/80" />
          ) : (
            <BookOpen className="w-12 h-12 text-white/80" />
          )}
          {isPhotoLog && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Camera className="w-3 h-3" />
              사진
            </div>
          )}
        </div>
      )}

      {/* 카드 내용 */}
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-800 line-clamp-1 mb-1">{log.bookTitle}</h3>
        <p className="text-xs text-gray-500 mb-2">{log.bookAuthor} · {formatDate(log.readDate)}</p>
        <StarRating rating={log.rating} size="sm" readonly />
        {previewText && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            &ldquo;{previewText.substring(0, 60)}...&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
