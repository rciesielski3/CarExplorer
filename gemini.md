# Car Explorer - Engineering Guidelines

## Core Principles

- KISS first.
- DRY second.
- Avoid premature abstractions.
- Prefer working solutions over theoretical perfection.
- Every new file must have a clear reason to exist.
- Optimize for maintainability.

---

## Tech Stack

- Expo
- React Native
- TypeScript
- React Query
- Expo Router (if introduced later)

---

## TypeScript

### Always

- Use strict typing.
- Prefer interfaces for public contracts.
- Avoid `any`.
- Use union types instead of magic strings.

Good:

```ts
type Theme = "light" | "dark";
```

Bad:

```ts
const theme: any = value;
```

---

## Components

### Rules

- One responsibility per component.
- Keep components under ~200 lines.
- Extract reusable logic into hooks.
- Extract reusable UI into components.
- Avoid deeply nested JSX.

Good:

```tsx
<CarCard />
<CarImage />
<CarSpecs />
```

Bad:

```tsx
CarCard with 600 lines of JSX
```

---

## State Management

### Local First

Use:

- useState
- useReducer

Before introducing:

- Context
- Zustand
- Redux

Rule:

If state is used by one screen, keep it local.

---

## Data Fetching

Use React Query.

Rules:

- No fetch calls directly inside UI components.
- API logic belongs in `/api`.
- Always handle:
  - loading
  - error
  - empty state

---

## API Layer

Structure:

```txt
src/api/
  carsApi.ts
  wikipediaApi.ts
  carImagesApi.ts
```

API files:

- fetch data
- transform data
- return typed models

Never return raw API responses.

---

## Car Images Strategy

Priority:

1. Wikipedia
2. CarImages
3. Local fallback

Never block UI waiting for images.

Always provide fallback UI.

---

## Performance

### Avoid

- unnecessary useMemo
- unnecessary useCallback
- premature optimization

Measure first.

Optimize second.

---

## Styling

Rules:

- Reuse colors.
- Reuse spacing.
- No hardcoded magic values everywhere.

Create:

```ts
theme / colors.ts;
theme / spacing.ts;
```

---

## Error Handling

Never silently swallow errors.

Good:

```ts
console.error(error);
```

and show fallback UI.

---

## File Structure

```txt
src/
  api/
  components/
  hooks/
  screens/
  types/
  utils/
```

Keep structure shallow.

---

## Naming

Components:

```txt
CarCard.tsx
CarDetailsScreen.tsx
```

Hooks:

```txt
useCars.ts
useCarImage.ts
```

Types:

```txt
Car.ts
Vehicle.ts
```

---

## Pull Request Rules

Before merging:

- Build passes
- Lint passes
- Types pass
- No dead code
- No unused imports
- No console.logs left behind

---

## Decision Rule

When multiple solutions exist:

Choose the simplest solution that:

- works
- is typed
- is testable
- is maintainable

Do not build for future requirements that do not exist.
