import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import DailyInput from '@/components/DailyInput';
import Dashboard from '@/components/Dashboard';
import HistoryView from '@/components/HistoryView';
import { ChallengeData, DailyEntry } from '@/types';

const STORAGE_KEY = '75-smart-challenge-data';
const MIGRATION_KEY = '75-smart-challenge-migration-v1';

// Migration function to convert time from minutes to seconds
const migrateTimeData = (data: ChallengeData): ChallengeData => {
  const migrated = { ...data };
  
  Object.keys(migrated.entries).forEach(date => {
    const entry = migrated.entries[date];
    // Check if time is likely in minutes (< 7200 seconds = 120 minutes)
    // This assumes no one runs for more than 2 hours, which is reasonable for most users
    if (entry.run.time > 0 && entry.run.time < 7200) {
      // Convert from minutes to seconds
      migrated.entries[date] = {
        ...entry,
        run: {
          ...entry.run,
          time: entry.run.time * 60
        }
      };
    }
  });
  
  return migrated;
};

function App() {
  const [isShareMode, setIsShareMode] = useState(false);
  const [challengeData, setChallengeData] = useState<ChallengeData>({
    startDate: new Date().toISOString().split('T')[0],
    entries: {},
    targetCalories: 2000,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const migrationComplete = localStorage.getItem(MIGRATION_KEY);
    
    if (savedData) {
      try {
        let data = JSON.parse(savedData);
        
        // Perform migration if not already done
        if (!migrationComplete) {
          data = migrateTimeData(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          localStorage.setItem(MIGRATION_KEY, 'true');
        }
        
        setChallengeData(data);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // ... existing code ... 