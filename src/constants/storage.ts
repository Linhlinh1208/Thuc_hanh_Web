export const STORAGE_KEYS = {
  SUBJECTS: 'learning_subjects',
  PROGRESS: 'learning_progress',
  GOALS: 'monthly_goals'
};

export interface Subject {
  id: number;
  name: string;
}

export interface Progress {
  id: number;
  subjectId: number;
  date: string;
  duration: number;
  content: string;
  notes?: string;
}

export interface Goal {
  id: number;
  subjectId: number;
  targetHours: number;
  month: number;
  year: number;
}