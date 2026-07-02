# Car Explorer — Implementation Plan
> Senior-level, incremental, production-ready.  
> Stack: React Native (Expo) · TypeScript · NativeWind · Zustand

---

## Design System

### Colors
```ts
// tokens.ts
export const colors = {
  // Dark (default)
  dark: {
    bg:      '#0A0A0B',
    bg2:     '#111114',
    bg3:     '#18181D',
    surface: 'rgba(255,255,255,0.04)',
    border:  'rgba(255,255,255,0.08)',
    border2: 'rgba(255,255,255,0.04)',
    text:    '#EEEAE4',
    text2:   '#9A9590',
    text3:   '#484542',
    accent:  '#FF4D1C',
    accentLo:'rgba(255,77,28,0.12)',
    accentMd:'rgba(255,77,28,0.22)',
    green:   '#22C55E',
    red:     '#EF4444',
    nav:     'rgba(10,10,11,0.96)',
  },
  // Light
  light: {
    bg:      '#F2EFE9',
    bg2:     '#E9E5DD',
    bg3:     '#DDD9D0',
    surface: 'rgba(255,255,255,0.70)',
    border:  'rgba(0,0,0,0.08)',
    border2: 'rgba(0,0,0,0.05)',
    text:    '#1C1A17',
    text2:   '#7A756E',
    text3:   '#B5B0A8',
    accent:  '#E03A0A',
    accentLo:'rgba(224,58,10,0.10)',
    accentMd:'rgba(224,58,10,0.20)',
    green:   '#22C55E',
    red:     '#EF4444',
    nav:     'rgba(242,239,233,0.97)',
  },
}
```

### Typography
```ts
// fonts.ts
export const fonts = {
  display: 'BarlowCondensed',   // 700, 800, 900 — headings, prices, scores
  body:    'DMSans',            // 400, 500, 600 — all UI text
}

// Scale
export const type = {
  hero:    { fontSize: 62, fontWeight: '900', letterSpacing: 0.5, lineHeight: 54 },
  h1:      { fontSize: 44, fontWeight: '900', letterSpacing: 0.5 },
  h2:      { fontSize: 28, fontWeight: '800', letterSpacing: 0.3 },
  modelName:{ fontSize: 22, fontWeight: '800', letterSpacing: 0.2 },
  body:    { fontSize: 14, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 11, fontWeight: '500' },
  label:   { fontSize: 9,  fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase' },
}
```

### Spacing & Radius
```ts
export const spacing = { xs:4, sm:8, md:12, base:16, lg:20, xl:24, xxl:32 }
export const radius =  { sm:8, md:12, lg:16, xl:20, pill:100 }
```

---

## Architecture

```
app/
├── (tabs)/
│   ├── index.tsx          # Home
│   ├── explore.tsx        # Explore
│   ├── quiz.tsx           # Quiz
│   ├── garage.tsx         # Garage
│   └── news.tsx           # News
├── explore/
│   ├── [brandId].tsx      # Model list
│   └── [brandId]/[model].tsx  # Model detail
├── compare.tsx            # Compare (modal stack)
├── vin.tsx                # VIN Checker
└── news/[id].tsx          # News detail

components/
├── ui/
│   ├── Card.tsx
│   ├── PillButton.tsx
│   ├── ActionButton.tsx
│   ├── SpecBox.tsx
│   ├── Toggle.tsx
│   └── BottomSheet.tsx
├── model/
│   ├── ModelCard.tsx
│   ├── BrandRow.tsx
│   ├── SpecGrid.tsx
│   └── CompareBar.tsx
├── home/
│   ├── HeroCard.tsx
│   ├── TileGrid.tsx
│   ├── GaragePill.tsx
│   └── AICard.tsx
├── settings/
│   ├── SettingsSheet.tsx
│   └── PremiumSheet.tsx
└── news/
    ├── NewsCard.tsx
    └── NewsDetail.tsx

store/
├── garage.ts      # favorites state
├── compare.ts     # compare list state
├── settings.ts    # theme, language
├── ai.ts          # quota tracking
└── premium.ts     # premium state (stub)

lib/
├── data/
│   ├── brands.ts
│   ├── models.ts
│   └── news.ts
├── vin.ts         # VIN decode logic
├── ai.ts          # AI service abstraction
└── quota.ts       # daily usage counter
```

---

## Phase 1 — UI Foundation
**Goal:** App looks and feels premium. All screens navigable. Zero backend.  
**Duration:** 1–2 sprints  
**Cost:** $0

