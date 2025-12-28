import { BarChart3 } from 'lucide-react';

interface ActivityData {
  date: string;
  count: number;
}

interface Props {
  data: ActivityData[];
}

export default function ActivityGraph({ data }: Props) {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card bg-dark-800/50">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-primary-400" size={20} />
        <h3 className="text-lg font-semibold">Activity (Last 7 Days)</h3>
      </div>

      <div className="space-y-3">
        {data.map((item) => {
          const date = new Date(item.date);
          const dayName = days[date.getDay()];
          const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

          return (
            <div key={item.date} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400 font-medium w-12">{dayName}</span>
                <span className="text-dark-500 text-xs">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="relative h-8 bg-dark-700 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg transition-all duration-500 flex items-center justify-end px-2"
                  style={{ width: `${Math.max(barWidth, item.count > 0 ? 10 : 0)}%` }}
                >
                  {item.count > 0 && (
                    <span className="text-xs font-bold text-white">{item.count}</span>
                  )}
                </div>
                {item.count === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-dark-500">No posts</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-dark-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-400">Total this week:</span>
          <span className="font-bold text-primary-400">
            {data.reduce((sum, d) => sum + d.count, 0)} posts
          </span>
        </div>
      </div>
    </div>
  );
}
