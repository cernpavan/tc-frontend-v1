import { Post } from '../types';

// Backend post format (from database)
interface BackendPost {
  id: string;
  authorId: string;
  author?: {
    id: string;
    username: string;
  };
  community?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
  };
  authorAlias?: string;
  title: string;
  content: string;
  contentTranslatedTelugu?: string;
  contentTranslatedEnglish?: string;
  images?: string[];
  tags: string[];
  nsfwLevel: string;
  mood?: string;
  adviceMode: string;
  expiryOption: string;
  expiresAt?: string;
  isStory: boolean;
  upvotes: number;
  downvotes: number;
  reactionRelatable: number;
  reactionHot: number;
  reactionFeltThis: number;
  reactionCurious: number;
  reactionSad: number;
  reactionTooMuch: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform backend post format to frontend Post type
 */
export const transformPost = (backendPost: BackendPost): Post => {
  return {
    _id: backendPost.id,
    author: backendPost.author ? {
      _id: backendPost.author.id,
      username: backendPost.author.username,
    } : {
      _id: backendPost.authorId,
      username: 'Anonymous',
    },
    community: backendPost.community ? {
      id: backendPost.community.id,
      name: backendPost.community.name,
      slug: backendPost.community.slug,
      icon: backendPost.community.icon,
      color: backendPost.community.color,
    } : undefined,
    authorAlias: backendPost.authorAlias,
    title: backendPost.title,
    content: backendPost.content,
    contentTranslated: {
      telugu: backendPost.contentTranslatedTelugu,
      english: backendPost.contentTranslatedEnglish,
    },
    images: backendPost.images,
    tags: backendPost.tags as any,
    nsfwLevel: backendPost.nsfwLevel as any,
    mood: backendPost.mood as any,
    adviceMode: backendPost.adviceMode as any,
    expiryOption: backendPost.expiryOption as any,
    expiresAt: backendPost.expiresAt,
    isStory: backendPost.isStory,
    upvotes: backendPost.upvotes,
    downvotes: backendPost.downvotes,
    reactionCounts: {
      relatable: backendPost.reactionRelatable || 0,
      hot: backendPost.reactionHot || 0,
      feltThis: backendPost.reactionFeltThis || 0,
      curious: backendPost.reactionCurious || 0,
      sad: backendPost.reactionSad || 0,
      tooMuch: backendPost.reactionTooMuch || 0,
    },
    commentCount: backendPost.commentCount,
    createdAt: backendPost.createdAt,
    updatedAt: backendPost.updatedAt,
  };
};

/**
 * Transform an array of backend posts to frontend Post types
 */
export const transformPosts = (backendPosts: BackendPost[]): Post[] => {
  return backendPosts.map(transformPost);
};
