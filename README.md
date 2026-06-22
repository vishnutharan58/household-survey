# PRO-VISION CARE Survey Manager

A comprehensive cross-platform application for coastal community household surveys in Tamil Nadu. 
Built using React Vite, React Native (Expo), Tailwind CSS, and Supabase.

## Architecture

This project uses a Turborepo Monorepo structure with shared logic and distinct frontends:

- `apps/web`: React Vite web application with Tailwind v4 for the Admin Dashboard and web-based Staff entry.
- `apps/mobile`: Expo React Native app for mobile field-workers.
- `packages/shared`: Shared Zod schemas, Supabase client initialization, and Zustand state (Auth + Offline drafts).

## Setup & Local Development

1. **Install dependencies:**
   From the root directory, run:
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in `apps/web` and `apps/mobile`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   This will start both the Web application (`http://localhost:5173`) and Expo server concurrently via Turbo.

## Database (Supabase) Setup
1. Create a new Supabase project.
2. Run the SQL script located in `supabase/schema.sql` in the Supabase SQL Editor.
3. This creates all tables (Households, Members, Documents, Schemes) and sets up the Row Level Security (RLS) policies based on Admin/Staff roles.

## Deployment

**Web App (Vercel/Netlify):**
Point the root directory to `apps/web` and use the build command `npm run build` and output directory `dist`. Ensure the env vars are added.

**Mobile App (Expo EAS):**
1. Navigate to `apps/mobile`
2. Run `eas build --platform android` to generate the `.apk` or `.aab` for Android deployment.
