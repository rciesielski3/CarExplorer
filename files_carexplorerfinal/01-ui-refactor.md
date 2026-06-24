# Car Explorer — Phase 1: UI Refactor

> **Scope:** Visual redesign only. Zero new backend costs. No new features.  
> **Goal:** App feels modern, polished, portfolio-worthy. Existing functionality intact.

---

## Design System

### Typography
| Role | Font | Weight |
|------|------|--------|
| Display / headings | Barlow Condensed | 700–900 |
| Body / UI | DM Sans | 400–600 |

```
https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap
```

### Color Tokens

```dart
// dark (default)
--bg:        #0A0A0B
--bg2:       #111114
--bg3:       #18181D
--surface:   rgba(255,255,255,0.035)
--border:    rgba(255,255,255,0.07)
--border2:   rgba(255,255,255,0.04)
--text:      #EEEAE4
--text2:     #9A9590
--text3:     #55534F
--accent:    #FF4D1C
--accent-lo: rgba(255,77,28,0.12)
--accent-md: rgba(255,77,28,0.22)
--nav:       rgba(10,10,11,0.94)

// light
--bg:        #F2EFE9
--bg2:       #E9E5DD
--bg3:       #DDD9D0
--surface:   rgba(255,255,255,0.65)
--border:    rgba(0,0,0,0.08)
--text:      #1C1A17
--text2:     #7A756E
--text3:     #B0AAA2
--accent:    #E03A0A
--nav:       rgba(242,239,233,0.95)
```

### Border Radius
```
--r:   12px   (cards, inputs, rows)
--rl:  18px   (larger cards, sheets)
--rxl: 24px   (modal sheets)
```

---

## Navigation Architecture

### Bottom Nav — 5 tabs (max per HIG)

| # | Tab | Screen ID | Daily Use |
|---|-----|-----------|-----------|
| 1 | Home | `HomeScreen` | ★★★★★ |
| 2 | Explore | `ExploreScreen` | ★★★★★ |
| 3 | Quiz | `QuizScreen` | ★★★★☆ |
| 4 | Garage | `GarageScreen` | ★★★★☆ |
| 5 | News | `NewsScreen` | ★★★★☆ |

**Rules:**
- Sub-screens (`ModelListScreen`, `ModelDetailScreen`) do NOT change the active tab — Explore stays highlighted throughout the browse flow
- Settings opens as a **bottom sheet overlay**, not a nav item
- VIN and Compare are **Home tiles**, not nav tabs (used rarely — 1–3× per session max)

### Settings — Bottom Sheet
- Triggered by ⚙ icon in Home header (top-right)
- Swipe-down or tap-backdrop to dismiss
- Contains: Light/Dark toggle, Language picker, Clear Garage, Reset Comparator, About

---

## Screen Inventory

### HomeScreen
```
Header row:
  [CARX logo]                    [⚙ Settings icon]

Hero section:
  eyebrow: "Your automotive companion"
  H1: "Drive / Curiosity" (accent color on second line)
  subtext: one line description

Stats strip (3 cols):
  Brands | Models | Quiz Q's

2×2 tile grid:
  [VIN Checker]  [Compare]
  (other 2 slots reserved for Phase 2/3)

Bottom: AI card — HIDDEN in Phase 1, slot reserved
```

### ExploreScreen
```
Page header: eyebrow + "Explore Cars" H1
Search bar: rounded pill, left search icon
Filter chips: horizontal scroll — All / Luxury / Sports / Supercar / Electric / American / Mainstream / Off-road / AWD
Brand list: card rows with abbr tile, name, meta, chevron
```

### ModelListScreen (sub, Explore tab stays active)
```
Back button → All brands
Brand name + type eyebrow
2-col model grid: type label, model name (display font), power stat
Compare checkbox top-right of each card
Sticky compare bar at bottom when ≥2 selected
```

### ModelDetailScreen (sub, Explore tab stays active)
```
Hero area (bg2 color):
  Back button
  Brand tag (accent color)
  Model name (display font, 52–58px)
  Chip tags: body type / drive / country

Spec grid 2×3:
  Engine | Power | Torque | Drive | 0–100 | Weight

Action buttons (full width):
  [Save to Garage]   — heart icon, toggles saved state
  [Add to Compare]   — bar chart icon, toggles compare state
```

**Garage button fix (reported bug):**
- Border radius on button: `border-radius: 100px` (pill shape)
- Min-height: `52px`
- Padding: `14px 20px`
- Font size: `14px`, `font-weight: 600`
- Icon size: `16×16px`, `flex-shrink: 0`
- Use `display: flex; align-items: center; gap: 8px` — prevents text clipping
- Do NOT use `overflow: hidden` on the button itself

