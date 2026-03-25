import { useNavigate } from 'react-router-dom';
import { ClassData, ClassStudent } from '../../types';
import { parseGridLayout } from '../../utils/helpers';
import { getGemLevel } from '../../utils/gemLevels';
import { BookOpen } from 'lucide-react';

interface StudentGridProps {
  classData: ClassData;
  currentUserId?: string;
}

export default function StudentGrid({ classData, currentUserId }: StudentGridProps) {
  const navigate = useNavigate();
  const { cols, rows } = parseGridLayout(classData.gridLayout);

  // 좌석 맵 생성
  const seatMap = new Map<string, ClassStudent>();
  classData.students.forEach((student) => {
    seatMap.set(`${student.seat.row}-${student.seat.col}`, student);
  });

  const handleStudentClick = (student: ClassStudent) => {
    navigate(`/class/${classData.classId}/student/${student.uid}`);
  };

  return (
    <div className="p-4">
      <div
        className="grid gap-3 max-w-4xl mx-auto"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: rows * cols }).map((_, idx) => {
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          const student = seatMap.get(`${row}-${col}`);

          if (student) {
            const gemLevel = getGemLevel(student.logCount);
            const isMe = student.uid === currentUserId;

            return (
              <button
                key={`student-${student.uid}`}
                onClick={() => handleStudentClick(student)}
                className={`
                  relative aspect-square rounded-xl p-2 flex flex-col items-center justify-center
                  transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer
                  ${isMe
                    ? 'bg-indigo-50 border-2 border-indigo-400 ring-2 ring-indigo-200'
                    : 'bg-white border border-gray-200 hover:border-indigo-300'
                  }
                `}
              >
                {/* 보석 등급 뱃지 */}
                <div className="absolute -top-1 -right-1 text-sm">{gemLevel.emoji}</div>

                {/* 아바타 */}
                {student.photoURL ? (
                  <img
                    src={student.photoURL}
                    alt={student.displayName}
                    className="w-10 h-10 rounded-full mb-1"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full mb-1 flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: gemLevel.color }}
                  >
                    {student.displayName.charAt(0)}
                  </div>
                )}

                {/* 이름 */}
                <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
                  {student.displayName}
                </span>

                {/* 독서록 수 */}
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                  <BookOpen className="w-3 h-3" />
                  {student.logCount}편
                </span>

                {isMe && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    나
                  </span>
                )}
              </button>
            );
          }

          // 빈 자리
          return (
            <div
              key={`empty-${row}-${col}`}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50"
            >
              <span className="text-gray-300 text-xs">빈 자리</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