### Tasks

#### 1.1 Project setup
```bash
npx create-expo-app car-explorer --template blank-typescript
npx expo install expo-router expo-font expo-blur
npx expo install react-native-reanimated react-native-gesture-handler
npm install nativewind zustand @shopify/flash-list
```

#### 1.2 Design system
- [ ] Load Barlow Condensed + DM Sans via `expo-font`
- [ ] Create `tokens.ts` with all color/spacing/radius values
- [ ] Create `useTheme()` hook — returns current token set
- [ ] `ThemeProvider` wrapping app root, persists to AsyncStorage

#### 1.3 Navigation
- [ ] Expo Router tab layout — 5 tabs: Home / Explore / Quiz / Garage / News
- [ ] Tab bar: custom component, safe area insets, blur background
- [ ] Active tab: accent stroke on icon + full text visibility
- [ ] Sub-screens (models, detail) via stack inside Explore tab — tab stays active

#### 1.4 Home screen
- [ ] Top bar: "CAR EXPLORER" wordmark (t2 color) + ⚙ settings button (top-right)
- [ ] Hero card: gradient overlay + SVG car silhouette (react-native-svg)
  - Title "Drive / Curiosity" (display font, accent on second line)
  - Subtitle text
- [ ] Garage pill: hidden when empty, shows "N cars saved" when favs > 0
- [ ] 2×2 tile grid: icon tile (44×44 icon bg with accentLo), title, subtitle
  - Tiles: Explore Cars / VIN Checker / Compare / Car Quiz
  - Accent underline animation on press (Reanimated)
- [ ] AI card: textarea + chip suggestions + send button
  - Quota badge: "5 left today"
  - Result area with "Show more" truncation

#### 1.5 Explore
- [ ] Search bar (pill shape, debounced 200ms)
- [ ] Filter chips: horizontal FlatList, pill toggle style
- [ ] Brand list: `@shopify/flash-list` for performance
  - Abbr tile (3-letter, accentLo bg) + name + meta + chevron
- [ ] Model list: card per model with inline specs (Power / 0-60 / Type)
  - Heart button (top-right, quicksave)
  - Compare button (bottom-right, toggle)
  - Price (display font)
- [ ] Compare float bar: Reanimated slide-up when ≥2 selected

#### 1.6 Model Detail
- [ ] Hero area: bg2 color, radial glow bottom-right
  - Back button, brand tag, model name (52px display), chip tags
- [ ] Spec grid 2×3: Engine / Power / Torque / Drive / 0-60 / Weight
- [ ] Save to Garage button (rect, 14px radius, full-width)
- [ ] Add to Compare button

#### 1.7 Quiz
- [ ] Progress bar (2px) + "Question N of 10" + live score
- [ ] Question card (display font 26px)
- [ ] 4 answer options: green/red feedback, dot indicator ✓/✗
- [ ] Auto-advance 900ms
- [ ] Result screen: score ring + tier message + Play Again

#### 1.8 Garage
- [ ] Empty state: icon + title + "Browse Cars →" CTA
- [ ] Filled: same ModelCard component reused
- [ ] Heart tap removes from garage (with confirm or undo snackbar)

#### 1.9 News
- [ ] Card list: thumb emoji + source overlay + title + 2-line excerpt
- [ ] News detail: full emoji hero, back button, title, body paragraphs, "Read full article →" link

#### 1.10 VIN Checker (from Home tile)
- [ ] Back → Home
- [ ] Input: underline style, Barlow Condensed font, letter-spacing
- [ ] 17-segment visual indicator: lit/sp states
- [ ] Decode / Clear buttons
- [ ] Result card: accent header + key/value rows

#### 1.11 Settings (bottom sheet)
- [ ] ⚙ button opens BottomSheet (react-native-bottom-sheet)
- [ ] Swipe-down gesture to dismiss
- [ ] Light Mode toggle (persists via AsyncStorage)
- [ ] Language picker (stub, future i18n)
- [ ] Clear Garage (confirm dialog)
- [ ] Reset Comparator
- [ ] **Premium section** (see Phase 3a)
- [ ] About: app name + version + developer link

#### 1.12 Animated background
- [ ] Canvas equivalent: `react-native-skia` or simple Animated.View particles
- [ ] 16 moving line segments, accent color, low opacity
- [ ] Respects light/dark opacity difference

