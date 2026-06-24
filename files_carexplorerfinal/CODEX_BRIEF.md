# Car Explorer — Codex Implementation Brief
> Single source of truth for AI-assisted implementation.  
> Stack: React Native · Expo Router · TypeScript · NativeWind · Zustand

---

## 1. Design Tokens

```ts
// constants/tokens.ts

export const Colors = {
  dark: {
    bg:       '#0A0A0B',
    bg2:      '#111114',
    bg3:      '#18181D',
    surface:  'rgba(255,255,255,0.04)',
    border:   'rgba(255,255,255,0.08)',
    border2:  'rgba(255,255,255,0.04)',
    text:     '#EEEAE4',
    text2:    '#9A9590',
    text3:    '#484542',
    accent:   '#FF4D1C',
    accentLo: 'rgba(255,77,28,0.12)',
    accentMd: 'rgba(255,77,28,0.22)',
    green:    '#22C55E',
    red:      '#EF4444',
    nav:      'rgba(10,10,11,0.96)',
  },
  light: {
    bg:       '#F2EFE9',
    bg2:      '#E9E5DD',
    bg3:      '#DDD9D0',
    surface:  'rgba(255,255,255,0.70)',
    border:   'rgba(0,0,0,0.08)',
    border2:  'rgba(0,0,0,0.05)',
    text:     '#1C1A17',
    text2:    '#7A756E',
    text3:    '#B5B0A8',
    accent:   '#E03A0A',
    accentLo: 'rgba(224,58,10,0.10)',
    accentMd: 'rgba(224,58,10,0.20)',
    green:    '#22C55E',
    red:      '#EF4444',
    nav:      'rgba(242,239,233,0.97)',
  },
} as const

export const Spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, xxl: 32,
} as const

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 100,
} as const

export const FontSize = {
  label:   9,
  caption: 11,
  small:   12,
  body:    13,
  bodyLg:  14,
  title:   18,
  h3:      22,
  h2:      28,
  h1:      44,
  hero:    62,
} as const
```

---

## 2. Fonts

```bash
npx expo install expo-font @expo-google-fonts/barlow-condensed @expo-google-fonts/dm-sans
```

```ts
// app/_layout.tsx
import { useFonts } from 'expo-font'
import {
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
  BarlowCondensed_900Black,
} from '@expo-google-fonts/barlow-condensed'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans'

// Usage:
// Display/headings → fontFamily: 'BarlowCondensed_900Black'
// UI text          → fontFamily: 'DMSans_400Regular'
```

**Font usage rules:**
- `BarlowCondensed_900Black` — hero h1, page headings, model names, prices, scores
- `BarlowCondensed_800ExtraBold` — section headers, card titles
- `BarlowCondensed_700Bold` — CTA buttons
- `DMSans_600SemiBold` — tile labels, action buttons, nav labels
- `DMSans_500Medium` — card titles, list items
- `DMSans_400Regular` — body text, descriptions, captions

---

## 3. App Structure

```
app/
├── _layout.tsx              # Root: ThemeProvider, fonts, safe area
├── (tabs)/
│   ├── _layout.tsx          # Custom TabBar component
│   ├── index.tsx            # Home screen
│   ├── explore.tsx          # Explore root
│   ├── quiz.tsx             # Quiz screen
│   ├── garage.tsx           # Garage screen
│   └── news.tsx             # News list
├── explore/
│   ├── [brandId].tsx        # Model list for brand
│   └── [brandId]/
│       └── [model].tsx      # Model detail
├── news/
│   └── [id].tsx             # News article detail
├── compare.tsx              # Compare screen (accessible from home + explore)
└── vin.tsx                  # VIN Checker (accessible from home tile)

components/
├── ui/
│   ├── Card.tsx             # Glass card wrapper
│   ├── ActionButton.tsx     # Full-width rect button (border-radius 14)
│   ├── PillButton.tsx       # Short pill CTA (border-radius 100)
│   ├── SpecBox.tsx          # Individual spec cell
│   ├── Toggle.tsx           # iOS-style switch
│   ├── EyebrowLabel.tsx     # Uppercase accent label with line
│   └── BottomSheet.tsx      # Reusable bottom sheet (react-native-bottom-sheet)
├── home/
│   ├── HeroCard.tsx         # Hero with SVG car + gradient
│   ├── GaragePill.tsx       # Dynamic "N cars saved" pill
│   ├── TileGrid.tsx         # 2×2 feature grid
│   └── AICard.tsx           # Ask AI card with quota
├── explore/
│   ├── BrandRow.tsx         # Brand list item
│   ├── ModelCard.tsx        # Full model card (Vercel-style with specs)
│   ├── FilterChips.tsx      # Horizontal filter row
│   └── CompareBar.tsx       # Sticky compare bar (slide-up)
├── settings/
│   ├── SettingsSheet.tsx    # Main settings bottom sheet
│   └── PremiumSheet.tsx     # Premium paywall bottom sheet
└── news/
    └── NewsCard.tsx         # News list card

store/
├── theme.ts                 # isDark, toggle, persisted to AsyncStorage
├── garage.ts                # favorites[], add/remove/clear
├── compare.ts               # compareList[] max 2, add/remove/reset
├── ai.ts                    # quota tracking (5/day, AsyncStorage)
└── premium.ts               # isPremium: false (stub for Phase 3c)

lib/
├── data/brands.ts           # All brand + model data
├── data/news.ts             # News articles
├── data/quiz.ts             # Quiz questions
├── vin.ts                   # VIN decode logic
└── ai.ts                    # AI service abstraction (proxy URL)
```

