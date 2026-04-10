# ConSafe Path

A React Native mobile application designed to help Concordia University students navigate campus safely during disruptions such as protests, construction, and emergencies.

---

## Prerequisites

Make sure you have the following installed before starting:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- [EAS CLI](https://docs.expo.dev/build/setup/): `npm install -g eas-cli`
- Either:
    - **Android Studio** for emulator/dev builds → https://docs.expo.dev/workflow/android-studio-emulator/
    - A **physical Android device** with USB debugging enabled

---

## Accounts Required

You will need accounts on the following services. All have free tiers sufficient for development.

### 1. Supabase
- Go to https://supabase.com and create a project
- Note your **Project URL** and **Publishable (anon) key** from Project Settings → API
- Run the schema (see below)

### 2. Google Cloud
You need three API keys from https://console.cloud.google.com:
- **Maps SDK for Android** → used for the map view
- **Places API** → used for location search autocomplete
- **Directions API** → used for safe route calculation

Steps:
1. Create a project in Google Cloud Console
2. Enable the three APIs above under **APIs & Services → Library**
3. Go to **APIs & Services → Credentials → Create Credentials → API Key**
4. Restrict each key to your app's package name: `com.soen6751.concordia_safe_path`

> You can use a single key for all three APIs or create separate keys per API.

### 3. Expo / EAS
- Create an account at https://expo.dev
- Run `eas login` and `eas init` to link the project
- Update the `projectId` in `app.json` under `extra.eas` with your own project ID

---

## Supabase Database Setup

1. Open your Supabase project
2. Go to **SQL Editor**
3. Paste and run the contents of `supabase/schema.sql`

This will create all tables, policies, and enable Realtime for `incidents`, `notifications`, and `comments` automatically.

> **Email confirmation** is disabled by default in this project. If your Supabase project has it enabled, go to **Authentication → Providers → Email** and turn off **Confirm email** — otherwise users won't be able to log in after registering.
---

## Setup

**1. Clone the repository**
```bash
git clone https://github.com/luantran/concordia-safe-path.git
cd concordia-safe-path
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the project root:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-supabase-anon-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your-google-places-key
EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY=your-google-directions-key
```

**4. Add Google Maps key to `app.json`**

Under `expo.android.config`:
```json
"config": {
  "googleMaps": {
    "apiKey": "your-google-maps-key"
  }
}
```

**5. Set up EAS environment variables**

Go to https://expo.dev → your project → **Environment Variables** and add:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`
- `EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY`

Set each one to the **Preview** environment so they're available during APK builds.

> These are never stored in the codebase: each team member sets them once on expo.dev.
---

## Running the App (Development)

```bash
npx expo start
```

| Platform | Command | Notes |
|---|---|---|
| Android Emulator | Press `a` in terminal | Emulator must be running first |
| Physical device (Expo Go) | Scan QR code | Must be on same WiFi network |

> Note: Push notifications and some native features do not work in Expo Go. Use a dev build for full functionality.

---

## Building a Dev Build (Recommended)

A dev build gives you native rendering with live reload — better than Expo Go for testing:

```bash
npx expo prebuild --platform android
npx expo run:android
```

Your device must be connected via USB with USB debugging enabled.

---

## Building a Preview APK

To generate an installable APK for testing on any Android device:

```bash
eas build --platform android --profile preview
```

Download the APK from https://expo.dev once the build completes and install it on your device.

> Make sure `eas.json` has your real API keys filled in before building.

---

## Project Structure

```
app/
├── (auth)/               ← Login & Register screens
├── (dashboard)/          ← Main app tabs
│   ├── incidents/        ← Incident feed
│   │   └── [id].jsx      ← Incident detail
│   ├── create.jsx        ← Report an incident
│   ├── map.jsx           ← Campus map with incident pins
│   ├── notifications.jsx ← Notification history
│   └── menu/             ← Profile, preferences, resources, FAQ
├── _layout.jsx           ← Root layout + providers

components/               ← Reusable themed components
contexts/                 ← React context (User, Incidents, Notifications, Theme)
hooks/                    ← useUser, useIncidents, useIncidentDetail, etc.
lib/                      ← Supabase client, helpers, navigationStore
constants/                ← Colors, Icons, Incidents
supabase/                 ← schema.sql
```