**Phase 1 checklist:**
- [ ] All 5 tabs navigable
- [ ] Theme toggle works on all screens
- [ ] Sub-screens don't change active tab
- [ ] All touch targets ≥ 44×44pt
- [ ] Safe area insets applied (notch, home bar)
- [ ] No hardcoded colors (all via `useTheme()`)
- [ ] Tested on iPhone SE (375pt) and iPhone Pro Max (430pt)
- [ ] Tested on Android mid-range (360pt)

---

## Phase 2 — Model Comparator
**Goal:** Full side-by-side comparison with BEST badge logic.  
**Duration:** 1 sprint  
**Cost:** $0

### Tasks
- [ ] `compare.ts` Zustand store: max 2 items, add/remove/reset
- [ ] Compare screen: selected cards row (with × remove)
- [ ] Empty state: icon + description + "Pick cars to compare" CTA
- [ ] Spec rows: label centered, 2-col values
- [ ] BEST badge: accent bg, white text, absolute positioned top-right of winning cell
- [ ] Winner logic:
  - Higher = better: power, torque
  - Lower = better: accel (seconds), weight (kg)
  - No winner: drive, engine, type
- [ ] Float bar: slide up from bottom when ≥2 selected, shows in Explore + Garage
- [ ] Compare accessible from: Home tile, model card button, model detail, float bar
- [ ] Settings "Reset Comparator" clears store

**Phase 2 checklist:**
- [ ] Max 2 models enforced (3rd replaces slot 2)
- [ ] Float bar synced across Explore + Garage
- [ ] BEST logic correct for all metric types
- [ ] Empty state shown when < 2 selected
- [ ] State persists through navigation

---

## Phase 3a — Premium Infrastructure (Settings stub)
**Goal:** Premium section visible in Settings. No payment yet. Collect intent.  
**Duration:** 0.5 sprint  
**Cost:** $0

### Settings Premium Section
```
─── PREMIUM ─────────────────────────────
  [🚀]  Car Explorer Pro
        Unlimited AI · No ads · Early access
                                    [Soon →]
```

### Premium Sheet (bottom sheet modal)
```
  [🚀 icon]
  Car Explorer Pro
  "Everything you need to explore, compare
   and decide — without limits."

  ✓  Unlimited AI answers
     No daily cap on Ask AI queries

  ✓  No ads
     Clean, distraction-free experience

  ✓  Early access to new features
     Model Comparator v2, price alerts, and more

  ✓  Sync your Garage across devices
     Coming in Phase 3

  [⏱] Launching soon — leave your email to get notified first.

  [ Coming Soon ]   ← disabled button
  €2.99 / month or €19.99 / year · Cancel anytime
```

### Implementation
```ts
// store/premium.ts
interface PremiumState {
  isPremium: boolean        // false until Phase 3c
  hasSeenPaywall: boolean
  emailCaptured: string | null
}
// isPremium gates: AI quota, ad units, future features
```

**Phase 3a checklist:**
- [ ] Premium row in Settings sheet
- [ ] Premium sheet opens with swipe-down close
- [ ] CTA button disabled with "Coming Soon" label
- [ ] Pricing shown (€2.99/mo · €19.99/yr)
- [ ] `isPremium` flag in store (false), ready to wire in Phase 3c

---

## Phase 3b — AI Feature (Free Tier)
**Goal:** Real AI answers via free Gemini tier. 5 queries/day for free users.  
**Duration:** 1 sprint  
**Cost:** $0 (Gemini free: 1500 req/day)

### AI Service
```ts
// lib/ai.ts
const PROXY_URL = 'https://your-worker.workers.dev/ai'  // Cloudflare Worker

export async function askCar(question: string): Promise<string> {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: question }),
  })
  const data = await res.json()
  return data.answer
}
```

