# Supabase setup (M1) — do this once

## 1. Create a project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. **New project** → name it `recruit-help` → pick a region near you.
3. Save your **database password** somewhere safe.

## 2. Enable email + password login

1. In Supabase: **Authentication** → **Providers** → **Email**
2. Make sure **Email** is enabled.
3. For easier testing while learning, you can turn **off** “Confirm email” under Email settings (turn it back on before real users).

## 3. Add redirect URL

**Authentication** → **URL Configuration**:

| Field | Value |
|-------|--------|
| Site URL | `https://recruit-help.vercel.app` |
| Redirect URLs | Add **all** of these (one per line): |

```
https://recruit-help.vercel.app/auth/callback
https://recruit-help.vercel.app/auth/confirm
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
```

**Important:** Do **not** use `recruit-help.com` here until that domain is connected to Vercel in Cloudflare. An unconnected custom domain causes **404** when you click the email link.

## 4. Run the database schema

1. **SQL Editor** → **New query**
2. Open `supabase/schema.sql` in this repo, copy all of it, paste, **Run**
3. You should see “Success” with tables `profiles` and `external_profiles`

## 5. API keys → your app

**Project Settings** → **API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### On your Mac (local)

```bash
cp .env.local.example .env.local
# Edit .env.local and paste the two values
npm run dev
```

### On Vercel (production)

**Project** → **Settings** → **Environment Variables** → add both variables for Production → **Redeploy**

## 6. Test

1. Visit `/signup` → create an account
2. You should land on `/dashboard` and see your profile slug
3. In Supabase **Table Editor** → `profiles` → your row exists

Done — M1 complete.

## Troubleshooting: 404 after email link

1. **Check the broken URL in your browser bar.**  
   - If it says `recruit-help.com` → change Supabase URLs to `recruit-help.vercel.app` (custom domain not wired up yet).  
   - If it says `/auth/callback` on vercel.app → add that URL to Supabase **Redirect URLs** and redeploy Vercel.

2. **Easier testing:** Supabase → **Authentication** → **Email** → turn **off** “Confirm email”, redeploy, sign up again — you go straight to `/dashboard` with no email link.

3. **Or** skip the email: sign up, then use **Log in** with the same password.
