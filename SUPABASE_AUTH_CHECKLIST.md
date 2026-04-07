# Supabase Auth & Deployment Checklist

This checklist now separates what is already implemented from the exact steps you need to perform next.

## What is already done in the code
- [x] Legacy auth removed from frontend
- [x] Legacy auth endpoints removed from backend
- [x] `src/lib/supabaseClient.js` created
- [x] `src/hooks/useAuth.jsx` wired for Supabase auth state, login, signup, and logout
- [x] `src/pages/Auth.jsx` updated to email/password flow
- [x] `src/utils/api.js` updated to attach Supabase JWT to backend requests
- [x] `server/main.py` updated to validate Supabase JWT and map users by email
- [x] `@supabase/supabase-js` installed in frontend
- [x] `python-jose[cryptography]` added to backend dependencies

## What you need to do now
Follow these steps in order. Mark each completed item with `✅` or let me know if you need help.

### Step 1: Create the Supabase project
- [x] Sign in to https://app.supabase.com/
- [x] Create a new project for this app
- [x] In Supabase, go to `Authentication` > `Settings`
- [x] Enable `Email` auth
- [x] Add allowed redirect URLs:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - Add your production URL later after deployment

**Status:** ✅ Supabase project "Finet" created
- Project URL found: `https://rznbqthumdlmnkrfytxi.supabase.co`

### Step 2: Copy the Supabase credentials
- [x] In Supabase, go to `Settings` > `API`
- [x] Copy `Project URL`
- [x] Copy `anon key`
- [x] Copy `JWT Secret`
- [x] Do not commit these values into source control

### Step 3: Add local environment variables
- [x] Create `.env` in `FINET` if it does not exist
- [x] Add these lines:
  ```env
  VITE_SUPABASE_URL=https://your-project-ref.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_JWT_SECRET=your-jwt-secret
  ```
- [x] Save the file and keep it private

### Step 4: Install backend dependencies
- [x] Run in the backend environment:
  - `pip install -r server/requirements.txt`
- [x] Confirm `python-jose[cryptography]` is installed

**Status:** ✅ All 9 packages installed successfully (fixed Python 3.14 compatibility)

### Step 5: Start both servers
- [x] Start frontend from `FINET`:
  - `npm run dev`
- [x] Start backend from `FINET`:
  - `uvicorn server.main:app --reload`

**Status:** ✅ Both servers running:
- Frontend: http://localhost:5176
- Backend: http://localhost:8000

### Step 6: Test the auth flow
- [ ] Open `http://localhost:5176`
- [ ] Register a new user on the Auth page
- [ ] Confirm the app redirects to `/`
- [ ] Click logout and confirm you return to `/auth`
- [ ] Login again with the same email/password
- [ ] Visit a protected page and confirm it loads
- [ ] Confirm protected pages redirect to `/auth` when logged out

### Step 7: Check for common issues
- [ ] `.env` variables are correct
- [ ] `SUPABASE_JWT_SECRET` matches the Supabase JWT secret exactly
- [ ] Frontend is running on `http://localhost:5176`
- [ ] Backend receives `Authorization: Bearer ...` from `src/utils/api.js`
- [ ] Supabase auth requests are not blocked by CORS

## How to report progress
After completing each step, write one of these:
- `✅ Step 1 done: Supabase project created`
- `✅ Step 3 done: .env created with Supabase values`
- `❌ Step 6 failed: login returned “Invalid login credentials”`

> Next, perform Steps 1–3 and tell me when they are done. I will then verify your `.env` settings and guide you through test execution. 