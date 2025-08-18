export interface DailyEntry {
  date: string; // ISO date string
  weight: number;
  calories: number;
  run: RunData;
  additionalWorkout: AdditionalWorkoutData;
}

export interface RunData {
  time: number; // in seconds
  distance: number; // in miles
  calories: number;
  avgPacePerMile: string; // "MM:SS" format
  elevationGain: number; // in feet
  avgHeartRate: number; // bpm
}

export interface AdditionalWorkoutData {
  type: 'strength' | 'recovery';
  length: number; // in minutes
  calories: number;
  avgHeartRate: number; // bpm
}

export interface ChallengeData {
  startDate: string; // ISO date string
  entries: Record<string, DailyEntry>; // key is date string
  targetCalories: number; // default 2000
}

export interface ChartDataPoint {
  day: number;
  weight?: number;
  calories?: number;
  runTime?: number;
  runDistance?: number;
  workoutCalories?: number;
  totalCalories?: number;
} 