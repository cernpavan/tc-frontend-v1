import clsx from 'clsx';

interface UserAvatarProps {
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-sm',
  sm: 'w-8 h-8 text-lg',
  md: 'w-10 h-10 text-xl',
  lg: 'w-12 h-12 text-2xl',
  xl: 'w-16 h-16 text-3xl',
};

export default function UserAvatar({
  avatar = '😎',
  size = 'md',
  className,
  onClick
}: UserAvatarProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-dark-800 border border-dark-700',
        'select-none',
        onClick && 'cursor-pointer hover:border-primary-500 hover:bg-dark-700 transition-colors',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <span className="leading-none">{avatar}</span>
    </div>
  );
}
