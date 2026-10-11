# 🌱 AgriMate AI — Smart Farming Assistant for Small-Scale Farmers

AgriMate AI is a production-grade, full-stack, AI-powered agricultural mobile application built with **React Native (Expo + TypeScript)**, a secure **Node.js/Express TypeScript backend**, **Supabase PostgreSQL with Row Level Security (RLS)**, and **Google Gemini AI**.

Designed with **everyday language**, clear visual guidance, large touch targets, and a forest-green agricultural theme, AgriMate AI empowers beginner and small-scale farmers to manage crops, diagnose plant ailments with AI, monitor weather-driven irrigation schedules, and optimize soil health safely.

---

## 🌾 Core Features & Capabilities

### 1. Robust Authentication & 6-Rule Strong Password Enforcement
- **Client & Server Validation:** Strictly validates:
  - Minimum 12 characters.
  - At least one uppercase letter (A–Z).
  - At least one lowercase letter (a–z).
  - At least one number (0–9).
  - At least one special character (`!@#$%^&*...`).
  - No leading or trailing spaces.
- **Interactive Password Strength Meter:** Visual progress bar (Red $\rightarrow$ Amber $\rightarrow$ Green) with live 6-point requirement checklist and password visibility toggle.
- **Password Recovery & Verification:** Verified email recovery flow with generic error messaging to prevent user enumeration attacks.
- **Zero Plaintext Credentials:** Passwords are never stored in application logs, database tables, or analytics.

### 2. Respectful, Polite Phone Permissions
- **Never Requested Upfront:** Permissions are only prompted when a specific feature is initiated.
- **Pre-Permission Explanation Dialogs:** Clear modals explain *why* the access is needed before triggering OS system dialogs.
- **Graceful Fallbacks:**
  - *Camera Denied?* Immediate fallback to select existing images from gallery or manually describe symptoms in AI Chat.
  - *Location Denied?* Direct manual farm region search via Open-Meteo geocoding without requiring GPS.
  - *Notifications Denied?* Farming planner remains fully accessible in-app.
- **Settings Permission Center:** Live status overview (Granted/Denied), privacy rationales, and one-click triggers to open system OS settings.

### 3. Home Dashboard
- Dynamic greeting using farmer's preferred name.
- Live weather card with current temperature, humidity, rain probability, and practical field advisories (e.g. holding irrigation before forecasted rain).
- Quick action shortcuts: **My Crops**, **Plant Doctor**, **Ask AI**, and **Soil Guide**.
- Today's task checklist with instant check-off.
- Horizontal scroll of active crop plots with growth stage badges.
- Welcoming empty state for new farmers with one-click "+ Add Crop" onboarding.

### 4. AI Plant Doctor (Multimodal Visual Diagnostics)
- **Workflow:** Select target crop $\rightarrow$ Snap photo or select from library $\rightarrow$ Preview $\rightarrow$ Describe visible symptoms $\rightarrow$ AI analysis.
- **Structured Results:**
  - Identified or suspected crop.
  - Observed visual symptoms (lesions, chlorosis, wilt).
  - Probable causes (distinguishing likely causes from confirmed diagnoses).
  - Confidence rating & honest photographic limitation notes.
  - Step-by-step practical remedies.
  - Cultural and organic prevention techniques.
  - Clear guidance on when to consult local extension officers.
- Saved automatically for offline review.

### 5. Conversational AI Agricultural Assistant
- Natural language chat powered by Google Gemini.
- Practical step-by-step farming guidance in plain language.
- Safety-first handling: never guesses chemical concentrations; warns about protective gear, pollinator safety, and label compliance.
- Interactive follow-up question chips.
- Bookmark / save advice to local history.

### 6. Real Weather & Farming Conditions
- Powered by live Open-Meteo forecasts (no mock/fabricated weather data).
- Temperature, precipitation probability, humidity, and wind conditions.
- Next 12 hours hourly forecast and 5-day daily agricultural outlook.
- Actionable advisories for irrigation and wind-sensitive foliar spraying.

### 7. My Crops & Farming Planner
- Complete crop tracking: crop name, variety, planting date, expected harvest date, plot size (acres/hectares), growth stage, and field notes.
- Status filters: Active, Harvested, and Archived.
- Planner task types: Watering, Fertilizing, Pest inspection, Crop monitoring, Planting, Harvesting, and General farm work.
- Local push notifications scheduled via Expo Notifications.

