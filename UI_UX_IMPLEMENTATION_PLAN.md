# Telugu Confession Platform - UI/UX Implementation Plan

> **Version**: 1.0
> **Last Updated**: December 2024
> **Scope**: User-facing UI/UX improvements only (no backend/database changes)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Prioritized Implementation Phases](#2-prioritized-implementation-phases)
3. [New Color System (Warm Midnight Theme)](#3-new-color-system-warm-midnight-theme)
4. [File-by-File Implementation Guide](#4-file-by-file-implementation-guide)
5. [Component-Specific Changes](#5-component-specific-changes)
6. [Micro-Copy Updates](#6-micro-copy-updates)
7. [Animation Specifications](#7-animation-specifications)
8. [Accessibility Checklist](#8-accessibility-checklist)
9. [Mobile Bottom Navigation Spec](#9-mobile-bottom-navigation-spec)

---

## 1. Executive Summary

This document provides a comprehensive, actionable implementation plan for improving the UI/UX of the Telugu Confession Platform. All changes focus exclusively on user-facing components and maintain backward compatibility with existing flows.

### Key Objectives
- Improve visual hierarchy and reduce cognitive load
- Enhance mobile experience with touch-optimized targets (minimum 44px)
- Implement "Warm Midnight" purple-tinted dark theme
- Add meaningful micro-interactions and animations
- Ensure WCAG 2.1 AA accessibility compliance
- Support Telugu language users with proper typography

---

## 2. Prioritized Implementation Phases

### Phase 1: Critical Foundations (Week 1-2) - HIGHEST IMPACT

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Color palette update to Warm Midnight | P0 | Medium | High |
| Touch target fixes (44px minimum) | P0 | Low | High |
| Typography scale improvements | P0 | Low | Medium |
| Focus states for accessibility | P0 | Low | High |
| Button size standardization | P0 | Low | Medium |

### Phase 2: Feed Experience Enhancement (Week 2-3)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| PostCard visual hierarchy redesign | P1 | High | High |
| ReactionBar simplification (top 3 visible) | P1 | Medium | Medium |
| Vote button micro-interactions | P1 | Low | Medium |
| Skeleton shimmer animations | P1 | Low | Medium |
| Content line-clamp improvements | P1 | Low | Low |

### Phase 3: Navigation & Accessibility (Week 3-4)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Mobile bottom navigation bar | P2 | High | High |
| Search UX improvements | P2 | Medium | Medium |
| Sidebar mobile drawer enhancements | P2 | Medium | Medium |
| Progressive disclosure in CreatePost | P2 | Medium | Medium |
| Screen reader improvements | P2 | Medium | High |

### Phase 4: Polish & Delight (Week 4-5)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Page transition animations | P3 | Medium | Low |
| Empty state illustrations | P3 | Medium | Medium |
| Micro-copy Telugu translations | P3 | Low | Medium |
| Success/error state animations | P3 | Low | Low |
| Loading state improvements | P3 | Low | Low |

---

## 3. New Color System (Warm Midnight Theme)

### Update: `tailwind.config.js`

Replace the existing color configuration with the new "Warm Midnight" purple-tinted dark theme:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary - Warm Purple (main accent)
        primary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        // Accent - Rose/Coral (secondary actions)
        accent: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        // Warm Midnight - Purple-tinted dark backgrounds
        dark: {
          50: '#faf8fc',
          100: '#f3f0f7',
          200: '#e8e3f0',
          300: '#d4cce4',
          400: '#a99ec4',
          500: '#7e72a3',
          600: '#5f5584',
          700: '#4a4369',
          // KEY BACKGROUND COLORS - Purple-tinted
          750: '#2d283d',  // Card borders, elevated surfaces
          800: '#252033',  // Card backgrounds, inputs
          850: '#1e1a2a',  // Sidebar, elevated backgrounds
          900: '#171321',  // Main background areas
          950: '#0f0c18',  // Body background, deepest
        },
        // Semantic colors
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Vote colors (distinct from semantic)
        vote: {
          up: '#4ade80',      // Green for upvotes
          upBg: '#166534',    // Background when active
          down: '#f87171',    // Red for downvotes
          downBg: '#991b1b',  // Background when active
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        telugu: ['Noto Sans Telugu', 'Mandali', 'sans-serif'],
      },
      fontSize: {
        // Improved typography scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        // Telugu-optimized sizes (slightly larger for readability)
        'te-sm': ['0.9375rem', { lineHeight: '1.5rem' }],
        'te-base': ['1.0625rem', { lineHeight: '1.75rem' }],
        'te-lg': ['1.1875rem', { lineHeight: '2rem' }],
      },
      spacing: {
        // Touch target minimum (44px = 2.75rem)
        'touch': '2.75rem',
        'touch-sm': '2.5rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(217, 70, 239, 0.15)',
        'glow-accent': '0 0 20px rgba(244, 63, 94, 0.15)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.15s ease-in',
        'bounce-subtle': 'bounceSubtle 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'vote-pop': 'votePop 0.3s ease-out',
        'heart-beat': 'heartBeat 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(217, 70, 239, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(217, 70, 239, 0.4)' },
        },
        votePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        heartBeat: {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1)' },
          '75%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
```

### CSS Variables Update: `src/index.css`

Add these CSS variables for easy runtime theming:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS Custom Properties for theming */
@layer base {
  :root {
    /* Warm Midnight Theme (Default Dark) */
    --color-bg-primary: 15 12 24;      /* dark-950 */
    --color-bg-secondary: 23 19 33;    /* dark-900 */
    --color-bg-tertiary: 30 26 42;     /* dark-850 */
    --color-bg-elevated: 37 32 51;     /* dark-800 */
    --color-bg-surface: 45 40 61;      /* dark-750 */

    --color-text-primary: 250 248 252;  /* near white */
    --color-text-secondary: 212 204 228; /* dark-300 */
    --color-text-muted: 169 158 196;    /* dark-400 */
    --color-text-disabled: 126 114 163; /* dark-500 */

    --color-border-default: 45 40 61;   /* dark-750 */
    --color-border-subtle: 37 32 51;    /* dark-800 */

    --color-primary: 217 70 239;        /* primary-500 */
    --color-accent: 244 63 94;          /* accent-500 */

    /* Spacing for touch targets */
    --touch-target-min: 44px;
    --touch-target-comfortable: 48px;

    /* Typography */
    --font-telugu: 'Noto Sans Telugu', 'Mandali', sans-serif;
    --line-height-telugu: 1.75;
  }

  html {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    scroll-behavior: smooth;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    @apply bg-dark-950 text-dark-100 antialiased;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Telugu text optimization */
  .font-telugu,
  [lang="te"] {
    font-family: var(--font-telugu);
    line-height: var(--line-height-telugu);
  }

  /* Focus visible for accessibility */
  *:focus-visible {
    @apply outline-none ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-950;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Scrollbar styling - Warm Midnight */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-dark-900;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-dark-700 rounded-full;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-dark-600;
  }

  /* Selection color */
  ::selection {
    @apply bg-primary-600/40 text-white;
  }
}

/* Component Styles */
@layer components {
  /* Button Base - with touch targets */
  .btn {
    @apply px-4 py-2.5 rounded-xl font-medium transition-all duration-200;
    @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
    @apply active:scale-[0.98];
    min-height: var(--touch-target-min);
  }

  .btn-primary {
    @apply btn bg-primary-600 text-white;
    @apply hover:bg-primary-500 hover:shadow-glow-primary;
    @apply focus-visible:ring-primary-500;
  }

  .btn-secondary {
    @apply btn bg-dark-750 text-dark-100 border border-dark-700;
    @apply hover:bg-dark-700 hover:border-dark-600;
    @apply focus-visible:ring-dark-500;
  }

  .btn-accent {
    @apply btn bg-accent-600 text-white;
    @apply hover:bg-accent-500 hover:shadow-glow-accent;
    @apply focus-visible:ring-accent-500;
  }

  .btn-ghost {
    @apply btn bg-transparent text-dark-300;
    @apply hover:bg-dark-800 hover:text-dark-100;
    @apply focus-visible:ring-dark-500;
  }

  /* Icon Button - for circular icon-only buttons */
  .btn-icon {
    @apply flex items-center justify-center rounded-full transition-all duration-200;
    @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950;
    @apply active:scale-95;
    width: var(--touch-target-min);
    height: var(--touch-target-min);
    min-width: var(--touch-target-min);
    min-height: var(--touch-target-min);
  }

  .btn-icon-sm {
    @apply btn-icon;
    width: var(--touch-target-comfortable);
    height: var(--touch-target-comfortable);
  }

  /* Input Base */
  .input {
    @apply w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl;
    @apply text-dark-100 placeholder-dark-500;
    @apply focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
    @apply transition-colors duration-200;
    min-height: var(--touch-target-min);
  }

  .input-error {
    @apply input border-error-500 focus:border-error-500 focus:ring-error-500;
  }

  /* Card Component */
  .card {
    @apply bg-dark-850 border border-dark-750 rounded-2xl p-4;
    @apply shadow-card transition-all duration-200;
  }

  .card-interactive {
    @apply card cursor-pointer;
    @apply hover:border-dark-600 hover:shadow-card-hover;
    @apply active:scale-[0.995];
  }

  /* Badge Components */
  .badge {
    @apply inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full;
    @apply transition-colors duration-200;
  }

  .badge-primary {
    @apply badge bg-primary-900/40 text-primary-300 border border-primary-700/40;
  }

  .badge-accent {
    @apply badge bg-accent-900/40 text-accent-300 border border-accent-700/40;
  }

  .badge-nsfw {
    @apply badge bg-error-900/40 text-error-300 border border-error-700/40;
  }

  .badge-success {
    @apply badge bg-success-600/20 text-success-400 border border-success-600/30;
  }

  /* Vote Button Styles */
  .vote-btn {
    @apply flex items-center justify-center rounded-full transition-all duration-150;
    @apply text-dark-400 hover:text-vote-up hover:bg-vote-up/10;
    @apply focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950;
    width: 36px;
    height: 36px;
    min-width: 36px;
  }

  .vote-btn-active-up {
    @apply text-vote-up bg-vote-up/20;
  }

  .vote-btn-active-down {
    @apply text-vote-down bg-vote-down/20;
  }

  /* Skeleton Loading */
  .skeleton {
    @apply bg-dark-750 rounded animate-pulse;
  }

  .skeleton-shimmer {
    @apply bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800;
    background-size: 200% 100%;
    @apply animate-shimmer;
  }

  /* Link Styles */
  .link {
    @apply text-primary-400 hover:text-primary-300 underline-offset-2;
    @apply hover:underline transition-colors duration-200;
  }

  /* Tag Pills */
  .tag-pill {
    @apply inline-flex items-center px-3 py-1.5 text-sm rounded-full;
    @apply bg-dark-800 text-dark-300 border border-dark-700;
    @apply hover:bg-dark-750 hover:text-dark-200 hover:border-dark-600;
    @apply transition-all duration-200 cursor-pointer;
    min-height: 32px;
  }

  .tag-pill-active {
    @apply bg-primary-600 text-white border-primary-500;
    @apply hover:bg-primary-500;
  }
}

/* NSFW Blur Effect */
.nsfw-blur {
  filter: blur(20px);
  transition: filter 0.3s ease;
}

.nsfw-blur.revealed,
.nsfw-blur:focus-within {
  filter: blur(0);
}

/* Utility Classes */
@layer utilities {
  /* Touch-friendly spacing */
  .touch-target {
    min-width: 44px;
    min-height: 44px;
  }

  /* Text truncation with Telugu support */
  .text-ellipsis-te {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Safe area padding for mobile */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .pt-safe {
    padding-top: env(safe-area-inset-top, 0);
  }

  /* Bottom nav spacing */
  .mb-bottom-nav {
    margin-bottom: calc(64px + env(safe-area-inset-bottom, 0));
  }

  /* Hide scrollbar but keep functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Line clamp utilities */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-4 {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

---

## 4. File-by-File Implementation Guide

### Critical Files (P0)

#### 4.1 `src/index.css`
**Priority**: P0
**Changes**:
- Replace entire file with new CSS from Section 3
- Add CSS variables for theming
- Add touch target utilities
- Add focus-visible states
- Add skeleton shimmer animation

---

#### 4.2 `tailwind.config.js`
**Priority**: P0
**Changes**:
- Replace entire color system with Warm Midnight palette
- Add new spacing values for touch targets
- Add animation keyframes
- Add font size scale for Telugu

---

#### 4.3 `src/components/post/PostCard.tsx`
**Priority**: P0
**Changes**:
```
Current Issues:
- Vote buttons too small (px-2 py-1 = ~32px)
- Visual hierarchy unclear
- Card click area conflicts with buttons
- No press feedback animation

Updates Required:
1. Vote button classes: Change from 'px-2 py-1' to 'w-9 h-9 min-w-[36px]'
2. Add 'card-interactive' class instead of 'card'
3. Add hover:shadow-card-hover transition
4. Update border color from 'border-dark-800' to 'border-dark-750'
5. Add 'animate-vote-pop' on vote action
```

**Specific Class Changes**:
```tsx
// Line 189 - Card wrapper
OLD: className="card hover:border-dark-700 transition-colors cursor-pointer"
NEW: className="card-interactive group"

// Line 331-366 - Vote buttons container
OLD: className="flex items-center gap-1 bg-dark-800/50 rounded-full px-1"
NEW: className="flex items-center bg-dark-800 rounded-full"

// Line 332-344 - Upvote button
OLD: className={clsx('text-xl font-bold transition-all duration-150 px-2 py-1 rounded-full', ...)}
NEW: className={clsx('vote-btn', myVote === 'upvote' && 'vote-btn-active-up animate-vote-pop', ...)}

// Line 353-365 - Downvote button
OLD: className={clsx('text-xl font-bold transition-all duration-150 px-2 py-1 rounded-full', ...)}
NEW: className={clsx('vote-btn', myVote === 'downvote' && 'vote-btn-active-down animate-vote-pop', ...)}
```

---

#### 4.4 `src/components/common/Header.tsx`
**Priority**: P0
**Changes**:
```
Updates Required:
1. All icon buttons need min-44px touch targets
2. Update background from 'bg-dark-900/95' to 'bg-dark-900/98 backdrop-blur-md'
3. Add border-bottom glow effect on scroll
4. Mobile search toggle needs larger hit area
```

**Specific Class Changes**:
```tsx
// Line 65 - Header container
OLD: className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur border-b border-dark-800"
NEW: className="sticky top-0 z-50 bg-dark-900/98 backdrop-blur-md border-b border-dark-750 shadow-lg"

// Line 93-99 - Mobile search toggle
OLD: className="md:hidden btn-ghost p-2"
NEW: className="md:hidden btn-icon bg-transparent text-dark-300 hover:bg-dark-800"

// Line 121-130 - Language toggle
OLD: className="btn-ghost p-2 flex items-center gap-1"
NEW: className="btn-icon-sm bg-transparent text-dark-300 hover:bg-dark-800 flex items-center gap-1"

// Line 133-139 - Theme toggle
OLD: className="btn-ghost p-2"
NEW: className="btn-icon bg-transparent text-dark-300 hover:bg-dark-800"
```

---

#### 4.5 `src/components/comment/CommentCard.tsx`
**Priority**: P0
**Changes**:
```
Updates Required:
1. Vote buttons need larger touch targets (currently too small)
2. Reply input needs minimum height
3. Action buttons need better spacing for touch
4. Thread collapse button needs larger hit area
```

**Specific Class Changes**:
```tsx
// Line 249-286 - Comment vote buttons
OLD: className="flex items-center gap-0.5 bg-dark-800/50 rounded-full px-0.5"
NEW: className="flex items-center bg-dark-800 rounded-full px-1"

// Line 250-262 - Upvote button
OLD: className={clsx('text-base font-bold transition-all duration-150 px-1.5 py-0.5 rounded-full', ...)}
NEW: className={clsx('w-8 h-8 flex items-center justify-center rounded-full transition-all', ...)}

// Line 288-302 - Reply button
OLD: className="font-bold hover:text-dark-300 transition-colors"
NEW: className="px-2 py-1 rounded font-medium hover:bg-dark-800 hover:text-dark-200 transition-colors min-h-[32px]"

// Line 358-384 - Reply form
OLD: className="input flex-1 text-sm py-1.5 bg-dark-800 border-dark-700"
NEW: className="input flex-1 text-sm min-h-[44px]"
```

---

### High Priority Files (P1)

#### 4.6 `src/components/post/ReactionBar.tsx`
**Priority**: P1
**Changes**:
```
Updates Required:
1. Show only top 3 reactions by default, expand on tap
2. Larger touch targets for reaction buttons
3. Add pop animation on selection
4. Better visual distinction for active state
```

**Implementation Strategy**:
```tsx
// Add state for expanded view
const [isExpanded, setIsExpanded] = useState(false);

// Show only top 3 + "more" button when collapsed
const visibleReactions = isExpanded
  ? reactions
  : reactions.slice(0, 3);

// Reaction button classes
OLD: className={clsx('flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all', ...)}
NEW: className={clsx('flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all min-h-[36px]',
  isActive && 'animate-scale-in', ...)}
```

---

#### 4.7 `src/pages/Feed.tsx`
**Priority**: P1
**Changes**:
```
Updates Required:
1. Improve skeleton loading with shimmer effect
2. Add pull-to-refresh visual indicator
3. Better empty state with illustration
4. Add spacing for mobile bottom nav
```

**Specific Class Changes**:
```tsx
// Line 12-29 - PostSkeleton component
// Replace with shimmer version:
const PostSkeleton = memo(() => (
  <div className="card animate-fade-in">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-24 h-4 skeleton-shimmer rounded" />
      <div className="w-16 h-4 skeleton-shimmer rounded" />
    </div>
    <div className="w-3/4 h-5 skeleton-shimmer rounded mb-3" />
    <div className="flex gap-2 mb-3">
      <div className="w-20 h-6 skeleton-shimmer rounded-full" />
      <div className="w-16 h-6 skeleton-shimmer rounded-full" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="w-full h-4 skeleton-shimmer rounded" />
      <div className="w-full h-4 skeleton-shimmer rounded" />
      <div className="w-2/3 h-4 skeleton-shimmer rounded" />
    </div>
  </div>
));

// Line 253 - Main container
OLD: className="space-y-6"
NEW: className="space-y-6 pb-20 lg:pb-6"  // Space for bottom nav on mobile

// Line 298-303 - Empty state
// Replace with improved version (see Section 5.8)
```

---

#### 4.8 `src/components/common/Sidebar.tsx`
**Priority**: P1
**Changes**:
```
Updates Required:
1. Nav items need 44px minimum height
2. Better visual hierarchy for sections
3. Improve tag pills touch targets
4. Add subtle hover animations
```

**Specific Class Changes**:
```tsx
// Line 63-79 - Feed nav links
OLD: className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${...}`}
NEW: className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-[44px] ${
  isActive
    ? 'bg-primary-600/20 text-primary-400 shadow-glow-primary/20'
    : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
}`}

// Line 89-109 - Community nav links
// Same pattern as above - add min-h-[44px] and rounded-xl

// Line 119-133 - Tag pills
OLD: className={({ isActive }) => `text-xs px-2 py-1 rounded-full transition-colors ${...}`}
NEW: className={({ isActive }) => `tag-pill ${isActive ? 'tag-pill-active' : ''}`}
```

---

#### 4.9 `src/components/layouts/MainLayout.tsx`
**Priority**: P1
**Changes**:
```
Updates Required:
1. Add mobile bottom navigation component
2. Adjust main content padding for bottom nav
3. Improve mobile sidebar animation
```

**Implementation**:
```tsx
// Add import for BottomNav (new component - see Section 9)
import BottomNav from '@components/common/BottomNav';

// Line 53-58 - Main content area
OLD: <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)]">
       <div className="max-w-3xl mx-auto px-4 py-6">
NEW: <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)]">
       <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:pb-6">

// Add BottomNav before closing </div>
      </main>
      <BottomNav /> {/* New component - only visible on mobile */}
    </div>
```

---

### Medium Priority Files (P2)

#### 4.10 `src/pages/CreatePost.tsx`
**Priority**: P2
**Changes**:
```
Updates Required:
1. Implement progressive disclosure (advanced options collapsed)
2. Larger touch targets for all form elements
3. Better visual grouping of related fields
4. Add character count progress indicator
```

**Implementation Strategy**:
```tsx
// Add state for advanced options
const [showAdvanced, setShowAdvanced] = useState(false);

// Group basic fields: Title, Content, Tags
// Group advanced fields (collapsed by default):
//   - NSFW Level, Mood, Advice Mode, Expiry, Alias

// Add expand button for advanced:
<button
  type="button"
  onClick={() => setShowAdvanced(!showAdvanced)}
  className="flex items-center gap-2 text-dark-400 hover:text-dark-200"
>
  <ChevronDown className={clsx('transition-transform', showAdvanced && 'rotate-180')} />
  {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
</button>

// Wrap advanced fields in collapsible container:
{showAdvanced && (
  <div className="space-y-6 animate-slide-down">
    {/* NSFW Level, Mood, Advice Mode, Expiry, Alias fields */}
  </div>
)}
```

---

#### 4.11 `src/components/common/SearchBar.tsx`
**Priority**: P2
**Changes**:
```
Updates Required:
1. Larger search input (min 48px height)
2. Better dropdown positioning on mobile
3. Clear visual feedback for loading state
4. Improve keyboard navigation accessibility
```

**Specific Class Changes**:
```tsx
// Line 188-197 - Search input
OLD: className="w-full pl-10 pr-10 py-2 bg-dark-800 border border-dark-700 rounded-full text-sm..."
NEW: className="w-full pl-11 pr-11 py-3 bg-dark-800 border border-dark-750 rounded-2xl text-base min-h-[48px]..."

// Line 216 - Dropdown container
OLD: className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700 rounded-lg..."
NEW: className="absolute top-full left-0 right-0 mt-2 bg-dark-850 border border-dark-750 rounded-2xl shadow-xl..."
```

---

### Lower Priority Files (P3)

#### 4.12 `src/pages/Landing.tsx`
**Priority**: P3
**Changes**:
```
Updates Required:
1. Update gradient colors to match Warm Midnight
2. Improve CTA button visibility
3. Better feature card hover states
4. Enhance age modal design
```

---

#### 4.13 `src/components/auth/AuthModal.tsx`
**Priority**: P3
**Changes**:
```
Updates Required:
1. Update modal background to new dark colors
2. Larger input touch targets
3. Better tab indicator animation
4. Add subtle entrance animation
```

---

#### 4.14 `src/pages/NotFound.tsx`
**Priority**: P3
**Changes**:
```
Updates Required:
1. Add illustration or icon
2. Improve empty state messaging
3. Add helpful navigation options
```

---

## 5. Component-Specific Changes

### 5.1 PostCard Detailed Specification

**Current State**:
- Basic card with flat hierarchy
- Small vote buttons
- Cluttered action row

**Target State**:
```
+------------------------------------------+
| [Avatar] Author Name  in  r/Community    |
|         12m ago  [Mood Emoji]            |
+------------------------------------------+
| Title of the Confession                  |
|                                          |
| [Tag1] [Tag2] [18+ Badge]                |
|                                          |
| Content preview text goes here and can   |
| span multiple lines with proper line     |
| clamp at 3-4 lines...                    |
|                                          |
| [Image Grid if any]                      |
|                                          |
| [Reaction Pills - Top 3 + More]          |
+------------------------------------------+
| [Up] 123 [Down]  | 45 Comments | Share   |
+------------------------------------------+
```

**Visual Specifications**:
- Card padding: 16px (p-4)
- Card border-radius: 16px (rounded-2xl)
- Card background: dark-850
- Card border: 1px dark-750
- Card hover border: dark-600
- Vote button size: 36x36px
- Vote button border-radius: 50%
- Action icon size: 20px
- Title font: 18px semibold (text-lg font-semibold)
- Content font: 15px regular (text-[15px])
- Meta font: 13px (text-sm)
- Spacing between sections: 12px (space-y-3)

---

### 5.2 Header Detailed Specification

**Current State**:
- Good overall structure
- Some buttons under 44px
- Could use better visual separation

**Target State**:
```
+------------------------------------------+
| [TC]  [Live: 1.2k]  [====Search====]     |
|                     [+Confess] [EN] [Sun]|
+------------------------------------------+
```

**Visual Specifications**:
- Header height: 64px (h-16)
- Logo font: 24px bold gradient
- Live indicator: pulsing dot + count
- Search bar: flex-1, max-w-xl, rounded-2xl
- Button touch targets: minimum 44px
- Icon size: 20px (size={20})
- Gap between items: 8px (gap-2)

---

### 5.3 Sidebar Detailed Specification

**Visual Specifications**:
- Width: 256px (w-64)
- Section heading: 12px uppercase tracking-wider text-dark-400
- Section spacing: 24px (space-y-6)
- Nav item height: minimum 44px
- Nav item padding: 12px horizontal, 10px vertical
- Nav item border-radius: 12px (rounded-xl)
- Active nav item: bg-primary-600/20, text-primary-400
- Tag pill height: 32px minimum
- Tag pill padding: 12px horizontal, 6px vertical

---

### 5.4 Bottom Navigation Specification

See Section 9 for complete implementation.

---

### 5.5 ReactionBar Simplification

**Current State**: 6 reactions always visible, crowded

**Target State**: Top 3 reactions visible, expandable

**Implementation**:
```tsx
// New ReactionBar with progressive disclosure
const [isExpanded, setIsExpanded] = useState(false);

// Calculate top 3 by count
const sortedReactions = [...reactions].sort((a, b) =>
  (counts[b.type] || 0) - (counts[a.type] || 0)
);

const visibleReactions = isExpanded ? reactions : sortedReactions.slice(0, 3);
const hiddenCount = reactions.length - 3;

return (
  <div className="flex flex-wrap items-center gap-2">
    {visibleReactions.map((reaction) => (
      // Reaction button
    ))}

    {!isExpanded && hiddenCount > 0 && (
      <button
        onClick={() => setIsExpanded(true)}
        className="tag-pill text-dark-400"
      >
        +{hiddenCount} more
      </button>
    )}
  </div>
);
```

---

### 5.6 CommentCard Touch Target Fixes

**Current Issues**:
- Vote buttons only ~24px
- Reply button is text-only, no clear tap area
- Delete menu trigger too small

**Fixes**:
```tsx
// Vote buttons - increase to 32x32px minimum
className="w-8 h-8 flex items-center justify-center rounded-full"

// Action buttons - add padding and min-height
className="px-3 py-1.5 rounded-lg hover:bg-dark-800 min-h-[32px]"

// Menu trigger - make it a proper icon button
className="btn-icon w-8 h-8"
```

---

### 5.7 CreatePost Progressive Disclosure

**Field Groupings**:

**Always Visible (Essential)**:
- Community selector
- Title input
- Content textarea
- Tags selection
- Submit/Cancel buttons

**Collapsed by Default (Advanced)**:
- Images upload
- NSFW Level
- Mood selector
- Advice Mode
- Post Expiry
- Author Alias

**Implementation Pattern**:
```tsx
<div className="space-y-6">
  {/* Essential Fields */}
  <CommunitySelector />
  <TitleInput />
  <ContentTextarea />
  <TagsSelection />

  {/* Advanced Options Toggle */}
  <button
    onClick={() => setShowAdvanced(!showAdvanced)}
    className="flex items-center gap-2 w-full py-3 text-dark-400 hover:text-dark-200 border-t border-dark-750"
  >
    <Settings size={18} />
    <span>Advanced options</span>
    <ChevronDown className={clsx('ml-auto transition-transform', showAdvanced && 'rotate-180')} />
  </button>

  {/* Collapsible Advanced Section */}
  <div className={clsx(
    'space-y-6 overflow-hidden transition-all duration-300',
    showAdvanced ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
  )}>
    <ImagesUpload />
    <NsfwLevelSelector />
    <MoodSelector />
    <AdviceModeSelector />
    <ExpirySelector />
    <AliasInput />
  </div>

  {/* Submit Buttons */}
  <SubmitButtons />
</div>
```

---

### 5.8 Empty States Specification

**Feed Empty State**:
```tsx
<div className="card text-center py-16">
  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-dark-800 flex items-center justify-center">
    <MessageSquare size={32} className="text-dark-500" />
  </div>
  <h3 className="text-xl font-semibold text-dark-200 mb-2">
    {isTeluguLang ? 'ఇంకా కన్ఫెషన్లు లేవు' : 'No confessions yet'}
  </h3>
  <p className="text-dark-400 mb-6 max-w-sm mx-auto">
    {isTeluguLang
      ? 'మొదటి వ్యక్తిగా మీ కథను పంచుకోండి'
      : 'Be the first to share your story with the community'}
  </p>
  <Link to="/create" className="btn-primary inline-flex items-center gap-2">
    <Plus size={18} />
    {isTeluguLang ? 'కన్ఫెస్ చేయండి' : 'Write a Confession'}
  </Link>
</div>
```

**Search No Results**:
```tsx
<div className="card text-center py-16">
  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-dark-800 flex items-center justify-center">
    <Search size={32} className="text-dark-500" />
  </div>
  <h3 className="text-xl font-semibold text-dark-200 mb-2">
    {isTeluguLang ? 'ఫలితాలు కనుగొనబడలేదు' : 'No results found'}
  </h3>
  <p className="text-dark-400 mb-4 max-w-sm mx-auto">
    {isTeluguLang
      ? `"${query}" కోసం ఏవైనా కన్ఫెషన్లు కనుగొనలేకపోయాము`
      : `We couldn't find any confessions matching "${query}"`}
  </p>
  <p className="text-dark-500 text-sm">
    {isTeluguLang ? 'వేరే పదాలతో ప్రయత్నించండి' : 'Try different keywords or browse tags'}
  </p>
</div>
```

---

## 6. Micro-Copy Updates

### 6.1 Button Labels

| Location | Current (EN) | New (EN) | New (TE) |
|----------|--------------|----------|----------|
| Header CTA | Confess | Share Secret | రహస్యం పంచుకో |
| PostCard Vote | (emoji only) | (keep emoji) | (keep emoji) |
| PostCard Comments | {count} | {count} comments | {count} వ్యాఖ్యలు |
| PostCard Share | Share | Share | షేర్ |
| PostCard Report | Report | Report | నివేదించు |
| ReactionBar | Relatable | I relate | నాకు అర్థమైంది |
| ReactionBar | Hot | Fire | అద్భుతం |
| ReactionBar | Felt this | Felt this | నాకూ అనిపించింది |
| ReactionBar | Curious | Curious | ఆసక్తి |
| ReactionBar | Sad | Sad | బాధగా |
| ReactionBar | Too much | Too much | చాలా ఎక్కువ |

### 6.2 Form Labels

| Location | Current (EN) | New (EN) | New (TE) |
|----------|--------------|----------|----------|
| CreatePost Title | Title * | Give it a title | శీర్షిక ఇవ్వండి |
| CreatePost Content | Your Confession * | Tell your story | మీ కథ చెప్పండి |
| CreatePost Tags | Tags (Select 1-3) * | Choose topics (1-3) | అంశాలు ఎంచుకోండి |
| CreatePost Submit | Post Confession | Share Anonymously | అనామకంగా షేర్ |
| CreatePost Cancel | Cancel | Discard | రద్దు |
| Search Placeholder | Search confessions... | Search stories... | కథలు వెతకండి... |

### 6.3 Empty States & Messages

| Location | Current (EN) | New (EN) | New (TE) |
|----------|--------------|----------|----------|
| Feed Empty | No confessions yet | Nothing here yet | ఇంకా ఏమీ లేదు |
| Feed Empty Sub | Be the first to share your story | Be the first to break the silence | మొదటి వ్యక్తిగా మౌనం విచ్ఛిన్నం చేయండి |
| Feed End | You've reached the end | You're all caught up | అన్నీ చూసారు |
| Search Empty | No results | No matching stories | సరిపోలే కథలు లేవు |
| Comments Empty | No comments yet | No thoughts shared yet | ఇంకా ఆలోచనలు లేవు |
| Comments Placeholder | What are your thoughts? | Share your thoughts... | మీ ఆలోచనలు పంచుకోండి... |

### 6.4 Error Messages

| Scenario | Current | New (EN) | New (TE) |
|----------|---------|----------|----------|
| Vote failed | Failed to vote | Couldn't save your vote | మీ ఓటు సేవ్ కాలేదు |
| Post failed | Failed to create post | Couldn't share your story | మీ కథ షేర్ కాలేదు |
| Load failed | Failed to load posts | Something went wrong | ఏదో తప్పు జరిగింది |
| Network error | Network error | Check your connection | కనెక్షన్ చెక్ చేయండి |

### 6.5 Success Messages

| Scenario | Current | New (EN) | New (TE) |
|----------|---------|----------|----------|
| Post created | Confession posted! | Story shared! | కథ షేర్ అయింది! |
| Comment added | Reply added | Thought shared | ఆలోచన షేర్ అయింది |
| Link copied | Link copied to clipboard | Link copied | లింక్ కాపీ అయింది |
| Login success | Welcome back! | Welcome back! | తిరిగి స్వాగతం! |
| Register success | Account created successfully! | You're in! | మీరు చేరారు! |

---

## 7. Animation Specifications

### 7.1 Vote Button Interactions

```css
/* Vote button pop animation */
@keyframes votePop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.animate-vote-pop {
  animation: votePop 0.3s ease-out;
}

/* Vote count change animation */
@keyframes countChange {
  0% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(-4px); opacity: 0.5; }
  100% { transform: translateY(0); opacity: 1; }
}
```

**Implementation**:
```tsx
// In PostCard vote handler
const handleVote = async (voteType) => {
  // Add animation class
  buttonRef.current?.classList.add('animate-vote-pop');

  // Haptic feedback (if available)
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }

  // Remove animation class after completion
  setTimeout(() => {
    buttonRef.current?.classList.remove('animate-vote-pop');
  }, 300);

  // ... rest of vote logic
};
```

---

### 7.2 Card Press Feedback

```css
/* Card active state */
.card-interactive:active {
  transform: scale(0.995);
  transition: transform 0.1s ease;
}

/* Card hover lift */
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
```

---

### 7.3 Skeleton Shimmer

```css
/* Shimmer gradient animation */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgb(var(--color-bg-elevated)) 0%,
    rgb(var(--color-bg-surface)) 50%,
    rgb(var(--color-bg-elevated)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}
```

---

### 7.4 Page Transitions

Using React Router with Framer Motion (optional enhancement):

```tsx
// Wrap routes with AnimatePresence
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
};

