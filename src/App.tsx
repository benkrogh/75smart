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

  // Save data to localStorage whenever challengeData changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challengeData));
  }, [challengeData]);

  // Check URL for share mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsShareMode(urlParams.get('share') === 'true');
  }, []);

  const handleSaveEntry = (entry: DailyEntry) => {
    setChallengeData(prev => ({
      ...prev,
      entries: {
        ...prev.entries,
        [entry.date]: entry,
      },
    }));
  };

  const handleUpdateEntry = (entry: DailyEntry) => {
    setChallengeData(prev => ({
      ...prev,
      entries: {
        ...prev.entries,
        [entry.date]: entry,
      },
    }));
  };

  const handleDeleteEntry = (date: string) => {
    setChallengeData(prev => {
      const newEntries = { ...prev.entries };
      delete newEntries[date];
      return {
        ...prev,
        entries: newEntries,
      };
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=true`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Shareable link copied to clipboard!');
    });
  };

  const getCurrentDay = () => {
    if (!challengeData.startDate) return 1;
    const start = new Date(challengeData.startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, 75);
  };

  if (isShareMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              75 SMART Challenge
            </h1>
            <p className="text-lg text-muted-foreground">
              Sustainable Momentum And Real Transformation
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium">Day {getCurrentDay()} of 75</span>
              <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${(getCurrentDay() / 75) * 100}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {Math.round((getCurrentDay() / 75) * 100)}%
              </span>
            </div>
          </div>
          <Dashboard challengeData={challengeData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              75 SMART Challenge
            </h1>
            <p className="text-lg text-muted-foreground">
              Sustainable Momentum And Real Transformation
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium">Day {getCurrentDay()} of 75</span>
              <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${(getCurrentDay() / 75) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round((getCurrentDay() / 75) * 100)}%
              </span>
            </div>
          </div>
          <Button onClick={handleShare} variant="outline" className="gap-2 shrink-0">
            <Share2 className="h-4 w-4" />
            Share Dashboard
          </Button>
        </div>

        <Tabs defaultValue="input" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-11">
            <TabsTrigger value="input" className="text-sm font-medium">Daily Input</TabsTrigger>
            <TabsTrigger value="history" className="text-sm font-medium">History</TabsTrigger>
            <TabsTrigger value="dashboard" className="text-sm font-medium">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Entry</CardTitle>
                <CardDescription>
                  Track your daily progress for the 75 SMART Challenge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DailyInput
                  onSave={handleSaveEntry}
                  existingEntry={challengeData.entries[new Date().toISOString().split('T')[0]]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <HistoryView 
              challengeData={challengeData}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard challengeData={challengeData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App; 