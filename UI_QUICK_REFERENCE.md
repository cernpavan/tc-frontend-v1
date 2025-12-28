# UI/UX Quick Reference - Telugu Confession Platform

## Color Palette (Warm Midnight Theme)

### Background Colors
| Token | Hex | Usage |
|-------|-----|-------|
| dark-950 | #0f0c18 | Body background |
| dark-900 | #171321 | Main areas |
| dark-850 | #1e1a2a | Sidebar, elevated |
| dark-800 | #252033 | Cards, inputs |
| dark-750 | #2d283d | Borders, surfaces |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| dark-100 | #faf8fc | Primary text |
| dark-300 | #d4cce4 | Secondary text |
| dark-400 | #a99ec4 | Muted text |
| dark-500 | #7e72a3 | Disabled text |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| primary-500 | #d946ef | Main accent (purple) |
| primary-600 | #c026d3 | Buttons, links |
| accent-500 | #f43f5e | Secondary accent (rose) |

### Vote Colors
| Token | Hex | Usage |
|-------|-----|-------|
| vote-up | #4ade80 | Upvote (green) |
| vote-down | #f87171 | Downvote (red) |

---

## Touch Targets

**Minimum size: 44x44px**

```css
/* Add to any interactive element */
min-height: 44px;
min-width: 44px;

/* Tailwind utility */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

---

## Component Classes

### Buttons
```html
<!-- Primary Button -->
<button class="btn-primary">Action</button>

<!-- Secondary Button -->
<button class="btn-secondary">Cancel</button>

<!-- Ghost Button -->
<button class="btn-ghost">Menu</button>

<!-- Icon Button (44x44px) -->
<button class="btn-icon">
  <Icon size={20} />
</button>
```

### Cards
```html
<!-- Basic Card -->
<div class="card">Content</div>

<!-- Interactive Card (clickable) -->
<div class="card-interactive">Clickable</div>
```

### Inputs
```html
<!-- Standard Input -->
<input class="input" placeholder="..." />

<!-- Error State -->
<input class="input-error" />
```

### Badges
```html
<span class="badge-primary">Tag</span>
<span class="badge-nsfw">18+</span>
<span class="badge-success">Active</span>
```

### Tag Pills
```html
<button class="tag-pill">Tag Name</button>
<button class="tag-pill tag-pill-active">Selected</button>
```

---

## Vote Buttons

```html
<div class="flex items-center bg-dark-800 rounded-full">
  <button class="vote-btn vote-btn-active-up">
    <!-- Up arrow -->
  </button>
  <span class="min-w-[2.5rem] text-center font-bold">123</span>
  <button class="vote-btn">
    <!-- Down arrow -->
  </button>
</div>
```

---

## Skeleton Loading

```html
<!-- Basic skeleton -->
<div class="skeleton w-24 h-4 rounded"></div>

<!-- Shimmer effect -->
<div class="skeleton-shimmer w-full h-4 rounded"></div>
```

---

## Animations

### Available Animations
```
animate-fade-in      - Opacity 0 to 1
animate-slide-up     - Slide from bottom
animate-slide-down   - Slide from top
animate-scale-in     - Scale 0.95 to 1
animate-vote-pop     - Scale pop effect
animate-shimmer      - Loading shimmer
```

### Usage
```html
<div class="animate-fade-in">Fading in</div>
<button class="animate-vote-pop">Voted!</button>
```

---

## Spacing Reference

| Class | Value | Pixels |
|-------|-------|--------|
| p-2 | 0.5rem | 8px |
| p-3 | 0.75rem | 12px |
| p-4 | 1rem | 16px |
| p-6 | 1.5rem | 24px |
| gap-2 | 0.5rem | 8px |
| gap-3 | 0.75rem | 12px |
| gap-4 | 1rem | 16px |

---

## Border Radius

| Class | Value |
|-------|-------|
| rounded-lg | 0.5rem (8px) |
| rounded-xl | 0.75rem (12px) |
| rounded-2xl | 1rem (16px) |
| rounded-full | 9999px |

---

## Focus States

All interactive elements should have visible focus:

```css
/* Already in index.css */
*:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: primary-500;
  ring-offset: 2px;
  ring-offset-color: dark-950;
}
```

---

## Telugu Typography

```html
<!-- Telugu text wrapper -->
<span class="font-telugu">తెలుగు టెక్స్ట్</span>

<!-- Telugu-optimized sizes -->
<p class="text-te-sm">Small Telugu</p>
<p class="text-te-base">Base Telugu</p>
<p class="text-te-lg">Large Telugu</p>
```

---

## Mobile Bottom Nav

**Integration in MainLayout.tsx:**
```tsx
import BottomNav from '@components/common/BottomNav';

// Add before closing </div>
<BottomNav />

// Add bottom padding to main content
<main class="pb-24 lg:pb-6">
```

---

## Priority Files

### P0 (Critical)
1. tailwind.config.js - Color system
2. src/index.css - Component styles
3. PostCard.tsx - Touch targets
4. Header.tsx - Touch targets
5. CommentCard.tsx - Touch targets

### P1 (High)
1. ReactionBar.tsx - Simplification
2. Feed.tsx - Skeletons
3. Sidebar.tsx - Touch targets
4. MainLayout.tsx - Bottom nav

### P2 (Medium)
1. BottomNav.tsx - New component
2. CreatePost.tsx - Progressive disclosure
3. SearchBar.tsx - Improvements

### P3 (Low)
1. Landing.tsx - Color updates
2. AuthModal.tsx - Styling
3. NotFound.tsx - Empty state

---

## Accessibility Checklist

- [ ] All buttons min 44x44px
- [ ] Focus visible on all interactive elements
- [ ] aria-labels on icon-only buttons
- [ ] Color contrast 4.5:1 for text
- [ ] Respects prefers-reduced-motion
- [ ] Screen reader announcements for dynamic content

---

## File Paths

```
C:\Users\pavan\OneDrive\Desktop\Telugu Confession\frontend\
  tailwind.config.js
  src\
    index.css
    components\
      common\
        Header.tsx
        Sidebar.tsx
        SearchBar.tsx
        BottomNav.tsx  (NEW)
      post\
        PostCard.tsx
        ReactionBar.tsx
      comment\
        CommentCard.tsx
      layouts\
        MainLayout.tsx
    pages\
      Feed.tsx
      CreatePost.tsx
      Landing.tsx
```
