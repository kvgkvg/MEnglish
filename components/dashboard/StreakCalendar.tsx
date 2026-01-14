"use client";

interface StreakCalendarProps {
  activityData: {
    date: string;
    hasActivity: boolean;
    wordCount: number;
  }[];
}

export function StreakCalendar({ activityData }: StreakCalendarProps) {
  // Get last 7 weeks (49 days) of data
  const weeks = [];
  for (let i = 0; i < 7; i++) {
    weeks.push(activityData.slice(i * 7, (i + 1) * 7));
  }

  const getIntensityColor = (wordCount: number) => {
    if (wordCount === 0) return "bg-gray-100";
    if (wordCount < 5) return "bg-blue-200";
    if (wordCount < 10) return "bg-blue-400";
    if (wordCount < 20) return "bg-blue-600";
    return "bg-blue-800";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Streak</h2>

      <div className="flex gap-2">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-2">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`w-4 h-4 rounded-sm ${getIntensityColor(
                  day.wordCount
                )} hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer`}
                title={`${day.date}: ${day.wordCount} words`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-gray-100"></div>
          <div className="w-4 h-4 rounded-sm bg-blue-200"></div>
          <div className="w-4 h-4 rounded-sm bg-blue-400"></div>
          <div className="w-4 h-4 rounded-sm bg-blue-600"></div>
          <div className="w-4 h-4 rounded-sm bg-blue-800"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
