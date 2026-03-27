import { getGemLevel, getNextGemLevel, getProgressToNextLevel } from '../../utils/gemLevels';

interface GemBadgeProps {
  logCount: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function GemBadge({ logCount, showProgress = false, size = 'md' }: GemBadgeProps) {
  const level = getGemLevel(logCount);
  const nextLevel = getNextGemLevel(logCount);
  const progress = getProgressToNextLevel(logCount);

  const sizeClasses = {
    sm: 'text-lg px-2 py-1',
    md: 'text-2xl px-3 py-2',
    lg: 'text-4xl px-4 py-3',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`inline-flex items-center gap-2 rounded-xl font-bold ${sizeClasses[size]}`}
        style={{ backgroundColor: level.bgColor, color: level.color }}
      >
        <span>{level.emoji}</span>
        <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}>
          {level.nameKo}
        </span>
      </div>

      {showProgress && nextLevel && (
        <div className="w-full max-w-[200px]">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{logCount}편</span>
            <span>다음: {nextLevel.nameKo} ({nextLevel.minLogs}편)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: level.color }}
            />
          </div>
        </div>
      )}

      {showProgress && !nextLevel && (
        <p className="text-xs text-indigo-600 font-semibold">최고 등급 달성!</p>
      )}

      {showProgress && (
        <p className="text-xs text-gray-500 mt-1">{level.description}</p>
      )}
    </div>
  );
}
