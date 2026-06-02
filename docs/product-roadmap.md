# Product Roadmap Notes

## Commercialization Track

Status: planned, off by default.

- Keep ads disabled until AdMob IDs and store policy copy are ready.
- Add AdMob in a small, isolated increment after the core user flows feel ready.
- Use public Expo env flags for ad visibility and ad unit IDs.
- Prefer test ads for development and preview builds.

### Proposed PR Sequence

1. `003-chore-release-monetization-foundation`
   - Add off-by-default monetization config.
   - Add EAS env placeholders.
   - Document the release and AdMob checklist.
2. `004-feat-admob-banner-placement`
   - Install the selected AdMob package.
   - Add one restrained banner placement after UX review.
   - Keep test ads enabled until production IDs are verified.
3. `005-chore-eas-release-runbook`
   - Build Android production AAB with EAS.
   - Verify signing SHA1 before Play Console upload.
   - Record versionCode and artifact path.

## EAS / Expo CLI Distribution

- Build only from PR-merged `main`.
- Use `eas build --platform android --profile production` for Play-ready AABs.
- Keep `production.autoIncrement` enabled in `eas.json`.
- Verify Android target SDK before store submission.
- Verify upload certificate SHA1 before manual Play Console upload.
- Do not submit automatically until the Play service account permissions are confirmed.

## AdMob Readiness Checklist

- Create or confirm the AdMob app for package `com.adateo.carexplorer`.
- Create Android banner ad unit.
- Add the production banner ad unit ID to EAS env only after testing.
- Keep `EXPO_PUBLIC_ENABLE_ADS=false` until policy copy and placement are approved.
- Keep `EXPO_PUBLIC_USE_TEST_ADS=true` for development and preview.
- Confirm privacy policy and store listing mention ads where required.
