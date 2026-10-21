# DirmanQuiz

Practice quizzes and course materials. Built with Next.js and Supabase.

Product rules are in [docs/PRD.md](docs/PRD.md). The technical design is in [docs/Architecture.md](docs/Architecture.md).

## Requirements

- Node.js 20 or newer, or Docker Desktop
- A free Supabase project

## 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) and create a new project.
2. Open **Project Settings > API** and keep the page open. You need the Project URL and the `anon` public key.

## 2. Set environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings > API > `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings > API > `service_role` key. Optional. Never put it in client code |

## 3. Create the database

Open **SQL Editor** in the Supabase dashboard. Paste and run each file in this order:

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_auth_triggers.sql`
3. `supabase/migrations/003_rls.sql`
4. `supabase/migrations/004_functions.sql`

Each file should finish with "Success. No rows returned".

Also run later migrations in order when present (`005` through `013`), including `013_student_pin_login.sql` for name + PIN student login.

## 4. Seed the first admin email

Open `supabase/seed.sql`, replace the email if needed, then run it in the SQL Editor. That address can log in as an administrator with email and password.

## 5. Email confirmation

Supabase asks new users to confirm their email by default. For classroom use, turn off **Confirm email** under Authentication > Sign In / Providers > Email so imported students can log in with their PIN immediately.

## 6. Run the app

With Node.js installed:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), choose **Admin login**, and sign in with the admin email from step 4. Then open **Roster**, import `data/data-serdik-kelas.xlsx`, and students can log in by class, name, and PIN. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` before importing.

To run in Docker instead, skip the Node.js commands and use the next section. Steps 2–5 stay the same.

## Run with Docker

[Docker Desktop](https://www.docker.com/products/docker-desktop/) must be running. Fill in `.env.local` first. Run the SQL files in the Supabase SQL Editor (steps 3–5). The container starts the Next.js app only.

Development server, with reload when you save files:

```powershell
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Later starts can omit `--build` until `package.json` changes. After a dependency change, replace the stored Linux `node_modules` volume:

```powershell
docker compose down -v
docker compose up --build
```

Stop the dev server with Ctrl+C, then `docker compose down`.

Production-like run. Name the `prod` service so only that container binds port 3000. `--env-file` supplies the public Supabase values at image build time:

```powershell
docker compose --env-file .env.local --profile prod up --build prod
```

Stop it with Ctrl+C, then `docker compose --profile prod down`.

## Using the app

- **Roster** (admin): add or remove the emails that may sign up, and set each email's role.
- **Quiz builder** (admin): create quizzes, add single-answer or multi-select questions, then publish.
- **Materials** (admin): add Google Drive links. Make each Drive file shareable with "Anyone with the link" or with your class.
- **Quizzes** (everyone): take a quiz as many times as you like. The score and correct answers appear after submit.
- **Leaderboard**: each quiz has its own board, ranked by best score, then by the earlier submit time.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
