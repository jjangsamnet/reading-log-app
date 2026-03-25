import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { onAuthChange, getUserProfile } from './services/authService';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import TeacherPage from './pages/TeacherPage';
import StudentPage from './pages/StudentPage';
import ClassroomPage from './pages/ClassroomPage';
import StudentBoardPage from './pages/StudentBoardPage';
import WriteLogPage from './pages/WriteLogPage';
import LogDetailPage from './pages/LogDetailPage';

function AppContent() {
  const { user, loading, setUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingSpinner message="앱 불러오는 중..." />;

  const HomeRedirect = () => {
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'teacher') return <Navigate to="/teacher" />;
    return <Navigate to="/student" />;
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherPage /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student', 'teacher']}><StudentPage /></ProtectedRoute>} />
      <Route path="/class/:classId" element={<ProtectedRoute><ClassroomPage /></ProtectedRoute>} />
      <Route path="/class/:classId/student/:studentId" element={<ProtectedRoute><StudentBoardPage /></ProtectedRoute>} />
      <Route path="/class/:classId/write" element={<ProtectedRoute><WriteLogPage /></ProtectedRoute>} />
      <Route path="/class/:classId/log/:logId" element={<ProtectedRoute><LogDetailPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
