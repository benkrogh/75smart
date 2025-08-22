import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Download } from 'lucide-react';
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

  // Load data from data.json first, then localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to fetch from public data.json first
        const response = await fetch('/data.json');
        if (response.ok) {
          const remoteData = await response.json();
          setChallengeData(remoteData);
          console.log('Loaded data from remote data.json');
          return;
        }
      } catch (error) {
        console.log('No remote data.json found, falling back to localStorage');
      }

      // Fallback to localStorage
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
          console.log('Loaded data from localStorage');
        } catch (error) {
          console.error('Failed to load saved data:', error);
        }
      }
    };

    loadData();
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

  const handleExportData = () => {
    // Get current localStorage data (this includes all local changes)
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      alert('No data to export. Please add some entries first.');
      return;
    }

    try {
      // Validate JSON and format it nicely
      const data = JSON.parse(savedData);
      const formattedJson = JSON.stringify(data, null, 2);
      
      // Copy to clipboard
      navigator.clipboard.writeText(formattedJson).then(() => {
        alert('Data exported to clipboard! Paste this into public/data.json and commit to update the deployed version.');
      }).catch(() => {
        // Fallback: show data in a prompt for manual copying
        const userCopy = confirm('Copy to clipboard failed. Would you like to see the data to copy manually?');
        if (userCopy) {
          prompt('Copy this JSON data to public/data.json:', formattedJson);
        }
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please check the console for details.');
    }
  };

  const getCurrentDay = () => {
    if (!challengeData.startDate) return 1;
    
    // Count the number of actual entries to determine current day
    const entryCount = Object.keys(challengeData.entries).length;
    
    // If no entries exist, we're on day 1
    if (entryCount === 0) return 1;
    
    // Otherwise, the current day is the number of entries + 1 (next day to fill)
    return Math.min(entryCount + 1, 75);
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
          <div className="flex gap-2 shrink-0">
            <Button onClick={handleExportData} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Dashboard
            </Button>
          </div>
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