# 📱 Google Play Store Publishing Guide — NEXUS LEARN

This guide provides step-by-step instructions for publishing **NEXUS LEARN** (`com.nexuslearn.app`) to the Google Play Store using the generated Android project.

---

## 1. Prerequisites
- **Android Studio** (Koala / Ladybug or newer)
- **Google Play Developer Account** ($25 one-time registration)
- **Java Development Kit (JDK 17 or 21)**

---

## 2. Build Web Assets & Sync Native Android Project

Run the following commands inside `nexus-learn`:

```bash
# 1. Build optimized web application
npm run build

# 2. Sync to Android Native wrapper
npx cap sync android
```

---

## 3. Generate a Release Upload Keystore

Generate your cryptographic signing keystore:

```bash
keytool -genkey -v -keystore nexus-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias nexus-key
```

Keep your `nexus-release-key.jks` and passwords safe.

---

## 4. Configure Keystore in `android/app/build.gradle`

In `android/app/build.gradle`, configure the `signingConfigs`:

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file("nexus-release-key.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: "your_password"
            keyAlias "nexus-key"
            keyPassword System.getenv("KEY_PASSWORD") ?: "your_password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 5. Build Production Android App Bundle (.aab)

Run the Gradle command to generate the `.aab` bundle required by Google Play Store:

```bash
cd android
./gradlew bundleRelease
```

The output file will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 6. Google Play Console Listing Details

1. **App Name**: `NEXUS LEARN — AI Smart Education & Gamified Learning`
2. **Short Description**: `AI-powered personalized gamified education platform for School, College, NEET, JEE & Skills.`
3. **Full Description**:
   ```text
   NEXUS LEARN is an intelligent gamified learning platform empowering students across India with:
   - 24/7 AI Tutor powered by Google Gemini AI
   - 10+ Interactive 3D Virtual Science & Engineering Labs
   - Bhasha AI: Spoken English & 22 Scheduled Indian Languages Translation with Audio Speech
   - Syllabus-Locked Video Learning with Struggle Detection
   - LeetCode-style Multi-Language Code Playground & Sandbox
   - Digital Twin Concept Mastery & Spaced Repetition
   ```
4. **App Category**: Education
5. **Content Rating**: Everyone (3+)
6. **Privacy Policy URL**: Included in the app or hosted on your GitHub Pages.

---

## 7. App Preview & Testing
Before uploading, you can preview the app inside the built-in emulator at `http://localhost:3000/mobile-preview` or test directly on an Android device:

```bash
npx cap run android
```
