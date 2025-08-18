import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { DailyEntry } from '@/types';
import { Save, Scale, Flame, Clock, MapPin, Heart, Target, Zap, Calendar } from 'lucide-react';
import { secondsToTimeString, timeStringToSeconds, validateTimeString } from '@/lib/utils';

interface DailyInputProps {
  onSave: (entry: DailyEntry) => void;
  existingEntry?: DailyEntry;
  allowDateChange?: boolean;
}

const DailyInput: React.FC<DailyInputProps> = ({ onSave, existingEntry, allowDateChange = true }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [entry, setEntry] = useState<DailyEntry>({
    date: today,
    weight: 0,
    calories: 0,
    run: {
      time: 0,
      distance: 0,
      calories: 0,
      avgPacePerMile: '0:00',
      elevationGain: 0,
      avgHeartRate: 0,
    },
    additionalWorkout: {
      type: 'strength',
      length: 0,
      calories: 0,
      avgHeartRate: 0,
    },
  });

  // State for time input in MM:SS format
  const [timeInput, setTimeInput] = useState<string>('0:00');

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (existingEntry) {
      setEntry(existingEntry);
      setSelectedDate(new Date(existingEntry.date));
      // Convert existing time (seconds) to MM:SS format for display
      setTimeInput(secondsToTimeString(existingEntry.run.time));
    }
  }, [existingEntry]);

  const handleInputChange = (field: string, value: any, section?: string) => {
    if (section) {
      setEntry(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof DailyEntry] as any,
          [field]: value,
        },
      }));
    } else {
      setEntry(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleTimeInputChange = (timeString: string) => {
    setTimeInput(timeString);
    
    // Convert to seconds and update entry if valid
    if (validateTimeString(timeString)) {
      const seconds = timeStringToSeconds(timeString);
      handleInputChange('time', seconds, 'run');
    }
  };

  const isTimeValid = () => {
    const seconds = timeStringToSeconds(timeInput);
    return seconds >= 1200; // 20 minutes minimum
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setEntry(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0],
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate minimum time requirement
    if (!isTimeValid()) {
      alert('Running time must be at least 20:00 (20 minutes).');
      return;
    }
    
    onSave(entry);
    alert('Daily entry saved successfully!');
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your daily weight and calorie intake for the challenge
            </CardDescription>
          </CardHeader>
          <CardContent className={`grid grid-cols-1 gap-6 ${allowDateChange ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {allowDateChange && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <DatePicker
                  date={selectedDate}
                  onDateChange={handleDateChange}
                  placeholder="Select date"
                  className="h-10"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2 text-sm font-medium">
                <Scale className="h-4 w-4" />
                Weight (lbs)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={entry.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                placeholder="Enter your weight"
                className="h-10"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calories" className="flex items-center gap-2 text-sm font-medium">
                <Flame className="h-4 w-4" />
                Calories Consumed
              </Label>
              <Input
                id="calories"
                type="number"
                value={entry.calories || ''}
                onChange={(e) => handleInputChange('calories', parseInt(e.target.value))}
                placeholder="Target: 2000 calories"
                className="h-10"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Running Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Cardio (20 min minimum)
            </CardTitle>
            <CardDescription>
              Track your daily running or cardio session details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="runTime" className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Time (MM:SS)
                </Label>
                <Input
                  id="runTime"
                  type="text"
                  value={timeInput}
                  onChange={(e) => handleTimeInputChange(e.target.value)}
                  placeholder="20:00 (minimum)"
                  className={`h-10 ${!validateTimeString(timeInput) && timeInput !== '0:00' ? 'border-red-500' : ''}`}
                  required
                  pattern="\d+:[0-5]\d"
                  title="Enter time in MM:SS format (e.g., 25:30)"
                />
                {!validateTimeString(timeInput) && timeInput !== '0:00' && (
                  <p className="text-sm text-red-600">Please enter time in MM:SS format</p>
                )}
                {validateTimeString(timeInput) && timeStringToSeconds(timeInput) < 1200 && (
                  <p className="text-sm text-red-600">Minimum time is 20:00</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="runDistance" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  Distance (miles)
                </Label>
                <Input
                  id="runDistance"
                  type="number"
                  step="0.1"
                  value={entry.run.distance || ''}
                  onChange={(e) => handleInputChange('distance', parseFloat(e.target.value), 'run')}
                  placeholder="Miles covered"
                  className="h-10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="runCalories" className="flex items-center gap-2 text-sm font-medium">
                  <Flame className="h-4 w-4" />
                  Calories Burned
                </Label>
                <Input
                  id="runCalories"
                  type="number"
                  value={entry.run.calories || ''}
                  onChange={(e) => handleInputChange('calories', parseInt(e.target.value), 'run')}
                  placeholder="Calories burned"
                  className="h-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="avgPace" className="text-sm font-medium">Avg Pace (MM:SS per mile)</Label>
                <Input
                  id="avgPace"
                  placeholder="e.g., 8:30"
                  value={entry.run.avgPacePerMile}
                  onChange={(e) => handleInputChange('avgPacePerMile', e.target.value, 'run')}
                  className="h-10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="elevation" className="text-sm font-medium">Elevation Gain (ft)</Label>
                <Input
                  id="elevation"
                  type="number"
                  value={entry.run.elevationGain || ''}
                  onChange={(e) => handleInputChange('elevationGain', parseInt(e.target.value), 'run')}
                  placeholder="Feet gained"
                  className="h-10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="runHeartRate" className="flex items-center gap-2 text-sm font-medium">
                  <Heart className="h-4 w-4" />
                  Avg Heart Rate (bpm)
                </Label>
                <Input
                  id="runHeartRate"
                  type="number"
                  value={entry.run.avgHeartRate || ''}
                  onChange={(e) => handleInputChange('avgHeartRate', parseInt(e.target.value), 'run')}
                  placeholder="Beats per minute"
                  className="h-10"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Workout Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Additional Workout (20 min minimum)
            </CardTitle>
            <CardDescription>
              Strength training or recovery work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  Workout Type
                </Label>
                <Select
                  value={entry.additionalWorkout.type}
                  onValueChange={(value: 'strength' | 'recovery') => 
                    handleInputChange('type', value, 'additionalWorkout')
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="recovery">Recovery Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workoutLength" className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Length (minutes)
                </Label>
                <Input
                  id="workoutLength"
                  type="number"
                  value={entry.additionalWorkout.length || ''}
                  onChange={(e) => handleInputChange('length', parseInt(e.target.value), 'additionalWorkout')}
                  placeholder="Minimum 20 minutes"
                  className="h-10"
                  required
                  min="20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workoutCalories" className="flex items-center gap-2 text-sm font-medium">
                  <Flame className="h-4 w-4" />
                  Calories Burned
                </Label>
                <Input
                  id="workoutCalories"
                  type="number"
                  value={entry.additionalWorkout.calories || ''}
                  onChange={(e) => handleInputChange('calories', parseInt(e.target.value), 'additionalWorkout')}
                  placeholder="Calories burned"
                  className="h-10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workoutHeartRate" className="flex items-center gap-2 text-sm font-medium">
                  <Heart className="h-4 w-4" />
                  Avg Heart Rate (bpm)
                </Label>
                <Input
                  id="workoutHeartRate"
                  type="number"
                  value={entry.additionalWorkout.avgHeartRate || ''}
                  onChange={(e) => handleInputChange('avgHeartRate', parseInt(e.target.value), 'additionalWorkout')}
                  placeholder="Beats per minute"
                  className="h-10"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-base font-semibold" size="lg">
          <Save className="mr-2 h-5 w-5" />
          Save Daily Entry
        </Button>
      </form>
    </div>
  );
};

export default DailyInput; 