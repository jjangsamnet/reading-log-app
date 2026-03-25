import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';
import { ClassData, ClassStudent } from '../types';
import { generateInviteCode, getGridLayout, findNextEmptySeat } from '../utils/helpers';

// 반 생성 (교사 전용)
export async function createClass(
  teacherId: string,
  teacherName: string,
  className: string,
  maxStudents: number = 25
): Promise<ClassData> {
  const classRef = doc(collection(db, 'classes'));
  const inviteCode = generateInviteCode();

  const classData: ClassData = {
    classId: classRef.id,
    className,
    teacherId,
    teacherName,
    inviteCode,
    gridLayout: getGridLayout(maxStudents),
    students: [],
    maxStudents,
    isActive: true,
    createdAt: Date.now(),
  };

  await setDoc(classRef, classData);

  // 교사 프로필에 반 ID 추가
  const teacherRef = doc(db, 'users', teacherId);
  await updateDoc(teacherRef, {
    classIds: arrayUnion(classRef.id),
  });

  return classData;
}

// 초대 코드로 반 검색
export async function findClassByCode(inviteCode: string): Promise<ClassData | null> {
  const q = query(
    collection(db, 'classes'),
    where('inviteCode', '==', inviteCode.toUpperCase()),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as ClassData;
}

// 반에 학생 참여
export async function joinClass(
  classId: string,
  studentUid: string,
  studentName: string,
  studentPhoto: string
): Promise<void> {
  const classRef = doc(db, 'classes', classId);
  const classSnap = await getDoc(classRef);

  if (!classSnap.exists()) throw new Error('반을 찾을 수 없습니다.');

  const classData = classSnap.data() as ClassData;

  // 이미 참여 중인지 확인
  if (classData.students.some((s) => s.uid === studentUid)) {
    return; // 이미 참여중
  }

  // 최대 인원 확인
  if (classData.students.length >= classData.maxStudents) {
    throw new Error('반 인원이 가득 찼습니다.');
  }

  // 다음 빈 좌석 찾기
  const seat = findNextEmptySeat(classData.students, classData.gridLayout);
  if (!seat) throw new Error('빈 좌석이 없습니다.');

  const newStudent: ClassStudent = {
    uid: studentUid,
    displayName: studentName,
    photoURL: studentPhoto,
    seat,
    logCount: 0,
  };

  // 반에 학생 추가
  await updateDoc(classRef, {
    students: arrayUnion(newStudent),
    gridLayout: getGridLayout(classData.students.length + 1),
  });

  // 학생 프로필에 반 ID 추가
  const studentRef = doc(db, 'users', studentUid);
  await updateDoc(studentRef, {
    classIds: arrayUnion(classId),
  });
}

// 반 정보 조회
export async function getClassData(classId: string): Promise<ClassData | null> {
  const classRef = doc(db, 'classes', classId);
  const classSnap = await getDoc(classRef);

  if (!classSnap.exists()) return null;
  return classSnap.data() as ClassData;
}

// 교사의 반 목록 조회
export async function getTeacherClasses(teacherId: string): Promise<ClassData[]> {
  const q = query(
    collection(db, 'classes'),
    where('teacherId', '==', teacherId),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ClassData);
}

// 학생의 반 목록 조회
export async function getStudentClasses(studentUid: string): Promise<ClassData[]> {
  const userRef = doc(db, 'users', studentUid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return [];

  const classIds = userSnap.data().classIds || [];
  const classes: ClassData[] = [];

  for (const id of classIds) {
    const classData = await getClassData(id);
    if (classData && classData.isActive) {
      classes.push(classData);
    }
  }

  return classes;
}

// 초대 코드 재생성
export async function regenerateInviteCode(classId: string): Promise<string> {
  const newCode = generateInviteCode();
  const classRef = doc(db, 'classes', classId);
  await updateDoc(classRef, { inviteCode: newCode });
  return newCode;
}

// 학생 좌석 배치 변경
export async function updateStudentSeat(
  classId: string,
  studentUid: string,
  newSeat: { row: number; col: number }
): Promise<void> {
  const classRef = doc(db, 'classes', classId);
  const classSnap = await getDoc(classRef);
  if (!classSnap.exists()) return;

  const classData = classSnap.data() as ClassData;
  const updatedStudents = classData.students.map((s) =>
    s.uid === studentUid ? { ...s, seat: newSeat } : s
  );

  await updateDoc(classRef, { students: updatedStudents });
}
