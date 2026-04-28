import { createClient } from "@/lib/supabase/server";
import { Stat } from "@/components/ui/stat";
import { Bar } from "@/components/ui/bar";
import { Pill } from "@/components/ui/pill";
import { Flame, BookOpen, Play } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    { data: userStats },
    { count: totalWords },
    { data: allProgress },
    { data: recentSessions },
    { data: sessionsForHeatmap },
  ] = await Promise.all([
    supabase.from("user_stats").select("current_streak").eq("user_id", user.id).single(),
    supabase
      .from("vocab_words")
      .select("id, vocab_sets!inner(user_id)", { count: "exact", head: true })
      .eq("vocab_sets.user_id", user.id),
    supabase
      .from("learning_progress")
      .select("memory_score, next_review_date")
      .eq("user_id", user.id),
    supabase
      .from("learning_sessions")
      .select("id, session_type, score, completed_at, vocab_sets(name)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(8),
    // 13 weeks = 91 days for heatmap
    supabase
      .from("learning_sessions")
      .select("score, completed_at")
      .eq("user_id", user.id)
      .gte("completed_at", new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const masteredWords = allProgress?.filter((p) => p.memory_score >= 85).length ?? 0;
  const avgMemoryScore =
    allProgress && allProgress.length > 0
      ? Math.round(allProgress.reduce((s, p) => s + p.memory_score, 0) / allProgress.length)
      : 0;
  const dueWords =
    allProgress?.filter((p) => p.next_review_date && new Date(p.next_review_date) <= new Date())
      .length ?? 0;
  const currentStreak = userStats?.current_streak ?? 0;

  // Sessions today
  const todayStr = new Date().toDateString();
  const sessionsToday = (sessionsForHeatmap ?? []).filter(
    (s) => new Date(s.completed_at).toDateString() === todayStr
  ).length;

  // Build 13×7 heatmap grid (91 days, column = week, row = day)
  const heatmapMap = new Map<string, number>();
  (sessionsForHeatmap ?? []).forEach((s) => {
    const d = new Date(s.completed_at).toDateString();
    heatmapMap.set(d, (heatmapMap.get(d) ?? 0) + 1);
  });

  const heatmap: number[][] = Array.from({ length: 13 }, (_, wi) =>
    Array.from({ length: 7 }, (_, di) => {
      const d = new Date();
      d.setDate(d.getDate() - (12 - wi) * 7 - (6 - di));
      return heatmapMap.get(d.toDateString()) ?? 0;
    })
  );

  const intensityColor = (v: number) =>
    v === 0
      ? "var(--mut2)"
      : `color-mix(in oklch, var(--acc) ${Math.min(v * 20, 90)}%, var(--mut2))`;

  // Recent activity grouped by day
  const activityGroups: Record<string, typeof recentSessions> = {};
  (recentSessions ?? []).forEach((s) => {
    const label = formatDayLabel(new Date(s.completed_at));
    if (!activityGroups[label]) activityGroups[label] = [];
    activityGroups[label]!.push(s);
  });

  // Date header
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).toUpperCase();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const masteryPct = totalWords ? Math.round((masteredWords / (totalWords ?? 1)) * 100) : 0;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px 60px" }}>
      {/* Header strip */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 18,
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--mut)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
              marginBottom: 4,
            }}
          >
            {dateLabel}
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "var(--ink)",
            }}
          >
            {greeting}.{" "}
            <span
              style={{
                color: "var(--mut)",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              {dueWords > 0 ? `${dueWords} cards are due.` : "You're all caught up!"}
            </span>
          </h1>
          <div
            style={{
              fontSize: 12,
              color: "var(--mut)",
              marginTop: 6,
              display: "flex",
              gap: 14,
              alignItems: "center",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Flame size={11} />
              {currentStreak}-day streak
            </span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{sessionsToday} sessions today</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{masteredWords.toLocaleString()} words mastered</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Link
            href="/dashboard/learn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 5,
              border: "0.5px solid var(--bd)",
              background: "var(--bg)",
              color: "var(--ink)",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <BookOpen size={12} /> Library
          </Link>
          {dueWords > 0 && (
            <Link
              href="/dashboard/learn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 5,
                background: "var(--ink)",
                color: "var(--bg)",
                fontSize: 12,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <Play size={12} /> Study · {dueWords} due
            </Link>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div
        style={{
          border: "0.5px solid var(--bd)",
          borderRadius: 6,
          background: "var(--card)",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <Stat
          label="Due today"
          value={dueWords}
          sub={dueWords > 0 ? "needs review" : "all clear"}
          accent
        />
        <Stat label="Streak" value={`${currentStreak}d`} sub="Keep it up" />
        <Stat label="Sessions today" value={sessionsToday} sub="cumulative" />
        <Stat label="Mastered" value={masteredWords.toLocaleString()} sub={`of ${(totalWords ?? 0).toLocaleString()} · ${masteryPct}%`} />
        <Stat
          label="Avg score"
          value={`${avgMemoryScore}%`}
          sub="memory retention"
          className="border-r-0"
        />
      </div>

      {/* Main 2-col grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Activity heatmap */}
          <div
            style={{
              background: "var(--card)",
              border: "0.5px solid var(--bd)",
              borderRadius: 6,
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "var(--ink)",
                  }}
                >
                  Activity
                </h3>
                <p style={{ fontSize: 11, color: "var(--mut)", marginTop: 2 }}>
                  Last 13 weeks · {currentStreak}-day streak
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10,
                  color: "var(--mut)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Less
                {[0, 1, 2, 3, 4].map((v) => (
                  <div
                    key={v}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: intensityColor(v),
                    }}
                  />
                ))}
                More
              </div>
            </div>
            <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>
              {heatmap.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {week.map((v, di) => (
                    <div
                      key={di}
                      title={`${v} session${v !== 1 ? "s" : ""}`}
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: 2,
                        background: intensityColor(v),
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 10,
                color: "var(--mut)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span>13 weeks ago</span>
              <span>7 weeks ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Recent sessions */}
          {Object.keys(activityGroups).length > 0 && (
            <div
              style={{
                background: "var(--card)",
                border: "0.5px solid var(--bd)",
                borderRadius: 6,
                padding: 14,
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  marginBottom: 12,
                  color: "var(--ink)",
                }}
              >
                Recent sessions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(activityGroups)
                  .slice(0, 4)
                  .map(([day, items]) => (
                    <div key={day}>
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                          color: "var(--mut)",
                          letterSpacing: "0.04em",
                          marginBottom: 4,
                          textTransform: "uppercase",
                        }}
                      >
                        {day}
                      </div>
                      {items!.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 12,
                            padding: "2px 0",
                            color: "var(--ink)",
                            display: "flex",
                            gap: 6,
                          }}
                        >
                          <span style={{ color: "var(--mut)" }}>·</span>
                          <span>
                            {(s.vocab_sets as any)?.name ?? "Unknown set"} ·{" "}
                            {formatSessionType(s.session_type)}
                            {s.score != null && (
                              <span style={{ color: "var(--mut)", fontFamily: "var(--font-mono)" }}>
                                {" "}
                                · {Math.round(s.score)}%
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Start studying CTA */}
          <div
            style={{
              background: "color-mix(in oklch, var(--acc) 6%, var(--card))",
              border: "0.5px solid color-mix(in oklch, var(--acc) 25%, var(--bd))",
              borderRadius: 6,
              padding: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "var(--acc)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
                fontFamily: "var(--font-mono)",
              }}
            >
              Today&apos;s goal
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                marginBottom: 14,
                color: "var(--ink)",
              }}
            >
              {dueWords > 0 ? (
                <>
                  Review{" "}
                  <span style={{ fontWeight: 600 }}>{dueWords} due cards</span> to maintain
                  your streak.
                </>
              ) : (
                <>
                  <span style={{ fontStyle: "italic" }}>All caught up!</span> Explore new sets or
                  review recent words to keep your streak going.
                </>
              )}
            </div>
            <Link
              href="/dashboard/learn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: "100%",
                padding: "8px 0",
                borderRadius: 5,
                background: "var(--ink)",
                color: "var(--bg)",
                fontSize: 12,
                fontWeight: 500,
                textDecoration: "none",
                border: "none",
              }}
            >
              <Play size={12} /> {dueWords > 0 ? `Start session · ${dueWords} due` : "Browse library"}
            </Link>
          </div>

          {/* Level / mastery progress */}
          <div
            style={{
              background: "var(--card)",
              border: "0.5px solid var(--bd)",
              borderRadius: 6,
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "var(--ink)",
                  }}
                >
                  Mastery progress
                </h3>
                <p style={{ fontSize: 11, color: "var(--mut)", marginTop: 2 }}>
                  {masteredWords.toLocaleString()} of {(totalWords ?? 0).toLocaleString()} words
                </p>
              </div>
              <Pill tone="accent">{masteryPct}%</Pill>
            </div>
            <Bar value={masteredWords} max={Math.max(totalWords ?? 1, 1)} height={8} />
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: "0.5px solid var(--bd)",
                fontSize: 11,
              }}
            >
              <div style={{ color: "var(--mut)", marginBottom: 4 }}>Memory score</div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 20,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                }}
              >
                {avgMemoryScore}%
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--mut)",
                  marginTop: 2,
                  fontFamily: "var(--font-mono)",
                }}
              >
                average retention across all words
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div
            style={{
              background: "var(--card)",
              border: "0.5px solid var(--bd)",
              borderRadius: 6,
              padding: 14,
            }}
          >
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                marginBottom: 10,
                color: "var(--ink)",
              }}
            >
              Quick actions
            </h3>
            {[
              { label: "Browse library", href: "/dashboard/learn", desc: "All sets and folders" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderTop: "0.5px solid var(--bd)",
                  textDecoration: "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>
                    {a.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--mut)",
                      fontFamily: "var(--font-mono)",
                      marginTop: 1,
                    }}
                  >
                    {a.desc}
                  </div>
                </div>
                <span style={{ color: "var(--mut)", fontSize: 12 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDayLabel(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.setHours(0,0,0,0) - date.setHours(0,0,0,0)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatSessionType(type: string): string {
  return (
    {
      flashcard: "Flashcards",
      multiple_choice: "Multiple choice",
      write: "Write mode",
      matching: "Matching",
      test: "Test",
    }[type] ?? type
  );
}