// In route components
<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={pageTransition}
>
  {/* Page content */}
</motion.div>
```

---

### 7.5 Reaction Selection Animation

```css
/* Reaction button selection */
@keyframes reactionPop {
  0% { transform: scale(1); }
  30% { transform: scale(1.2); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.reaction-selected {
  animation: reactionPop 0.4s ease-out;
}

/* Emoji bounce on hover */
.reaction-btn:hover .reaction-emoji {
  animation: bounceSubtle 0.4s ease-out;
}
```

---

### 7.6 Modal Entrance/Exit

```css
/* Modal backdrop */
@keyframes backdropFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Modal content */
@keyframes modalSlide {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-backdrop {
  animation: backdropFade 0.2s ease-out;
}

.modal-content {
  animation: modalSlide 0.3s ease-out;
}
```

---

### 7.7 Loading States

```css
/* Spinner rotation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pulsing dots */
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.loading-dot:nth-child(1) { animation-delay: 0s; }
.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }
```

---

## 8. Accessibility Checklist

### 8.1 Focus Management

- [ ] All interactive elements have visible focus states
- [ ] Focus order follows logical reading order
- [ ] Modal traps focus when open
- [ ] Skip link to main content
- [ ] Focus returns to trigger when modal closes

### 8.2 Keyboard Navigation

- [ ] All functionality accessible via keyboard
- [ ] Escape closes modals/dropdowns
- [ ] Arrow keys navigate menus
- [ ] Enter/Space activate buttons
- [ ] Tab navigates between focusable elements

### 8.3 Screen Reader Support

- [ ] All images have alt text (or alt="" if decorative)
- [ ] Icons have aria-label or sr-only text
- [ ] Form inputs have associated labels
- [ ] Error messages announced via aria-live
- [ ] Loading states announced
- [ ] Page titles update on navigation

### 8.4 Color & Contrast

- [ ] Text meets WCAG AA contrast (4.5:1 for normal, 3:1 for large)
- [ ] UI components meet 3:1 contrast
- [ ] Information not conveyed by color alone
- [ ] Focus indicators visible (3:1 contrast minimum)

### 8.5 Motion & Animation

- [ ] Respect prefers-reduced-motion
- [ ] No auto-playing animations that can't be paused
- [ ] Animations don't flash more than 3 times per second
- [ ] Important content doesn't depend on animation

### 8.6 Touch Targets

- [ ] All touch targets minimum 44x44px
- [ ] Adequate spacing between targets (8px minimum)
- [ ] Touch targets don't overlap
- [ ] Important actions easily reachable with thumb

### 8.7 Telugu Language Support

- [ ] Telugu text uses appropriate font (Noto Sans Telugu)
- [ ] Telugu text has increased line-height (1.75)
- [ ] Telugu text size slightly larger than English
- [ ] Mixed content renders correctly
- [ ] RTL not required (Telugu is LTR)

---

## 9. Mobile Bottom Navigation Spec

### 9.1 New Component: `src/components/common/BottomNav.tsx`

```tsx
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, User, Menu } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import clsx from 'clsx';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  labelTe: string;
  requiresAuth?: boolean;
  action?: () => void;
}

