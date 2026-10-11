# 🚀 AgriMate AI — Deployment & Infrastructure Guide

This guide details how to deploy AgriMate AI across Supabase PostgreSQL, the Node.js/TypeScript backend API, and Android mobile application distribution.

---

## 1. Database & Supabase Configuration

### Step 1: Create Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Note your **Project URL**, **Anon Public Key**, and **Service Role Key** under **Project Settings $\rightarrow$ API**.

### Step 2: Execute Database Migrations
1. Open the **SQL Editor** in your Supabase dashboard.
2. Paste and run the entire contents of `supabase/migrations/20261011_agrimate_schema.sql`.
3. This creates:
   - All 10 relational tables (`profiles`, `farms`, `crops`, `farming_tasks`, `plant_analyses`, `ai_conversations`, `ai_messages`, `weather_cache`, `user_settings`).
   - Indexes for high-performance querying on foreign keys and scheduled dates.
   - Row Level Security (RLS) policies on all tables ensuring multi-tenant isolation.
   - The `handle_new_user` trigger automatically populating profile records upon user signup.
   - The private storage bucket `plant-photos` with owner-only access policies.

### Step 3: Configure Auth Password Policy in Supabase
In **Authentication $\rightarrow$ Providers $\rightarrow$ Email**:
- Set Minimum Password Length to **12 characters**.
- Require uppercase, lowercase, numbers, and symbols to align with AgriMate's client and server validation.

---

## 2. Backend Server Deployment

The backend server can be deployed to any Node.js hosting platform (e.g. Render, Railway, Fly.io, or AWS ECS).

### Environment Variables
Configure the following in your hosting provider's environment settings:
```env
PORT=4000
NODE_ENV=production
GEMINI_API_KEY=your_production_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SERVER_BASE_URL=https://api.yourdomain.com
```

### Build & Start Commands
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start` (executes `node dist/index.js`)

---

## 3. Mobile Client Deployment (Android APK & AAB)

### Environment Variables
In `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### EAS Build Configuration
Create `mobile/eas.json`:
```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Triggering Android Builds
- **Standalone Preview APK:**
  ```bash
  cd mobile
  eas build --platform android --profile preview
  ```
- **Google Play Store App Bundle (AAB):**
  ```bash
  cd mobile
  eas build --platform android --profile production
  ```

---

## 4. Verification Checklist
- [x] Backend responds to `GET /api/health` with `{"status": "healthy"}`.
- [x] Weather endpoint pulls live data from Open-Meteo.
- [x] Plant diagnosis endpoint returns structured causes, remedies, and uncertainty notes.
- [x] Password policy validates 12 characters, uppercase, lowercase, number, special char, no spaces.
- [x] Mobile app builds and runs without TypeScript errors.
- [x] Camera, Photo, Location, and Notification permissions display explanation modals before OS dialogs.
- [x] Full offline mode support preserves tasks and crop data in AsyncStorage.
