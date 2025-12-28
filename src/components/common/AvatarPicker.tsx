import clsx from 'clsx';
import { AVATAR_OPTIONS } from '@/types';

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
  className?: string;
}

export default function AvatarPicker({
  selectedAvatar,
  onSelect,
  className
}: AvatarPickerProps) {
  return (
    <div className={clsx('space-y-3', className)}>
      <label className="block text-sm font-medium text-dark-300">
        Choose your avatar
      </label>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {AVATAR_OPTIONS.map((avatar) => (
          <button
            key={avatar}
            type="button"
            onClick={() => onSelect(avatar)}
            className={clsx(
              'w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg text-xl sm:text-2xl',
              'transition-all duration-200 border-2',
              selectedAvatar === avatar
                ? 'bg-primary-500/20 border-primary-500 scale-110'
                : 'bg-dark-800 border-dark-700 hover:border-dark-600 hover:bg-dark-750'
            )}
            aria-label={`Select ${avatar} avatar`}
            aria-pressed={selectedAvatar === avatar}
          >
            {avatar}
          </button>
        ))}
      </div>
      <p className="text-xs text-dark-500">
        This avatar will be displayed next to your posts and comments
      </p>
    </div>
  );
}
