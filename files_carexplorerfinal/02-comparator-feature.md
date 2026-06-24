# Car Explorer — Phase 2: Model Comparator

> **Scope:** New feature built on top of Phase 1 UI.  
> **Cost:** Zero — fully client-side, no API calls.  
> **Entry points:** Home tile "Compare" + floating bar in ModelListScreen.

---

## Feature Overview

Side-by-side specification comparison of any 2 models from the database.  
Winner per metric highlighted in accent color.

---

## User Flow

```
ExploreScreen
  → tap brand → ModelListScreen
      → tap ☑ checkbox on model card  (select for compare)
      → tap ☑ on second model card
      → floating "Compare →" bar appears at bottom
          → tap → CompareScreen
  
  OR:
  
  ModelDetailScreen
      → tap "Add to Compare" button
      → add second model from another brand
      → tap floating bar OR navigate Home → Compare tile
          → CompareScreen
```

---

## CompareScreen

### Layout

```
eyebrow: "Side by side"
H1: "Compare"

[if < 2 models selected]
  Hint text: "Select up to 2 models from Explore…"
  CTA button: "Pick Models →"

[if 2 models selected]
  Column headers (2-col grid):
    ┌─────────────┬─────────────┐
    │  BMW        │  Porsche    │
    │  M3         │  911        │
    └─────────────┴─────────────┘

  Spec rows (label centered, values in 2-col grid):
    POWER
    ┌─────────────┬─────────────┐
    │  503hp  🟠  │  443hp      │  ← winner highlighted
    └─────────────┴─────────────┘

    TORQUE
    ACCELERATION
    DRIVE
    WEIGHT
    ENGINE
    BODY TYPE

  [Clear comparison] ghost button
```

### Winner Logic

| Metric | Better = |
|--------|----------|
| Power | Higher number |
| Torque | Higher number |
| 0–100 / Acceleration | Lower number (faster) |
| Weight | Lower number (lighter) |
| Drive / Engine / Body | No winner (informational) |

Winner cell styling:
```css
background: var(--accent-lo);
color: var(--accent);
border: 1px solid var(--accent-md);
```

---

## Selection UX

### Model card checkbox
```
Position: absolute, top-right corner (9px, 9px)
Size: 17×17px
Border-radius: 4px
Default: border 1.5px var(--border), bg var(--surface)
Selected: bg var(--accent), border var(--accent), checkmark ✓ white 9px
Card border when selected: rgba(255,77,28,0.35)
```

### Floating compare bar
```
Position: sticky, bottom: 90px (above nav)
Appears when: cmpList.length >= 2
Animation: opacity 0→1, translateY 10px→0, duration 280ms

Layout:
  [N selected]    [Compare →]
  
Button: accent bg, white text, pill shape
```

### Compare button in ModelDetailScreen
```
Default:
  bg: var(--accent-lo)
  border: var(--accent-md)
  color: var(--accent)
  label: "Add to Compare"

Added state:
  bg: var(--accent)
  color: #fff
  label: "Added to Compare ✓"
```

---

## State Management

```typescript
// Max 2 items
compareList: Array<{
  brand: string
  brandId: string
  model: string
  specs: ModelSpecs
}>

// Actions
addToCompare(model)     // if length < 2, push; if length === 2, replace [1]
removeFromCompare(key)  // splice by brand|model key
resetCompare()          // compareList = []
isInCompare(key): bool
```

---

## Data Requirements

Each model needs these spec fields for full comparison:

```typescript
interface ModelSpecs {
  type: string       // body type — "Sports Sedan", "SUV", etc.
  engine: string     // "3.0L i6T", "Dual Electric", etc.
  power: string      // "503hp"
  torque: string     // "479lb-ft"
  drive: string      // "RWD" | "AWD" | "FWD" | "4WD"
  weight: string     // "1730kg"
  accel: string      // "3.5s"
}
```

Models without full specs show `—` in cells (no winner highlighting).

---

## Entry Points Summary

| Where | How | Result |
|-------|-----|--------|
| Home | Tile "Compare" | Opens CompareScreen directly |
| ModelListScreen | ☑ checkbox on card | Adds to list, shows float bar |
| ModelDetailScreen | "Add to Compare" button | Adds to list |
| Float bar | "Compare →" button | Opens CompareScreen |
| Settings | "Reset Comparator" | Clears list |

---

## Checklist before ship

- [ ] Max 2 models enforced (3rd selection replaces slot 2)
- [ ] Checkbox state synced between ModelListScreen and detail
- [ ] Float bar appears/disappears with animation
- [ ] CompareScreen shows hint when < 2 models
- [ ] Winner highlighting correct for all metric types
- [ ] Reset clears both CompareScreen and model card checkboxes
- [ ] Compare accessible from Home tile (no selection needed — opens with hint)
- [ ] State persists through navigation (not reset on back)
