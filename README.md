# TuitionApp

<p align="center">
  <img src="https://img.shields.io/badge/Expo-57-000020?style=for-the-badge&logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase" />
</p>

<p align="center">
  <strong>Smart tuition management for teachers who want less paperwork and more focus on learning.</strong>
</p>

TuitionApp is a modern React Native + Expo app designed for coaching centers and tuition businesses. It brings together student records, attendance, fee tracking, and communication into one dashboard that is easy to use on the go.

## ✨ What this app does

- Teacher login and signup using Firebase Authentication
- Secure user-specific Firestore data storage
- Dashboard overview with quick metrics
- Student management with add, edit, and delete flow
- Attendance tracking by student and class date
- Fee status tracking for pending and paid students
- WhatsApp reminder links to reduce payment follow-up friction
- Profile screen with logout and account details
- Warm, friendly mobile-first UI tailored for a tutoring business

## 🧩 Tech stack

- Expo SDK 57
- React Native 0.86.3
- Expo Router
- Firebase Auth
- Firebase Firestore
- AsyncStorage
- Expo Vector Icons
- TypeScript support

## 🏗️ Project structure

```bash
TuitionApp/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── attendance.js
│   │   ├── fees.js
│   │   ├── index.tsx
│   │   ├── profile.js
│   │   └── students/
│   │       ├── [id]/
│   │       │   └── attendance-history.js
│   │       ├── add.js
│   │       └── index.js
│   ├── _layout.tsx
│   ├── login.js
│   └── student-view/
│       └── [id].tsx
├── components/
│   ├── Avatar.js
│   ├── Card.js
│   ├── PrimaryButton.js
│   ├── RoundedInput.js
│   ├── ScreenHeader.js
│   ├── WavyBackground.js
│   └── ui/
├── config/
│   └── firebaseConfig.js
├── constants/
│   └── theme.ts
├── functions/
│   └── index.js
├── hosting/
│   └── parent.html
├── firestore.rules
├── app.json
├── expo-env.d.ts
├── eslint.config.js
├── package.json
├── tsconfig.json
├── README.md
├── AGENTS.md
├── CLAUDE.md
└── assets/
    └── images/
```

## 🧭 App navigation

The app currently uses a 4-tab bottom navigation:
- Home
- Calendar
- Students
- Profile

Extra screens like fee tracking, add/edit student views, and attendance history are internal routes used by actions from the main app flow.

## 🔐 Firebase setup

Create a root-level `.env` file with your Firebase credentials:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Then enable:
- Firebase Authentication → Email/Password
- Firestore Database

## 🚀 Run locally

```bash
npm install
npx expo start -c
```

Open the app in Expo Go, Android Studio, or an iOS simulator.

## ✅ Included features

- [x] Teacher login and signup
- [x] Firebase auth persistence using AsyncStorage
- [x] Dashboard overview cards
- [x] Student add, edit, delete, and listing flow
- [x] Attendance tracking and history
- [x] Fee tracking with paid/pending status
- [x] WhatsApp reminder links for follow-ups
- [x] Teacher profile page with logout
- [x] Warm coffee-inspired mobile UI
- [x] Parent/public view support structure

## 📝 Notes

- This is an MVP for a tuition business workflow.
- Data is isolated per user in Firestore using the logged-in UID.
- The app is built for real usage, but it is still designed as a practical MVP before full production-grade security hardening.

## 🌱 Future improvements

- monthly WhatsApp report automation
- secure parent share-token access flow
- stronger Firestore rules and validation
- better attendance analytics and trends
- role-based multi-admin support
- production deployment pipeline with Firebase Hosting and Cloud Functions

<p align="center">
  <sub>Built for coaching centers, tuition classes, and fast-moving student management workflows.</sub>
</p>