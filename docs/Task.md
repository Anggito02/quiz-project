# Implementation tasks

Build the Financial Management and Strategy quiz app described in [PRD.md](PRD.md). Complete the phases in order. Each phase ends with a checkable outcome.

Stack: Next.js (App Router) + TypeScript, Supabase Auth and Postgres. UI follows [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## 1. Scaffold

- Create a Next.js App Router project with TypeScript in the repo root.
- Add the Supabase browser client and a server client. Read the URL and anon key from environment variables.
- Add `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Values stay empty. Do not commit real keys.
- Add `README.md` at the repo root. It explains how to create the Supabase project, copy `.env.example` to `.env.local`, fill in the three variables, seed the first admin email, and run the app locally.
- Map design tokens from the design system into global CSS: Courier New, 0px radius, 8px spacing, the documented palette, max width 1280px, and `min-h-[100dvh]` instead of `h-screen`.

**Done when:** `npm run dev` serves a blank class home page that uses those tokens, the app fails clearly if the public Supabase env vars are missing, `.env.example` lists the three variable names with empty values, and `README.md` walks through setup and local run.

## 2. Schema and RLS

- Add a SQL migration for `allowed_emails`, `profiles`, `quizzes`, `questions`, `options`, `attempts`, `attempt_answers`, and `materials` as specified in the PRD.
- `allowed_emails.email` is unique and stored lowercase. `role` is `admin` or `student`.
- `profiles.id` references the Auth user. `role` is copied from `allowed_emails` when the account is created.
- On `attempt_answers`, store both `selected_option_ids` and a snapshot of `correct_option_ids` taken at submit time.
- Enable Row Level Security on every table.
- Students can select published quizzes and their questions and options, select materials, and select or insert only their own attempts and attempt answers.
- Admins can manage `allowed_emails`, quizzes, questions, options, materials, and profiles. Students cannot insert or update `allowed_emails`.
- Students cannot update `attempts.score` from the client. Scoring is written by a server action or a security-definer database function.

**Done when:** the migration applies on a fresh Supabase project, and a student JWT cannot insert a quiz or read another student's attempts.

## 3. Auth

- Build Supabase Auth sign-up, login, and logout with email and password.
- Sign-up collects email, password, and display name. A server check rejects the request when the lowercased email is not in `allowed_emails`. Enforce the same rule in the database or an Auth hook so a direct client `signUp` cannot skip it.
- On a successful sign-up, create `profiles` with the display name and the role stored on that allowlist row.
- Login uses `signInWithPassword`. Reject login when the email is no longer on the allowlist.
- After login, load `profiles.role` and send admins and students to the class home.
- Protect admin routes. A student who opens one is redirected away.
- Seed the first admin by inserting that email into `allowed_emails` with role `admin`. Record the step in a short comment at the top of the seed file, not in a new doc. That person signs up through the app.
- Add an admin roster page to add and remove allowlist emails and set each email's role. The form does not set a password.

**Done when:** an allowlisted email can sign up and log in, an unknown email cannot sign up, a removed email cannot log in again, and a student cannot open the roster page.

## 4. Quiz builder

- Admin can create, edit, and archive a quiz (title, description, status).
- Admin can add, reorder, edit, and delete questions on a draft or published quiz.
- Each question is `single` or `multi`, with two or more options, a prompt, and correct flags.
- Saving a `single` question with a number of correct options other than one is rejected.
- Saving a `multi` question with zero correct options is rejected.
- Students do not see drafts. Published quizzes appear on the student quiz list. Archived quizzes disappear from that list and keep old attempts.

**Done when:** an admin can publish a quiz that contains one single-answer question and one multi-select question, and a student can see that quiz on the list.

## 5. Take quiz

- A student opens a published quiz, answers every question, and submits once per attempt.
- Single-answer questions render as one choice. Multi-select questions render as a set of choices.
- The server grades the attempt. A question scores only when the selected set equals the correct set. Unanswered questions score 0.
- Persist the attempt, score as a whole-number percentage, and answer rows including the correctness snapshot.
- The results page shows the score, each prompt, the student's selections, and the correct options.
- The student can start another attempt immediately. Attempt history lists date, score, and a link to that result.

**Done when:** a wrong multi-select (missing one correct option, or including an extra one) scores 0 for that question, a later attempt is stored separately, and the results page matches the snapshot even if the admin later edits the question.

## 6. Leaderboard

- Add one leaderboard per quiz, visible to both roles. Do not add an overall board.
- One row per student who has submitted that quiz. The counting attempt is the highest score. If several attempts share that score, keep the earliest `submitted_at`.
- Sort by score descending, then by that `submitted_at` ascending, then by display name A to Z.
- Show rank, display name, score, and the submit time of the counting attempt.
- A later lower score does not replace a higher one.

**Done when:** scores 40, then 80, then 60 on one quiz show 80 and the submit time of the 80 attempt, and two students with the same best score rank with the earlier submit time first.

## 7. Materials

- Admin can create, edit, reorder, and delete materials (title, `http` or `https` URL, position).
- Reject non-http(s) URLs.
- Students and admins see the list. Each title opens the URL in a new tab with `rel="noopener noreferrer"`.
- An empty list shows a short empty state. Admins also see the add action.

**Done when:** a saved Google Drive link opens in a new tab and the app page stays open.

## 8. Class shell

- Shared navigation: Quizzes, Materials, and Log out. Each quiz links to its own leaderboard. Admins also see the email roster and Quiz builder. Sign up sits next to login.
- Apply the brutalist layout to login, home, quiz list, attempt, results, leaderboard, materials, and admin screens.
- Include empty states for no published quizzes, no attempts, and no materials.
- Check the main flows at desktop width and below 768px: sign up from the allowlist, login, publish quiz, submit attempt, read results, open that quiz's leaderboard, open a material link.

**Done when:** an allowlisted student can move from sign-up through a quiz result, that quiz's leaderboard, and a material link without a broken layout or a dead end.