export default function BottomNav() {
  const location = useLocation();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const isTeluguLang = user?.language === 'telugu';

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
    }
  };

  const handleMenuClick = () => {
    window.dispatchEvent(new CustomEvent('toggleMobileSidebar'));
  };

  const navItems: NavItem[] = [
    {
      path: '/feed',
      icon: Home,
      label: 'Home',
      labelTe: 'హోమ్',
    },
    {
      path: '/search',
      icon: Search,
      label: 'Search',
      labelTe: 'వెతకండి',
    },
    {
      path: '/create',
      icon: PlusCircle,
      label: 'Create',
      labelTe: 'సృష్టించు',
      requiresAuth: true,
    },
    {
      path: '/my-posts',
      icon: User,
      label: 'Profile',
      labelTe: 'ప్రొఫైల్',
      requiresAuth: true,
    },
  ];

  // Don't show on auth pages or landing
  if (location.pathname === '/' ||
      location.pathname.startsWith('/auth') ||
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/register')) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-dark-900/98 backdrop-blur-md border-t border-dark-750"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/feed' && location.pathname.startsWith('/feed'));

          const handleClick = (e: React.MouseEvent) => {
            if (item.requiresAuth && !isAuthenticated) {
              e.preventDefault();
              openAuthModal();
            }
          };

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleClick}
              className={clsx(
                'flex flex-col items-center justify-center w-16 h-full',
                'transition-colors duration-200',
                isActive ? 'text-primary-400' : 'text-dark-400'
              )}
            >
              <item.icon
                size={24}
                className={clsx(
                  'transition-transform duration-200',
                  isActive && 'scale-110'
                )}
              />
              <span className={clsx(
                'text-[10px] mt-1 font-medium',
                isTeluguLang && 'font-telugu'
              )}>
                {isTeluguLang ? item.labelTe : item.label}
              </span>
            </NavLink>
          );
        })}

        {/* Menu button for sidebar access */}
        <button
          onClick={handleMenuClick}
          className="flex flex-col items-center justify-center w-16 h-full text-dark-400 transition-colors duration-200"
        >
          <Menu size={24} />
          <span className={clsx(
            'text-[10px] mt-1 font-medium',
            isTeluguLang && 'font-telugu'
          )}>
            {isTeluguLang ? 'మెనూ' : 'More'}
          </span>
        </button>
      </div>
    </nav>
  );
}
```

### 9.2 Visual Specifications

```
+------------------------------------------------+
|  Home    Search   Create   Profile    More     |
|   [H]      [S]     [+]       [P]       [M]     |
+------------------------------------------------+
        Safe area padding at bottom
