import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from './firebase';
import { ReadingLog, ReadingLogInput } from '../types';

// 독서록 생성
export async function createReadingLog(
  studentId: string,
  studentName: string,
  classId: string,
  input: ReadingLogInput
): Promise<string> {
  const logRef = doc(collection(db, 'readingLogs'));
  const now = Date.now();

  const logData: ReadingLog = {
    logId: logRef.id,
    studentId,
    studentName,
    classId,
    bookTitle: input.bookTitle,
    bookAuthor: input.bookAuthor,
    coverImage: input.coverImage || '',
    readDate: input.readDate,
    rating: input.rating,
    summary: input.summary,
    impressiveScene: input.impressiveScene,
    favoriteQuote: input.favoriteQuote || '',
    thoughts: input.thoughts,
    recommendation: input.recommendation || '',
    logType: input.logType || 'text',
    photoImages: input.photoImages || [],
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(logRef, logData);
  await updateStudentLogCount(classId, studentId);
  return logRef.id;
}

export async function updateReadingLog(
  logId: string,
  updates: Partial<ReadingLogInput>
): Promise<void> {
  const logRef = doc(db, 'readingLogs', logId);
  await updateDoc(logRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteReadingLog(logId: string, classId: string, studentId: string): Promise<void> {
  const logRef = doc(db, 'readingLogs', logId);
  await deleteDoc(logRef);
  await updateStudentLogCount(classId, studentId);
}

export async function getStudentLogs(
  studentId: string,
  classId: string
): Promise<ReadingLog[]> {
  const q = query(
    collection(db, 'readingLogs'),
    where('studentId', '==', studentId),
    where('classId', '==', classId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ReadingLog);
}

export async function getAllStudentLogs(studentId: string): Promise<ReadingLog[]> {
  const q = query(
    collection(db, 'readingLogs'),
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ReadingLog);
}

export async function getClassLogs(classId: string): Promise<ReadingLog[]> {
  const q = query(
    collection(db, 'readingLogs'),
    where('classId', '==', classId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ReadingLog);
}

export async function getLogDetail(logId: string): Promise<ReadingLog | null> {
  const logRef = doc(db, 'readingLogs', logId);
  const logSnap = await getDoc(logRef);
  if (!logSnap.exists()) return null;
  return logSnap.data() as ReadingLog;
}

export function subscribeToStudentLogs(
  studentId: string,
  classId: string,
  callback: (logs: ReadingLog[]) => void
) {
  const q = query(
    collection(db, 'readingLogs'),
    where('studentId', '==', studentId),
    where('classId', '==', classId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => doc.data() as ReadingLog);
    callback(logs);
  });
}

export async function uploadCoverImage(
  file: File,
  studentId: string
): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `covers/${studentId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadLogPhotos(
  files: File[],
  studentId: string
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split('.').pop();
    const fileName = `log-photos/${studentId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  return urls;
}

async function updateStudentLogCount(classId: string, studentId: string) {
  const q = query(
    collection(db, 'readingLogs'),
    where('studentId', '==', studentId),
    where('classId', '==', classId)
  );
  const snapshot = await getDocs(q);
  const count = snapshot.size;
  const classRef = doc(db, 'classes', classId);
  const classSnap = await getDoc(classRef);
  if (!classSnap.exists()) return;
  const classData = classSnap.data();
  const updatedStudents = classData.students.map((s: any) =>
    s.uid === studentId ? { ...s, logCount: count } : s
  );
  await updateDoc(classRef, { students: updatedStudents });
}
