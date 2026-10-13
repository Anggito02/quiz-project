# Graph Report - quiz-project  (2026-10-13)

## Corpus Check
- 101 files · ~105,987 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 489 nodes · 884 edges · 36 communities (17 shown, 19 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `af608891`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- createClient
- package.json
- admin/quizzes/[quizId]/actions.ts
- site-nav.tsx
- ═══════════════════════════════════════════════════════════════
- login/page.tsx
- Same structure as DARK. Change text colors only:
- play-form.tsx
- Product Requirements: Financial Management and Strategy Quiz
- compilerOptions
- roster/actions.ts
- quizzes/actions.ts
- COLOR TOKENS
- classes/add-form.tsx
- courses/add-form.tsx
- app/quizzes/page.tsx
- getSupabaseEnv
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

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 57 edges
2. `next` - 39 edges
3. `getSessionProfile()` - 30 edges
4. `react` - 19 edges
5. `compilerOptions` - 16 edges
6. `═══════════════════════════════════════════════════════════════` - 16 edges
7. `Same structure as DARK. Change text colors only:` - 15 edges
8. `AppChrome()` - 14 edges
9. `LeaderboardView()` - 13 edges
10. `KuisLockup()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Authentication` --references--> `signUp()`  [INFERRED]
  docs/Architecture.md → app/signup/actions.ts
- `Authentication` --references--> `signUp()`  [INFERRED]
  docs/PRD.md → app/signup/actions.ts
- `Stack` --references--> `signUp()`  [INFERRED]
  docs/PRD.md → app/signup/actions.ts
- `3. Auth` --references--> `signUp()`  [INFERRED]
  docs/Task.md → app/signup/actions.ts
- `requireAdmin()` --calls--> `createClient()`  [EXTRACTED]
  app/admin/classes/actions.ts → lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (36 total, 19 thin omitted)

### Community 0 - "createClient"
Cohesion: 0.08
Nodes (45): AdminLayout(), resetLeaderboard(), AdminLeaderboardPage(), ResetBoardForms(), GET(), logOut(), LeaderboardPage(), AttemptPage() (+37 more)

### Community 1 - "package.json"
Cohesion: 0.04
Nodes (42): AnswerGroup(), RecapAnswer, ResultRecap(), SnapshotOption, eslintConfig, dependencies, exceljs, lucide-react (+34 more)

### Community 2 - "admin/quizzes/[quizId]/actions.ts"
Cohesion: 0.12
Nodes (32): deleteQuestion(), EditorState, importQuestions(), moveQuestion(), quizPath(), readOptions(), requireAdmin(), saveQuestion() (+24 more)

### Community 3 - "site-nav.tsx"
Cohesion: 0.11
Nodes (27): jakarta, metadata, RootLayout(), Home(), SignUpState, SignUpPage(), initialState, SignUpForm() (+19 more)

### Community 4 - "═══════════════════════════════════════════════════════════════"
Cohesion: 0.05
Nodes (37): Application structure, Architecture: Financial Management and Strategy Quiz, Data model, Environment, Leaderboard, Materials, Quiz taking and grading, Row Level Security (+29 more)

### Community 5 - "login/page.tsx"
Cohesion: 0.43
Nodes (5): logIn(), LoginState, initialState, LoginForm(), LoginPage()

### Community 6 - "Same structure as DARK. Change text colors only:"
Cohesion: 0.07
Nodes (29): ACCESSIBILITY (non-negotiable), Answer Option Tiles (Learner mode), BORDER RADIUS, Buttons, COMPONENT SPECIFICATIONS, CSS TOKEN STARTER, Dialogs & Confirmations, ELEVATION & SHADOWS (+21 more)

### Community 7 - "play-form.tsx"
Cohesion: 0.12
Nodes (17): readAnswers(), submitQuiz(), SubmitState, initialState, Question, TakeQuizForm(), readAnswers(), startUnlimited() (+9 more)

### Community 8 - "Product Requirements: Financial Management and Strategy Quiz"
Cohesion: 0.06
Nodes (35): signUp(), Authentication, Acceptance examples, Admin builds a quiz, Admin sets who may sign in, Attempts, Authentication, Data outline (+27 more)

### Community 9 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "roster/actions.ts"
Cohesion: 0.31
Nodes (11): addEmail(), adminClient(), classIdFromForm(), removeEmail(), roleFromForm(), RosterState, updateRole(), AddEmailForm() (+3 more)

### Community 11 - "quizzes/actions.ts"
Cohesion: 0.27
Nodes (10): createQuiz(), QuizFormState, requireAdmin(), resolveCourseId(), CreateQuizForm(), initialState, courseName(), groupByCourse() (+2 more)

### Community 12 - "COLOR TOKENS"
Cohesion: 0.15
Nodes (13): Accent (Kuis Lime), Brand (Kuis Indigo), COLOR TOKENS, Dark Quiz Canvas (Learner mode), Every screen must belong to exactly one mode. Do NOT mix visual treatments., MODE 1 — WORKSPACE, MODE 2 — LEARNER / LIVE QUIZ, MODE 3 — MARKETING / DISCOVERY (+5 more)

### Community 13 - "classes/add-form.tsx"
Cohesion: 0.33
Nodes (9): addClass(), CatalogState, removeClass(), requireAdmin(), AddClassForm(), initialState, RemoveClassForm(), ClassesPage() (+1 more)

### Community 14 - "courses/add-form.tsx"
Cohesion: 0.33
Nodes (9): addCourse(), CatalogState, removeCourse(), requireAdmin(), AddCourseForm(), initialState, RemoveCourseForm(), CourseRow (+1 more)

### Community 15 - "app/quizzes/page.tsx"
Cohesion: 0.33
Nodes (8): catalogHref(), CourseEmbed, courseNameOf(), QuizCard, QuizCards(), QuizzesPage(), searchFilter(), TrendingRow

### Community 16 - "getSupabaseEnv"
Cohesion: 0.32
Nodes (4): getSupabaseEnv(), createClient(), config, @supabase/ssr

## Knowledge Gaps
- **6 isolated node(s):** `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 237 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `signUp()` connect `Product Requirements: Financial Management and Strategy Quiz` to `createClient`, `site-nav.tsx`?**
  _High betweenness centrality (0.294) - this node is a cross-community bridge._
- **What connects `@tailwindcss/postcss`, `@types/node`, `@types/react` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.0784313725490196 - nodes in this community are weakly interconnected._
- **Why does `createClient()` connect `createClient` to `admin/quizzes/[quizId]/actions.ts`, `login/page.tsx`, `play-form.tsx`, `Product Requirements: Financial Management and Strategy Quiz`, `roster/actions.ts`, `quizzes/actions.ts`, `classes/add-form.tsx`, `courses/add-form.tsx`, `app/quizzes/page.tsx`, `getSupabaseEnv`?**
  _High betweenness centrality (0.293) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04440333024976873 - nodes in this community are weakly interconnected._
- **Why does `═══════════════════════════════════════════════════════════════` connect `═══════════════════════════════════════════════════════════════` to `COLOR TOKENS`, `Same structure as DARK. Change text colors only:`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Should `admin/quizzes/[quizId]/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11951219512195121 - nodes in this community are weakly interconnected._