---

## 4. Navigation Architecture

**Bottom Tab Bar — 5 tabs:**

| Tab | Screen | Daily use driver |
|-----|--------|-----------------|
| Home | `(tabs)/index` | Hub + AI |
| Explore | `(tabs)/explore` | Core browse |
| Quiz | `(tabs)/quiz` | Retention/gamification |
| Garage | `(tabs)/garage` | Personalization |
| News | `(tabs)/news` | Feed/return visits |

**Sub-screens (stack inside Explore tab):**
- `explore/[brandId]` — model list (Explore tab stays active)
- `explore/[brandId]/[model]` — model detail (Explore tab stays active)

**Modal screens (from Home tiles):**
- `vin` — VIN Checker
- `compare` — Compare screen

**Rule:** Sub-screens never change the active bottom tab.

---

## 5. Screen Specs

### HomeScreen `(tabs)/index.tsx`

```
Layout (top → bottom, no centering, natural flow):

[CAR EXPLORER wordmark]          [⚙ settings button]
─────────────────────────────────────────────────────
[HERO CARD — card component]
  gradient overlay (accent 16% → transparent)
  "Your automotive companion" eyebrow
  "Drive / Curiosity" h1 (accent on 2nd line)
  subtitle text
  SVG car silhouette (right side, opacity 0.10)

[GARAGE PILL — hidden when favs=0]
  ♥ "N cars saved in your garage"  →

[2×2 TILE GRID]
  ┌─────────────┬─────────────┐
  │ 🔍 Explore  │ ✓ VIN Check │
  │  Cars       │             │
  ├─────────────┼─────────────┤
  │ ≡ Compare   │ ? Car Quiz  │
  │             │             │
  └─────────────┴─────────────┘
  Each tile: 44×44 icon container (accentLo bg) + title + subtitle
  Accent underline animates in on hover/press

[AI CARD — card component]
  "ASK AI" label + quota badge ("5 left today")
  textarea placeholder "Ask anything about cars…"
  chip suggestions: [Flat-6] [Best EV] [AWD vs 4WD]
  [→ send button]
  Result area (hidden until query):
    question label (uppercase accent)
    answer text (4-line clamp + "Show more ↓")
```

**Settings button:** opens SettingsSheet (bottom sheet), NOT a nav item

### ExploreScreen `(tabs)/explore.tsx`

```
"Browse" eyebrow + "Explore Cars" h1
Search bar (pill, debounced 200ms)
Filter chips (horizontal scroll): All / Luxury / Sports / Supercar / Electric / American / Mainstream
Brand list (FlashList for perf):
  [3-letter abbr tile] [Name + Country · Year · Type] [›]
```

### ModelListScreen `explore/[brandId].tsx`

```
← All brands
[Brand type eyebrow]
[Brand name h1]

Model cards (FlashList):
  [♥ fav button top-right]
  BRAND · 2026
  Model Name (display font)
  One-line description
  ┌──────┬──────┬──────┐
  │Power │0-60  │Type  │
  │503hp │3.5s  │Sedan │
  └──────┴──────┴──────┘
  $76,900          [≡ Compare]

[Sticky compare bar — slide up when ≥2 selected]
  ≡ 2 selected  [×]  [Compare →]
```

### ModelDetailScreen `explore/[brandId]/[model].tsx`

