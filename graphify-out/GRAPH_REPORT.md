# Graph Report - quiz-project  (2026-10-20)

## Corpus Check
- 117 files · ~113,353 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 534 nodes · 986 edges · 36 communities (15 shown, 21 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ddce2a86`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- createClient
- package.json
- admin/quizzes/[quizId]/actions.ts
- site-nav.tsx
- ═══════════════════════════════════════════════════════════════
- leaderboard-view.tsx
- Same structure as DARK. Change text colors only:
- play-form.tsx
- Product Requirements: Financial Management and Strategy Quiz
- compilerOptions
- roster/actions.ts
- quizzes/actions.ts
- classes/add-form.tsx
- courses/add-form.tsx
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

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 55 edges
2. `next` - 39 edges
3. `getSessionProfile` - 30 edges
4. `react` - 21 edges
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

## Communities (36 total, 21 thin omitted)

### Community 0 - "createClient"
Cohesion: 0.06
Nodes (54): AdminLayout(), AdminLeaderboardPage(), logOut(), LeaderboardPage(), logIn(), LoginState, initialState, LoginForm() (+46 more)

### Community 1 - "package.json"
Cohesion: 0.05
Nodes (37): eslintConfig, dependencies, exceljs, lucide-react, next, react, react-dom, @supabase/ssr (+29 more)

### Community 2 - "admin/quizzes/[quizId]/actions.ts"
Cohesion: 0.10
Nodes (35): deleteQuestion(), EditorState, importQuestions(), moveQuestion(), quizPath(), readOptions(), requireAdmin(), saveQuestion() (+27 more)

### Community 3 - "site-nav.tsx"
Cohesion: 0.13
Nodes (24): jakarta, metadata, RootLayout(), Home(), AmbientBackdrop(), KuisLetterMark(), KuisLockup(), KuisMark() (+16 more)

### Community 4 - "═══════════════════════════════════════════════════════════════"
Cohesion: 0.05
Nodes (40): ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, ═══════════════════════════════════════════════════════════════, Accent (Kuis Lime), Always pair with letter markers AND correct/incorrect iconography., BRAND IDENTITY, Brand Identity × Wayground-Inspired Structural Patterns (+32 more)

### Community 5 - "leaderboard-view.tsx"
Cohesion: 0.10
Nodes (20): resetLeaderboard(), ResetBoardForms(), boardHref(), CourseEmbed, CourseGroup, courseOf(), LeaderboardView(), PickerQuizRow (+12 more)

### Community 6 - "Same structure as DARK. Change text colors only:"
Cohesion: 0.07
Nodes (29): ACCESSIBILITY (non-negotiable), Answer Option Tiles (Learner mode), BORDER RADIUS, Buttons, COMPONENT SPECIFICATIONS, CSS TOKEN STARTER, Dialogs & Confirmations, ELEVATION & SHADOWS (+21 more)

### Community 7 - "play-form.tsx"
Cohesion: 0.13
Nodes (16): readAnswers(), submitQuiz(), SubmitState, initialState, Question, TakeQuizForm(), readAnswers(), startUnlimited() (+8 more)

### Community 8 - "Product Requirements: Financial Management and Strategy Quiz"
Cohesion: 0.05
Nodes (45): signUp(), Application structure, Architecture: Financial Management and Strategy Quiz, Authentication, Data model, Environment, Leaderboard, Materials (+37 more)

### Community 9 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "roster/actions.ts"
Cohesion: 0.29
Nodes (12): addEmail(), adminClient(), classIdFromForm(), removeEmail(), roleFromForm(), rosterEntry(), RosterState, updateRole() (+4 more)

### Community 11 - "quizzes/actions.ts"
Cohesion: 0.27
Nodes (10): createQuiz(), QuizFormState, requireAdmin(), resolveCourseId(), CreateQuizForm(), initialState, courseName(), groupByCourse() (+2 more)

### Community 13 - "classes/add-form.tsx"
Cohesion: 0.33
Nodes (9): addClass(), CatalogState, removeClass(), requireAdmin(), AddClassForm(), initialState, RemoveClassForm(), ClassesPage() (+1 more)

### Community 14 - "courses/add-form.tsx"
Cohesion: 0.33
Nodes (9): addCourse(), CatalogState, removeCourse(), requireAdmin(), AddCourseForm(), initialState, RemoveCourseForm(), CourseRow (+1 more)

### Community 38 - "loading-frame.tsx"
Cohesion: 0.14
Nodes (21): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+13 more)

## Knowledge Gaps
- **6 isolated node(s):** `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 243 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `createClient` to `admin/quizzes/[quizId]/actions.ts`, `leaderboard-view.tsx`, `play-form.tsx`, `Product Requirements: Financial Management and Strategy Quiz`, `roster/actions.ts`, `quizzes/actions.ts`, `classes/add-form.tsx`, `courses/add-form.tsx`?**
  _High betweenness centrality (0.256) - this node is a cross-community bridge._
- **What connects `@tailwindcss/postcss`, `@types/node`, `@types/react` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.06022408963585434 - nodes in this community are weakly interconnected._
- **Why does `signUp()` connect `Product Requirements: Financial Management and Strategy Quiz` to `createClient`?**
  _High betweenness centrality (0.255) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Why does `═══════════════════════════════════════════════════════════════` connect `═══════════════════════════════════════════════════════════════` to `Same structure as DARK. Change text colors only:`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Should `admin/quizzes/[quizId]/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10434782608695652 - nodes in this community are weakly interconnected._