import { useAuthStore } from '../../stores/authStore';
import { signOut } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Home } from 'lucide-react';

export default function Header() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg text-gray-800">우리 반 독서록</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
        >
          <Home className="w-4 h-4" />
          홈
        </button>
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {user.displayName?.charAt(0)}
            </div>
          )}
          <span className="text-sm text-gray-600">{user.displayName}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {user.role === 'admin' ? '관리자' : user.role === 'teacher' ? '교사' : '학생'}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="로그아웃"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