```
Hero (bg2 background, radial glow bottom-right):
  ← Back
  BRAND (accent uppercase)
  Model Name (52px display)
  [Type] [Drive] [Country] chips

Body:
  Spec grid 2×3: Engine / Power / Torque / Drive / 0-60 / Weight
  [♥ Save to Garage] — full-width, rect (radius 14)
  [≡ Add to Compare] — full-width, rect (radius 14), accent tint
```

### CompareScreen `compare.tsx`

```
"Side by side" eyebrow + "Compare" h1

[Empty state when <2 selected]:
  ≡ icon circle
  "Compare cars side by side"
  "Pick 2 models with the Compare button on any car card"
  [Pick cars to compare →] CTA

[When 2 selected]:
  ┌──────────────┬──────────────┐
  │ BMW  [×]     │ Porsche [×]  │
  │ M3           │ 911          │
  │ 2026         │ 2026         │
  └──────────────┴──────────────┘

  HORSEPOWER
  ┌──────────────┬──────────────┐
  │ 503hp BEST   │ 443hp        │  ← winner: accent bg + BEST badge
  └──────────────┴──────────────┘

  (repeat for: 0-60, Torque, Drivetrain, Weight, Engine, Body Type)
```

**Winner logic:**
- Higher = better: Power (hp), Torque (lb-ft)  
- Lower = better: 0-60 (seconds), Weight (kg)
- No winner: Drivetrain, Engine, Body Type

### QuizScreen `(tabs)/quiz.tsx`

```
"Automotive Quiz" eyebrow + "Car Quiz" h1
"Question N of 10" ←→ "Score N" (two sides)
Progress bar (2px, accent fill)
Question card (display font 26px)
4 answer options:
  ● correct: green bg tint + ✓ dot
  ● wrong: red bg tint + ✗ dot (correct also revealed)
  Auto-advance after 900ms

Result screen:
  Score ring (accent border, score big/10 small)
  Tier message + Play Again CTA
```

### GarageScreen `(tabs)/garage.tsx`

```
"Saved" eyebrow + "Your Garage" h1

Empty state:
  ♥ icon circle
  "Empty Garage"
  "Save cars while browsing to compare and revisit them here."
  [Browse Cars →]

Filled: Same ModelCard component as Explore
  ♥ button (filled) removes from garage
  [Compare] button adds to compare list
```

### NewsScreen `(tabs)/news.tsx`

```
"Latest" eyebrow + "Auto News" h1
Card list:
  130px thumb (emoji placeholder / real image)
  Source + date overlay (bottom of thumb)
  Headline (display font 18px)
  2-line excerpt (line-clamp)
  → tap opens NewsDetailScreen
```

### NewsDetailScreen `news/[id].tsx`

```
200px hero (emoji / image)
← All News
SOURCE · DATE
Headline (display font 28px)
Full article body (paragraphs, 14px, 1.75 line-height)
"Read full article →" external link
```

### VINScreen `vin.tsx`

```
← Home
"Decode" eyebrow + "VIN Checker" h1
Input card:
  "VEHICLE IDENTIFICATION NUMBER" label
  Underline input (display font, letter-spacing 0.13em, uppercase)
  17 segment visual (lit = accent, special positions 8/9/10 = accentLo)
  "VIN does not use I, O or Q"
[Decode VIN]  [Clear]
Result card (hidden until decode):
  Accent header bar "Vehicle Decoded"
  Key/value rows: Full VIN / Country / Manufacturer / Descriptor /
                  Model Year / Plant Code / Production No. / Check Digit
```

### SettingsSheet (bottom sheet modal)

```
Handle bar
"Settings" h2

─── APPEARANCE ─────────────────
  ☀ Light Mode              [toggle]
  🌐 Language               [English ▾]

─── DATA ───────────────────────
  🗑 Clear Garage            →
  ↺ Reset Comparator         →

─── PREMIUM ────────────────────
  ▶ Car Explorer Pro         [Soon]
    Unlimited AI · No ads · Early access
    → opens PremiumSheet

─── (about box) ────────────────
  CAR EXPLORER
  Version 5.0 · © 2026 Adateo
  Built by Rafał Ciesielski
```

### PremiumSheet (bottom sheet modal, from Settings)

