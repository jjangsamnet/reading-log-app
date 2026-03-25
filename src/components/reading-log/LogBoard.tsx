import { ReadingLog } from '../../types';
import LogCard from './LogCard';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface LogBoardProps {
  logs: ReadingLog[];
  classId: string;
  studentId: string;
  isOwner: boolean; // 본인의 보드인지
}

export default function LogBoard({ logs, classId, studentId, isOwner }: LogBoardProps) {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 min-h-[400px]">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* 새 독서록 작성 버튼 (본인만) */}
        {isOwner && (
          <button
            onClick={() => navigate(`/class/${classId}/write`)}
            className="bg-white rounded-xl border-2 border-dashed border-indigo-300
              flex flex-col items-center justify-center gap-2 min-h-[240px]
              hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center
              group-hover:bg-indigo-200 transition-colors">
              <Plus className="w-7 h-7 text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-indigo-600">새 독서록 작성</span>
          </button>
        )}

        {/* 독서록 카드 목록 */}
        {logs.map((log) => (
          <LogCard
            key={log.logId}
            log={log}
            onClick={() => navigate(`/class/${classId}/log/${log.logId}`)}
          />
        ))}

        {/* 비어있을 때 */}
        {logs.length === 0 && !isOwner && (
          <div className="col-span-full text-center py-20 text-gray-400">
            아직 작성된 독서록이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
