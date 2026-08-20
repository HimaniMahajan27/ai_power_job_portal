# API Key Setup (Gemini + Groq)

This guide explains how to configure API keys for AI features in the backend.

## 1. Keys Used by This Project

Set these variables in `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

Both keys are optional, but strongly recommended.

## 2. Why Configure Both?

The backend uses fallback chains:

- Resume analysis: `Gemini -> Groq -> Template`
- Cover letter generation: `Groq -> Gemini -> Template`
- Practice test generation/evaluation: `Groq -> Gemini -> Template`

If one provider fails (quota, rate limit, outage), the next provider is used automatically.

## 3. Gemini API Key Setup

1. Open Google AI Studio API key page:
   `https://makersuite.google.com/app/apikey`
2. Create an API key.
3. Copy the key.
4. Add it to `backend/.env`:

```env
GEMINI_API_KEY=your_real_key_here
```

## 4. Groq API Key Setup

1. Open Groq Console keys page:
   `https://console.groq.com/keys`
2. Create an API key.
3. Copy the key.
4. Add it to `backend/.env`:

```env
GROQ_API_KEY=your_real_key_here
```

## 5. Restart Required

After editing `.env`, restart backend:

```bash
cd backend
npm run dev
```

The backend reads environment variables only at startup.

## 6. Verify Configuration

1. Start backend and frontend.
2. Login to the app.
3. Test one or more AI features:
   - Resume Analyzer
   - Cover Letter Generator
   - Practice Test
4. Confirm responses are returned without API key errors.

## 7. Optional Modes

Use both keys (recommended):
- Best reliability and better fallback coverage.

Use only `GEMINI_API_KEY`:
- Resume analysis still prefers Gemini.
- Cover letter/practice flows may fall back to Gemini if Groq is absent.

Use only `GROQ_API_KEY`:
- Resume analysis may fall back to Groq when Gemini is absent.
- Cover letter/practice features continue with Groq as primary.

Use no keys:
- Template fallback still works, but output quality is more basic.

## 8. Troubleshooting

`401` or invalid key error:
- Check for spaces/quotes in key values.
- Regenerate the key and replace it.

`429` rate-limit/quota error:
- Retry after a short wait.
- Keep both keys configured so fallback can help.

No AI output:
- Confirm keys are in `backend/.env` (not frontend `.env`).
- Restart backend after any env update.
- Check backend logs for provider-specific errors.

## 9. Security Notes

- Never commit real keys to git.
- Keep `.env` files private.
- Rotate keys immediately if exposed.

## 10. Example Backend .env Snippet

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
