import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { UserProfile, UserRole } from '../types';

// Google 로그인
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Firestore에 사용자 프로필 생성/업데이트
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // 신규 사용자: 기본 role은 student
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '이름없음',
      photoURL: user.photoURL || '',
      role: 'student' as UserRole,
      classIds: [],
      pendingTeacher: false,
      createdAt: Date.now(),
    });
  } else {
    // 기존 사용자: 프로필 정보만 업데이트
    await updateDoc(userRef, {
      email: user.email,
      displayName: user.displayName || userSnap.data().displayName,
      photoURL: user.photoURL || userSnap.data().photoURL,
    });
  }

  return user;
}

// 로그아웃
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// 사용자 프로필 조회
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;
  return userSnap.data() as UserProfile;
}

// 교사 권한 요청
export async function requestTeacherRole(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    pendingTeacher: true,
  });
}

// 교사 권한 승인 (관리자 전용)
export async function approveTeacherRole(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    role: 'teacher' as UserRole,
    pendingTeacher: false,
  });
}

// 교사 권한 거절 (관리자 전용)
export async function rejectTeacherRole(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    pendingTeacher: false,
  });
}

// Auth 상태 리스너
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
