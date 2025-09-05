# Quant Prep XP Tracker

## Overview

Quant Prep XP Tracker gamifies preparation for quantitative finance interviews. Users log in, track tasks, earn XP, and level up. The app can be wrapped as an Android TWA for mobile installation.

## Features

* Firebase Authentication
* Firestore for user tasks
* Mark tasks completed to update XP/level
* Add tasks dynamically
* XP progress bar
* Android TWA support

## Tech Stack

* React
* Vite
* Firebase (Auth & Firestore)
* Bubblewrap (TWA)
* Android Studio

## Setup

### 1. React App

```bash
npm install
npm run dev
```

### 2. Firebase Hosting

* Ensure `dist/` is public folder.

```bash
npm run build
firebase init
firebase deploy
```

### 3. Export App to Android TWA

```bash
bubblewrap init --manifest=https://quant-prep.web.app/manifest.json
cd twa-build
bubblewrap build
```

**In Android Studio:**

1. Open `twa-build/` (Gradle sync).
2. Build Project: `Build → Make Project`.
3. Build APK: `Build → Build Bundle(s) / APK(s) → Build APK(s)`.
4. Run on emulator/device.


### 4. Enable Developer Mode & USB Debugging
1. **Developer Mode:** `Settings → About phone → Tap Build number 7x`.
2. **USB Debugging:** `Settings → System → Developer options → USB debugging`.
3. Connect phone via USB and accept prompts.
4. Verify connection in a terminal: `adb devices`.
5. Install APK: from a terminal, within the project folder:
  ```bash
  adb -s YOUR_DEVICE install -r twa-build/app/build/outputs/apk/debug/app-debug.apk
  ```
  replace `YOUR_DEVICE` by its value found from `adb devices` command

## Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userQuests/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## License

MIT
