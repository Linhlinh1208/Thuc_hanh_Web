import { STORAGE_KEYS } from '@/constants/storage';
import type { Subject, Progress, Goal } from '@/constants/storage';

export const getStorageData = (key: keyof typeof STORAGE_KEYS) => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS[key]);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

export const setStorageData = (key: keyof typeof STORAGE_KEYS, data: Subject[] | Progress[] | Goal[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};
