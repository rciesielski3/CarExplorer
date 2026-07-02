# Codex Instructions - Car Explorer

## Role

Act like a senior Expo + TypeScript engineer with strong QA automation mindset.
Deliver small, safe, production-ready changes.

---

## Core Rules

- KISS first.
- DRY when duplication is real.
- ASAP delivery, but not careless delivery.
- Prefer simple working code over clever abstractions.
- Do not rewrite unrelated code.
- Do not introduce new libraries without a strong reason.
- Keep changes easy to review.

---

## Project Context

This is a Car Explorer mobile app built with:

- Expo
- React Native
- TypeScript
- API-based car data
- Car images from external sources
- Favorites, comparison, quiz, news, and settings features

The app should stay lightweight, maintainable, and friendly for mobile users.

---

## Implementation Style

### Do

- Make the smallest change that solves the task.
- Keep logic readable.
- Use clear names.
- Add types before adding comments.
- Extract helpers only when they reduce real complexity.
- Handle loading, error, and empty states.
- Keep UI responsive when APIs fail.

### Avoid

- Big refactors without request.
- Over-engineered architecture.
- Deep prop chains.
- Duplicated API logic.
- `any` unless there is no better safe option.
- Silent failures.
- Hardcoded secrets.

---

## TypeScript Rules

- Use strict types.
- Prefer `type` or `interface` for shared contracts.
- Use union types for fixed values.
- Never return raw external API responses directly to UI.
- Normalize API data in the API layer.

Example:

```ts
type VehicleType = "car" | "truck" | "motorcycle";
```

---

## File Structure

Keep structure simple:

```txt
src/
  api/
  components/
  hooks/
  screens/
  types/
  utils/
  theme/
```

Add new files only when they have a clear purpose.

---

## API Layer

API calls belong in `/api`.

Recommended structure:

```txt
src/api/carsApi.ts
src/api/wikipediaApi.ts
src/api/carImagesApi.ts
```

Rules:

- Keep fetch logic outside UI components.
- Return typed, normalized data.
- Catch API errors.
- Do not crash UI because an image or optional field is missing.
- Use fallbacks where possible.

---

## Car Images Strategy

Use this priority:

1. Wikipedia REST API
2. CarImages API fallback
3. Local UI fallback with initials/model text

Rules:

- Never show broken images.
- Never block the whole card because image loading failed.
- Cache repeated image lookups when simple to do.
- Do not store API secrets in frontend code.

---

## Components

- One component = one clear responsibility.
- Keep components small and readable.
- Extract reusable UI only when used more than once or when readability improves.
- Avoid huge JSX blocks.
- Prefer simple props over global state.

Good:

```tsx
<CarCard />
<CarImage />
<CarSpecs />
```

Bad:

```tsx
One 600-line screen with API calls, mapping, styling, and fallback logic together.
```

---

## Hooks

Use hooks for reusable behavior, not for everything.

Good candidates:

```txt
useCars.ts
useCarImage.ts
useFavorites.ts
```

Rules:

- Keep hooks focused.
- No hidden side effects.
- Return clear state: `data`, `isLoading`, `error`.

---

## State Management

Use local state first.

Prefer:

- `useState`
- `useReducer`
- React Query for server state

Avoid global state unless multiple screens truly need it.

---

## Styling

- Reuse theme values.
- Avoid random hardcoded colors and spacing.
- Keep styles close to the component unless reused.
- Prefer readable UI over flashy UI.

Suggested:

```txt
src/theme/colors.ts
src/theme/spacing.ts
src/theme/radius.ts
```

---

## Error Handling

Every user-facing flow should handle:

- loading state
- error state
- empty state
- fallback state

Do not silently ignore errors.

Acceptable:

```ts
console.error("Failed to load car image", error);
```

Then show fallback UI.

---

## Testing Mindset

Before finishing, verify:

- app builds
- TypeScript passes
- no unused imports
- no obvious runtime crash
- empty API response works
- failed image URL works
- slow network does not break UI

For testable logic:

- keep pure helpers separate
- avoid mixing API, state, and rendering in one place

---

## Pull Request Checklist

Before final answer:

- Explain what changed.
- Mention files touched.
- Mention how to test manually.
- Mention any risk or limitation.
- Do not claim tests passed unless actually run.

---

## Decision Rule

When there are multiple options, choose the simplest solution that is:

- typed
- readable
- safe
- testable
- easy to revert

Do not build for imaginary future requirements.
