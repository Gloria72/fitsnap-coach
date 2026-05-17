# FitSnap Coach

FitSnap Coach is a local-first AI fitness and nutrition coach MVP. It covers Phase 0 of the PRD: goal setup, daily calories and macros, weekly training plans, photo/video form analysis, simulated Apple Health access, recovery scoring, an AI Coach Agent workspace, and interactive weekly/monthly trends.

## Run

Open `index.html` directly in a browser. If the browser restricts IndexedDB on `file://`, run this from the project directory:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

Data is stored locally in the browser. IndexedDB is the primary database, with LocalStorage as a compatibility backup. Media and health data are not uploaded to any server.

## Cloud Deployment

This MVP can be opened from the cloud as a static website, similar to a public web app.

Production URL:

```text
https://fitsnap-coach.vercel.app
```

### Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Use the default static-site settings. No build command is required.
4. Vercel will serve `index.html` over HTTPS.

The included `vercel.json` sets basic browser security headers and allows camera access from the same origin for live form checks.

### Netlify

1. Push this folder to a GitHub repository or drag the folder into Netlify Deploys.
2. Netlify should publish the project root.
3. No build command is required.

The included `netlify.toml` publishes the static root and sets matching security headers.

### Cloud Data Sync

The current cloud deployment is **cloud-openable**, not yet **cloud-synced**. User data still lives in the visitor's browser through IndexedDB. To sync data across devices, add:

- Authentication: Clerk, Supabase Auth, Firebase Auth, or Auth.js.
- Database: Supabase Postgres, Firebase Firestore, Neon, or PlanetScale.
- Media storage: Supabase Storage, S3, R2, or Firebase Storage.
- API layer: Next.js API routes, FastAPI, or serverless functions.
- AI services: hosted LLM calls for the Agent and server-side media analysis jobs.

Camera access requires HTTPS in production. Vercel and Netlify provide HTTPS automatically.

## Features

- Switch the website language between Chinese and English.
- Calculate calorie and macro targets from current weight, target weight, height, age, and activity level.
- Generate a 7-day training plan and mark workouts as completed.
- Log meals from a photo or text description using rule-based calorie and macro estimates.
- Upload exercise photos or videos and receive simulated form score, risk, compensation, and correction feedback.
- Load a browser-side MoveNet pose model through TensorFlow.js for real keypoint detection when network access is available.
- Use live camera mode for real-time, on-device pose preview with a skeleton overlay and continuously refreshed form feedback.
- Run a local AI Coach Agent that observes user data, reasons about priority, generates an action queue, and lets the user open or complete tasks.
- Simulate Apple Health authorization, manually enter health metrics, or import JSON/CSV health data.
- Generate a recovery score from sleep, HRV, resting heart rate, SpO2, steps, and training load.
- Store meal history, workout completions, form analyses, health snapshots, and media metadata in IndexedDB.
- View interactive weekly/monthly charts for calories, protein, workouts, readiness, form score, and upload count.

## Pose Model Integration

The form analysis pipeline now uses a hybrid approach:

```text
uploaded photo/video
-> TensorFlow.js + MoveNet SinglePose Lightning
-> body keypoints
-> angle, symmetry, torso-lean, knee/ankle tracking signals
-> rule-based form scoring
-> coach-readable feedback
```

The model is loaded dynamically from jsDelivr only when the user clicks **Load pose model** or runs a form analysis. If TensorFlow.js, the pose model, or reliable keypoints are unavailable, the app falls back to the local rule-based analysis so the product remains usable offline.

Live camera mode uses `navigator.mediaDevices.getUserMedia` and MoveNet in the browser. It renders a skeleton overlay and live feedback, but it does not save every frame to history. To persist a form-analysis record, upload a photo/video and run **Generate form feedback**.

## AI Coach Agent

The Agent workspace uses a local rule-based agent loop:

```text
observe local profile, meals, training, form, health, and trend data
-> reason about the highest-impact constraint
-> generate nutrition, training, recovery, or form tasks
-> let the user open the relevant section or mark the task done
-> persist the messages and tasks in IndexedDB
```

This gives the product an agent-like workflow without requiring a backend or API key. A production build can replace the local reasoning layer with an LLM call while keeping the same context builder, task schema, and safety boundaries.

## Local Database

The IndexedDB database is named `fitsnap-coach-db`.

Object stores:

- `meta`
- `profile`
- `nutritionTargets`
- `meals`
- `workoutPlan`
- `workoutCompletions`
- `formAnalyses`
- `healthSnapshots`
- `mediaAssets`
- `agentTasks`
- `agentMessages`

## Health Boundary

This MVP does not provide medical diagnosis and does not directly measure cortisol. The recovery score uses proxy signals from health and training data to estimate stress load trends. If heart rate, blood oxygen, sleep, or physical symptoms remain abnormal, users should consult a qualified professional.
