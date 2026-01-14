import { BookOpen, Check, Edit, Grid3x3, FileText } from "lucide-react";

interface Activity {
  id: string;
  type: "flashcard" | "multiple_choice" | "write" | "matching" | "test";
  setName: string;
  score?: number;
  timestamp: string;
}

const activityIcons = {
  flashcard: BookOpen,
  multiple_choice: Check,
  write: Edit,
  matching: Grid3x3,
  test: FileText,
};

const activityLabels = {
  flashcard: "Flashcards",
  multiple_choice: "Multiple Choice",
  write: "Write Mode",
  matching: "Matching",
  test: "Test",
};

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity</p>
          <p className="text-sm mt-2">Start learning to see your progress here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            return (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.setName}</p>
                    <p className="text-sm text-gray-500">
                      {activityLabels[activity.type]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.score !== undefined && (
                    <p className="font-semibold text-gray-900">
                      {activity.score}%
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
