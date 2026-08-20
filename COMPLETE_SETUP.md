# Complete Setup Lookup

This document is a practical reference to run the full project locally:
- `frontend` (React)
- `backend` (Node.js + Express + MongoDB + Socket.IO)

Use this when you need commands, environment variables, URLs, and quick troubleshooting in one place.

## 1. Prerequisites

- Node.js `18+`
- npm `9+`
- MongoDB (local or Atlas)

Check versions:

```bash
node -v
npm -v
```

## 2. Project Structure

```text
job-portal-full/
  backend/
  frontend/
  README.md
  COMPLETE_SETUP.md
  API_KEY_SETUP.md
```

## 3. Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/job-portal
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=replace_with_a_long_random_secret
SESSION_SECRET=replace_with_a_long_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Notes:
- `MONGO_URI`, `JWT_SECRET`, `SESSION_SECRET` are required.
- `GOOGLE_*` is required only for Google OAuth login.
- `GEMINI_API_KEY` and `GROQ_API_KEY` are optional but recommended for best AI output.

## 4. Install Dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

## 5. Run the App

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm start
```

Default URLs:
- Frontend: `http://localhost:3000`
- API: `http://localhost:5000/api`
- Socket server: `http://localhost:5000`

## 6. Feature Provider Lookup (AI)

The app uses provider fallback chains:

- Resume analysis: `Gemini -> Groq -> Template`
- Cover letter generation: `Groq -> Gemini -> Template`
- Practice test generation/evaluation: `Groq -> Gemini -> Template`

If both API keys are missing or providers fail, template-based fallback still returns output.

## 7. Commands Cheat Sheet

Backend:

```bash
cd backend
npm run dev
npm start
```

Frontend:

```bash
cd frontend
npm start
npm run build
npm test
```

## 8. API Quick Lookup

Base URL: `http://localhost:5000/api`

- Health: `GET /api`
- Auth: `/auth/*`
- Jobs: `/jobs/*`
- Applications: `/applications/*`
- Messages: `/messages/*`
- Resume AI: `/resume/*`
- Cover Letter AI: `/cover-letter/*`
- Practice Test AI: `/practice-test/*`
- Experiences: `/experiences/*`

Full endpoint list is in `README.md`.

## 9. First-Run Verification Checklist

1. Backend starts without MongoDB connection errors.
2. Frontend loads at `http://localhost:3000`.
3. `GET http://localhost:5000/api` responds.
4. Register and login work.
5. Jobs list loads.
6. At least one AI feature runs (resume or cover letter).

## 10. Common Issues

MongoDB connection fails:
- Confirm `MONGO_URI`.
- If Atlas is used, allow your IP in Atlas network access.

CORS/auth token errors:
- Confirm `CLIENT_URL` in `backend/.env`.
- Confirm `REACT_APP_API_URL` in `frontend/.env`.

Google OAuth callback errors:
- Ensure callback URL in Google Console exactly matches:
  `http://localhost:5000/api/auth/google/callback`

AI provider errors:
- Confirm `GEMINI_API_KEY` and/or `GROQ_API_KEY` in `backend/.env`.
- Restart backend after changing env values.
- If rate-limited, retry after a short delay.

## 11. Where to Edit Key Logic

- Backend entry: `backend/server.js`
- Auth routes: `backend/routes/auth.js`
- Jobs routes: `backend/routes/jobs.js`
- Applications routes: `backend/routes/applications.js`
- Messages routes: `backend/routes/messages.js`
- AI fallback logic: `backend/utils/aiAnalyzer.js`
- Frontend routes: `frontend/src/App.js`

## 12. Related Docs

- Main documentation: `README.md`
- API key setup (Gemini + Groq): `API_KEY_SETUP.md`