```
Handle bar
▶ icon (accent bg, 52px, rounded)
"Car Explorer Pro"
"Everything you need to explore, compare and decide — without limits."

─────────────────────────────────
✓ Unlimited AI answers
  No daily cap on Ask AI queries

✓ No ads
  Clean, distraction-free experience

✓ Early access to new features
  Comparator v2, price alerts, and more

✓ Sync your Garage across devices
  Coming in a future update
─────────────────────────────────

⏱ "Launching soon — leave your email to be notified first."

[  Coming Soon  ]  ← disabled, opacity 0.4
€2.99 / month  ·  €19.99 / year  ·  Cancel anytime
```

---

## 6. State Management

```ts
// store/garage.ts (Zustand)
interface GarageStore {
  favs: SavedCar[]
  add: (car: SavedCar) => void
  remove: (key: string) => void      // key = "brand|model"
  clear: () => void
  isSaved: (key: string) => boolean
}
// Persist to AsyncStorage

// store/compare.ts
interface CompareStore {
  list: ComparedCar[]                // max 2
  add: (car: ComparedCar) => void    // if length===2, replaces slot[1]
  remove: (index: number) => void
  reset: () => void
  isSelected: (key: string) => boolean
}
// NOT persisted — session only

// store/theme.ts
interface ThemeStore {
  isDark: boolean
  toggle: () => void
}
// Persist to AsyncStorage

// store/ai.ts
interface AIStore {
  used: number          // queries used today
  date: string          // today's date string
  consume: () => number // returns remaining
  getRemaining: () => number
}
// Persist to AsyncStorage, reset when date changes

// store/premium.ts (Phase 3c)
interface PremiumStore {
  isPremium: boolean    // false until RevenueCat wired
  // gates: AI quota (Infinity if premium), ad visibility
}
```

---

## 7. Milestones

### Milestone 1 — Foundation (Sprint 1–2)
**Deliverable:** App shell, navigation, design system, Home screen  
**Done when:** All 5 tabs navigable, theme toggle works, fonts load, Home renders with hero/tiles/AI card

Tasks:
- [ ] Expo project init with Router, TypeScript, NativeWind
- [ ] Font loading (Barlow Condensed + DM Sans)
- [ ] Token system (`Colors`, `Spacing`, `Radius`, `FontSize`)
- [ ] `useTheme()` hook + ThemeProvider, AsyncStorage persist
- [ ] Custom TabBar (5 tabs, accent active icon, safe area)
- [ ] Home screen: top bar, hero card with SVG car, garage pill, 2×2 grid, AI card
- [ ] Settings bottom sheet: theme toggle, language picker, data actions, Premium row
- [ ] Premium bottom sheet: features list, disabled CTA, pricing

**Test:** iPhone SE (375pt) + iPhone 15 Pro (393pt) + Android Pixel (393pt)

---

### Milestone 2 — Browse Flow (Sprint 3)
**Deliverable:** Full Explore → Brand → Models → Detail flow  
**Done when:** User can browse any brand, view all models, save to garage

Tasks:
- [ ] Brand data file (`lib/data/brands.ts`) — 10 brands minimum, full specs
- [ ] ExploreScreen: search + filter chips + FlashList brand rows
- [ ] ModelListScreen: FlashList model cards with specs/price/compare button
- [ ] ModelDetailScreen: hero, spec grid, Save + Compare buttons
- [ ] Garage store wired to heart buttons everywhere
- [ ] Compare store wired to compare buttons
- [ ] GaragePill on Home updates dynamically

**Test:** Save 3 cars, verify garage pill shows; select 2 for compare, verify float bar

---

### Milestone 3 — Quiz + Garage + News (Sprint 4)
**Deliverable:** Quiz playable end-to-end; Garage full; News with detail  
**Done when:** All 5 bottom tabs are fully functional

Tasks:
- [ ] Quiz data (`lib/data/quiz.ts`) — 10 questions
- [ ] QuizScreen: progress, question card, 4 options, feedback, result
- [ ] GarageScreen: empty state + filled model cards (reuse ModelCard)
- [ ] NewsScreen: card list with FlashList
- [ ] NewsDetailScreen: full article view, external link
- [ ] VINScreen: input + 17-seg visual + decode result

**Test:** Complete full quiz, verify score; save and unsave cars; open news article

---

### Milestone 4 — Compare + Polish (Sprint 5)
**Deliverable:** Model Comparator fully functional; app submission-ready  
**Done when:** Compare works with BEST badges; light mode tested on all screens; App Store assets ready

