import { Clock, Heart, MessageCircle, Eye } from 'lucide-react';

export type PostFilterType = 'latest' | 'most-liked' | 'most-commented' | 'most-viewed';

interface Props {
  activeFilter: PostFilterType;
  onFilterChange: (filter: PostFilterType) => void;
}

export default function PostFilters({ activeFilter, onFilterChange }: Props) {
  const filters: Array<{ type: PostFilterType; label: string; icon: any }> = [
    { type: 'latest', label: 'Latest', icon: Clock },
    { type: 'most-liked', label: 'Most Liked', icon: Heart },
    { type: 'most-commented', label: 'Most Commented', icon: MessageCircle },
    { type: 'most-viewed', label: 'Most Viewed', icon: Eye },
  ];

  return (
    <div className="card bg-dark-800/50">
      <h3 className="text-sm font-medium text-dark-400 mb-3">Sort Posts By</h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.type}
              onClick={() => onFilterChange(filter.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeFilter === filter.type
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-dark-400 hover:bg-dark-600 hover:text-dark-300'
              }`}
            >
              <Icon size={16} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
