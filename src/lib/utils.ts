import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Time conversion utilities for MM:SS format
export function secondsToTimeString(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function timeStringToSeconds(timeString: string): number {
  if (!timeString || timeString.trim() === '') return 0;
  
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;
  
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  
  return minutes * 60 + seconds;
}

export function validateTimeString(timeString: string): boolean {
  if (!timeString || timeString.trim() === '') return false;
  
  // Allow MM:SS format where minutes can be any number and seconds 0-59
  const timeRegex = /^\d+:[0-5]\d$/;
  if (!timeRegex.test(timeString)) return false;
  
  // Additional validation: seconds should not exceed 59
  const parts = timeString.split(':');
  const seconds = parseInt(parts[1], 10);
  return seconds >= 0 && seconds <= 59;
} 