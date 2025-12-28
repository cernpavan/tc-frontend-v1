import { useState } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { Post } from '../../types';
import { apiPost, apiDelete } from '@services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';

interface ReactionBarProps {
  post: Post;
}

const reactions = [
  { type: 'relatable', emoji: '😳', label: 'Relatable', labelTe: 'సంబంధం' },
  { type: 'hot', emoji: '🔥', label: 'Hot', labelTe: 'హాట్' },
  { type: 'feltThis', emoji: '🤍', label: 'Felt this', labelTe: 'అనిపించింది' },
  { type: 'curious', emoji: '🤔', label: 'Curious', labelTe: 'ఆసక్తి' },
  { type: 'sad', emoji: '😢', label: 'Sad', labelTe: 'బాధ' },
  { type: 'tooMuch', emoji: '🙈', label: 'Intense', labelTe: 'తీవ్రమైన' },
];

export default function ReactionBar({ post }: ReactionBarProps) {
  const { user, isAuthenticated } = useAuthStore();
  const currentLanguage = isAuthenticated ? user?.language : (localStorage.getItem('guest-language') || 'english');
  const isTeluguLang = currentLanguage === 'telugu';

  const [counts, setCounts] = useState(post.reactionCounts || {
    relatable: 0,
    hot: 0,
    feltThis: 0,
    curious: 0,
    sad: 0,
    tooMuch: 0,
  });
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReaction = async (reactionType: string) => {
    if (isLoading) return;

    const previousReaction = myReaction;
    const previousCounts = { ...counts };

    // Optimistically update UI immediately
    if (myReaction === reactionType) {
      // Remove reaction
      setCounts((prev) => ({
        ...prev,
        [reactionType]: Math.max(0, prev[reactionType as keyof typeof prev] - 1),
      }));
      setMyReaction(null);
    } else {
      // Add/change reaction
      const newCounts = { ...counts };
      if (myReaction) {
        // Decrement old reaction
        newCounts[myReaction as keyof typeof newCounts] = Math.max(0, newCounts[myReaction as keyof typeof newCounts] - 1);
      }
      // Increment new reaction
      newCounts[reactionType as keyof typeof newCounts] = newCounts[reactionType as keyof typeof newCounts] + 1;
      setCounts(newCounts);
      setMyReaction(reactionType);
    }

    setIsLoading(true);
    try {
      if (previousReaction === reactionType) {
        // Remove reaction API call
        await apiDelete(`/reactions/post/${post._id}`);
      } else {
        // Add/change reaction API call
        await apiPost(`/reactions/post/${post._id}`, { reactionType });
      }
    } catch (error) {
      toast.error('Failed to react');
      // Revert optimistic update on error
      setCounts(previousCounts);
      setMyReaction(previousReaction);
    } finally {
      setIsLoading(false);
    }
  };

  const totalReactions = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  // Sort reactions by count for progressive disclosure
  const sortedReactions = [...reactions].sort((a, b) => {
    const countA = counts[a.type as keyof typeof counts] || 0;
    const countB = counts[b.type as keyof typeof counts] || 0;
    return countB - countA;
  });

  // Show top 3 reactions by default, all when expanded
  const visibleReactions = isExpanded ? reactions : sortedReactions.slice(0, 3);
  const hiddenCount = reactions.length - 3;

  return (
    <div className="flex flex-wrap items-center gap-1 md:gap-2">
      {visibleReactions.map((reaction) => {
        const count = counts[reaction.type as keyof typeof counts] || 0;
        const isActive = myReaction === reaction.type;

        return (
          <button
            key={reaction.type}
            onClick={() => handleReaction(reaction.type)}
            disabled={isLoading}
            className={clsx(
              'reaction-btn',
              isActive && 'reaction-btn-active reaction-selected'
            )}
            title={isTeluguLang ? reaction.labelTe : reaction.label}
            aria-label={`${isTeluguLang ? reaction.labelTe : reaction.label}${count > 0 ? ` (${count})` : ''}`}
          >
            <span className="text-sm md:text-base">{reaction.emoji}</span>
            {count > 0 && <span className="text-[10px] md:text-xs font-medium">{count}</span>}
          </button>
        );
      })}

      {/* Expand button for more reactions */}
      {!isExpanded && hiddenCount > 0 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="reaction-btn text-dark-400"
          aria-label="Show more reactions"
        >
          <ChevronDown size={14} className="md:w-4 md:h-4" />
          <span className="text-[10px] md:text-xs">+{hiddenCount}</span>
        </button>
      )}

      {/* Is This Normal Indicator - hidden on mobile for space */}
      {totalReactions >= 5 && (
        <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-dark-800/50 border border-dark-700/50">
          <span className={`text-xs text-dark-400 ${isTeluguLang ? 'font-telugu' : ''}`}>
            {counts.relatable > totalReactions * 0.5
              ? isTeluguLang ? '✓ చాలా మంది సంబంధం' : '✓ Many relate'
              : counts.tooMuch > totalReactions * 0.3
              ? isTeluguLang ? '⚠ అసాధారణం' : '⚠ Uncommon'
              : isTeluguLang ? '≈ మిశ్రమ ప్రతిస్పందనలు' : '≈ Mixed reactions'}
          </span>
        </div>
      )}
    </div>
  );
}
