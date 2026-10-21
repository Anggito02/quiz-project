# Graph Report - quiz-project  (2026-10-21)

## Corpus Check
- 129 files · ~121,117 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 613 nodes · 1193 edges · 44 communities (22 shown, 22 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab8bd8be`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- createClient
- package.json
- admin/quizzes/[quizId]/actions.ts
- Architecture: Financial Management and Strategy Quiz
- COLOR TOKENS
- leaderboard-view.tsx
- Same structure as DARK. Change text colors only:
- take-form.tsx
- Product Requirements: Financial Management and Strategy Quiz
- compilerOptions
- roster/actions.ts
- next
- ═══════════════════════════════════════════════════════════════
- server.ts
- courses/actions.ts
- DirmanQuiz
- Implementation tasks
- dirmanquiz-questions_mk2_w2_01_f2e6933a.md
- dirmanquiz-questions_mk2_w2_02_03a0f4c0.md
- dirmanquiz-questions_mk2_w2_03_f6a7d5e5.md
- dirmanquiz-questions_mk2_w2_04_7a637b31.md
- dirmanquiz-questions_mk2_w2_05_38906f44.md
- dirmanquiz-questions_mk2_w2_06_a8ae08d4.md
- dirmanquiz-questions_mk2_w2_07_9d81df26.md
- dirmanquiz-questions_mk2_w2_08_628225a4.md
- dirmanquiz-questions_mk2_w2_09_02cd9bf2.md
- dirmanquiz-questions_mk2_w2_10_b0744892.md
- dirmanquiz-questions_mk2_w2_3d7556a0.md
- dirmanquiz-questions_mk2_w3_1_7f856264.md
- dirmanquiz-questions_mk2_w3_2_c23b7651.md
- dirmanquiz-questions_mk2_w3_3_62b74ddd.md
- dirmanquiz-questions_mk2_w4_2ef22eff.md
- dirmanquiz-questions_template_1117ac3d.md
- dirmanquiz-questions_template_5620beb7.md
- dirmanquiz-questions_template_da5d8d59.md
- postcss.config.mjs
- AGENTS.md
- loading-frame.tsx
- LOGO ASSETS (inline SVG — paste directly into HTML)
- react
- generate-serdik-seed.mjs
- admin/quizzes/page.tsx

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 57 edges
2. `next` - 41 edges
3. `getSessionProfile` - 31 edges
4. `react` - 29 edges
5. `compilerOptions` - 16 edges
6. `═══════════════════════════════════════════════════════════════` - 16 edges
7. `Same structure as DARK. Change text colors only:` - 15 edges
8. `PendingLink()` - 14 edges
9. `AppChrome()` - 14 edges
10. `LeaderboardView()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `requireAdmin()` --calls--> `createClient()`  [EXTRACTED]
  app/admin/classes/actions.ts → lib/supabase/server.ts
- `ClassesPage()` --calls--> `createClient()`  [EXTRACTED]
  app/admin/classes/page.tsx → lib/supabase/server.ts
- `requireAdmin()` --calls--> `createClient()`  [EXTRACTED]
  app/admin/courses/actions.ts → lib/supabase/server.ts
- `CoursesPage()` --calls--> `createClient()`  [EXTRACTED]
  app/admin/courses/page.tsx → lib/supabase/server.ts
- `AdminLayout()` --calls--> `getSessionProfile`  [EXTRACTED]
  app/admin/layout.tsx → lib/session.ts

## Import Cycles
- None detected.

## Communities (44 total, 22 thin omitted)

### Community 0 - "createClient"
Cohesion: 0.08
Nodes (41): AdminLayout(), ClassStudent, listClassStudents(), logInAdmin(), LoginState, logInStudent(), AdminLoginForm(), initialState (+33 more)

### Community 1 - "package.json"
Cohesion: 0.05
Nodes (40): AnswerGroup(), RecapAnswer, ResultRecap(), SnapshotOption, eslintConfig, dependencies, exceljs, lucide-react (+32 more)

### Community 2 - "admin/quizzes/[quizId]/actions.ts"
Cohesion: 0.11
Nodes (33): deleteQuestion(), EditorState, importQuestions(), moveQuestion(), quizPath(), readOptions(), requireAdmin(), saveQuestion() (+25 more)

### Community 3 - "Architecture: Financial Management and Strategy Quiz"
Cohesion: 0.18
Nodes (11): Application structure, Architecture: Financial Management and Strategy Quiz, Authentication, Data model, Environment, Leaderboard, Materials, Quiz taking and grading (+3 more)

### Community 4 - "COLOR TOKENS"
Cohesion: 0.15
Nodes (13): Accent (Kuis Lime), Brand (Kuis Indigo), COLOR TOKENS, Dark Quiz Canvas (Learner mode), Every screen must belong to exactly one mode. Do NOT mix visual treatments., MODE 1 — WORKSPACE, MODE 2 — LEARNER / LIVE QUIZ, MODE 3 — MARKETING / DISCOVERY (+5 more)

### Community 5 - "leaderboard-view.tsx"
Cohesion: 0.14
Nodes (17): resetLeaderboard(), ResetBoardForms(), boardHref(), CourseEmbed, CourseGroup, courseOf(), LeaderboardView(), PickerQuizRow (+9 more)

### Community 6 - "Same structure as DARK. Change text colors only:"
Cohesion: 0.07
Nodes (29): ACCESSIBILITY (non-negotiable), Answer Option Tiles (Learner mode), BORDER RADIUS, Buttons, COMPONENT SPECIFICATIONS, CSS TOKEN STARTER, Dialogs & Confirmations, ELEVATION & SHADOWS (+21 more)

### Community 7 - "take-form.tsx"
Cohesion: 0.13
Nodes (13): readAnswers(), submitQuiz(), SubmitState, countLabel(), formatWhen(), TakeQuizPage(), initialState, Question (+5 more)

### Community 8 - "Product Requirements: Financial Management and Strategy Quiz"
Cohesion: 0.08
Nodes (24): Acceptance examples, Admin builds a quiz, Admin sets who may sign in, Attempts, Authentication, Data outline, Flows, Functional requirements (+16 more)

### Community 9 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "roster/actions.ts"
Cohesion: 0.12
Nodes (26): addEmail(), adminClient(), importStudents(), removeEmail(), rosterEntry(), RosterState, AddEmailForm(), initialState (+18 more)

### Community 11 - "next"
Cohesion: 0.08
Nodes (39): QuizzesCatalog(), QuizzesPage(), TrendingCards(), readAnswers(), startUnlimited(), submitUnlimited(), UnlimitedState, formatWhen() (+31 more)

### Community 12 - "═══════════════════════════════════════════════════════════════"
Cohesion: 0.18
Nodes (11): ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, BRAND IDENTITY, Brand Identity × Wayground-Inspired Structural Patterns, Brand Identity × Wayground-Inspired Structural Patterns, END OF KUIS DESIGN SYSTEM PROMPT  v2 (+3 more)

### Community 13 - "server.ts"
Cohesion: 0.17
Nodes (13): addClass(), CatalogState, removeClass(), requireAdmin(), AddClassForm(), initialState, RemoveClassForm(), ClassesPage() (+5 more)

### Community 14 - "courses/actions.ts"
Cohesion: 0.32
Nodes (10): addCourse(), CatalogState, removeCourse(), requireAdmin(), AddCourseForm(), initialState, RemoveCourseForm(), CourseRow (+2 more)

### Community 15 - "DirmanQuiz"
Cohesion: 0.18
Nodes (11): 1. Create the Supabase project, 2. Set environment variables, 3. Create the database, 4. Seed the first admin email, 5. Email confirmation, 6. Run the app, DirmanQuiz, Requirements (+3 more)

### Community 16 - "Implementation tasks"
Cohesion: 0.22
Nodes (9): 1. Scaffold, 2. Schema and RLS, 3. Auth, 4. Quiz builder, 5. Take quiz, 6. Leaderboard, 7. Materials, 8. Class shell (+1 more)

### Community 38 - "loading-frame.tsx"
Cohesion: 0.09
Nodes (34): Loading(), AdminLeaderboardBoard(), AdminLeaderboardPage(), boardKey(), BoardParams, Loading(), Loading(), boardKey() (+26 more)

### Community 39 - "LOGO ASSETS (inline SVG — paste directly into HTML)"
Cohesion: 0.40
Nodes (5): Always pair with letter markers AND correct/incorrect iconography., FULL LOCKUP — DARK (for dark/quiz backgrounds), FULL LOCKUP — LIGHT (for workspace / white backgrounds), ICON MARK (24–72px) — Learner mode, favicon, mobile nav, LOGO ASSETS (inline SVG — paste directly into HTML)

### Community 41 - "react"
Cohesion: 0.13
Nodes (24): logOut(), jakarta, metadata, RootLayout(), Home(), AmbientBackdrop(), KuisLetterMark(), KuisLockup() (+16 more)

### Community 42 - "generate-serdik-seed.mjs"
Cohesion: 0.23
Nodes (9): cellText(), classes, classValues, numberFromCell(), pinFromCell(), rows, seedValues, sqlStr() (+1 more)

### Community 43 - "admin/quizzes/page.tsx"
Cohesion: 0.25
Nodes (11): createQuiz(), QuizFormState, requireAdmin(), resolveCourseId(), CreateQuizForm(), initialState, courseName(), groupByCourse() (+3 more)

## Knowledge Gaps
- **6 isolated node(s):** `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 266 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `createClient`, `package.json`, `admin/quizzes/[quizId]/actions.ts`, `leaderboard-view.tsx`, `loading-frame.tsx`, `take-form.tsx`, `react`, `roster/actions.ts`, `admin/quizzes/page.tsx`, `server.ts`, `courses/actions.ts`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **What connects `@tailwindcss/postcss`, `@types/node`, `@types/react` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.08032786885245902 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `createClient`, `package.json`, `admin/quizzes/[quizId]/actions.ts`, `leaderboard-view.tsx`, `loading-frame.tsx`, `take-form.tsx`, `roster/actions.ts`, `admin/quizzes/page.tsx`, `next`, `server.ts`, `courses/actions.ts`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04756871035940803 - nodes in this community are weakly interconnected._
- **Why does `createClient()` connect `createClient` to `admin/quizzes/[quizId]/actions.ts`, `leaderboard-view.tsx`, `take-form.tsx`, `react`, `roster/actions.ts`, `admin/quizzes/page.tsx`, `next`, `server.ts`, `courses/actions.ts`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `admin/quizzes/[quizId]/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11295681063122924 - nodes in this community are weakly interconnected._