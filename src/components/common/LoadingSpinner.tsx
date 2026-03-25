import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = '불러오는 중...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}
