#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.release.local"
AAB_PATH="$ROOT_DIR/android/app/build/outputs/bundle/release/app-release.aab"
EXPECTED_SHA1="AC:F5:2A:DD:61:C8:8B:AA:B7:54:74:F9:B2:D5:6E:7E:9F:00:A4:E3"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

required_vars=(
  CAREXPLORER_UPLOAD_STORE_FILE
  CAREXPLORER_UPLOAD_STORE_PASSWORD
  CAREXPLORER_UPLOAD_KEY_ALIAS
  CAREXPLORER_UPLOAD_KEY_PASSWORD
)

missing_vars=()
for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    missing_vars+=("$var_name")
  fi
done

if (( ${#missing_vars[@]} > 0 )); then
  echo "Missing release signing values:"
  printf '  - %s\n' "${missing_vars[@]}"
  echo
  echo "Create .env.release.local from .env.release.example and fill in the upload keystore values."
  exit 1
fi

if [[ ! -f "$CAREXPLORER_UPLOAD_STORE_FILE" ]]; then
  echo "Keystore file not found: $CAREXPLORER_UPLOAD_STORE_FILE"
  exit 1
fi

node "$ROOT_DIR/scripts/patch-android-release-dependencies.js"

(
  cd "$ROOT_DIR/android"
  ./gradlew clean bundleRelease
)

echo
echo "Signed AAB:"
echo "$AAB_PATH"
echo
echo "Certificate:"
keytool -printcert -jarfile "$AAB_PATH"
echo
echo "Expected SHA1:"
echo "$EXPECTED_SHA1"
