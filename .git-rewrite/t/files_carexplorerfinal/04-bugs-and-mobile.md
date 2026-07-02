# Car Explorer — Bug Fixes & Mobile Viewport

## Bug 1: Save to Garage — text clipped, corners too round

### Root Cause
`border-radius: 100px` on a short-height button with `overflow: hidden` clips
the icon or text when the button height is constrained.

### Fix
```css
/* action button base */
.act-btn {
  width: 100%;
  padding: 14px 20px;          /* generous vertical + horizontal */
  border-radius: 16px;          /* NOT 100px — use 16px for rectangle buttons */
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  overflow: visible;             /* never hidden on buttons with text */
  white-space: nowrap;           /* prevent wrap on short labels */
  /* pill shape only for 1-word CTAs like "Browse Cars →" */
}

/* pill shape — only for standalone single-word CTAs */
.btn-pill {
  border-radius: 100px;
  padding: 13px 32px;
  width: auto;                   /* not full width */
}
```

**Rule:** `border-radius: 100px` (full pill) only on:
- Single-word or very short buttons (`Browse Cars →`, `Decode`, `Clear`)
- Buttons with `width: auto` (not stretched full-width)

Full-width buttons with icons + text → `border-radius: 16px`.

---

## Bug 2: Favorites item — text clipped

### Fix
```css
.fav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  border-radius: 14px;          /* was too large relative to height */
  min-height: 64px;
  overflow: visible;
}

.fav-body {
  flex: 1;
  min-width: 0;                 /* CRITICAL — allows text to truncate inside flex */
}

.fav-model {
  font-size: 14px;
  font-weight: 600;
  display: block;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;      /* truncate long model names gracefully */
}

.fav-brand {
  font-size: 11px;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

## Mobile Viewport Rules

### Viewport meta (required)
```html
<meta name="viewport"
  content="width=device-width, initial-scale=1,
           maximum-scale=1, user-scalable=no,
           viewport-fit=cover">
```

`viewport-fit=cover` enables safe area insets on notched devices.

### Safe Area Insets
```css
/* bottom nav */
nav {
  padding-bottom: max(env(safe-area-inset-bottom), 12px);
}

/* content screens */
.screen {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

/* settings sheet */
.settings-sheet {
  padding-bottom: max(env(safe-area-inset-bottom), 24px);
}
```

### Minimum Touch Targets
All interactive elements must be ≥ 44×44px (Apple HIG / Material guidelines):

```css
/* nav items */
.ni { min-height: 44px; min-width: 44px; }

/* model card checkboxes — make hit area larger than visual */
.cmp-box {
  width: 17px; height: 17px;   /* visual */
}
.cmp-box::before {             /* expanded hit area */
  content: '';
  position: absolute;
  inset: -14px;
}

/* remove buttons (fav-rm, etc.) */
.fav-rm { width: 44px; height: 44px; }

/* back buttons */
.back-btn { min-height: 44px; padding: 12px 0; }
```

### Font Size Floor
```css
/* Never below these sizes for readable content */
body copy:    13–14px
Labels:       11px minimum
Eyebrows:     10px minimum (uppercase + letter-spacing compensates)
Spec labels:  9px (acceptable — uppercase, sufficient contrast)
```

### Scroll Behavior
```css
/* Horizontal chip rows */
.chips-row {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  scroll-snap-type: x proximity;
}
.chips-row::-webkit-scrollbar { display: none; }

/* Screen scroll */
.screen {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}
```

### No Zoom on Input Focus (iOS)
```css
/* All inputs must be ≥ 16px to prevent iOS auto-zoom */
input, textarea, select {
  font-size: max(16px, 1rem);
}

/* Exception: if design requires smaller, compensate with transform */
.vin-field {
  font-size: 16px;              /* minimum for iOS — was 20px in design, OK */
}
```

### Active States (mobile tap feedback)
```css
/* Use :active, not :hover alone — hover doesn't fire reliably on touch */
.brand-card:active,
.model-card:active,
.home-tile:active { transform: scale(0.97); transition: transform 100ms; }

.act-btn:active { opacity: 0.82; }
.btn-solid:active { opacity: 0.80; }
```

### Bottom Sheet (Settings) — gesture close
```javascript
// Support swipe-down to close
let startY = 0;
sheet.addEventListener('touchstart', e => { startY = e.touches[0].clientY; });
sheet.addEventListener('touchmove', e => {
  const dy = e.touches[0].clientY - startY;
  if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
});
sheet.addEventListener('touchend', e => {
  const dy = e.changedTouches[0].clientY - startY;
  if (dy > 80) closeSettings();
  else sheet.style.transform = '';
});
```

### Tablet Layout (≥ 600px width)
```css
@media (min-width: 600px) {
  body {
    max-width: 430px;          /* keep phone-width column, centered */
    /* or expand to 2-col grid for tablet */
  }

  /* Optional tablet expansion */
  @media (min-width: 768px) {
    .brand-list  { column-count: 2; }   /* 2-col brand grid */
    .model-grid  { grid-template-columns: repeat(3, 1fr); }  /* 3-col models */
    .home-grid   { grid-template-columns: repeat(4, 1fr); }  /* 4 tiles */
  }
}
```

---

## Pre-ship Mobile Checklist

- [ ] Tested on iPhone SE (375px) — smallest common screen
- [ ] Tested on iPhone 15 Pro Max (430px)
- [ ] Tested on Android mid-range (360px, Chrome)
- [ ] Tested on iPad (768px) — at minimum no layout breaks
- [ ] No horizontal scroll on any screen
- [ ] All inputs ≥ 16px font-size (no auto-zoom on iOS)
- [ ] Bottom nav clears home indicator on iPhone (safe area)
- [ ] Settings sheet swipe-down gesture works
- [ ] Fav item text does not clip on 320px width
- [ ] All CTAs readable at system large text size (accessibility)
