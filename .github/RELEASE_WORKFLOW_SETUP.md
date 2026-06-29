# Release Build Workflow Setup

## Required GitHub Secrets

Configure these in GitHub Settings → Secrets and variables → Actions:

1. **ANDROID_KEYSTORE_BASE64**
   - Value: Base64-encoded Android release keystore (@adateo__car-explorer.jks)
   - Generate: `base64 -i /Users/rafalciesielski/Developer/carExplorer/@adateo__car-explorer.jks`
   - Certificate SHA1: AC:F5:2A:DD:61:C8:8B:AA:B7:54:74:F9:B2:D5:6E:7E:9F:00:A4:E3 ✅

2. **KEYSTORE_PASSWORD**
   - Value: `3d3e66c0b1c16f8c5a5a649081abe945` (from .env.release.local)

3. **KEY_ALIAS**
   - Value: `130f695a3887657c5eefb66ddee9db90` (from .env.release.local)

4. **KEY_PASSWORD**
   - Value: `a30e3a263456fcb2cdd5f7e917a8819a` (from .env.release.local)

5. **PLAY_STORE_SERVICE_ACCOUNT_JSON**
   - Value: JSON service account key from Google Play Console
   - Setup: https://github.com/r0adkll/upload-google-play#setup

6. **EXPO_PUBLIC_ADMOB_ANDROID_APP_ID**
   - Value: Production AdMob Android App ID (e.g. `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`)
   - Required for production releases — if unset, the build falls back to Google's
     test AdMob App ID (`ca-app-pub-3940256099942544~3347511713`), which violates
     Play Store policy for production releases.

## Triggering a Release

### Automatic (on tag push)
```bash
git tag -a v2.0.7 -m "Release version 2.0.7"
git push origin v2.0.7
```

### Manual
Go to GitHub → Actions → Build Release Bundle → Run workflow → Select build type

## Output

- Signed AAB uploaded to Play Store Console (internal track, draft status)
- APK attached to GitHub Release
- Artifacts retained for 30 days

## Known follow-ups

- `actions/create-release@v1` is archived/unmaintained. It still works but should
  be migrated to `softprops/action-gh-release@v2` in a future change (requires
  reworking the release step's inputs/outputs).
- Release notes file must be named `RELEASE_NOTES_<tag>.md`, matching the pushed
  tag exactly (including the `v` prefix), e.g. tag `v2.0.7` → `RELEASE_NOTES_v2.0.7.md`.
