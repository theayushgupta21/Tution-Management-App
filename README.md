# TuitionApp

A React Native + Expo app for managing a tuition center with attendance, fee tracking, student records, and WhatsApp communication.

## What this app does
- Teacher/admin login and signup with Firebase Authentication
- Add, edit, and delete student records
- Mark attendance per student
- Track fee status (paid/pending)
- Send WhatsApp reminders for pending fees
- View dashboard summary and student attendance history
- Use a 4-tab bottom navigation: Home, Calendar, Students, Profile

## Tech stack
- Expo Router
- React Native
- Firebase Auth
- Firebase Firestore
- Expo Vector Icons
- AsyncStorage for Firebase auth persistence

## Current project structure
```bash
TuitionApp/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── attendance.js
│   │   ├── index.tsx
│   │   ├── profile.js
│   │   └── students/
│   │       ├── [id]/
│   │       │   └── attendance-history.js
│   │       ├── index.js
│   │       └── add.js
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
├── utils/
│   └── attendanceHelpers.js
├── app.json
├── expo-env.d.ts
├── eslint.config.js
├── package.json
├── tsconfig.json
├── README.md
└── assets/
    └── images/
```

## Main app flow
### Tabs
The bottom navigation is limited to 4 items:
- Home
- Calendar
- Students
- Profile

### Internal screens
These are normal routed screens, not bottom-tab entries:
- Fee status screen
- Add / edit student screen
- Attendance history screen
- Public student view screen

These screens are opened from dashboard buttons or list actions, not from the tab bar.

## Firebase setup
Create a Firebase project and add the following environment variables at the root of the project in a `.env` file:

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

## Install and run
```bash
npm install
npx expo start -c
```

Run the app in Expo Go or a simulator/emulator.

## Features implemented
- [x] Admin signup/login
- [x] User-specific Firebase data scoping
- [x] Dashboard summary cards
- [x] Student add/edit/delete flow
- [x] Daily attendance marking
- [x] Attendance history calendar view
- [x] Fee tracking and status switching
- [x] WhatsApp reminder deep links
- [x] Teacher profile page
- [x] Warm coffee themed UI

## Notes
- This project is designed as an MVP for a tuition center workflow.
- App logic is intentionally focused on real management tasks rather than a generic template.
- Firestore security rules should be tightened before production deployment.

## Future improvements
- Automatic monthly WhatsApp reports
- Parent-facing reporting link with read-only access
- More advanced attendance analytics
- Better role-based access (admin vs teacher)
- Production security rules and validation