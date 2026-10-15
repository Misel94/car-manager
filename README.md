# My Cars

Android app for keeping track of your own cars. Version 0.1 talks to a Google Sheet through a Google Apps Script web app. This first step only opens a home screen. The car list, forms, and icons come in the next steps.

## Install

```bash
npm install
```

## Configure

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Open `.env` and set:

- `EXPO_PUBLIC_API_URL` — the web app URL of your deployed Apps Script
- `EXPO_PUBLIC_API_TOKEN` — the secret token that script expects

The app does not call the sheet yet. You can leave the placeholders until the next step.

## Run

```bash
npx expo start
```

## Open on your phone

1. Install **Expo Go** from the Play Store.
2. Make sure the phone and the computer are on the same Wi‑Fi network.
3. In the terminal, a QR code appears. In Expo Go, scan that code.
4. You should see a light grey screen, a white card, and the words **My Cars**.

If the QR code does not connect, press `s` in the terminal to switch the connection type, then scan again.