### Cloudflare Worker (free, 100k req/day)
```js
// worker.js — API key never in client
export default {
  async fetch(request, env) {
    const { query } = await request.json()
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_KEY}`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents:[{ parts:[{ text: query }] }],
          systemInstruction:{ parts:[{ text:'Automotive expert. 2-4 sentences. No markdown.' }] }
        })
      }
    )
    const data = await res.json()
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer.'
    return Response.json({ answer })
  }
}
```

### Quota (AsyncStorage)
```ts
// lib/quota.ts
const LIMIT = 5
export function getRemainingQueries(): number
export function consumeQuery(): number   // returns remaining
export function resetIfNewDay(): void
```

**Phase 3b checklist:**
- [ ] Cloudflare Worker deployed (API key not in app)
- [ ] Gemini free tier working
- [ ] 5/day quota enforced via AsyncStorage
- [ ] Quota badge updates after each query
- [ ] Limit message shown when 0 remaining
- [ ] "Show more" for answers > 200 chars
- [ ] Typing indicator while loading
- [ ] Error state: offline / timeout

---

## Phase 3c — Monetization
**Goal:** Paying users unlock unlimited AI + no ads.  
**Duration:** 1–2 sprints  
**Cost:** RevenueCat free to $2.5k MRR

### Stack
- **RevenueCat** SDK — handles iOS + Android IAP
- **Google AdMob** — banner (Home, above nav) + interstitial (after every 3rd quiz)

### Products
```
com.adateo.carexplorer.pro.monthly   €2.99/month
com.adateo.carexplorer.pro.yearly    €19.99/year  (save 44%)
```

### Premium gates
```ts
// Every gated feature checks:
const { isPremium } = usePremiumStore()

// AI: no quota for premium
const limit = isPremium ? Infinity : 5

// Ads: hidden for premium
{!isPremium && <BannerAd />}
```

### Paywall screen
```
[🚀 icon]
Car Explorer Pro

Feature comparison:
              Free    Pro
AI answers    5/day   ∞
Ads           Yes     No
Early access  No      Yes
Garage sync   No      Soon

[ €2.99 / month ]
[ €19.99 / year  · Best value ]
  Restore purchases
```

**Phase 3c checklist:**
- [ ] RevenueCat SDK integrated
- [ ] Products configured in App Store Connect + Google Play
- [ ] `isPremium` from RevenueCat entitlement (not local flag)
- [ ] Paywall screen with both price tiers
- [ ] Restore purchases flow
- [ ] AdMob banner on Home (non-premium only)
- [ ] AdMob interstitial after quiz round 3 (non-premium only)
- [ ] Privacy policy updated

---

## Suggested Folder Structure

```
car-explorer/
├── app/
│   ├── _layout.tsx              # Root: ThemeProvider, fonts
│   ├── (tabs)/
│   │   ├── _layout.tsx          # TabBar component
│   │   ├── index.tsx            # Home
│   │   ├── explore.tsx          # Explore root
│   │   ├── quiz.tsx
│   │   ├── garage.tsx
│   │   └── news.tsx
│   ├── explore/
│   │   ├── [brandId].tsx
│   │   └── [brandId]/[model].tsx
│   ├── news/[id].tsx
│   ├── compare.tsx
│   └── vin.tsx
├── components/
│   ├── ui/                      # Design system primitives
│   ├── model/                   # ModelCard, BrandRow, etc.
│   ├── home/                    # Hero, TileGrid, AICard, etc.
│   └── settings/                # SettingsSheet, PremiumSheet
├── store/                       # Zustand stores
├── lib/                         # Data, VIN, AI, quota
├── hooks/
│   ├── useTheme.ts
│   ├── useAIQuota.ts
│   └── usePremium.ts
├── constants/
│   ├── tokens.ts                # Colors, spacing, radius
│   ├── fonts.ts
│   └── brands.ts                # All brand/model data
└── assets/fonts/
    ├── BarlowCondensed-*.ttf
    └── DMSans-*.ttf
```

---

## Sprint Roadmap

| Sprint | Scope | Deliverable |
|--------|-------|-------------|
| 1 | Setup + Design System + Navigation | App shell, tab nav, theme |
| 2 | Home + Explore + Brand/Model screens | Core browse flow |
| 3 | Detail + Garage + Quiz + News | All 5 tabs complete |
| 4 | VIN + Settings + AI card (static FAQ) | Phase 1 complete |
| 5 | Model Comparator full | Phase 2 complete |
| 6 | Gemini AI + Cloudflare proxy + quota | Phase 3b complete |
| 7 | RevenueCat + AdMob + Premium paywall | Phase 3c complete |
| 8 | Polish, A11y, perf, store submission | App Store ready |

---

## App Store Submission Checklist

- [ ] App icon: 1024×1024px, no alpha, no rounded corners (OS applies)
- [ ] Screenshots: 6.7" iPhone (1290×2796) + 12.9" iPad
- [ ] Privacy policy URL (required for AI + IAP)
- [ ] Age rating: 4+ (no objectionable content)
- [ ] IAP products approved before submission
- [ ] AdMob app ID in Info.plist
- [ ] `NSUserTrackingUsageDescription` in Info.plist (ATT prompt for ads)
- [ ] Tested on real device (not just simulator)
- [ ] No placeholder content in production build
