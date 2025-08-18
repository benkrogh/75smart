import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChallengeData, DailyEntry } from '@/types';
import { Calendar, Edit3, Search, Clock, MapPin, Flame, Scale, Target, Zap, Heart, Save, Trash2 } from 'lucide-react';
import { secondsToTimeString, timeStringToSeconds, validateTimeString } from '@/lib/utils';

interface HistoryViewProps {
  challengeData: ChallengeData;
  onUpdateEntry: (entry: DailyEntry) => void;
  onDeleteEntry: (date: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ challengeData, onUpdateEntry, onDeleteEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'weight' | 'calories'>('date');
  
  // State for time input in MM:SS format during editing
  const [editTimeInput, setEditTimeInput] = useState<string>('0:00');

  const sortedEntries = useMemo(() => {
    const entries = Object.values(challengeData.entries);
    const filtered = entries.filter(entry => {
      const searchLower = searchTerm.toLowerCase();
      const dateMatch = entry.date.includes(searchTerm);
      const weightMatch = entry.weight.toString().includes(searchTerm);
      const workoutMatch = entry.additionalWorkout.type.toLowerCase().includes(searchLower);
      return dateMatch || weightMatch || workoutMatch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'weight':
          return b.weight - a.weight;
        case 'calories':
          return b.calories - a.calories;
        default:
          return 0;
      }
    });
  }, [challengeData.entries, searchTerm, sortBy]);

  const handleEditEntry = (entry: DailyEntry) => {
    setEditingEntry({ ...entry });
    // Convert existing time (seconds) to MM:SS format for editing
    setEditTimeInput(secondsToTimeString(entry.run.time));
  };

  const handleSaveEdit = () => {
    if (editingEntry) {
      // Validate minimum time requirement
      const seconds = timeStringToSeconds(editTimeInput);
      if (!validateTimeString(editTimeInput) || seconds < 1200) {
        alert('Running time must be at least 20:00 (20 minutes) in MM:SS format.');
        return;
      }
      
      onUpdateEntry(editingEntry);
      setEditingEntry(null);
    }
  };

