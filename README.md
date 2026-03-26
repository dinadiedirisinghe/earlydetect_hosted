# EarlyDetect — Local Setup Guide

A multi-screen health onboarding app for early disease detection, built with
React + Vite. Designed for young adults aged 18–30.

---

## What's Inside

```
earlydetect/
├── index.html              ← The single HTML page (Vite's entry point)
├── package.json            ← Project dependencies list
├── vite.config.js          ← Vite bundler configuration
└── src/
    ├── main.jsx            ← React bootstrapper (don't edit this)
    ├── index.css           ← All global styles and design tokens
    ├── utils.jsx           ← Shared utility functions + tiny UI components
    ├── App.jsx             ← The wizard controller — wires all screens
    ├── OTPScreen.jsx       ← Screen 1: Email + OTP verification
    ├── RegScreen.jsx       ← Screen 2: Name + birthday registration
    ├── ProfileScreen.jsx   ← Screen 3: Body stats + live BMI + obesity alert
    ├── HabitsScreen.jsx    ← Screen 4: Exercise, smoking, drinking, lifestyle
    ├── MedScreen.jsx       ← Screen 5: Medications + family history
    └── SummaryScreen.jsx   ← Screen 6: Full data summary + risk alerts
```

---

## Step-by-Step: Running Locally

### STEP 1 — Install Node.js (only needed once, ever)

Node.js is the JavaScript runtime that runs the Vite development server
on your computer. Think of it as the "engine" that powers your local server.

1. Go to https://nodejs.org
2. Download the **LTS** version (the green button — LTS = Long Term Support,
   the stable version recommended for projects like this)
3. Run the installer. Click Next → Next → Install. That's it.
4. To confirm it worked, open a terminal (Command Prompt on Windows,
   Terminal on Mac/Linux) and run:

   ```
   node --version
   ```

   You should see something like `v20.11.0`. Any version 18+ is fine.

5. Also confirm npm (Node Package Manager) is available:

   ```
   npm --version
   ```

   npm comes bundled with Node. You should see `10.x.x` or similar.

---

### STEP 2 — Place the project files

Create a folder somewhere on your computer — for example:
- Windows: `C:\Users\YourName\projects\earlydetect`
- Mac/Linux: `~/projects/earlydetect`

Copy all the files from this download into that folder, preserving the
folder structure exactly as shown in the tree above (the `src/` subfolder
must be inside `earlydetect/`).

---

### STEP 3 — Open a terminal in the project folder

- **Windows**: Open File Explorer, navigate to the `earlydetect` folder,
  then type `cmd` in the address bar at the top and press Enter. This opens
  Command Prompt directly in that folder.
  
- **Mac**: Right-click the `earlydetect` folder → "New Terminal at Folder"
  (or open Terminal and type `cd ~/projects/earlydetect`).

- **VS Code** (recommended): Open the folder in VS Code, then press
  Ctrl+` (backtick) to open the integrated terminal — it automatically
  opens in the right folder.

---

### STEP 4 — Install the project dependencies

In your terminal, run:

```bash
npm install
```

This reads `package.json` and downloads the required libraries (React, Vite,
etc.) into a `node_modules/` folder. This only needs to happen once.
You'll see a progress bar. It takes 20–60 seconds depending on your internet.

After it finishes, your folder will have a new `node_modules/` directory
and a `package-lock.json` file. Both are normal — don't delete them.

---

### STEP 5 — Start the development server

```bash
npm run dev
```

You'll see output like:

```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Now open your browser and go to: **http://localhost:5173**

You should see the EarlyDetect app! 🎉

The server has **hot reload** — whenever you save a file, the browser
updates automatically without you needing to refresh.

---

### STEP 6 — Stopping the server

Press `Ctrl + C` in the terminal window where the server is running.

---

## Common Issues & Fixes

**"npm is not recognized" / "command not found"**
→ Node.js wasn't installed correctly. Re-run the Node.js installer from
  nodejs.org and make sure to check "Add to PATH" during installation.
  Then close and reopen your terminal.

**"Cannot find module" errors after npm install**
→ Delete the `node_modules` folder and run `npm install` again.

**Port 5173 already in use**
→ Another app is using that port. Vite will automatically try 5174, 5175,
  etc. Check the terminal output for the actual URL.

**Fonts not loading (looks plain)**
→ The app fetches Google Fonts from the internet. Make sure you have an
  active internet connection when you first open it.

---

## Building for Production (optional)

When you're ready to deploy to the web, run:

```bash
npm run build
```

This creates a `dist/` folder with optimised, minified files ready to be
uploaded to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

To preview the production build locally:

```bash
npm run preview
```

---

## What Each Screen Does

| Screen | File | Purpose |
|--------|------|---------|
| OTP Login | OTPScreen.jsx | Email input → 6-digit OTP verification |
| Registration | RegScreen.jsx | First name, last name, birthday |
| Profile | ProfileScreen.jsx | Sex, height, weight, blood type. Auto-calculates age & BMI. Fires obesity alert if BMI ≥ 30. |
| Health Habits | HabitsScreen.jsx | Exercise, smoking (with sub-form for current smokers), alcohol, drugs, diet, sleep slider, stress, occupation, location |
| Medications | MedScreen.jsx | Add/remove medication cards + family history toggles |
| Summary | SummaryScreen.jsx | Full read-out of all data + active health risk alerts |

---

## Next Steps (Extending the App)

These features would be the natural next additions to match your PDF vision:

1. **Backend / Database**: Connect to a Node.js/Express or Python/FastAPI
   backend to save user profiles. Use PostgreSQL or MongoDB for storage.

2. **Real Email OTP**: Integrate an email service like SendGrid or Resend
   to send actual OTP emails (currently the app accepts any 6-digit code).

3. **Image Upload**: Add a screen where users can upload medical images
   (skin photos, lab reports) using the HTML `<input type="file">` element,
   then send them to a computer vision model.

4. **Symptom Checker**: Add a screen with a searchable checklist of symptoms
   using a library like Fuse.js for fuzzy search.

5. **AI Risk Analysis**: Send the collected profile data to your ML model
   via a REST API call and display the predicted disease risks on the
   Summary screen.

6. **Doctor / Hospital Finder**: After the risk analysis, show nearby
   specialists using the Google Maps / Places API.
