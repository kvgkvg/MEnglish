"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { BookOpen, Flame, Brain, TrendingUp } from "lucide-react";

// Mock data for visualization
const mockProgressData = [
  { date: "Mon", wordsLearned: 12, memoryScore: 65 },
  { date: "Tue", wordsLearned: 18, memoryScore: 72 },
  { date: "Wed", wordsLearned: 25, memoryScore: 78 },
  { date: "Thu", wordsLearned: 30, memoryScore: 82 },
  { date: "Fri", wordsLearned: 42, memoryScore: 85 },
  { date: "Sat", wordsLearned: 48, memoryScore: 88 },
  { date: "Sun", wordsLearned: 55, memoryScore: 90 },
];

const mockActivityData = Array.from({ length: 49 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (48 - i));
  const wordCount = Math.floor(Math.random() * 25);
  return {
    date: date.toLocaleDateString(),
    hasActivity: wordCount > 0,
    wordCount,
  };
});

const mockRecentActivities = [
  {
    id: "1",
    type: "test" as const,
    setName: "Academic Vocabulary",
    score: 92,
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "flashcard" as const,
    setName: "Business English",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "multiple_choice" as const,
    setName: "IELTS Preparation",
    score: 85,
    timestamp: "Yesterday",
  },
  {
    id: "4",
    type: "write" as const,
    setName: "Academic Vocabulary",
    score: 78,
    timestamp: "Yesterday",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your learning progress and achievements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Words"
          value={248}
          icon={BookOpen}
          description="Words in your library"
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Current Streak"
          value="7 days"
          icon={Flame}
          description="Keep it up!"
          color="orange"
        />
        <StatsCard
          title="Memory Score"
          value="88%"
          icon={Brain}
          description="Overall retention"
          trend={{ value: 5, isPositive: true }}
          color="purple"
        />
        <StatsCard
          title="Words Mastered"
          value={156}
          icon={TrendingUp}
          description="Score above 85%"
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart data={mockProgressData} />
        <StreakCalendar activityData={mockActivityData} />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={mockRecentActivities} />

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-8 text-white">
        <h2 className="text-2xl font-bold mb-3">Ready to Learn?</h2>
        <p className="text-blue-100 mb-6">
          Continue building your vocabulary with interactive learning modes
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            Start Learning
          </button>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors border border-white/20">
            Create New Set
          </button>
        </div>
      </div>
    </div>
  );
}
