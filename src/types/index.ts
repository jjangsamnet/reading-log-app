// ========================================
// 독서록 작성 프로그램 - 타입 정의
// ========================================

export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  classIds: string[];
  pendingTeacher?: boolean; // 교사 권한 요청 대기 중
  createdAt: number;
}

export interface SeatPosition {
  row: number;
  col: number;
}

export interface ClassStudent {
  uid: string;
  displayName: string;
  photoURL: string;
  seat: SeatPosition;
  logCount: number;
}

export interface ClassData {
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  inviteCode: string;
  gridLayout: string; // "5x5" | "5x6" | "5x7"
  students: ClassStudent[];
  maxStudents: number;
  isActive: boolean;
  createdAt: number;
}

export interface ReadingLog {
  logId: string;
  studentId: string;
  studentName: string;
  classId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImage: string;
  readDate: number;
  rating: number; // 1~5
  summary: string;
  impressiveScene: string;
  favoriteQuote: string;
  thoughts: string;
  recommendation: string;
  logType: 'text' | 'photo'; // 'text': 웹 작성, 'photo': 사진 업로드
  photoImages: string[]; // 사진 업로드 시 이미지 URLs
  createdAt: number;
  updatedAt: number;
}

export interface ReadingLogInput {
  bookTitle: string;
  bookAuthor: string;
  coverImage?: string;
  readDate: number;
  rating: number;
  summary: string;
  impressiveScene: string;
  favoriteQuote?: string;
  thoughts: string;
  recommendation?: string;
  logType?: 'text' | 'photo';
  photoImages?: string[];
}

// 보석 등급 시스템 (10단계)
export interface GemLevel {
  level: number;
  name: string;
  nameKo: string;
  emoji: string;
  color: string;
  bgColor: string;
  minLogs: number;
  description: string;
}

// 교사 대시보드 통계
export interface ClassStats {
  totalStudents: number;
  totalLogs: number;
  averageLogsPerStudent: number;
  activeStudentsThisWeek: number;
  activeStudentsThisMonth: number;
  topReaders: { name: string; count: number; uid: string }[];
  monthlyTrend: { month: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
}

export interface StudentProgress {
  uid: string;
  displayName: string;
  photoURL: string;
  totalLogs: number;
  gemLevel: GemLevel;
  lastLogDate: number | null;
  thisMonthLogs: number;
  averageRating: number;
}
