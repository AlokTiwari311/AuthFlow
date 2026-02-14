# AuthFlow

Passwordless login app built with React Native + Expo. Users enter their email, get a 6-digit OTP (simulated on-device, no backend), verify it, and land on a session screen. Everything persists across app restarts using AsyncStorage.

## Setup

You need Node.js (v18+) and the Expo Go app on your phone.

```bash
git clone https://github.com/<your-username>/react-native-auth-flow.git
cd react-native-auth-flow
npm install
npx expo start
```

Scan the QR code with Expo Go to run on your phone. You can also do `npx expo start --web` if you just want to test in a browser.

## How the OTP works

All the OTP logic is in `src/services/otpService.js`. There's no server — everything runs locally on the device.

When the user submits their email, `generateOtp()` creates a random 6-digit code using `Math.floor(100000 + Math.random() * 900000)`, sets an expiry 60 seconds from now, and saves it to AsyncStorage. The code gets logged to the console so you can actually test it (since there's no real SMS or email being sent).

When they submit a code, `validateOtp()` runs through these checks in order:
- Does OTP data exist for this email? If not, it was never requested or already cleared.
- Has it been more than 60 seconds? If yes, it's expired.
- Have they already failed 3 times? If yes, they're locked out.
- Does the entered code match? If not, increment the attempt counter and tell them how many tries are left.

If the code matches, the OTP data gets deleted immediately (so it can't be reused) and a session is created.

The OTP screen shows a countdown timer. When it hits zero, a "Resend Code" button appears. Resending generates a completely new code with a fresh 60-second window and resets the attempt counter back to 0.

If the user closes the app while on the OTP screen and reopens it, `App.js` checks AsyncStorage for a pending email. If the OTP hasn't expired yet, it restores them to the OTP screen with the remaining time. If it has expired, they go back to the email screen.

## Data structures

I'm storing a few different things in AsyncStorage, each under its own key.

**OTP data** (`pa_otp_data`) is a JSON object keyed by email:

```js
{
  "user@example.com": {
    email: "user@example.com",
    otp: "482916",
    expiresAt: 1707900000000,
    attempts: 0,
    isUsed: false
  }
}
```

Using email as the key gives O(1) lookups instead of searching through an array. The expiry is stored as a unix timestamp so checking if it's expired is just `Date.now() > expiresAt`. Attempts are tracked right on the OTP object so validation doesn't need to look anywhere else. The OTP itself is a string, not a number — just in case.

**Session** (`pa_sessions`) is a simple object:

```js
{
  email: "user@example.com",
  startTime: 1707900060000,
  isActive: true
}
```

`startTime` drives the live session timer on the dashboard. `isActive` is a straightforward boolean to check login state.

**Event log** (`pa_events`) is an array that gets appended to every time something happens (OTP generated, validated, session started, etc). It's basically a local audit trail for debugging.

## Why AsyncStorage

I went with `@react-native-async-storage/async-storage` because it's the simplest option that does what I need — persist small JSON blobs across app restarts.

Other options I considered:
- **MMKV** — faster, but needs native modules and doesn't work with Expo Go. Overkill for the small amount of data I'm storing.
- **SQLite** — made for relational data and complex queries. My data is just key-value pairs.
- **SecureStore** — better for actual secrets like tokens. My OTP is ephemeral and local-only, so it doesn't need that level of security.
- **Redux / Context** — these are in-memory. Data disappears on restart, which defeats the whole purpose.

AsyncStorage works on iOS, Android, and web, has first-class Expo support, and the API is dead simple (`getItem`, `setItem`, `removeItem`). For an app storing maybe 1KB of data total, it's the right tool.

## What GPT helped with vs. what I did

I designed the auth flow myself — the 3-screen navigation (Login → OTP → Session), the OTP rules (60s expiry, 3 attempts, single-use), the data structures, and how state restoration should work on app restart. I also wrote the email validation regex and handled the UX decisions like locking the verify button after 3 failures and showing the countdown timer.

Where GPT helped was mostly on the React Native side of things. This was originally a React web app, and GPT helped me convert it — swapping `<div>` for `<View>`, `<input>` for `<TextInput>`, CSS for `StyleSheet.create`, that kind of stuff. It also helped with Expo project setup, getting AsyncStorage wired up correctly, and debugging some edge cases around state not persisting properly on restart. And it helped structure this README.

Basically: I knew *what* the app should do and *why*. GPT sped up the *how*, especially the React Native-specific boilerplate.

## Project structure

```
react-native-auth-flow/
├── App.js                   # Main controller, handles screen switching
├── app.json                 # Expo config
├── index.js                 # Entry point
├── package.json
└── src/
    ├── components/
    │   ├── Login.js          # Email input screen
    │   ├── Otp.js            # OTP verification screen
    │   └── Session.js        # Logged-in screen with session timer
    ├── hooks/
    │   └── useSessionTimer.js  # Custom hook for the live timer
    └── services/
        ├── otpService.js     # OTP generation and validation logic
        └── storageService.js # AsyncStorage wrapper
```
