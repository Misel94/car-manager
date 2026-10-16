# My Cars

Personal car manager for Android. Version 0.1 keeps your cars and to-dos in a Google Sheet. The phone app reads and writes that sheet over the internet. There is no offline mode.

The name on the phone is **My Cars** (`app.json`). The project folder is `car-manager`, version `0.1.0`.

## Contents

1. [Overview](#1-overview)
2. [How the app works](#2-how-the-app-works)
3. [Google Sheets backend setup](#3-google-sheets-backend-setup)
4. [Local setup on a new machine](#4-local-setup-on-a-new-machine)
5. [Project structure](#5-project-structure)
6. [Screens and navigation](#6-screens-and-navigation)
7. [How to add things](#7-how-to-add-things)
8. [Git workflow](#8-git-workflow)
9. [Roadmap](#9-roadmap)

## 1. Overview

v0.1 can:

- list your cars
- add a car
- edit a car
- open a car and see the facts that are filled in
- add, tick, untick, and delete to-dos for that car
- delete a car, which also deletes that car's to-dos

It cannot work without a network connection. Nothing is saved on the phone.

### Tech stack

| Piece | What it is | Why this app uses it |
| --- | --- | --- |
| Expo (SDK 57) and Expo Go | A way to run a React Native app on a phone without Android Studio | You install Expo Go from the Play Store and scan a QR code |
| React Native | The UI toolkit | Buttons, lists, and forms on Android |
| TypeScript | JavaScript with types | `Car` and `Todo` are described in `src/types/` so a wrong field is easier to spot |
| expo-router | File-based screens | A file in `app/` is a screen. The stack is set in `app/_layout.tsx` |
| Google Sheets | The database | Two tabs, `Cars` and `Todos` |
| Google Apps Script web app | The small API in front of the sheet | The phone never talks to the sheet directly. It calls the script's `/exec` URL |

The Apps Script source is **not** a file in this repository. Section 3 includes the script that belongs with this app. Copy it into the Google script editor.

## 2. How the app works

```text
Phone (Expo Go)
    |  HTTPS
    v
Google Apps Script Web App  (.../exec)
    |
    v
Google Sheet
    Cars
    Todos
```

Every screen that needs data calls `src/api/sheets.ts`. That file is the only place that builds requests.

### Reads and writes

**Read (GET).** The app calls:

```text
EXPO_PUBLIC_API_URL?sheet=Cars&token=EXPO_PUBLIC_API_TOKEN
```

`sheet` is `Cars` or `Todos`. The token is URL-encoded. A good reply is:

```json
{ "data": [] }
```

`data` is an array of row objects. One car or one to-do looks like the objects in the examples below.

**Write (POST).** The app sends `Content-Type: text/plain` and a JSON string as the body. The script in section 3 expects that plain-text body. The same URL is used for create, update, and delete. Only `action` changes.

```json
{
  "token": "YOUR_TOKEN",
  "sheet": "Cars",
  "action": "create",
  "data": { "name": "Vandzia", "brand": "Skoda", "model": "Fabia" }
}
```

| Action | `sheet` | `id` | `data` | What the script does |
| --- | --- | --- | --- | --- |
| list | `Cars` or `Todos` on the GET query, not in a POST body | no | no | Returns every row on that tab |
| `create` | `Cars` or `Todos` | not sent | the fields to store | New id, `created_at`, and `updated_at`. Appends a row |
| `update` | `Cars` or `Todos` | the row id | only the fields that change | Finds the row, keeps old values, overwrites the sent fields, sets `updated_at` |
| `delete` | `Cars` or `Todos` | the row id | not sent | Deletes that row |

There is no "list to-dos for one car" action. `listTodosForCar` in `src/api/sheets.ts` loads the whole Todos tab and keeps rows whose `car_id` matches.

### Example bodies the app sends

Create a car (the form sends every field; empty optional fields are `""`):

```json
{
  "token": "YOUR_TOKEN",
  "sheet": "Cars",
  "action": "create",
  "data": {
    "name": "Vandzia",
    "brand": "Skoda",
    "model": "Fabia",
    "year": 2018,
    "mileage": 123456,
    "icon_key": "hatchback",
    "tire_type": "summer",
    "rim_type": "",
    "tire_size": "205/55 R16",
    "oil_type": "5W-30",
    "oil_change_date": "2026-04-01",
    "oil_change_mileage": "",
    "plate": "",
    "fuel_type": "petrol 95",
    "inspection_date": "",
    "insurance_date": "",
    "color": "",
    "engine": "",
    "transmission": "manual",
    "purchase_date": "",
    "tank_capacity": "",
    "battery_date": "",
    "brake_pads_date": "",
    "timing_belt_mileage": "",
    "tire_change_date": "",
    "notes": ""
  }
}
```

Update a car. The edit screen sends every form field, not only the one you changed. The script still merges: it keeps old values and overwrites what you sent. `setTodoDone` is the call that sends only two fields. A small update body looks like this:

```json
{
  "token": "YOUR_TOKEN",
  "sheet": "Cars",
  "action": "update",
  "id": "PASTE_THE_ROW_ID",
  "data": { "mileage": 124000 }
}
```

Tick a to-do. The app sets `done` to `true` and `done_at` to today as `YYYY-MM-DD`. Untick sends `done: false` and `done_at: ""`.

```json
{
  "token": "YOUR_TOKEN",
  "sheet": "Todos",
  "action": "update",
  "id": "PASTE_THE_ROW_ID",
  "data": { "done": true, "done_at": "2026-10-16" }
}
```

Create a to-do:

```json
{
  "token": "YOUR_TOKEN",
  "sheet": "Todos",
  "action": "create",
  "data": {
    "car_id": "PASTE_THE_CAR_ID",
    "title": "Change oil",
    "done": false,
    "done_at": ""
  }
}
```

Delete:

```json
{
  "token": "YOUR_TOKEN",
  "sheet": "Todos",
  "action": "delete",
  "id": "PASTE_THE_ROW_ID"
}
```

### Example responses

Success, list:

```json
{
  "data": [
    {
      "id": "PASTE_THE_ROW_ID",
      "name": "Vandzia",
      "brand": "Skoda",
      "model": "Fabia",
      "year": 2018,
      "mileage": 123456,
      "icon_key": "hatchback",
      "tire_type": "summer",
      "rim_type": "",
      "tire_size": "",
      "oil_type": "",
      "oil_change_date": "",
      "oil_change_mileage": "",
      "plate": "",
      "fuel_type": "petrol 95",
      "inspection_date": "",
      "insurance_date": "",
      "color": "",
      "engine": "",
      "transmission": "",
      "purchase_date": "",
      "tank_capacity": "",
      "battery_date": "",
      "brake_pads_date": "",
      "timing_belt_mileage": "",
      "tire_change_date": "",
      "notes": "",
      "created_at": "2026-10-16T12:00:00.000Z",
      "updated_at": "2026-10-16T12:00:00.000Z"
    }
  ]
}
```

Success, create or update: `{ "data": { ...the row... } }`.

Success, delete, from the script in section 3:

```json
{ "data": { "id": "PASTE_THE_ROW_ID" } }
```

The app does not show that object. It only checks that the call did not come back as an error.

Failure. The script sends a string in `error`. The phone shows that string as-is.

```json
{ "error": "unauthorized" }
```

```json
{ "error": "bad sheet" }
```

```json
{ "error": "not found" }
```

```json
{ "error": "unknown action" }
```

Other messages are written by the app, not the script:

| Situation | Text on screen |
| --- | --- |
| `.env` is empty, or still has `YOUR_DEPLOYMENT_ID` or `replace-with-your-token` | `Missing Google Sheets setup. In the .env file, set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_TOKEN, then stop Expo and start it again.` |
| The phone cannot reach the server | `Could not reach Google Sheets. Check your internet connection and try again.` |
| The reply is not JSON | `Google Sheets sent a reply the app could not read.` |
| HTTP error with no `error` string | `Google Sheets returned an error (STATUS).` |

Empty sheet cells are `""`. Numbers are JSON numbers. Dates the user picks are `YYYY-MM-DD`. `done` is `true` or `false`. The script writes `created_at` and `updated_at` with `new Date().toISOString()`. If Google Sheets later stores that cell as a real date, the script's reader sends it back as `YYYY-MM-DD`. The details screen does not display those two timestamps.

### The token and `.env`

`.env` is not in git (see `.gitignore`). `.env.example` is the safe template.

```bash
EXPO_PUBLIC_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
EXPO_PUBLIC_API_TOKEN=replace-with-your-token
```

`EXPO_PUBLIC_` is required. Expo copies variables with that prefix into the app when it starts. The app cannot see other environment variables. Change `.env`, then stop Expo and start it again.

**Security limit.** Because of `EXPO_PUBLIC_`, the token is inside the JavaScript bundle on the phone. It is not a fully hidden secret. The web app is also deployed so anyone with the link can call it. The token is the only check. Do not reuse a password you use elsewhere. This is fine for a personal app. It is not enough for an app you give to strangers.

The string in `.env` must be exactly the same as `TOKEN` in the Apps Script.

## 3. Google Sheets backend setup

Do this once, in a desktop browser, before the phone app can load cars.

### 3.1 Create the spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) and create a blank spreadsheet.
2. You do not have to rename the tabs by hand. The `setup` function in the script creates tabs named exactly `Cars` and `Todos`, writes the header row, and freezes that row. If a tab named `Sheet1` or `Arkusz1` exists, `setup` deletes that tab. Do not keep data on `Sheet1` or `Arkusz1` before you run it.

Run `setup` from the script editor after you paste the script (section 3.3). Run it once.

Header names and order must match the script. The script reads columns by position, not by looking up a header name later.

### 3.2 Columns

`Cars` has 29 columns. The first 27 (`id` through `notes`) are the car fields. `created_at` and `updated_at` are added by the server. The form edits 26 fields. It does not edit `id`, `created_at`, or `updated_at`.

| # | Column | Type | Example | Who fills it |
| --- | --- | --- | --- | --- |
| 1 | `id` | text (UUID) | `PASTE_THE_ROW_ID` | server, on create |
| 2 | `name` | text, required | `Vandzia` | you, in the form (label: Nickname) |
| 3 | `brand` | text, required | `Skoda` | you |
| 4 | `model` | text, required | `Fabia` | you |
| 5 | `year` | whole number, or empty | `2018` | you. Empty is allowed |
| 6 | `mileage` | whole number of kilometres, or empty | `123456` | you |
| 7 | `icon_key` | text | `hatchback` | you, from the icon list below. Empty uses the default picture |
| 8 | `tire_type` | text | `summer` | you, from the tire list. Empty is allowed |
| 9 | `rim_type` | text | `alloy wheel` | you, from the rim list |
| 10 | `tire_size` | text | `205/55 R16` | you |
| 11 | `oil_type` | text | `5W-30` | you |
| 12 | `oil_change_date` | `YYYY-MM-DD` or empty | `2026-04-01` | you |
| 13 | `oil_change_mileage` | whole number or empty | `120000` | you |
| 14 | `plate` | text | `WX 12345` | you |
| 15 | `fuel_type` | text | `petrol 95` | you, from the fuel list |
| 16 | `inspection_date` | `YYYY-MM-DD` or empty | `2026-11-01` | you |
| 17 | `insurance_date` | `YYYY-MM-DD` or empty | `2027-01-15` | you |
| 18 | `color` | text | `blue` | you |
| 19 | `engine` | text | `1.0 TSI` | you |
| 20 | `transmission` | text | `manual` | you, from the transmission list |
| 21 | `purchase_date` | `YYYY-MM-DD` or empty | `2019-05-20` | you |
| 22 | `tank_capacity` | number of litres, or empty | `45` or `45.5` | you |
| 23 | `battery_date` | `YYYY-MM-DD` or empty | `2024-03-01` | you |
| 24 | `brake_pads_date` | `YYYY-MM-DD` or empty | `2025-06-01` | you |
| 25 | `timing_belt_mileage` | whole number or empty | `90000` | you |
| 26 | `tire_change_date` | `YYYY-MM-DD` or empty | `2025-10-01` | you |
| 27 | `notes` | text | `Winter tires in the garage` | you |
| 28 | `created_at` | text timestamp | `2026-10-16T12:00:00.000Z` | server, on create |
| 29 | `updated_at` | text timestamp | `2026-10-16T12:00:00.000Z` | server, on create and on every update |

`Todos` has 6 columns:

| # | Column | Type | Example | Who fills it |
| --- | --- | --- | --- | --- |
| 1 | `id` | text (UUID) | `PASTE_THE_ROW_ID` | server, on create |
| 2 | `car_id` | text | the car's `id` | the app, when you add a to-do |
| 3 | `title` | text, required | `Change oil` | you |
| 4 | `done` | `true` or `false` | `false` | the app, when you tick the box |
| 5 | `created_at` | text timestamp | `2026-10-16T12:00:00.000Z` | server, on create |
| 6 | `done_at` | `YYYY-MM-DD` or empty | `2026-10-16` | the app. Today when ticked, empty when unticked |

### Allowed values

These are the exact strings in `src/constants/options.ts` and `src/constants/carIcons.ts`. The sheet does not enforce them. The form only offers these choices.

| Field | Allowed values |
| --- | --- |
| `fuel_type` | `petrol 95`, `petrol 98`, `diesel`, `LPG`, `hybrid`, `electric` |
| `tire_type` | `summer`, `winter`, `all-season` |
| `rim_type` | `steel wheel`, `alloy wheel` |
| `transmission` | `manual`, `automatic` |
| `icon_key` | `default`, `sedan`, `suv`, `hatchback`, `wagon`, `van` |

An empty `icon_key`, or a word that is not in that list, still shows `assets/car-icons/default.png`.

### 3.3 Apps Script

This repository does not contain a `.gs` file. Paste the script below into Google's editor.

1. Open the spreadsheet.
2. Choose **Extensions → Apps Script**.
3. Replace the contents of `Code.gs` with the script below.
4. Set `TOKEN` to a long random string (30 or more characters). Remember it. You will put the same string in `.env`.
5. Save.
6. In the function dropdown, choose `setup`, then **Run**. Approve the permissions Google asks for. This creates the `Cars` and `Todos` tabs and the header row.
7. Deploy, as in the next section.

```javascript
// ============================================================
// Car Manager backend (Google Apps Script)
// This script turns your spreadsheet into a small JSON API.
// ============================================================

// Your secret "password". Replace with a long random string (30+ chars).
// The app must send the same token, otherwise requests are rejected.
const TOKEN = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING';

// Definition of sheet tabs and their columns (order = column order).
// If you add a field later, add it here AND in the app.
const SHEETS = {
  Cars: [
    'id','name','brand','model','year','mileage','icon_key',
    'tire_type','rim_type','tire_size',
    'oil_type','oil_change_date','oil_change_mileage',
    'plate','fuel_type','inspection_date','insurance_date',
    'color','engine','transmission','purchase_date','tank_capacity',
    'battery_date','brake_pads_date','timing_belt_mileage','tire_change_date','notes',
    'created_at','updated_at'
  ],
  Todos: ['id','car_id','title','done','created_at','done_at']
};

// Run this ONCE manually: creates tabs + header rows.
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(name => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.getRange(1, 1, 1, SHEETS[name].length)
      .setValues([SHEETS[name]])
      .setFontWeight('bold');
    sh.setFrozenRows(1); // keep header visible when scrolling
  });
  // Remove the default empty tab (English or Polish name)
  const def = ss.getSheetByName('Sheet1') || ss.getSheetByName('Arkusz1');
  if (def) ss.deleteSheet(def);
}

// Helper: wrap an object as a JSON response.
function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper: read all rows of a tab as an array of objects.
function readAll(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const last = sh.getLastRow();
  if (last < 2) return []; // only header row = no data
  const headers = SHEETS[name];
  const values = sh.getRange(2, 1, last - 1, headers.length).getValues();
  const tz = Session.getScriptTimeZone();
  return values.filter(r => r[0] !== '').map(r => {
    const o = {};
    headers.forEach((h, i) => {
      let v = r[i];
      // Sheets auto-converts "2025-01-31" into a Date; convert back to text.
      if (v instanceof Date) v = Utilities.formatDate(v, tz, 'yyyy-MM-dd');
      o[h] = v;
    });
    return o;
  });
}

// READ: GET ...?sheet=Cars&token=XXX
function doGet(e) {
  const p = e.parameter;
  if (p.token !== TOKEN) return out({ error: 'unauthorized' });
  if (!SHEETS[p.sheet]) return out({ error: 'bad sheet' });
  return out({ data: readAll(p.sheet) });
}

// WRITE: POST with JSON body { token, sheet, action, data?, id? }
// action = create | update | delete
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.token !== TOKEN) return out({ error: 'unauthorized' });
  const name = body.sheet;
  if (!SHEETS[name]) return out({ error: 'bad sheet' });

  // Lock prevents two writes at the same time from corrupting data.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
    const headers = SHEETS[name];
    const now = new Date().toISOString();

    // CREATE: new row with a generated id and timestamps
    if (body.action === 'create') {
      const row = Object.assign({}, body.data, {
        id: Utilities.getUuid(), created_at: now, updated_at: now
      });
      sh.appendRow(headers.map(h => (row[h] === undefined ? '' : row[h])));
      return out({ data: row });
    }

    // UPDATE / DELETE: find the row by id first
    const last = sh.getLastRow();
    if (last < 2) return out({ error: 'not found' });
    const ids = sh.getRange(2, 1, last - 1, 1).getValues().flat();
    const idx = ids.indexOf(body.id);
    if (idx < 0) return out({ error: 'not found' });
    const rowNum = idx + 2; // +1 for header, +1 because sheets start at 1

    if (body.action === 'update') {
      // Merge: keep old values, overwrite only fields sent by the app
      const current = readAll(name).find(r => r.id === body.id);
      const row = Object.assign({}, current, body.data, { id: body.id, updated_at: now });
      sh.getRange(rowNum, 1, 1, headers.length)
        .setValues([headers.map(h => (row[h] === undefined ? '' : row[h]))]);
      return out({ data: row });
    }

    if (body.action === 'delete') {
      sh.deleteRow(rowNum);
      return out({ data: { id: body.id } });
    }
    return out({ error: 'unknown action' });
  } finally {
    lock.releaseLock(); // always release the lock
  }
}
```

### 3.4 Deploy

1. In the Apps Script editor, choose **Deploy → New deployment**.
2. Click the gear and choose **Web app** if it is not already selected.
3. **Execute as:** Me.
4. **Who has access:** Anyone.
5. Click **Deploy**, approve access, and copy the **Web app URL**.

The URL ends in `/exec`. It looks like:

```text
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Put that URL in `.env` as `EXPO_PUBLIC_API_URL`. Put the same string as `TOKEN` in `.env` as `EXPO_PUBLIC_API_TOKEN`.

**After you change the script,** do not create a second deployment if you want to keep the same URL. Choose **Deploy → Manage deployments**, edit the existing web app, set **Version** to **New version**, and deploy. The `/exec` URL stays the same. A brand-new deployment gets a new URL, and you would have to change `.env`.

### 3.5 Test the URL in a browser

A browser can test GET only. Paste this, with your real deployment id and token:

```text
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?sheet=Cars&token=YOUR_TOKEN
```

An empty sheet:

```json
{"data":[]}
```

Wrong sheet name:

```text
.../exec?sheet=NotATab&token=YOUR_TOKEN
```

```json
{"error":"bad sheet"}
```

Wrong token:

```json
{"error":"unauthorized"}
```

The phone shows `bad sheet` or `unauthorized` as the error text. POST (add, edit, delete) is what the app sends. A browser address bar does not send that POST.

## 4. Local setup on a new machine

### Prerequisites

- Node.js 22.13 or newer. Expo SDK 57 asks for that. This repo does not pin the version inside `package.json`.
- npm (it comes with Node.js).
- Git.
- VS Code or Cursor.
- An Android phone with **Expo Go** from the Play Store.
- The sheet and the deployed web app from section 3.

### Steps

```bash
git clone YOUR_GIT_URL
cd car-manager
npm install
cp .env.example .env
```

Edit `.env`. Then:

```bash
npx expo start
```

1. Phone and computer on the same Wi-Fi.
2. In Expo Go, scan the QR code from the terminal.
3. You should see **My Cars**. Tap **+** to add a car, or tap a card to open it.

Stop Expo and run `npx expo start` again after every `.env` change. Expo reads that file only when it starts.

If the QR code does not connect, press `s` in the terminal to switch the connection type, then scan again.

### Stay on Expo SDK 57

`package.json` uses `expo` `~57.0.30` and `react-native` `0.86.3`. That is the stable SDK that Expo Go from the Play Store could open when this app was built. SDK 58 was still a beta then, and Expo Go showed **Project is incompatible with this version of Expo Go**.

Do not upgrade Expo, React, or React Native to a beta, RC, or canary version to "get the latest". Do not change those versions unless you know the Play Store Expo Go build supports them.

### Troubleshooting

| What you see | What to do |
| --- | --- |
| `Project is incompatible with this version of Expo Go` | The project SDK and the Play Store Expo Go app do not match. This repo is SDK 57. Do not jump to a beta SDK. Update Expo Go from the Play Store only if that store build supports SDK 57. |
| `npm ERR! ERESOLVE` while installing | Run `npm install` with no extra flags. Do not use `--force` or `--legacy-peer-deps`. Those hide a real version clash. Use the committed `package-lock.json`. |
| `Missing Google Sheets setup...` | `.env` is missing, empty, or still has the placeholders `YOUR_DEPLOYMENT_ID` or `replace-with-your-token`. Fix it and restart Expo. |
| `bad sheet` | The GET or POST `sheet` value is not `Cars` or `Todos`, or the script's `SHEETS` map does not have that name. |
| `unauthorized` | `.env` token and the script `TOKEN` are not the same string. |
| `Could not reach Google Sheets...` | The phone has no route to the script. Check internet, and that the phone and the computer are on the same Wi-Fi when you are only trying to open Expo (the sheet itself needs internet on the phone). |
| QR code does not open the app | Same Wi-Fi for phone and computer. Then press `s` in the Expo terminal and scan again. |

## 5. Project structure

```text
car-manager/
  app/                          Screens. One file is one route.
    _layout.tsx                 Stack navigator: top bar, back button, theme colours.
    index.tsx                   Car list. Route `/`.
    car/new.tsx                 Add car. Route `/car/new`.
    car/[id]/index.tsx          Car details and to-dos. Route `/car/[id]`.
    car/[id]/edit.tsx           Edit car. Route `/car/[id]/edit`.
  src/
    api/sheets.ts               Every Google Sheets call.
    types/car.ts                Car and CarFields types.
    types/todo.ts               Todo and TodoFields types.
    constants/theme.ts          Colours, spacing, text sizes.
    constants/options.ts        Fuel, tire, rim, and transmission words.
    constants/carIcons.ts       Icon file map and fallback to default.
    components/CarCard.tsx      One car row on the list.
    components/CarForm.tsx      The add and edit form.
    components/CollapsibleSection.tsx
                                A form group that can fold shut.
    components/FormField.tsx    Label, text box, error under the box.
    components/PickerField.tsx  Dropdown for a fixed list of words.
    components/DateField.tsx    YYYY-MM-DD date picker.
    components/IconPicker.tsx   Grid of car icons.
    components/TodoItem.tsx     One to-do: checkbox, title, Delete.
  assets/
    car-icons/                  256×256 placeholder car PNGs.
      default.png
      sedan.png
      suv.png
      hatchback.png
      wagon.png
      van.png
    icon.png                    Expo app icon (the launcher picture).
    splash-icon.png             Splash image from the Expo template.
    favicon.png                 Web favicon from the Expo template.
    android-icon-foreground.png
    android-icon-background.png
    android-icon-monochrome.png Android adaptive icon pieces.
  app.json                      Expo config: name "My Cars", SDK plugins, scheme.
  package.json                  Dependencies and npm scripts.
  package-lock.json             Exact installed versions. Commit this.
  tsconfig.json                 TypeScript. Extends Expo's base config, strict mode.
  .gitignore                    Ignores node_modules, .expo, .env, and native ios/android folders.
  .env.example                  Placeholder URL and token. Safe to commit.
  .env                          Your real URL and token. Not in git. You create it locally.
  README.md                     This file.
```

There is no `docs/` folder and no Apps Script file in the repo.

### Where do I change X?

| I want to… | Change |
| --- | --- |
| Add a car icon | A PNG in `assets/car-icons/`, plus one line in `src/constants/carIcons.ts`. See section 7. |
| Add a picker word | `src/constants/options.ts` only, if the column already exists. |
| Add a new car field | Sheet column, `SHEETS.Cars` in the script, `src/types/car.ts`, `toCar` in `src/api/sheets.ts`, and `src/components/CarForm.tsx`. Details screen only if it should be visible there. See section 7. |
| Change colours | `src/constants/theme.ts` |
| Change the API address or token | `.env`, then restart Expo. Never hardcode them. |
| Change the screen order or top bar | `app/_layout.tsx` and the `router.push` calls in the screens |

## 6. Screens and navigation

`app/_layout.tsx` wraps every screen in a stack. The back button returns to the previous screen. The list title is **My Cars**. Add and Edit set their own titles.

| Screen | File | What you see | API | Where it goes |
| --- | --- | --- | --- | --- |
| Car list | `app/index.tsx` | Cards from `CarCard`: icon, nickname, brand + model, mileage. Loading, empty, and error states. Pull to refresh. **+** in the top bar. | `listCars` | **+** opens `/car/new`. A card opens `/car/[id]`. Coming back to this screen loads the list again. |
| Add car | `app/car/new.tsx` | `CarForm`, empty. Save stays disabled while the request runs. | `createCar` | On success, back to the list. |
| Car details | `app/car/[id]/index.tsx` | Icon, nickname, brand + model, **Edit**, then only the filled-in facts (year, mileage, plate, fuel, tires, oil, inspection, insurance). To-dos: open ones first. **Delete car** in red, separate from Edit. Pull to refresh. | `listCars` (then find this id), `listTodosForCar`, `createTodo`, `setTodoDone`, `deleteTodo`, `deleteCar` | **Edit** opens `/car/[id]/edit`. After a successful car delete, back to the list. If to-dos were deleted but the car delete failed, this screen stays open and shows the error. |
| Edit car | `app/car/[id]/edit.tsx` | Same `CarForm`, filled from the sheet. | `listCars` (find this id), `updateCar` | On success, back to details. Details loads again when it is shown. |

`CarForm` groups fields like this:

- **Basics** (open): Nickname, Brand, Model, Year, Current mileage (km), Icon
- **Tires & rims**
- **Oil**
- **Deadlines**
- **General** (plate, fuel, color, engine, transmission, purchase date, tank capacity)
- **Service & parts**
- **Notes**

Nickname, brand, and model are required. Year, mileage, oil-change mileage, and timing-belt mileage must be whole numbers when they are not empty. Tank capacity may be a decimal such as `45.5`. The message appears under the field.

The details screen does not show color, engine, transmission, purchase date, tank, battery, brake pads, timing belt, or notes. Those are only on the form.

Deleting a car loads that car's to-dos and deletes those rows first, one `delete` each, then deletes the car. There is no single "delete car and to-dos" action.

## 7. How to add things

### A new icon

1. Export a PNG, 256 by 256 pixels, transparent background, under 100 KB.
2. Save it as `assets/car-icons/pickup.png` (use your own file name).
3. Add one line to the map in `src/constants/carIcons.ts`:

```ts
pickup: require('../../assets/car-icons/pickup.png'),
```

The word on the left is the `icon_key` stored in the sheet. The picker reads the keys from that map. You do not edit a second list.

### A new picker option

Edit `src/constants/options.ts`. Add the word to the right array, with the same spelling you want in the sheet. For example, a new fuel:

```ts
export const fuelTypes = [
  'petrol 95',
  'petrol 98',
  'diesel',
  'LPG',
  'hybrid',
  'electric',
  'petrol 100',
] as const;
```

No script change is required for a new word on an existing column. Old rows keep whatever text they already have.

### A new car field

Example: a text field `vin`.

1. **Sheet.** Insert the column in `Cars` in the same position you will list in the script. Do not put it after `updated_at` unless you also change the script. The script writes a whole row in `SHEETS.Cars` order.
2. **Apps Script.** Add `'vin'` to the `SHEETS.Cars` array in that same position. Deploy a **new version** of the existing web app (section 3.4). Run is not a new `setup` unless you want `setup` to rewrite the header. If the header row already exists, `setup` overwrites row 1 with `SHEETS`. Check that you do not wipe a header you still need. This repo cannot run that for you.
3. **`src/types/car.ts`.** Add `vin: string` to `Car`. `CarFields` is every field except `id`, `created_at`, and `updated_at`, so it picks the new field up.
4. **`src/api/sheets.ts`.** In `toCar`, add `vin: asText(row.vin)`. Create and update already send `CarFields`.
5. **`src/components/CarForm.tsx`.** Add `vin` to `FormState`, to the blank form, to `toFormState`, to `toCarFields`, and a `FormField` in the section where it should appear. Add a check in `validate` if the field has a rule.
6. **Details, only if it should show there.** `app/car/[id]/index.tsx`, inside `Facts`. The list card (`src/components/CarCard.tsx`) only shows icon, name, brand, model, and mileage. Change that file only if the list should show the new field too.
7. If the field is a fixed list of words, also add an array in `src/constants/options.ts` and use `PickerField` instead of `FormField`.

## 8. Git workflow

Think of git as save games.

| Idea | Git |
| --- | --- |
| The game you can always go back to | `main` |
| A side save, so an experiment does not break `main` | a branch |
| One save point, with a sentence about what changed | a commit |
| "Please look at this side save and, when it is ready, copy it into `main`" | a pull request |
| The pull request is not ready to merge | a draft pull request |
| The side save becomes part of `main` | merge |

This repository has used branches whose names start with `cursor/`, small commits, and draft pull requests. The first pull request was squash-merged into `main`. A squash merge folds the branch's commits into one commit on `main`.

Typical commands:

```bash
git checkout main
git pull
git checkout -b my-short-description
# edit files
git add README.md
git commit -m "Explain the app in the README."
git push -u origin my-short-description
```

Then open a pull request into `main`. You can mark it as a draft until you have tried it on the phone.

**Never commit `.env`.** It is listed in `.gitignore`. Commit `.env.example` only, with placeholders. `git status` should not list `.env`.

## 9. Roadmap

These are ideas, not promises. They are not in v0.1.

- Offline mode
- Fuel logs
- Service and inspection history
- Mileage history
- An installable APK built with EAS

v0.1 always needs the network, and it only stores the current car row plus a simple to-do list.
