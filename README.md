# Field Log App

Offline-first field log capture for React Native (Expo + TypeScript). Submissions are saved
locally the instant you tap Submit — online or not — and sync out in FIFO order as
connectivity allows.

## Features

- **Optimistic queue & sync engine** — Customer Name, Log Notes, Timestamp, optional photo.
  Submitting offline shows the record immediately as **Pending Sync**, persisted to
  `AsyncStorage`, and flushed FIFO once the device is back online.
- **Optimized list** — 120 seeded historical logs in a `FlatList` using `getItemLayout`,
  `keyExtractor`, and memoized rows to avoid frame drops. Explicit **Empty / Loading /
  Sync Failed (Retry) / Synced** states, plus an animated spinner while a retry is in flight.
- **Network simulation toggle** — a banner with a "Force Offline (dev)" switch that overrides
  the app's effective connectivity without touching the device's real Wi-Fi/cellular state.
- **Delete with confirmation** — a trash icon per row opens a custom confirm dialog before
  permanently removing a log.

## Requirements

- [Node.js](https://nodejs.org/) 20+
- [Java JDK 17 or 21](https://adoptium.net/) (`JAVA_HOME` set)
- [Android Studio](https://developer.android.com/studio) with an Android SDK, platform-tools,
  and either a device (USB debugging enabled) or an emulator (AVD Manager)
- Expo CLI is used via `npx`, no global install needed

## Setup

```bash
git clone https://github.com/zore1803/field-log-app.git
cd field-log-app
npm install
```

## Running the app

This project uses native modules (`AsyncStorage`, `NetInfo`, `expo-image-picker`), so it
needs a **development build** — Expo Go will not work.

### 1. Generate the native Android project (first time only)

```bash
npx expo prebuild --platform android
```

### 2. Run on a device or emulator

Connect a device via USB with USB debugging enabled (or start an emulator from Android
Studio's Device Manager), then:

```bash
npx expo run:android
```

This builds the app, installs it, starts the Metro bundler, and launches it. Subsequent
runs can just use `npm start` (or `npx expo start --dev-client`) once the app is installed,
as long as the same Wi-Fi/USB connection is available for Metro.

### iOS

```bash
npx expo run:ios
```
(requires a Mac with Xcode).

## Building a standalone APK (no dev server required)

To produce a release build with the JS bundle baked in — installable and fully usable
without Metro or a network connection to your dev machine:

```bash
npx expo prebuild --platform android
cd android
./gradlew app:assembleRelease
```

The signed APK will be at:

```
android/app/build/outputs/apk/release/app-release.apk
```

Install it directly on a device:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

> The release build is signed with the Android debug keystore by default (fine for
> internal testing/sharing). For a Play Store submission, configure a real signing
> key in `android/app/build.gradle`.

## Project structure

```
src/
  components/   UI building blocks (list item, status badge, dialogs, spinner, banner)
  context/      NetworkContext (connectivity + dev offline toggle), LogsContext (queue state)
  screens/      LogListScreen, NewLogScreen
  storage/      AsyncStorage-backed log repository
  sync/         FIFO sync engine (mock server submit with simulated failures)
  utils/        Seed data generator
  theme.ts      Shared design tokens
  types.ts      FieldLog / SyncStatus types
```

## Notes

- The "server" the queue syncs to is currently mocked (`src/sync/syncEngine.ts`) with a
  random delay and a ~15% simulated failure rate, so the Sync Failed / Retry flow has
  something real to exercise. Swap `mockSubmitToServer` for a real API call when wiring
  this up to a backend.
- All persistence is local (`AsyncStorage`) — no backend/database is required to run or
  demo the app as-is.
