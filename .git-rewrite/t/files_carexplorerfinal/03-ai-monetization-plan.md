# Car Explorer — Phase 3: AI Search + Monetization

> **Goal:** Add AI-powered car discovery. Monetize via freemium — free tier with ads + limited AI, paid tier removes ads and unlocks full AI.  
> **Principle:** Every increment must be independently shippable and revenue-positive before the next step.

---

## AI Feature: What It Does

A conversational search box on HomeScreen where users can ask anything about cars:

```
"What is a flat-6 engine?"
"Best family SUV under 40k in 2026?"
"Difference between AWD and 4WD?"
"What car has the most torque under 30k?"
"Is the Porsche Taycan worth it?"
```

Returns a 2–4 sentence expert answer (no markdown, plain text).  
Does NOT replace the Explore/VIN features — it supplements them.

---

## Cost Analysis

### Option A — Anthropic Claude API (current prototype)
| Model | Input | Output | Est. per query (avg 200 in / 150 out tokens) |
|-------|-------|--------|----------------------------------------------|
| claude-haiku-4-5 | $0.80/M | $4.00/M | ~$0.0008 |
| claude-sonnet-4-6 | $3.00/M | $15.00/M | ~$0.003 |

**Haiku recommended** for this use case — short answers, factual Q&A.  
At 1000 daily queries: ~$0.80/day = ~$24/month.

### Option B — Google Gemini Flash
| Model | Price | Est. per query |
|-------|-------|----------------|
| Gemini 2.0 Flash | Free tier: 1500 req/day | $0 up to limit |
| Beyond free | $0.075/M input | ~$0.00002 |

**Recommended for Phase 3 launch** — free tier covers initial user base.  
Switch to paid when DAU exceeds ~500 active AI users/day.

### Option C — Static FAQ / fuzzy match (zero cost)
Pre-written answers for top 50 automotive questions.  
Fuzzy match user input to closest question.  
No API needed. Feels limited but works offline.

**Recommended approach: Start C → migrate to B → migrate to A as revenue grows.**

---

## Monetization Model

### Free Tier
- Full access: Explore, VIN, Quiz, Garage, News, Compare
- AI queries: **5 per day** (resets midnight local time)
- Ads: banner on HomeScreen bottom (above nav), interstitial after every 3rd quiz

### Premium Tier — "Car Explorer Pro"
- **Price:** €2.99/month or €19.99/year
- AI queries: **unlimited**
- No ads anywhere
- Priority access to new features

### Premium Prompt in Settings
```
Settings → [Go Premium]

  ┌─────────────────────────────────┐
  │  🏎  Car Explorer Pro           │
  │                                 │
  │  ✓  Unlimited AI answers        │
  │  ✓  No ads                      │
  │  ✓  Early access to features    │
  │                                 │
  │  [€2.99/month]  [€19.99/year]  │
  │  Best value: save 44% yearly    │
  └─────────────────────────────────┘
```

---

## Incremental Rollout Plan

### Step 0 — Pre-launch (no cost, no AI) ← Phase 1 + 2
- UI refactor shipped
- Model Comparator shipped
- No AI, no ads
- Gather organic installs and baseline retention data

---

### Step 1 — Static AI (zero cost)
**Ships as:** Minor update  
**What:**
- AI card appears on HomeScreen (UI from prototype)
- Backed by hardcoded FAQ: top 50 Q&A pairs
- Fuzzy string match (Levenshtein distance or simple keyword scoring)
- If no match found: "Try rephrasing — or upgrade for full AI answers"
- No usage limit UI yet (all queries "work")

**Deliverables:**
- `ai_faq.json` — 50 Q&A pairs covering: engine types, drivetrain, brands, buying tips, EV basics
- Fuzzy match function (client-side)
- AI card UI wired up

**Success metric:** Track how many users interact with AI card (analytics event)

---

### Step 2 — Usage Limit + Upsell Hook (zero cost)
**Ships as:** Minor update  
**What:**
- Enforce 5 free queries/day (localStorage counter + timestamp)
- After 5th query: show soft paywall card

```
  ┌────────────────────────────────────┐
  │  You've used your 5 free           │
  │  AI answers for today.             │
  │                                    │
  │  Upgrade to Pro for unlimited      │
  │  answers + no ads.                 │
  │                                    │
  │  [Go Pro →]      [Maybe later]     │
  └────────────────────────────────────┘
```

- Settings → "Go Premium" section visible (but purchase not wired yet)
- Counter resets at midnight

**Deliverables:**
- `useAIQuota.ts` hook — reads/writes localStorage
- Paywall card component
- "Go Premium" placeholder in Settings

**Success metric:** Tap rate on "Go Pro →" button (conversion intent)

---

### Step 3 — Real AI on Free Tier (low cost, Gemini free tier)
**Ships as:** Major update  
**What:**
- Replace static FAQ with Gemini Flash API (free tier: 1500 req/day)
- System prompt: "automotive expert, 2-4 sentences, no markdown"
- Quota still 5/day for free users (protects free tier limit)
- Error handling: timeout, offline, quota exceeded

**API setup:**
```
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
Auth: API key (stored server-side or via proxy — NOT in client bundle)
```

⚠️ **Never expose API key in client app.** Route through:
- Simple proxy function (Cloudflare Worker free tier, or Firebase Function)
- Returns answer text only — key never leaves server

