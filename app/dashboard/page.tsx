import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { BookOpen, Flame, Brain, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user stats
  const { data: userStats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Fetch total words count
  const { count: totalWords } = await supabase
    .from("vocab_words")
    .select("id, vocab_sets!inner(user_id)", { count: "exact", head: true })
    .eq("vocab_sets.user_id", user.id);

  // Fetch words with high memory score (mastered)
  const { data: masteredWordsData } = await supabase
    .from("learning_progress")
    .select("id")
    .eq("user_id", user.id)
    .gte("memory_score", 85);

  const masteredWords = masteredWordsData?.length || 0;

  // Calculate average memory score
  const { data: progressData } = await supabase
    .from("learning_progress")
    .select("memory_score")
    .eq("user_id", user.id);

  const avgMemoryScore =
    progressData && progressData.length > 0
      ? Math.round(
          progressData.reduce((sum, p) => sum + p.memory_score, 0) /
            progressData.length
        )
      : 0;

  // Fetch recent learning sessions
  const { data: recentSessions } = await supabase
    .from("learning_sessions")
    .select("id, session_type, score, completed_at, vocab_sets(name)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5);

  // Format recent activities
  const recentActivities = (recentSessions || []).map((session) => ({
    id: session.id,
    type: session.session_type as "flashcard" | "multiple_choice" | "write" | "matching" | "test",
    setName: (session.vocab_sets as any)?.name || "Unknown Set",
    score: session.score ? Math.round(session.score) : undefined,
    timestamp: formatTimestamp(new Date(session.completed_at)),
  }));

  // Generate activity data for streak calendar (last 49 days)
  const { data: sessionsForCalendar } = await supabase
    .from("learning_sessions")
    .select("completed_at")
    .eq("user_id", user.id)
    .gte(
      "completed_at",
      new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString()
    );

  const activityMap = new Map<string, number>();
  (sessionsForCalendar || []).forEach((session) => {
    const date = new Date(session.completed_at).toLocaleDateString();
    activityMap.set(date, (activityMap.get(date) || 0) + 1);
  });

  const activityData = Array.from({ length: 49 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (48 - i));
    const dateStr = date.toLocaleDateString();
    const wordCount = activityMap.get(dateStr) || 0;
    return {
      date: dateStr,
      hasActivity: wordCount > 0,
      wordCount,
    };
  });

  // Generate progress data for chart (last 7 days)
  const progressChartData = await generateProgressChartData(supabase, user.id);

  // Calculate current streak
  const currentStreak = userStats?.current_streak || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Track your learning progress and achievements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Words"
          value={totalWords || 0}
          icon={BookOpen}
          description="Words in your library"
          color="blue"
        />
        <StatsCard
          title="Current Streak"
          value={currentStreak > 0 ? `${currentStreak} days` : "0 days"}
          icon={Flame}
          description={currentStreak > 0 ? "Keep it up!" : "Start learning today!"}
          color="orange"
        />
        <StatsCard
          title="Memory Score"
          value={`${avgMemoryScore}%`}
          icon={Brain}
          description="Overall retention"
          color="purple"
        />
        <StatsCard
          title="Words Mastered"
          value={masteredWords}
          icon={TrendingUp}
          description="Score above 85%"
          color="green"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart data={progressChartData} />
        <StreakCalendar activityData={activityData} />
      </div>

      {/* Recent Activity */}
      {recentActivities.length > 0 ? (
        <RecentActivity activities={recentActivities} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Recent Activity
          </h3>
          <p className="text-gray-600">
            Start learning to see your activity here!
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-8 text-white">
        <h2 className="text-2xl font-bold mb-3">Ready to Learn?</h2>
        <p className="text-blue-100 mb-6">
          Continue building your vocabulary with interactive learning modes
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard/learn"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Start Learning
          </Link>
          <Link
            href="/dashboard/learn"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors border border-white/20"
          >
            Create New Set
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return "Just now";
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

async function generateProgressChartData(supabase: any, userId: string) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    // Count sessions for this day
    const { count: sessionsCount } = await supabase
      .from("learning_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("completed_at", date.toISOString())
      .lt("completed_at", nextDate.toISOString());

    // Get average score for this day
    const { data: sessionsData } = await supabase
      .from("learning_sessions")
      .select("score")
      .eq("user_id", userId)
      .gte("completed_at", date.toISOString())
      .lt("completed_at", nextDate.toISOString());

    const avgScore =
      sessionsData && sessionsData.length > 0
        ? Math.round(
            sessionsData.reduce((sum: number, s: any) => sum + (s.score || 0), 0) /
              sessionsData.length
          )
        : 0;

    result.push({
      date: days[date.getDay()],
      wordsLearned: sessionsCount || 0,
      memoryScore: avgScore,
    });
  }

  return result;
}
