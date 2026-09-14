# Tuition Manager — Attendance, Fees & WhatsApp Reminders

A React Native (Expo) app for small tuition/coaching centers to manage students,
mark daily attendance, and send WhatsApp fee reminders to parents — replacing
manual WhatsApp groups and Excel sheets.

## Problem it solves
Small coaching centers currently track attendance and fee collection manually,
leading to missed fee follow-ups (real revenue loss) and no organized record of
student attendance. This app gives the tuition owner one simple dashboard for
all three.

## Tech Stack
- **Frontend:** React Native + Expo
- **Navigation:** React Navigation (bottom tabs + native stack)
- **Backend:** Firebase Firestore (database) + Firebase Auth (login)
- **Parent communication:** WhatsApp deep link (`wa.me` / `whatsapp://send`)

## Setup Instructions

### 1. Install dependencies
```bash
npx create-expo-app TuitionApp
cd TuitionApp
# Copy all files from this project into the new folder, overwriting App.js

npm install firebase
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```

### 2. Set up Firebase
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → Create Project (free tier is enough)
2. Inside the project, click "Add app" → Web (</>) — yes, even though this is a mobile app, Firebase's web SDK works fine with Expo
3. Copy the config object it gives you into `config/firebaseConfig.js`
4. In the Firebase console:
   - **Authentication** → Sign-in method → Enable "Email/Password"
   - **Firestore Database** → Create database → Start in **test mode** (switch to secure rules before going live — see note below)

### 3. Run the app
```bash
npx expo start
```
Scan the QR code with the Expo Go app on your phone (Android/iOS), or press `a` for Android emulator / `i` for iOS simulator.

## Project Structure
```
TuitionApp/
├── App.js                     # Entry point, handles login state
├── config/
│   └── firebaseConfig.js      # Firebase credentials
├── navigation/
│   └── AppNavigator.js        # Tab + stack navigation
└── screens/
    ├── LoginScreen.js
    ├── DashboardScreen.js
    ├── StudentListScreen.js
    ├── AddStudentScreen.js
    ├── AttendanceScreen.js
    └── FeeScreen.js
```

## Features (MVP)
- [x] Admin login/signup (Firebase Auth)
- [x] Add / edit / delete students
- [x] Mark daily attendance (present/absent) per student
- [x] Track fee status (paid/pending) per student
- [x] One-tap WhatsApp reminder to parent for pending fees
- [x] Live dashboard summary (total students, pending fees)

## Roadmap (Phase 2)
- [ ] Replace manual WhatsApp deep link with Twilio WhatsApp Business API for fully automated, scheduled reminders
- [ ] Monthly fee history (currently tracks only current status, not per-month log)
- [ ] Attendance calendar view + monthly attendance % report
- [ ] Parent-facing view (read-only) via a shared link
- [ ] Push notifications for the owner (e.g. "5 fees still pending this week")

## Important note on Firestore security
This starter uses Firestore in **test mode**, which allows open read/write —
fine for development, **not safe for production**. Before deploying for a real
user, add security rules so only authenticated users can read/write their own
center's data.

## Why this project (for recruiters/interviewers)
This isn't a tutorial clone — it targets a real, underserved niche (small
tuition centers, most of which still run on WhatsApp groups + Excel) and
integrates a real third-party communication channel (WhatsApp) rather than
just CRUD screens. It demonstrates: Firebase real-time data (`onSnapshot`),
multi-screen navigation architecture, auth state handling, and basic product
thinking about a genuine small-business pain point.