### 8. Soil & Fertilizer Guidance
- Interactive soil texture guide (Clay, Sandy, Loamy, Silty, Peaty).
- Soil pH analysis with ideal ranges per crop.
- Essential N-P-K nutrient education and organic soil amendments.
- **Honest hardware disclaimer:** explicitly informs farmers that phones cannot measure pH directly and advises testing kits or lab analysis.

### 9. Offline & Low-Connectivity Support
- Seamless local caching via `@react-native-async-storage/async-storage`.
- In-memory and cached fallbacks for crops, tasks, past diagnoses, and weather.
- Offline status banner with retry sync control.
- In-app offline mode simulator for field testing.

---

## 📁 Repository Structure

```
├── mobile/                        # React Native / Expo Mobile Application
│   ├── app/                       # Expo Router File-Based Routing
│   │   ├── _layout.tsx            # Root Layout (SafeArea, AuthProvider, OfflineProvider)
│   │   ├── index.tsx              # Gateway Splash Screen
│   │   ├── (auth)/                # Authentication Screens
│   │   │   ├── onboarding.tsx     # Onboarding Carousel
│   │   │   ├── login.tsx          # Login Screen
│   │   │   ├── register.tsx       # Registration Screen (Password Checklist)
│   │   │   ├── forgot-password.tsx# Password Recovery
│   │   │   └── verify-email.tsx   # Verification Screen
│   │   ├── (tabs)/                # Bottom Tab Navigation
│   │   │   ├── _layout.tsx        # Tab Bar Layout
│   │   │   ├── index.tsx          # Home Dashboard
│   │   │   ├── crops.tsx          # My Crops Screen
│   │   │   ├── planner.tsx        # Farming Planner Screen
│   │   │   ├── doctor.tsx         # AI Plant Doctor Screen
│   │   │   └── chat.tsx           # AI Agricultural Assistant Chat
│   │   ├── crop/                  # Crop Management
│   │   │   ├── [id].tsx           # Crop Details View
│   │   │   ├── add.tsx            # Add Crop Modal
│   │   │   └── edit.tsx           # Edit Crop Modal
│   │   ├── weather.tsx            # Weather & Farming Conditions
│   │   ├── soil-guide.tsx         # Soil & Fertilizer Guide
│   │   ├── analysis/[id].tsx      # Plant Health Analysis Report
│   │   ├── saved-history.tsx      # Saved Diagnoses & Advice
│   │   ├── notifications.tsx      # Reminder Settings
│   │   ├── profile.tsx            # Farmer Profile Screen
│   │   └── settings/              # Settings & Permission Center
│   │       ├── index.tsx          # Settings Screen
│   │       └── permissions.tsx    # Permission Center
│   ├── src/                       # Shared Client Code
│   │   ├── components/            # UI Components (Button, Input, Card, Badge, Modal)
│   │   ├── context/               # AuthContext, OfflineContext
│   │   ├── services/              # API Client, OfflineStorage, Permissions, Notifications
│   │   ├── theme/                 # Forest Green Design System & Spacing
│   │   ├── utils/                 # Zod Schemas & Password Policy Validator
│   │   └── __tests__/             # Mobile Unit Tests (node:test)
│   ├── package.json
│   └── tsconfig.json
│
├── server/                        # Secure Node.js / Express Backend
│   ├── src/
│   │   ├── config.ts              # Environment Configuration
│   │   ├── index.ts               # Express Entrypoint & Health Check
│   │   ├── middleware/            # Supabase Auth Middleware
│   │   ├── routes/                # AI, Weather, Crops, Tasks, Soil, User Endpoints
│   │   ├── services/              # Gemini AI, Open-Meteo Weather, Soil Analysis
│   │   ├── utils/                 # Server Password Policy Validator
│   │   └── __tests__/             # Backend Jest Integration Test Suite
│   ├── dist/                      # Compiled Production Output
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── supabase/
│   └── migrations/
│       └── 20261011_agrimate_schema.sql # 10 Tables, Indexes, Triggers & RLS Policies
│
├── README.md                      # Comprehensive Guide & Documentation
├── API.md                         # Complete REST API Specification
└── DEPLOYMENT.md                  # Database & Production Deployment Guide
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v24.21.0)
- npm v9+

### 1. Start the Backend API Server
```bash
cd server
npm install
npm run build
npm start
```
The server will boot on `http://localhost:4000`:
- Health check: `GET http://localhost:4000/api/health`
- Weather: `GET http://localhost:4000/api/weather?lat=37.77&lon=-122.41`

