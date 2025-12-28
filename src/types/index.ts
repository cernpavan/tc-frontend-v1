// Community types
export interface Community {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  color?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

// Tag types (admin-managed)
export interface Tag {
  id: string;
  slug: string;
  name: string;
  nameTelugu?: string;
  description?: string;
  color?: string;
  postCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Avatar options
export const AVATAR_OPTIONS = ['😎', '🦊', '🐱', '🐶', '🦁', '🐸', '🐼', '🦄', '🐲', '🎭', '👻', '🤖', '👽', '🦋', '🐙', '🦉', '🐝', '🌸', '⭐', '🔥'] as const;
export type AvatarType = typeof AVATAR_OPTIONS[number];

// User types
export interface User {
  _id: string;
  username: string;
  avatar?: AvatarType;
  language: 'telugu' | 'english';
  theme: 'light' | 'dark';
  showNsfw: boolean;
  usernameChangesLeft: number;
  createdAt: string;
}

// Post types
// PostTag is now a string to support dynamic tags from the database
export type PostTag = string;

export type NsfwLevel = 'normal' | 'explicit' | 'extreme';
export type Mood = 'horny' | 'lonely' | 'guilty' | 'curious' | 'happy';
export type AdviceMode = 'want-advice' | 'just-sharing';
export type ExpiryOption = '24h' | '7d' | '30d' | 'never';

export interface Post {
  _id: string;
  author: {
    _id: string;
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
  contentTranslated?: {
    telugu?: string;
    english?: string;
  };
  images?: string[];
  tags: PostTag[];
  nsfwLevel: NsfwLevel;
  mood?: Mood;
  adviceMode: AdviceMode;
  expiryOption: ExpiryOption;
  expiresAt?: string;
  isStory: boolean;
  upvotes: number;
  downvotes: number;
  reactionCounts: {
    relatable: number;
    hot: number;
    feltThis: number;
    curious: number;
    sad: number;
    tooMuch: number;
  };
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    username: string;
  };
  content: string;
  contentTranslated?: {
    telugu?: string;
    english?: string;
  };
  parentCommentId?: string | null;
  replies: Comment[];
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
}

// Reaction types
export type ReactionType = 'relatable' | 'hot' | 'feltThis' | 'curious' | 'sad' | 'tooMuch';
export type VoteType = 'upvote' | 'downvote';

export interface Reaction {
  _id: string;
  user: string;
  post: string;
  reactionType?: ReactionType;
  voteType?: VoteType;
}

// Report types
export type ReportReason =
  | 'minors'
  | 'non-consensual'
  | 'extreme-abuse'
  | 'spam'
  | 'fake-stories'
  | 'personal-data'
  | 'threats'
  | 'other';

export interface Report {
  _id: string;
  reporter: string;
  targetType: 'post' | 'comment' | 'user';
  targetPost?: string;
  targetComment?: string;
  targetUser?: string;
  reason: ReportReason;
  details?: string;
  status: 'pending' | 'reviewed' | 'action-taken' | 'dismissed';
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Search types
export interface SearchResult extends Post {
  snippet?: string;
  relevanceScore?: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'tag' | 'content';
}

export interface SearchResponse {
  posts: SearchResult[];
  query: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
