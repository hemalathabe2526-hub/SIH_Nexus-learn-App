#!/bin/bash
# ============================================================
# NEXUS LEARN — Release Signing & Play Store AAB Build Script
# Run: bash scripts/build-release.sh
# ============================================================

set -e

KEYSTORE_FILE="nexus-release-key.jks"
KEY_ALIAS="nexus-key"
KEYSTORE_PASS="nexuslearn@2024"
KEY_PASS="nexuslearn@2024"

echo ""
echo "========================================"
echo " NEXUS LEARN — Play Store Release Build"
echo "========================================"

# Step 1: Generate keystore (only on first run)
if [ ! -f "$KEYSTORE_FILE" ]; then
  echo "[1/3] Generating release keystore..."
  keytool -genkey -v \
    -keystore "$KEYSTORE_FILE" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias "$KEY_ALIAS" \
    -storepass "$KEYSTORE_PASS" \
    -keypass "$KEY_PASS" \
    -dname "CN=NEXUS LEARN, OU=SIH, O=NexusLearnEdu, L=Chennai, ST=TamilNadu, C=IN"
  echo "[1/3] Keystore created: $KEYSTORE_FILE"
else
  echo "[1/3] Keystore already exists, skipping..."
fi

# Step 2: Build Next.js static export
echo "[2/3] Building Next.js production static export..."
npm run build

# Step 3: Sync to Android
echo "[3/3] Syncing to Android native project..."
npx cap sync android

echo ""
echo "✓ Web assets synced to Android!"
echo ""
echo "Now build the signed AAB inside the android folder:"
echo ""
echo "  cd android"
echo "  .\\gradlew.bat bundleRelease"
echo "    -Pandroid.injected.signing.store.file=../nexus-release-key.jks"
echo "    -Pandroid.injected.signing.store.password=nexuslearn@2024"
echo "    -Pandroid.injected.signing.key.alias=nexus-key"
echo "    -Pandroid.injected.signing.key.password=nexuslearn@2024"
echo ""
echo "Output: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
