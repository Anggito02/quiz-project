# Graph Report - quiz-project  (2026-10-13)

## Corpus Check
- 92 files · ~83,229 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 449 nodes · 824 edges · 29 communities (16 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41ba8d58`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin/quizzes/[quizId]/actions.ts
- package.json
- createClient
- quizzes/actions.ts
- compilerOptions
- play-form.tsx
- roster/actions.ts
- ═══════════════════════════════════════════════════════════════
- site-nav.tsx
- classes/add-form.tsx
- courses/add-form.tsx
- Architecture: Financial Management and Strategy Quiz
- Same structure as DARK. Change text colors only:
- postcss.config.mjs
- COLOR TOKENS
- getSupabaseEnv
- dirmanquiz-questions_mk2_w2_01_e8e35002.md
- dirmanquiz-questions_mk2_w2_02_8eeaad2a.md
- dirmanquiz-questions_mk2_w2_03_7535e6a2.md
- dirmanquiz-questions_mk2_w2_04_ac350146.md
- dirmanquiz-questions_mk2_w2_05_2df92f33.md
- dirmanquiz-questions_mk2_w2_06_b2d0caf3.md
- dirmanquiz-questions_mk2_w2_07_6429e3e4.md
- dirmanquiz-questions_mk2_w2_08_292c38f1.md
- dirmanquiz-questions_mk2_w2_09_fcaf5889.md
- dirmanquiz-questions_mk2_w2_10_f32890a6.md
- dirmanquiz-questions_mk2_w2_d20da342.md
- dirmanquiz-questions_template_1117ac3d.md
- Product Requirements: Financial Management and Strategy Quiz

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 57 edges
2. `next` - 38 edges
3. `getSessionProfile()` - 30 edges
4. `react` - 16 edges
5. `compilerOptions` - 16 edges
6. `═══════════════════════════════════════════════════════════════` - 16 edges
7. `Same structure as DARK. Change text colors only:` - 15 edges
8. `LeaderboardView()` - 13 edges
9. `LeaderboardTable()` - 12 edges
10. `Product Requirements: Financial Management and Strategy Quiz` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Authentication` --references--> `signUp()`  [INFERRED]
  docs/Architecture.md → app/signup/actions.ts
- `3. Auth` --references--> `signUp()`  [INFERRED]
  docs/Task.md → app/signup/actions.ts
- `Authentication` --references--> `signUp()`  [INFERRED]
  docs/PRD.md → app/signup/actions.ts
- `Stack` --references--> `signUp()`  [INFERRED]
  docs/PRD.md → app/signup/actions.ts
- `requireAdmin()` --calls--> `createClient()`  [EXTRACTED]
  app/admin/classes/actions.ts → lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (29 total, 13 thin omitted)

### Community 0 - "admin/quizzes/[quizId]/actions.ts"
Cohesion: 0.13
Nodes (30): deleteQuestion(), EditorState, importQuestions(), moveQuestion(), quizPath(), readOptions(), requireAdmin(), saveQuestion() (+22 more)

### Community 1 - "package.json"
Cohesion: 0.04
Nodes (43): AnswerGroup(), RecapAnswer, ResultRecap(), SnapshotOption, eslintConfig, dependencies, exceljs, lucide-react (+35 more)

### Community 2 - "createClient"
Cohesion: 0.09
Nodes (40): AdminLayout(), resetLeaderboard(), AdminLeaderboardPage(), ResetBoardForms(), GET(), logOut(), LeaderboardPage(), QuizzesPage() (+32 more)

### Community 3 - "quizzes/actions.ts"
Cohesion: 0.27
Nodes (10): createQuiz(), QuizFormState, requireAdmin(), resolveCourseId(), CreateQuizForm(), initialState, courseName(), groupByCourse() (+2 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 5 - "play-form.tsx"
Cohesion: 0.12
Nodes (17): readAnswers(), submitQuiz(), SubmitState, initialState, Question, TakeQuizForm(), readAnswers(), startUnlimited() (+9 more)

### Community 6 - "roster/actions.ts"
Cohesion: 0.31
Nodes (11): addEmail(), adminClient(), classIdFromForm(), removeEmail(), roleFromForm(), RosterState, updateRole(), AddEmailForm() (+3 more)

### Community 7 - "═══════════════════════════════════════════════════════════════"
Cohesion: 0.06
Nodes (36): ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, Always pair with letter markers AND correct/incorrect iconography., BRAND IDENTITY, Brand Identity × Wayground-Inspired Structural Patterns, Brand Identity × Wayground-Inspired Structural Patterns (+28 more)

### Community 8 - "site-nav.tsx"
Cohesion: 0.11
Nodes (23): jakarta, metadata, RootLayout(), logIn(), LoginState, initialState, LoginForm(), LoginPage() (+15 more)

### Community 9 - "classes/add-form.tsx"
Cohesion: 0.33
Nodes (9): addClass(), CatalogState, removeClass(), requireAdmin(), AddClassForm(), initialState, RemoveClassForm(), ClassesPage() (+1 more)

### Community 10 - "courses/add-form.tsx"
Cohesion: 0.33
Nodes (9): addCourse(), CatalogState, removeCourse(), requireAdmin(), AddCourseForm(), initialState, RemoveCourseForm(), CourseRow (+1 more)

### Community 12 - "Architecture: Financial Management and Strategy Quiz"
Cohesion: 0.18
Nodes (11): Application structure, Architecture: Financial Management and Strategy Quiz, Authentication, Data model, Environment, Leaderboard, Materials, Quiz taking and grading (+3 more)

### Community 13 - "Same structure as DARK. Change text colors only:"
Cohesion: 0.07
Nodes (28): ACCESSIBILITY (non-negotiable), Answer Option Tiles (Learner mode), BORDER RADIUS, Buttons, COMPONENT SPECIFICATIONS, CSS TOKEN STARTER, Dialogs & Confirmations, ELEVATION & SHADOWS (+20 more)

### Community 15 - "COLOR TOKENS"
Cohesion: 0.15
Nodes (13): Accent (Kuis Lime), Brand (Kuis Indigo), COLOR TOKENS, Dark Quiz Canvas (Learner mode), Every screen must belong to exactly one mode. Do NOT mix visual treatments., MODE 1 — WORKSPACE, MODE 2 — LEARNER / LIVE QUIZ, MODE 3 — MARKETING / DISCOVERY (+5 more)

### Community 16 - "getSupabaseEnv"
Cohesion: 0.32
Nodes (4): getSupabaseEnv(), createClient(), config, @supabase/ssr

### Community 29 - "Product Requirements: Financial Management and Strategy Quiz"
Cohesion: 0.07
Nodes (29): signUp(), SignUpState, SignUpPage(), initialState, SignUpForm(), Acceptance examples, Admin builds a quiz, Admin sets who may sign in (+21 more)

## Knowledge Gaps
- **6 isolated node(s):** `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 218 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `signUp()` connect `Product Requirements: Financial Management and Strategy Quiz` to `createClient`, `Architecture: Financial Management and Strategy Quiz`, `═══════════════════════════════════════════════════════════════`?**
  _High betweenness centrality (0.321) - this node is a cross-community bridge._
- **What connects `@tailwindcss/postcss`, `@types/node`, `@types/react` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin/quizzes/[quizId]/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12685560053981107 - nodes in this community are weakly interconnected._
- **Why does `createClient()` connect `createClient` to `admin/quizzes/[quizId]/actions.ts`, `quizzes/actions.ts`, `play-form.tsx`, `roster/actions.ts`, `site-nav.tsx`, `classes/add-form.tsx`, `courses/add-form.tsx`, `getSupabaseEnv`, `Product Requirements: Financial Management and Strategy Quiz`?**
  _High betweenness centrality (0.311) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04343971631205674 - nodes in this community are weakly interconnected._
- **Why does `═══════════════════════════════════════════════════════════════` connect `═══════════════════════════════════════════════════════════════` to `Same structure as DARK. Change text colors only:`, `COLOR TOKENS`?**
  _High betweenness centrality (0.198) - this node is a cross-community bridge._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.09435028248587571 - nodes in this community are weakly interconnected._