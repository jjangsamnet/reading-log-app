import { create } from 'zustand';
import { ClassData } from '../types';

interface ClassState {
  currentClass: ClassData | null;
  myClasses: ClassData[];
  setCurrentClass: (cls: ClassData | null) => void;
  setMyClasses: (classes: ClassData[]) => void;
}

export const useClassStore = create<ClassState>((set) => ({
  currentClass: null,
  myClasses: [],
  setCurrentClass: (cls) => set({ currentClass: cls }),
  setMyClasses: (classes) => set({ myClasses: classes }),
}));