### QuizScreen
```
Progress bar (2px height) + counter "1 / 10"
Question card (display font, 28–30px)
4 answer options: full-width rows, check dot right side
  — correct: green tint + ✓
  — wrong: red tint + ✗ (correct also revealed)
Auto-advance after 900ms
Result screen: score ring, title, message, Play Again CTA
```

### GarageScreen
```
Empty state:
  Icon circle + title "Empty Garage" + subtext + "Browse Cars →" CTA

Filled state:
  List of saved items: abbr tile / model name + brand·type / remove ×
```

### NewsScreen
```
Card list:
  Thumbnail area (emoji placeholder until real images) with source overlay
  Body: headline (display font) + excerpt
```

### VINScreen (accessible from Home tile)
```
Eyebrow + "VIN Checker" H1
Input card:
  Label "VEHICLE IDENTIFICATION NUMBER"
  Underline text input (monospaced-style, letter-spacing)
  17-segment visual indicator below input
  Hint: "VIN does not use I, O or Q"
Action row: [Decode] [Clear] side by side
Result card (hidden until decode):
  Accent-color header bar
  Key/value rows: Full VIN / Country / WMI / VDS / Model Year / Plant / Seq / Check Digit
```

---

## Component Specs

### Card / Surface
```css
background: var(--surface);
border: 1px solid var(--border);
border-radius: var(--rl);           /* 18px */
backdrop-filter: blur(12px);
```

### List Row (brand, settings)
```css
padding: 14px 16px;
border-bottom: 1px solid var(--border2);
transition: background 150ms;
/* hover: rgba(255,255,255,0.02) dark / rgba(0,0,0,0.03) light */
```

### Pill Button (filter chip)
```css
padding: 7px 14px;
border-radius: 100px;
border: 1px solid var(--border);
background: var(--surface);
font-size: 11px; font-weight: 500;
/* active/on state: background var(--accent), color #fff */
```

### Action Button (full-width)
```css
width: 100%;
padding: 14px 20px;
border-radius: 100px;
display: flex; align-items: center; justify-content: center; gap: 8px;
font-size: 14px; font-weight: 600;
min-height: 52px;
/* IMPORTANT: no overflow:hidden — prevents text clip */
```

### Toggle Switch
```css
width: 42px; height: 24px;
border-radius: 100px;
/* knob: 18×18px, translate 18px when on */
/* off: var(--text3), on: var(--accent) */
```

### Spec Box
```css
padding: 13px;
border-radius: 12px;
background: var(--bg3);
/* label: 9px, uppercase, letter-spacing .09em, color var(--text3) */
/* value: Barlow Condensed 20px 700, color var(--text) */
```

---

## Animated Background

Subtle moving line particles on canvas (z-index 0, behind all content):
- 18 lines, random position/direction, slow movement
- Color: `rgba(255,77,28, opacity)` dark / `rgba(200,50,10, opacity)` light
- Canvas opacity: `0.28` dark / `0.10` light
- `pointer-events: none`

---

## Responsive / Mobile Rules

- Max content width: `430px`, centered
- All touch targets: minimum `44×44px`
- Bottom nav padding-bottom: `env(safe-area-inset-bottom, 16px)`
- Scroll containers: `-webkit-overflow-scrolling: touch`
- Font sizes: never below `11px` for readable content, `9px` only for labels/eyebrows
- Horizontal chip scroll: `scrollbar-width: none`, no visible scrollbar on iOS

---

## Light / Dark Theme

Switching mechanism:
```html
<html data-theme="light">   <!-- or no attribute for dark -->
```

All colors via CSS variables — NO hardcoded hex in component styles.  
Canvas particle color reacts to `document.documentElement.dataset.theme`.

---

## Checklist before ship

- [ ] Barlow Condensed + DM Sans fonts load correctly
- [ ] All colors via CSS variables (no hardcoded hex in components)
- [ ] Light mode tested on all 7 screens
- [ ] Bottom nav active state correct through sub-screen navigation
- [ ] Garage save/unsave toggles correctly
- [ ] VIN 17-segment indicator updates on each keypress
- [ ] Quiz auto-advances after answer
- [ ] Settings sheet opens/closes without nav change
- [ ] All touch targets ≥ 44px
- [ ] Safe area insets applied to bottom nav
- [ ] No text clipping on action buttons