*(Optional)* To enable live Google Gemini AI features, configure your key in `server/.env`:
```env
GEMINI_API_KEY=AIzaSy...
```
*(If no API key is provided, the server automatically uses the built-in intelligent agricultural knowledge engine for both chat and leaf diagnostics.)*

### 2. Start the Mobile Application
In a separate terminal:
```bash
cd mobile
npm install --legacy-peer-deps
npm start
```
From the Expo CLI menu:
- Press `w` to open in your web browser.
- Press `a` to launch in an Android emulator or connected device.
- Scan the QR code using the Expo Go mobile app on your phone.

---

## 🧪 Running the Automated Test Suite

### Server Integration Tests (Jest + Supertest)
Covers password strength enforcement, weather advisory parsing, soil analysis, and crops/tasks API routes:
```bash
cd server
npm test
```
**Results:** `4 test suites passed, 15 tests passed.`

### Mobile Unit Tests (Node Native Test Runner)
Covers Zod input validation schemas and client-side password policies:
```bash
cd server
npx tsx --test ../mobile/src/__tests__/passwordPolicy.test.ts ../mobile/src/__tests__/validation.test.ts
```
**Results:** `6 test suites passed, 7 tests passed.`

### TypeScript Verification
```bash
# Mobile type check:
cd mobile
npx tsc --noEmit

# Server type check:
cd server
npm run build
```
Both compiled with **0 errors**.

---

## 📱 Android Development & Build Instructions

### Running on Android Device or Emulator
1. Connect your Android phone with **USB Debugging** enabled or start an Android Virtual Device (AVD).
2. Run:
   ```bash
   cd mobile
   npx expo run:android
   ```

### Building a Production APK or Android App Bundle (AAB) with EAS
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Configure project credentials:
   ```bash
   eas build:configure
   ```
4. Build APK for direct device installation:
   ```bash
   eas build --platform android --profile preview
   ```
5. Build AAB for Google Play Store release:
   ```bash
   eas build --platform android --profile production
   ```

---

## 🔒 Security & Privacy Model
- **No Private Keys on Client:** Google Gemini API keys and Supabase service role keys reside strictly on the server backend.
- **Row Level Security:** Database policies enforce that users can only view, mutate, or delete records belonging to their own `user_id = auth.uid()`.
- **Private Image Bucket:** Plant photos are uploaded to an authenticated, private Supabase Storage bucket (`plant-photos`) with strict owner-only policies.
- **Data Export & Deletion:** Farmers can export their complete history in standard JSON format or permanently delete their account and all associated farming data at any time under Settings.

---

## 📋 Status & Configuration Notes
| Component | Implementation Status | Notes |
| :--- | :--- | :--- |
| **Authentication & Password Checklist** | ✅ Complete | Meets all 6 requirements; full checklist & strength meter |
| **Phone Permission Flow** | ✅ Complete | Camera, Gallery, Location, Notifications with polite fallbacks & Permission Center |
| **Home Dashboard** | ✅ Complete | Live weather card, active plots, today's tasks, new user empty states |
| **AI Agriculture Chat** | ✅ Complete | Google Gemini API + offline fallback, chemical cautions, follow-up chips |
| **AI Plant Doctor** | ✅ Complete | Multimodal image diagnostics, uncertainty notes, cultural remedies |
| **Weather & Farming Conditions** | ✅ Complete | Live Open-Meteo forecasts, hourly/5-day outlook, spraying/irrigation guidance |
| **My Crops Management** | ✅ Complete | CRUD, growth stage tracking, plot sizing, status filtering |
| **Farming Planner** | ✅ Complete | Task creation, completion toggle, local push notifications |
| **Soil & Fertilizer Guide** | ✅ Complete | Soil texture analysis, N-P-K education, hardware testing disclaimers |
| **Low-Connectivity Support** | ✅ Complete | AsyncStorage caching, sync queue, and offline simulator |
| **Relational Database & RLS** | ✅ Complete | Full SQL migration file with 10 tables, triggers, and bucket policies |
