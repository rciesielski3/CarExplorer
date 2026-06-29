# Release Build Workflow Setup

## Required GitHub Secrets

Configure these in GitHub Settings → Secrets and variables → Actions:

1. **ANDROID_KEYSTORE_BASE64**
   - Value: Base64-encoded Android release keystore
   - Generate: `base64 -i ~/.android/carexplorer-release-key.jks`

2. **KEYSTORE_PASSWORD**
   - Value: Password for the keystore file

3. **KEY_ALIAS**
   - Value: Alias of the signing key (usually "carexplorer-release")

4. **KEY_PASSWORD**
   - Value: Password for the signing key

5. **PLAY_STORE_SERVICE_ACCOUNT_JSON**
   - Value: JSON service account key from Google Play Console
   - Setup: https://github.com/r0adkll/upload-google-play#setup

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
