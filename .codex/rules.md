# CarExplorer Codex Rules

CarExplorer is a React Native / Expo / TypeScript mobile app. Treat Android,
Google Play, local Gradle/EAS builds, AdMob, NHTSA vPIC data, and Wikipedia
fallbacks as the core project context.

## Workflow

- Never work directly on `main`.
- Every change must happen on a branch and go through a pull request.
- Branch names start with the next incremental number, then a short kebab-case
  topic, for example `012-fix-vin-decoder`.
- Do not include the word `codex` in branch names.
- Use Conventional Commits, for example `feat: add model fallback`,
  `fix: guard empty vin decode`, or `docs: update release checklist`.
- Keep changes small and scoped. Do not rewrite unrelated files or clean up
  other people's work unless the task explicitly asks for it.
- Do not commit unless the user explicitly asks.

## Platform Priorities

- Android is the priority platform.
- iOS is not a priority. Do not spend time fixing iOS-only issues unless the
  user explicitly asks.
- Prefer Android-safe React Native and Expo APIs.
- Verify layouts on realistic Android phone sizes and keep all screens safe for
  notches, navigation bars, keyboard overlap, and small displays.

## Stack And Architecture

- Use React Native, Expo, and TypeScript patterns already present in the repo.
- Keep business logic out of screens when practical. Put API/data work in
  `src/api`, `src/services`, hooks, or existing local equivalents.
- Keep components focused and reusable. Prefer composition over inheritance.
- Avoid `any`; model external API responses with narrow, defensive types.
- Keep error handling explicit and user-safe. Vehicle data can be incomplete,
  stale, or missing.

## Data Sources

- Do not add paid APIs for car data.
- Keep vehicle data based on NHTSA vPIC and safe fallbacks.
- Use Wikipedia only as a fallback/enrichment source for public descriptions
  and images.
- Treat remote data as unreliable: validate fields, handle empty results, and
  keep fallbacks graceful.
- Do not add scraping or fragile unofficial endpoints without explicit approval.

## Secrets And Configuration

- Secrets live only in `.env` or `.env.release.local`.
- Never commit secrets, keystores, Play Console credentials, AdMob production
  IDs outside the approved env files, or local machine paths.
- `.env.release.local` is for local release signing and production Android
  values. Keep it untracked.
- AdMob changes must keep development/test behavior safe and avoid accidental
  production ads in local development.

## Android Builds And Releases

- Prefer the local store build path:

  ```sh
  bash scripts/build-android-release.sh
  ```

- The script loads `.env.release.local`, patches Android release dependencies,
  runs Gradle, and prints the signed AAB certificate.
- The expected signed output is:

  ```text
  android/app/build/outputs/bundle/release/app-release.aab
  ```

- Gradle fallback from `android/` is acceptable when diagnosing build issues:

  ```sh
  ./gradlew clean bundleRelease
  ```

- For Google Play releases, prepare release notes for both `en-US` and `pl-PL`.
- Keep version and versionCode changes intentional and Android-focused.

## Frontend Standards

- Keep the UI modern, lightweight, and fast on mid-range Android phones.
- Maintain dark mode, light mode, and i18n behavior for user-visible changes.
- Do not hard-code user-facing strings when the surrounding feature is
  localized.
- Use existing theme tokens and shared components where available.
- Avoid inline colors and duplicated styling unless matching an existing local
  pattern requires it.
- Make layouts mobile-safe: no clipped text, hidden controls, unsafe tap
  targets, or content behind system UI.

## Verification

- Run the smallest useful verification for the change.
- For TypeScript or UI logic changes, prefer lint/tests when available:

  ```sh
  npm run lint
  npm test -- --watchAll=false
  ```

- For Android release/build changes, verify with the local build script or the
  relevant Gradle command.
- If a check cannot be run locally, say so clearly in the final response.