  const handleDeleteEntry = (date: string) => {
    if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      onDeleteEntry(date);
    }
  };

  const handleInputChange = (field: string, value: any, section?: string) => {
    if (!editingEntry) return;

    if (section) {
      setEditingEntry(prev => prev ? ({
        ...prev,
        [section]: {
          ...prev[section as keyof DailyEntry] as any,
          [field]: value,
        },
      }) : null);
    } else {
      setEditingEntry(prev => prev ? ({
        ...prev,
        [field]: value,
      }) : null);
    }
  };

  const handleEditTimeInputChange = (timeString: string) => {
    setEditTimeInput(timeString);
    
    // Convert to seconds and update entry if valid
    if (validateTimeString(timeString)) {
      const seconds = timeStringToSeconds(timeString);
      handleInputChange('time', seconds, 'run');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayNumber = (dateString: string) => {
    const startDate = new Date(challengeData.startDate);
    const entryDate = new Date(dateString);
    const diffTime = Math.abs(entryDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (editingEntry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Edit Day {getDayNumber(editingEntry.date)}</h2>
            <p className="text-muted-foreground">{formatDate(editingEntry.date)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Separator />

        {/* Edit Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-weight" className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Weight (lbs)
                </Label>
                <Input
                  id="edit-weight"
                  type="number"
                  step="0.1"
                  value={editingEntry.weight || ''}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-calories" className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Calories Consumed
                </Label>
                <Input
                  id="edit-calories"
                  type="number"
                  value={editingEntry.calories || ''}
                  onChange={(e) => handleInputChange('calories', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Running */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Running Session
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time (MM:SS)
                </Label>
                <Input
                  type="text"
                  value={editTimeInput}
                  onChange={(e) => handleEditTimeInputChange(e.target.value)}
                  placeholder="20:00 (minimum)"
                  className={`${!validateTimeString(editTimeInput) && editTimeInput !== '0:00' ? 'border-red-500' : ''}`}
                  pattern="\d+:[0-5]\d"
                  title="Enter time in MM:SS format (e.g., 25:30)"
                />
                {!validateTimeString(editTimeInput) && editTimeInput !== '0:00' && (
                  <p className="text-sm text-red-600">Please enter time in MM:SS format</p>
                )}
                {validateTimeString(editTimeInput) && timeStringToSeconds(editTimeInput) < 1200 && (
                  <p className="text-sm text-red-600">Minimum time is 20:00</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Distance (miles)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editingEntry.run.distance || ''}
                  onChange={(e) => handleInputChange('distance', parseFloat(e.target.value), 'run')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Calories Burned
                </Label>
                <Input
                  type="number"
                  value={editingEntry.run.calories || ''}
                  onChange={(e) => handleInputChange('calories', parseInt(e.target.value), 'run')}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Avg Pace</Label>
                <Input
                  placeholder="8:30"
                  value={editingEntry.run.avgPacePerMile}
                  onChange={(e) => handleInputChange('avgPacePerMile', e.target.value, 'run')}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Elevation (ft)</Label>
                <Input
                  type="number"
                  value={editingEntry.run.elevationGain || ''}
                  onChange={(e) => handleInputChange('elevationGain', parseInt(e.target.value), 'run')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Heart Rate (bpm)
                </Label>
                <Input
                  type="number"
                  value={editingEntry.run.avgHeartRate || ''}
                  onChange={(e) => handleInputChange('avgHeartRate', parseInt(e.target.value), 'run')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Workout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Additional Workout
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Workout Type</Label>
                <Select
                  value={editingEntry.additionalWorkout.type}
                  onValueChange={(value: 'strength' | 'recovery') => 
                    handleInputChange('type', value, 'additionalWorkout')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="recovery">Recovery Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Length (minutes)
                </Label>
                <Input
                  type="number"
                  value={editingEntry.additionalWorkout.length || ''}
                  onChange={(e) => handleInputChange('length', parseInt(e.target.value), 'additionalWorkout')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Calories Burned
                </Label>
                <Input
                  type="number"
                  value={editingEntry.additionalWorkout.calories || ''}
                  onChange={(e) => handleInputChange('calories', parseInt(e.target.value), 'additionalWorkout')}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Heart Rate (bpm)
                </Label>
                <Input
                  type="number"
                  value={editingEntry.additionalWorkout.avgHeartRate || ''}
                  onChange={(e) => handleInputChange('avgHeartRate', parseInt(e.target.value), 'additionalWorkout')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">History & Data Management</h2>
          <p className="text-muted-foreground">View and edit your previous daily entries</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value: 'date' | 'weight' | 'calories') => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="weight">By Weight</SelectItem>
              <SelectItem value="calories">By Calories</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Entries List */}
      <div className="space-y-4">
        {sortedEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No entries found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No entries match your search.' : 'Start adding daily entries to see your history here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedEntries.map((entry) => (
            <Card key={entry.date} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{formatDate(entry.date)}</CardTitle>
                      <Badge variant="secondary">Day {getDayNumber(entry.date)}</Badge>
                    </div>
                    <CardDescription>{entry.date}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.date)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Basic Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Scale className="h-4 w-4" />
                      <span>Weight</span>
                    </div>
                    <p className="text-2xl font-bold">{entry.weight} lbs</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Flame className="h-4 w-4" />
                      <span>Calories</span>
                    </div>
                    <p className="text-2xl font-bold">{entry.calories.toLocaleString()}</p>
                  </div>
                  
                  {/* Running Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>Run</span>
                    </div>
                    <p className="text-lg font-semibold">{secondsToTimeString(entry.run.time)} • {entry.run.distance}mi</p>
                    <p className="text-sm text-muted-foreground">{entry.run.avgPacePerMile} pace</p>
                  </div>
                  
                  {/* Workout Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span>Workout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.additionalWorkout.type === 'strength' ? 'default' : 'secondary'}>
                        {entry.additionalWorkout.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.additionalWorkout.length}min</p>
                  </div>
                </div>

                {/* Additional Details */}
                <Separator className="my-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Run Calories:</span>
                    <p className="font-medium">{entry.run.calories}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Elevation:</span>
                    <p className="font-medium">{entry.run.elevationGain} ft</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Run HR:</span>
                    <p className="font-medium">{entry.run.avgHeartRate} bpm</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Workout HR:</span>
                    <p className="font-medium">{entry.additionalWorkout.avgHeartRate} bpm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView; 