**Proxy (Cloudflare Worker, free 100k req/day):**
```javascript
// worker.js
export default {
  async fetch(request) {
    const { query } = await request.json()
    const res = await fetch(`https://generativelanguage.googleapis.com/...`, {
      method: 'POST',
      headers: { 'x-goog-api-key': GEMINI_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: query }] }] })
    })
    const data = await res.json()
    return Response.json({ answer: data.candidates[0].content.parts[0].text })
  }
}
```

**Deliverables:**
- Cloudflare Worker (or equivalent proxy)
- Updated AI service layer in app
- Graceful fallback to static FAQ if proxy fails

**Success metric:** D7 retention of users who used AI vs those who didn't

---

### Step 4 — Ads on Free Tier
**Ships as:** Update (requires ad network approval time — start process early)  
**What:**
- Google AdMob integration
- Banner ad: HomeScreen, above bottom nav (50dp height)
- Interstitial: after every 3rd completed quiz
- Premium users: `isPremium` flag suppresses all ad units

**Ad units needed:**
```
ca-app-pub-XXXX/YYYY  — banner (home)
ca-app-pub-XXXX/ZZZZ  — interstitial (quiz)
```

**Revenue estimate (conservative):**
- Banner eCPM: ~€0.50–1.50
- Interstitial eCPM: ~€3–8
- At 1000 DAU: ~€15–40/day

**Deliverables:**
- AdMob SDK integration
- `isPremium` state wired to ad visibility
- Ad placement components with correct sizing

---

### Step 5 — In-App Purchase / Subscription
**Ships as:** Major update  
**What:**
- RevenueCat SDK (handles iOS + Android IAP, free tier)
- Products configured in App Store Connect + Google Play Console
- `isPremium` driven by RevenueCat entitlement (not localStorage)
- Paywall screen fully wired
- Receipt validation server-side via RevenueCat webhooks

**Products to create:**
```
com.adateo.carexplorer.pro.monthly  — €2.99/month
com.adateo.carexplorer.pro.yearly   — €19.99/year
```

**Settings → Premium section:**
```
[Go Pro] tile → opens PaywallScreen
  — shows feature comparison
  — two purchase CTAs
  — restore purchases link
```

**RevenueCat free tier:** up to $2500 MRR — zero cost until significant revenue.

**Deliverables:**
- RevenueCat integration
- `PaywallScreen` component
- `isPremium` entitlement check replacing localStorage flag
- Restore purchases flow
- Webhook handler for subscription events

---

### Step 6 — Claude API for Premium Users
**Ships as:** Premium feature  
**What:**
- Premium users get answers from Claude (claude-haiku-4-5) instead of Gemini
- Higher quality, longer answers, follow-up context
- Free users stay on Gemini Flash
- Remove daily quota for premium users

**Cost control:**
- Rate limit: 30 queries/user/hour even for premium
- Max tokens per response: 300
- Cache repeated questions (Redis or Cloudflare KV)

**Deliverables:**
- AI service abstraction: `getAIAnswer(query, isPremium)`
- Claude proxy endpoint (separate from Gemini proxy)
- Response cache layer
- Premium badge/indicator on AI card

---

## Settings Screen — Premium Section

Add to Settings bottom sheet:

```
─── PREMIUM ─────────────────────────

  [🏎] Car Explorer Pro
       Unlimited AI + no ads
                              [Go Pro →]

─── AI USAGE (free users only) ──────

  AI Queries Today               3 / 5
  [████████░░]
  Resets in 8h 42min

─── ACCOUNT (after purchase) ────────

  Status                     Pro ✓
  Renews                     Jul 2026
  [Manage Subscription]
```

---

## Tech Stack Summary

| Layer | Free Phase | Paid Phase |
|-------|------------|------------|
| AI backend | Static FAQ → Gemini Flash free | Claude Haiku (premium) |
| Proxy | Cloudflare Worker (free 100k/day) | Same + caching |
| Auth/IAP | — | RevenueCat (free to $2.5k MRR) |
| Ads | — | Google AdMob |
| Analytics | Firebase Free | Firebase Free |

---

## KPIs per Phase

| Phase | Metric | Target |
|-------|--------|--------|
| 1 (UI) | App Store rating | ≥ 4.2★ |
| 2 (Compare) | Session length | +20% vs baseline |
| 3a (Static AI) | AI card interaction rate | ≥ 30% of sessions |
| 3b (Paywall) | "Go Pro" tap rate | ≥ 8% of AI users |
| 4 (Real AI) | D7 retention | +15% vs no-AI |
| 5 (Ads) | ARPDAU | ≥ €0.02 |
| 6 (IAP) | Conversion to Pro | ≥ 2% of MAU |
| 7 (Claude Pro) | Pro churn rate | ≤ 5%/month |

---

## Checklist — Phase 3 Prerequisites

Before starting any Phase 3 work:
- [ ] Phase 1 shipped and stable (≥2 weeks)
- [ ] Phase 2 shipped
- [ ] Analytics installed (Firebase or equivalent)
- [ ] AI card interaction rate measured from static FAQ
- [ ] App Store / Google Play listings reviewed for IAP compliance
- [ ] Privacy policy updated (AI queries, ad tracking)
- [ ] Cloudflare Worker account created
- [ ] AdMob account created (approval takes 2–4 weeks — start early)
