# Graph Report - quiz-project  (2026-10-21)

## Corpus Check
- 122 files · ~115,931 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 561 nodes · 1054 edges · 43 communities (21 shown, 22 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d2ad9c96`
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
- [sessionId]/page.tsx
- Product Requirements: Financial Management and Strategy Quiz
- compilerOptions
- roster/actions.ts
- quizzes/actions.ts
- ═══════════════════════════════════════════════════════════════
- classes/add-form.tsx
- courses/add-form.tsx
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
- site-nav.tsx
- getSupabaseEnv

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 59 edges
2. `next` - 38 edges
3. `getSessionProfile` - 31 edges
4. `react` - 22 edges
5. `compilerOptions` - 16 edges
6. `═══════════════════════════════════════════════════════════════` - 16 edges
7. `Same structure as DARK. Change text colors only:` - 15 edges
8. `AppChrome()` - 14 edges
9. `LeaderboardView()` - 13 edges
10. `LeaderboardTable()` - 12 edges

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

## Communities (43 total, 22 thin omitted)

### Community 0 - "createClient"
Cohesion: 0.10
Nodes (39): AdminLayout(), resetLeaderboard(), GET(), logOut(), LoginPage(), ProfilePage(), catalogHref(), CourseEmbed (+31 more)

### Community 1 - "package.json"
Cohesion: 0.04
Nodes (43): AnswerGroup(), RecapAnswer, ResultRecap(), SnapshotOption, eslintConfig, dependencies, exceljs, lucide-react (+35 more)

### Community 2 - "admin/quizzes/[quizId]/actions.ts"
Cohesion: 0.12
Nodes (32): deleteQuestion(), EditorState, importQuestions(), moveQuestion(), quizPath(), readOptions(), requireAdmin(), saveQuestion() (+24 more)

### Community 3 - "Architecture: Financial Management and Strategy Quiz"
Cohesion: 0.18
Nodes (11): Application structure, Architecture: Financial Management and Strategy Quiz, Authentication, Data model, Environment, Leaderboard, Materials, Quiz taking and grading (+3 more)

### Community 4 - "COLOR TOKENS"
Cohesion: 0.15
Nodes (13): Accent (Kuis Lime), Brand (Kuis Indigo), COLOR TOKENS, Dark Quiz Canvas (Learner mode), Every screen must belong to exactly one mode. Do NOT mix visual treatments., MODE 1 — WORKSPACE, MODE 2 — LEARNER / LIVE QUIZ, MODE 3 — MARKETING / DISCOVERY (+5 more)

### Community 5 - "leaderboard-view.tsx"
Cohesion: 0.13
Nodes (16): AdminLeaderboardPage(), ResetBoardForms(), LeaderboardPage(), boardHref(), CourseEmbed, CourseGroup, courseOf(), LeaderboardView() (+8 more)

### Community 6 - "Same structure as DARK. Change text colors only:"
Cohesion: 0.07
Nodes (29): ACCESSIBILITY (non-negotiable), Answer Option Tiles (Learner mode), BORDER RADIUS, Buttons, COMPONENT SPECIFICATIONS, CSS TOKEN STARTER, Dialogs & Confirmations, ELEVATION & SHADOWS (+21 more)

### Community 7 - "[sessionId]/page.tsx"
Cohesion: 0.10
Nodes (21): readAnswers(), submitQuiz(), SubmitState, initialState, Question, TakeQuizForm(), readAnswers(), startUnlimited() (+13 more)

### Community 8 - "Product Requirements: Financial Management and Strategy Quiz"
Cohesion: 0.08
Nodes (24): Acceptance examples, Admin builds a quiz, Admin sets who may sign in, Attempts, Authentication, Data outline, Flows, Functional requirements (+16 more)

### Community 9 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "roster/actions.ts"
Cohesion: 0.07
Nodes (43): addEmail(), adminClient(), importStudents(), removeEmail(), rosterEntry(), RosterState, AddEmailForm(), initialState (+35 more)

### Community 11 - "quizzes/actions.ts"
Cohesion: 0.27
Nodes (10): createQuiz(), QuizFormState, requireAdmin(), resolveCourseId(), CreateQuizForm(), initialState, courseName(), groupByCourse() (+2 more)

### Community 12 - "═══════════════════════════════════════════════════════════════"
Cohesion: 0.18
Nodes (11): ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, BRAND IDENTITY, Brand Identity × Wayground-Inspired Structural Patterns, Brand Identity × Wayground-Inspired Structural Patterns, END OF KUIS DESIGN SYSTEM PROMPT  v2 (+3 more)

### Community 13 - "classes/add-form.tsx"
Cohesion: 0.33
Nodes (9): addClass(), CatalogState, removeClass(), requireAdmin(), AddClassForm(), initialState, RemoveClassForm(), ClassesPage() (+1 more)

### Community 14 - "courses/add-form.tsx"
Cohesion: 0.33
Nodes (9): addCourse(), CatalogState, removeCourse(), requireAdmin(), AddCourseForm(), initialState, RemoveCourseForm(), CourseRow (+1 more)

### Community 15 - "DirmanQuiz"
Cohesion: 0.18
Nodes (11): 1. Create the Supabase project, 2. Set environment variables, 3. Create the database, 4. Seed the first admin email, 5. Email confirmation, 6. Run the app, DirmanQuiz, Requirements (+3 more)

### Community 16 - "Implementation tasks"
Cohesion: 0.22
Nodes (9): 1. Scaffold, 2. Schema and RLS, 3. Auth, 4. Quiz builder, 5. Take quiz, 6. Leaderboard, 7. Materials, 8. Class shell (+1 more)

### Community 38 - "loading-frame.tsx"
Cohesion: 0.14
Nodes (21): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+13 more)

### Community 39 - "LOGO ASSETS (inline SVG — paste directly into HTML)"
Cohesion: 0.40
Nodes (5): Always pair with letter markers AND correct/incorrect iconography., FULL LOCKUP — DARK (for dark/quiz backgrounds), FULL LOCKUP — LIGHT (for workspace / white backgrounds), ICON MARK (24–72px) — Learner mode, favicon, mobile nav, LOGO ASSETS (inline SVG — paste directly into HTML)

### Community 41 - "site-nav.tsx"
Cohesion: 0.14
Nodes (23): jakarta, metadata, RootLayout(), Home(), AmbientBackdrop(), KuisLetterMark(), KuisLockup(), KuisMark() (+15 more)

### Community 42 - "getSupabaseEnv"
Cohesion: 0.32
Nodes (4): getSupabaseEnv(), createClient(), config, @supabase/ssr

## Knowledge Gaps
- **6 isolated node(s):** `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 254 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `createClient` to `package.json`, `admin/quizzes/[quizId]/actions.ts`, `leaderboard-view.tsx`, `[sessionId]/page.tsx`, `site-nav.tsx`, `roster/actions.ts`, `quizzes/actions.ts`, `getSupabaseEnv`, `classes/add-form.tsx`, `courses/add-form.tsx`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **What connects `@tailwindcss/postcss`, `@types/node`, `@types/react` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.09739866908650938 - nodes in this community are weakly interconnected._
- **Why does `createClient()` connect `createClient` to `admin/quizzes/[quizId]/actions.ts`, `leaderboard-view.tsx`, `[sessionId]/page.tsx`, `roster/actions.ts`, `quizzes/actions.ts`, `getSupabaseEnv`, `classes/add-form.tsx`, `courses/add-form.tsx`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04343971631205674 - nodes in this community are weakly interconnected._
- **Why does `react` connect `site-nav.tsx` to `createClient`, `package.json`, `admin/quizzes/[quizId]/actions.ts`, `leaderboard-view.tsx`, `[sessionId]/page.tsx`, `roster/actions.ts`, `quizzes/actions.ts`, `classes/add-form.tsx`, `courses/add-form.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `admin/quizzes/[quizId]/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11951219512195121 - nodes in this community are weakly interconnected._