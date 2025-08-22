import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent,
  type ChartConfig 
} from '@/components/ui/chart';
import { ChallengeData, ChartDataPoint } from '@/types';
import { Calendar, Target, Flame, Clock, TrendingUp, Zap, MapPin } from 'lucide-react';
import { secondsToTimeString } from '@/lib/utils';

interface DashboardProps {
  challengeData: ChallengeData;
}



const Dashboard: React.FC<DashboardProps> = ({ challengeData }) => {
  const chartData = useMemo(() => {
    const data: ChartDataPoint[] = [];
    const entries = challengeData.entries;
    const startDate = new Date(challengeData.startDate);
    
    for (let i = 0; i < 75; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      const entry = entries[dateString];
      
      data.push({
        day: i + 1,
        weight: entry?.weight,
        calories: entry?.calories,
        runTime: entry?.run.time ? Math.round((entry.run.time / 60) * 10) / 10 : undefined, // Convert to decimal minutes
        runDistance: entry?.run.distance,
        workoutCalories: (entry?.run.calories || 0) + (entry?.additionalWorkout.calories || 0),
        totalCalories: entry?.calories,
      });
    }
    
    return data;
  }, [challengeData]);

  // Chart configurations
  const weightChartConfig = {
    weight: {
      label: "Weight",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const calorieChartConfig = {
    calories: {
      label: "Calories",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const runningChartConfig = {
    runTime: {
      label: "Time (min)",
      color: "hsl(var(--chart-1))",
    },
    runDistance: {
      label: "Distance (mi)",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const workoutChartConfig = {
    strength: {
      label: "Strength Training",
      color: "hsl(var(--chart-1))",
    },
    recovery: {
      label: "Recovery",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const stats = useMemo(() => {
    const entries = Object.values(challengeData.entries);
    const completedDays = entries.length;
    const totalRunTime = entries.reduce((sum, entry) => sum + entry.run.time, 0);
    const totalDistance = entries.reduce((sum, entry) => sum + entry.run.distance, 0);
    const totalCaloriesBurned = entries.reduce((sum, entry) => 
      sum + entry.run.calories + entry.additionalWorkout.calories, 0);
    
    // Calculate total weight lost from day 1
    const startDateString = challengeData.startDate;
    const startEntry = challengeData.entries[startDateString];
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestEntry = sortedEntries[0];
    
    const totalWeightLost = startEntry && latestEntry ? 
      startEntry.weight - latestEntry.weight : 0;
    
    const averageCaloriesConsumed = entries.length > 0 ? 
      entries.reduce((sum, entry) => sum + entry.calories, 0) / entries.length : 0;
    
    return {
      completedDays,
      totalRunTime,
      totalDistance,
      totalCaloriesBurned,
      totalWeightLost,
      averageCaloriesConsumed,
      completionPercentage: (completedDays / 75) * 100,
    };
  }, [challengeData.entries, challengeData.startDate]);

  const workoutTypeData = useMemo(() => {
    const entries = Object.values(challengeData.entries);
    const strengthCount = entries.filter(entry => entry.additionalWorkout.type === 'strength').length;
    const recoveryCount = entries.filter(entry => entry.additionalWorkout.type === 'recovery').length;
    
    return [
      { name: 'Strength Training', value: strengthCount, color: '#0088FE' },
      { name: 'Recovery', value: recoveryCount, color: '#00C49F' },
    ];
  }, [challengeData.entries]);

  const recentEntries = useMemo(() => {
    return Object.values(challengeData.entries)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
  }, [challengeData.entries]);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedDays}/75</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionPercentage.toFixed(1)}% complete
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistance.toFixed(1)} mi</div>
            <p className="text-xs text-muted-foreground">
              {secondsToTimeString(stats.totalRunTime)} total running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCaloriesBurned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From workouts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weight Lost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalWeightLost >= 0 ? 
                `${stats.totalWeightLost.toFixed(1)} lbs` : 
                `+${Math.abs(stats.totalWeightLost).toFixed(1)} lbs`
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalWeightLost >= 0 ? 'Lost from day 1' : 'Gained from day 1'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weight Progress
            </CardTitle>
            <CardDescription>Daily weight tracking over 75 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weightChartConfig} className="min-h-[300px] w-full">
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--color-weight)" 
                  strokeWidth={2}
                  connectNulls={false}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Calorie Intake */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Calorie Intake
            </CardTitle>
            <CardDescription>Daily calorie consumption vs 2000 target</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={calorieChartConfig} className="min-h-[300px] w-full">
              <AreaChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="var(--color-calories)" 
                  fill="var(--color-calories)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Running Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Running Performance
            </CardTitle>
            <CardDescription>Daily run time and distance</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={runningChartConfig} className="min-h-[300px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis hide />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => {
                        if (name === 'Time (min)' && typeof value === 'number') {
                          const seconds = Math.round(value * 60);
                          return [secondsToTimeString(seconds), 'Time'];
                        }
                        return [value, name];
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="runTime" fill="var(--color-runTime)" radius={4} />
                <Bar dataKey="runDistance" fill="var(--color-runDistance)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Workout Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Workout Types
            </CardTitle>
            <CardDescription>Strength vs Recovery sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={workoutChartConfig} className="min-h-[300px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={workoutTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workoutTypeData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? "var(--color-strength)" : "var(--color-recovery)"} 
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Last 7 completed days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No entries yet. Start tracking your progress!</p>
            ) : (
              recentEntries.map((entry) => (
                <div key={entry.date} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.weight} lbs • {entry.calories} cal consumed
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">
{secondsToTimeString(entry.run.time)} run • {entry.run.distance}mi
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.additionalWorkout.length}min {entry.additionalWorkout.type}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 