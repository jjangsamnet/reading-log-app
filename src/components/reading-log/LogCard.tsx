import { ReadingLog } from '../../types';
import StarRating from '../common/StarRating';
import { formatDate } from '../../utils/helpers';
import { BookOpen } from 'lucide-react';

interface LogCardProps {
  log: ReadingLog;
  onClick?: () => void;
}

// 랜덤 그라데이션 색상 (커버 이미지 없을 때)
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
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer
        hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
    >
      {/* 책 커버 */}
      {log.coverImage ? (
        <div className="h-36 overflow-hidden">
          <img
            src={log.coverImage}
            alt={log.bookTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div
          className={`h-36 bg-gradient-to-br ${getGradient(log.bookTitle)} flex items-center justify-center`}
        >
          <BookOpen className="w-12 h-12 text-white/80" />
        </div>
      )}

      {/* 카드 내용 */}
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-800 line-clamp-1 mb-1">{log.bookTitle}</h3>
        <p className="text-xs text-gray-500 mb-2">{log.bookAuthor} · {formatDate(log.readDate)}</p>
        <StarRating rating={log.rating} size="sm" readonly />
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
          &ldquo;{log.thoughts.substring(0, 60)}...&rdquo;
        </p>
      </div>
    </div>
  );
}