```

**Dimensions**:
- Total height: 64px + safe-area-inset-bottom
- Item width: equally distributed (flex justify-around)
- Icon size: 24px
- Label size: 10px
- Gap between icon and label: 4px

**Colors**:
- Background: dark-900 with 98% opacity + backdrop-blur
- Border top: dark-750
- Inactive icon: dark-400
- Active icon: primary-400
- Active scale: 1.1

**Behavior**:
- Hidden on desktop (lg:hidden)
- Hidden on landing and auth pages
- Create button triggers auth modal if not logged in
- More button opens sidebar drawer

---

## 10. Implementation Checklist

### Week 1: Critical Foundations
- [ ] Update tailwind.config.js with new color system
- [ ] Update src/index.css with new component styles
- [ ] Fix touch targets in Header.tsx
- [ ] Fix touch targets in PostCard.tsx
- [ ] Fix touch targets in CommentCard.tsx
- [ ] Add focus-visible states globally
- [ ] Test on mobile devices

### Week 2: Feed Experience
- [ ] Redesign PostCard visual hierarchy
- [ ] Implement ReactionBar simplification
- [ ] Add vote button animations
- [ ] Implement skeleton shimmer
- [ ] Update Feed.tsx with new empty states
- [ ] Add bottom nav spacing to main content

### Week 3: Navigation & Accessibility
- [ ] Create BottomNav.tsx component
- [ ] Integrate BottomNav in MainLayout.tsx
- [ ] Improve Sidebar.tsx touch targets
- [ ] Implement SearchBar.tsx improvements
- [ ] Implement CreatePost.tsx progressive disclosure
- [ ] Add aria-labels and screen reader text

### Week 4: Polish
- [ ] Add page transition animations (optional)
- [ ] Update all micro-copy
- [ ] Add Telugu translations
- [ ] Implement success/error animations
- [ ] Final accessibility audit
- [ ] Cross-browser testing
- [ ] Performance optimization

---

## Appendix A: File Quick Reference

| File | Priority | Main Changes |
|------|----------|--------------|
| tailwind.config.js | P0 | Color system, animations |
| src/index.css | P0 | Component styles, utilities |
| src/components/post/PostCard.tsx | P0 | Touch targets, visual hierarchy |
| src/components/common/Header.tsx | P0 | Touch targets, styling |
| src/components/comment/CommentCard.tsx | P0 | Touch targets, spacing |
| src/components/post/ReactionBar.tsx | P1 | Progressive disclosure |
| src/pages/Feed.tsx | P1 | Skeletons, empty states |
| src/components/common/Sidebar.tsx | P1 | Touch targets, styling |
| src/components/layouts/MainLayout.tsx | P1 | Bottom nav integration |
| src/components/common/BottomNav.tsx | P2 | New component |
| src/pages/CreatePost.tsx | P2 | Progressive disclosure |
| src/components/common/SearchBar.tsx | P2 | Touch targets, styling |
| src/pages/Landing.tsx | P3 | Color updates |
| src/components/auth/AuthModal.tsx | P3 | Styling updates |

---

## Appendix B: Testing Checklist

### Device Testing
- [ ] iPhone SE (smallest common iOS)
- [ ] iPhone 14 Pro (notch + dynamic island)
- [ ] Samsung Galaxy S21 (Android)
- [ ] iPad (tablet)
- [ ] Desktop browsers (Chrome, Firefox, Safari, Edge)

### Accessibility Testing
- [ ] VoiceOver (iOS)
- [ ] TalkBack (Android)
- [ ] NVDA (Windows)
- [ ] Keyboard-only navigation
- [ ] High contrast mode
- [ ] Reduced motion mode

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No layout shift during load
- [ ] Smooth 60fps animations

---

*Document prepared by UI Designer Agent*
*For implementation by Frontend Developer*
