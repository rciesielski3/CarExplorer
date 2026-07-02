# Android release signing

Local `./gradlew bundleRelease` builds require the Google Play upload keystore.
The keystore file must stay outside git.

## Required inputs

Copy the template and fill in your local upload-keystore values:

```sh
cp .env.release.example .env.release.local
```

The local file must contain the production Android AdMob app ID and upload
keystore values:

```sh
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy
CAREXPLORER_UPLOAD_STORE_FILE=/absolute/path/to/upload-keystore.jks
CAREXPLORER_UPLOAD_STORE_PASSWORD=...
CAREXPLORER_UPLOAD_KEY_ALIAS=...
CAREXPLORER_UPLOAD_KEY_PASSWORD=...
```

The app config falls back to Google's official test AdMob app ID when this
environment variable is not set, so local development builds do not accidentally
load production ads.

Then build from the repository root:

```sh
bash scripts/build-android-release.sh
```

Alternatively, export the same values and build from the Android project:

```sh
cd android
./gradlew bundleRelease
```

The signed bundle is generated at:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## Verify before Play Console upload

```sh
keytool -printcert -jarfile android/app/build/outputs/bundle/release/app-release.aab
```

Expected upload certificate SHA1:

```text
AC:F5:2A:DD:61:C8:8B:AA:B7:54:74:F9:B2:D5:6E:7E:9F:00:A4:E3
```