Tasks:
- [ ] CompareScreen: empty state + selected cards row + spec rows + BEST logic
- [ ] Compare float bar slides up/down correctly
- [ ] Cross-screen compare state sync (Explore, Garage, Detail)
- [ ] Light mode QA on all screens
- [ ] Safe area insets verified on notched devices
- [ ] All touch targets ≥ 44pt
- [ ] No hardcoded colors (all via `useTheme()`)
- [ ] App icon 1024×1024, screenshots 6.7" iPhone + 12.9" iPad

**Test:** Compare BMW M3 vs Porsche 911 — verify BEST on power, accel; verify light mode on all 5 tabs

---

### Milestone 5 — AI Feature (Sprint 6)
**Deliverable:** Real AI answers via Gemini proxy; 5/day quota  
**Done when:** AI card returns real answers; limit enforced; no API key in app bundle

Tasks:
- [ ] Cloudflare Worker deployed (proxy Gemini, key in env var)
- [ ] `lib/ai.ts` service with `askCar(query)` → string
- [ ] AI quota store wired: 5/day, resets midnight, badge updates
- [ ] Show More button for long answers (>200 chars)
- [ ] Typing indicator while loading
- [ ] Error states: offline, timeout, limit reached
- [ ] Premium store `isPremium` gates: unlimited quota if true

**Test:** Ask 6 questions — verify 5th shows answer, 6th shows limit message; check midnight reset

---

### Milestone 6 — Monetization (Sprint 7)
**Deliverable:** RevenueCat subscriptions + AdMob; Premium unlocks AI and removes ads  
**Done when:** Payment flow works on TestFlight; ads show for free users only

Tasks:
- [ ] RevenueCat SDK + products configured (monthly + yearly)
- [ ] PaywallScreen wired (replaces "Coming Soon" button)
- [ ] `isPremium` from RevenueCat entitlement (replaces stub)
- [ ] AdMob: banner on Home above nav (free users only)
- [ ] AdMob: interstitial after quiz round 3 (free users only)
- [ ] Restore purchases flow
- [ ] Privacy policy URL in app metadata
- [ ] `NSUserTrackingUsageDescription` in Info.plist (ATT)

**Products:**
```
com.adateo.carexplorer.pro.monthly   €2.99/month
com.adateo.carexplorer.pro.yearly    €19.99/year
```

**Test:** Purchase on sandbox, verify AI unlimited + ads hidden; cancel, verify reverts

---

## 8. Component Reference

### ModelCard
```tsx
// Used in: ModelListScreen, GarageScreen
// Props:
interface ModelCardProps {
  brandId: string
  model: ModelData
  brandName: string
  onPress: () => void
  onFavToggle: () => void
  onCompareToggle: () => void
  isFav: boolean
  isComparing: boolean
}
```

### ActionButton (full-width)
```tsx
// border-radius: 14 — NOT pill shape
// Use for: Save to Garage, Add to Compare, Decode VIN
<ActionButton
  label="Save to Garage"
  icon={<HeartIcon />}
  variant="ghost" | "accent"
  onPress={...}
/>
```

### PillButton (short CTA)
```tsx
// border-radius: 100 — pill shape
// Use for: Browse Cars →, Play Again, Pick cars to compare
<PillButton label="Browse Cars →" onPress={...} />
```

### BottomSheet
```tsx
// Wrap SettingsSheet and PremiumSheet
// Use: @gorhom/bottom-sheet
// Snap points: ['88%']
// Swipe down to close
// Backdrop: semi-transparent blur
```

---

## 9. Key Implementation Rules

1. **Never hardcode colors.** Always `colors[isDark ? 'dark' : 'light'].xxx`
2. **Sub-screens don't change active tab.** Use stack navigator inside tab, not modal.
3. **API key never in client bundle.** AI queries go through Cloudflare Worker proxy.
4. **All touch targets ≥ 44pt.** Apply `minHeight: 44, minWidth: 44` to all tappable elements.
5. **Safe area insets everywhere.** Use `useSafeAreaInsets()` for nav, headers, modals.
6. **ActionButton uses radius 14, not pill.** Pill only for standalone short CTAs.
7. **Compare max 2.** Adding a 3rd replaces slot index 1. Never 3-way compare.
8. **Garage pill on Home.** Must update instantly when any save/unsave happens anywhere.
9. **Premium is a stub until Milestone 6.** `isPremium = false`, paywall shows "Coming Soon".
10. **Fonts must load before render.** Use `expo-font` `useFonts()` with splash screen held.
