# Android release signing

Local `./gradlew bundleRelease` builds require the Google Play upload keystore.
The keystore file must stay outside git.

## Required inputs

Set these values as environment variables or Gradle properties before building:

```sh
CAREXPLORER_UPLOAD_STORE_FILE=/absolute/path/to/upload-keystore.jks
CAREXPLORER_UPLOAD_STORE_PASSWORD=...
CAREXPLORER_UPLOAD_KEY_ALIAS=...
CAREXPLORER_UPLOAD_KEY_PASSWORD=...
```

Then build from the Android project:

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
