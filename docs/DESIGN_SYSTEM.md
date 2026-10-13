# ═══════════════════════════════════════════════════════════════
# KUIS — Complete Design System Prompt  v2
# Brand Identity × Wayground-Inspired Structural Patterns
# ═══════════════════════════════════════════════════════════════

## BRAND IDENTITY

Brand name   : kuis  (always lowercase in all UI contexts)
Tagline      : Bantuin ujian kamu
Product type : Indonesian student quiz & exam-prep platform
Personality  : Smart, friendly, energetic — a helpful study buddy, not a formal exam tool

## THREE VISUAL MODES

# Every screen must belong to exactly one mode. Do NOT mix visual treatments.

### MODE 1 — WORKSPACE
  Context  : Library, search, create/edit resources, settings, reports, dashboard
  Surface  : Light neutral (#FFFFFF, #F7F7FA), restrained brand accent
  Tone     : Calm, information-dense, clear hierarchy, compact controls
  Logo     : Full lockup (light variant) — left-aligned in topbar

### MODE 2 — LEARNER / LIVE QUIZ
  Context  : Join, answer, progress, feedback, live game sessions
  Surface  : Immersive dark canvas (--kuis-base #07051A or --purple-900)
  Tone     : High-contrast, large question text, large answer targets, visible feedback
  Logo     : Icon mark only (32–44px) — top-left in quiz shell

### MODE 3 — MARKETING / DISCOVERY
  Context  : Landing pages, feature explanations, conversion flows
  Surface  : Dark base (--kuis-base) with gradient accents OR light sections
  Tone     : Spacious, strong headlines, colorful features, clear CTAs
  Logo     : Full lockup — dark or light variant based on section background

## COLOR TOKENS

### Brand (Kuis Indigo)
  --color-brand-50  : #EEECFF  → Subtle brand-tinted bg, hover background
  --color-brand-100 : #DAD8FF  → Selected nav bg, light highlights
  --color-brand-500 : #5856F8  → Primary action, CTA, active state
  --color-brand-600 : #4644D6  → Hover / pressed primary
  --color-brand-700 : #3533B4  → Strong accent text on light surfaces

### Secondary (Kuis Purple)
  --color-secondary-500 : #9333EA  → Gradient end, decorative accent
  --color-secondary-700 : #7E22CE  → Deeper purple surfaces

### Accent (Kuis Lime)
  --color-accent      : #B5FF4D  → Correct answers, progress fills, success spark
  --color-accent-dark : #6FAD00  → Lime on light surfaces (better contrast)

### Dark Quiz Canvas (Learner mode)
  --color-purple-950 : #07051A  → Deepest base (Kuis base dark)
  --color-purple-900 : #0E0B2E  → Quiz panel / immersive background
  --color-purple-800 : #1A1248  → Elevated dark panel
  --color-purple-700 : #2A1B6E  → Strong dark surface
  --color-purple-500 : #9333EA  → Supporting purple accent

### Text
  --color-text-primary   : #24232D  → Main workspace text
  --color-text-secondary : #62616F  → Secondary copy and metadata
  --color-text-muted     : #767582  → Low-priority labels
  --color-text-inverse   : #FFFFFF  → Text on dark surfaces

### Neutral Surfaces (Workspace mode)
  --color-bg             : #FFFFFF  → Main page background
  --color-bg-subtle      : #F7F7FA  → Page sections, quiet surfaces
  --color-surface        : #FFFFFF  → Cards, dialogs, menus
  --color-border         : #E4E3EA  → Standard borders and dividers
  --color-border-strong  : #C9C7D3  → Emphasized borders
  --color-focus          : #286FE8  → Keyboard focus ring (all modes)

### Semantic
  --color-success        : #168653  → Correct, completion, saved
  --color-success-bg     : #E8F7EF  → Success background tint
  --color-error          : #C9364F  → Incorrect, destructive, failed
  --color-error-bg       : #FFF0F1  → Error background tint
  --color-warning        : #946200  → Time-sensitive, caution
  --color-warning-bg     : #FFF5D9  → Warning background tint
  --color-info           : #286FE8  → Informational
  --color-info-bg        : #EDF4FF  → Info background tint

### Quiz Answer Palette (Learner mode only)
# These identify options; they do NOT imply correctness by themselves.
# Always pair with letter markers AND correct/incorrect iconography.
  --answer-blue    : #3F78B5  → Option A
  --answer-teal    : #459D9B  → Option B
  --answer-gold    : #D8A638  → Option C
  --answer-orange  : #E66B35  → Option D
  --answer-purple  : #8350C8  → Option E / extra
  --answer-pink    : #D94788  → Option F / extra

## LOGO ASSETS (inline SVG — paste directly into HTML)

### ICON MARK (24–72px) — Learner mode, favicon, mobile nav
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 80 80">
  <defs><linearGradient id="ki" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#5856F8"/><stop offset="100%" stop-color="#9333EA"/>
  </linearGradient></defs>
  <rect width="80" height="80" rx="18" fill="url(#ki)"/>
  <path d="M51 59.1A22 22 0 1 0 29 59.1" fill="none" stroke="#fff"
        stroke-width="7.5" stroke-linecap="round"/>
  <path d="M31 58L38 67.5 63 51" fill="none" stroke="#B5FF4D"
        stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

### FULL LOCKUP — DARK (for dark/quiz backgrounds)
<div style="display:flex;align-items:center;gap:14px;">
  <!-- Icon above, width/height="44" -->
  <div style="display:flex;flex-direction:column;gap:4px;">
    <span style="font-size:28px;font-weight:900;letter-spacing:-.03em;
                 color:#fff;line-height:1;
                 font-family:'Plus Jakarta Sans',system-ui,sans-serif">kuis</span>
    <span style="font-size:11px;font-weight:500;color:rgba(255,255,255,.42);
                 letter-spacing:.015em;
                 font-family:'Plus Jakarta Sans',system-ui,sans-serif">
      Bantuin ujian kamu</span>
  </div>
</div>

### FULL LOCKUP — LIGHT (for workspace / white backgrounds)
# Same structure as DARK. Change text colors only:
  wordmark color : #24232D  (--color-text-primary)
  tagline color  : #62616F  (--color-text-secondary)

### LETTER MARK (decorative large-scale use only)
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs><linearGradient id="klm" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#5856F8"/><stop offset="100%" stop-color="#9333EA"/>
  </linearGradient></defs>
  <path d="M130 149A60 60 0 1 0 70 149" fill="none"
        stroke="url(#klm)" stroke-width="20" stroke-linecap="round"/>
  <path d="M75 146L95 172 162 128" fill="none" stroke="#B5FF4D"
        stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

## LOGO SELECTION RULES

FULL LOCKUP → use when:
  ✓ Workspace topbar (light variant, height 36px, left-aligned)
  ✓ Marketing hero / landing page sections
  ✓ Footer (dark variant)
  ✓ Auth pages (sign in / sign up) — centered above form
  ✓ Email headers / onboarding screens
  ✓ Dashboard page headers

ICON MARK → use when:
  ✓ Quiz shell topbar (Learner mode, 32–44px)
  ✓ Mobile navigation bar (≤ 768px)
  ✓ Browser favicon (16 / 32 / 64px)
  ✓ Splash / loading screen (64–80px, centered)
  ✓ Bottom tab bar, avatar context, card headers

LETTER MARK → use when:
  ✓ Hero decorative background element (opacity .06–.12, pointer-events:none)
  ✓ Watermarks on certificates and exported PDFs
  ✓ Posters, print materials, large-format branding

## POSITIONING & SIZING RULES

Workspace topbar (MODE 1)
  Position    → Full lockup, left-aligned, height 36px, 24–32px from left edge
  Breakpoint  → ≤ 768px: show icon (32px) only, hide wordmark
  Clear space → min 1× icon height on all four sides

Quiz shell topbar (MODE 2)
  Position    → Icon mark, left side, 32–44px
  Topbar also carries: progress bar (center) + question counter (right)
  Do NOT show full lockup in learner mode — too much chrome

Hero / marketing (MODE 3)
  Full lockup centered, margin-bottom 32px before headline
  Letter mark may float behind content: opacity .06–.1, 300–500px, blurred

Auth pages
  Icon 56px OR full lockup 40px height, centered above form card, margin-bottom 24px

Loading / splash
  Icon centered, 64–80px, with slim indigo→lime progress bar below

Footer
  Full lockup dark variant, 32–36px height, left column (multi-col) or centered (simple)

Dashboard sidebar (desktop)
  Expanded   → Full lockup, 32px height, top of sidebar, 20px padding
  Collapsed  → Icon only, 28px

## TYPOGRAPHY

  Primary font : Plus Jakarta Sans  (import from Google Fonts)
  Fallback     : system-ui, -apple-system, Arial, sans-serif
  Mono         : JetBrains Mono or system monospace

Type scale:
  Display      : clamp(2.25rem, 4vw, 3.5rem) / lh 1.08 / w 700–800 → Marketing hero only
  Page title   : 2rem / lh 1.2 / w 700                              → Workspace page title
  Section      : 1.5rem / lh 1.3 / w 650–700                       → Content sections
  Card title   : 1.125rem / lh 1.35 / w 600–700                    → Resource cards
  Question     : clamp(1.25rem, 2.4vw, 2rem) / lh 1.35 / w 600–700 → Learner quiz prompt
  Body         : 1rem / lh 1.5 / w 400                              → Standard content
  Body small   : 0.875rem / lh 1.45 / w 400–500                    → Helper text, metadata
  Label        : 0.75rem / lh 1.4 / w 600                          → Compact labels
  Button       : 0.9375rem / lh 1.2 / w 600                        → Action labels

Rules:
  → Sentence case for headings, buttons, tabs, labels (no ALL CAPS on long strings)
  → Question text must be visually dominant over timers and metadata
  → Never truncate a question or answer in a way that changes its meaning — wrap instead
  → Line length: 45–80 characters for workspace copy

## SPACING SYSTEM (4px base unit)

  --space-1  :  4px  → Icon-to-label gap, micro-spacing
  --space-2  :  8px  → Compact controls, small internal gaps
  --space-3  : 12px  → Input padding, tight card spacing
  --space-4  : 16px  → Standard component padding
  --space-5  : 20px  → Medium groups
  --space-6  : 24px  → Card padding, section gaps
  --space-8  : 32px  → Major component separation
  --space-10 : 40px  → Section separation
  --space-12 : 48px  → Large content gaps
  --space-16 : 64px  → Marketing section rhythm

## BORDER RADIUS

  --radius-sm   :   6px  → Tags, compact controls
  --radius-md   :   8px  → Inputs, secondary buttons
  --radius-lg   :  12px  → Resource cards, menus
  --radius-xl   :  16px  → Large panels, answer tiles
  --radius-2xl  :  24px  → Marketing panels, prominent illustrations
  --radius-pill : 999px  → Avatars, counters, pill badges, selected filters

## ELEVATION & SHADOWS

  --shadow-sm : 0 1px 2px  rgb(28 18 40 / 6%)   → Ordinary cards
  --shadow-md : 0 4px 14px rgb(28 18 40 / 9%)   → Interactive / elevated card
  --shadow-lg : 0 12px 32px rgb(28 18 40 / 14%) → Dialogs, popovers

  Rule: prefer subtle borders on ordinary cards; use shadow only when card is elevated
  or interactive. Avoid a workspace that looks like a stack of floating cards.

## COMPONENT SPECIFICATIONS

### Buttons
  Primary     : brand-filled (#5856F8), one per clear context
  Secondary   : neutral surface + border, secondary actions
  Tertiary    : low-chrome text/icon, toolbar repeated rows
  Destructive : error color (#C9364F) + explicit label
  Quiz action : high-visibility, gradient bg, for Join / Start / Next / Submit

  States: default → hover → focus-visible → active → disabled → loading → success
  - Loading buttons retain width and label; prevent duplicate submission
  - Disabled must look disabled AND expose disabled state to assistive tech
  - NEVER use only a color shift for focus — always show a focus ring (#286FE8)

### Answer Option Tiles (Learner mode)
  Structure   : [letter marker] + [answer text] + [optional media]
  Border-radius: --radius-xl (16px)
  Min height  : 56px desktop, 64px mobile (never shrink in timed mode)
  
  States:
  - Default   : solid answer color (--answer-blue/teal/gold/orange)
  - Hover     : filter:brightness(1.08)
  - Focus     : 2px outline in --color-focus, offset 2px
  - Selected  : border or glow, accessible selected state
  - Correct   : green overlay + checkmark icon + accessible label
  - Incorrect : error overlay + X icon + accessible label
  
  Rules:
  → Never shrink answer tiles or text as timer runs down
  → For multiple-select: clearly signal "select all that apply"
  → Do NOT communicate correctness through color alone — always add icon + text
  → Preserve answer-to-color mapping throughout one activity

### Resource Cards (Workspace mode)
  Contains: [thumbnail 16:9] + [title wrap] + [type badge] + [metadata] + [primary action] + [overflow menu]
  Border-radius: --radius-lg (12px)
  Border: 1px solid --color-border; shadow on hover: --shadow-md
  
  Rules:
  → Keep card heights aligned in grid where practical; allow title to wrap
  → Place metadata beneath title, not scattered across the card
  → Provide: loading skeleton, empty state, and error state

### Progress Indicator & Timer (Learner mode)
  Progress bar: linear, indigo→lime gradient, height 4px, in quiz topbar
  Always pair with text: "Question 4 of 12"
  Timer: visible, legible; NOT the only low-time signal — add color + text change
  → Avoid rapid flashing or excessive motion when time is low
  → If paused, show clear paused state

### Text Fields & Join-Code Entry
  Label: always visible (never placeholder-only)
  Join code: large, easy-to-read field, uppercase transform if codes are case-insensitive
  Focus ring: 2px solid --color-focus
  Validate after entry or submit; explain how to fix — no blame language

### Dialogs & Confirmations
  Use for: focused decisions, destructive confirmations, short sub-tasks
  NOT for: routine information that fits inline
  → Move focus into dialog on open; trap focus while modal
  → Close with Escape when safe; restore focus to trigger on close
  → Explicit action labels (e.g. "Delete quiz" not "OK")

### Toast / Inline Feedback
  Success  → concise confirmation + next action
  Error    → what went wrong + how to fix it
  Warning  → consequence before risky action
  Info     → context without interrupting task
  → Toasts must NOT contain critical instructions that disappear before reading
  → Use persistent inline errors for form correction

## LAYOUT PATTERNS

### Workspace shell (MODE 1)
  Desktop: persistent left sidebar nav + topbar + flexible main content area
  Mobile:  collapsible sidebar (hamburger); topbar shows icon + page title
  Gutter:  24–32px desktop; 16px mobile
  Max content width: 1280px
  Topbar: kuis full lockup left, search center-right, account/actions right

### Learner frame
  Quizzes, Unlimited, Leaderboard, and result pages use a full-width dark frame
  No sidebar. Header: lockup, Quizzes / Unlimited / Leaderboard (Admin for admins), user pill, Log out
  Background: purple field, blurred color blobs, and two drifting quiz-doodle layers
  Panels: dark glass with a purple glow. Admin routes keep the light sidebar workspace

### Learner quiz shell (MODE 2)
  Dark/themed background fills the viewport, with the same moving doodle field
  Topbar: kuis icon left | progress bar center | question X/Y and timer right
  Leave a run with Finish or Submit. There is no Exit control
  A timed run shows Time's up before the result page
  Question title sits inside the panel and wraps. Selected answers use border and highlight only
  Question panel: centered, max-width 720px, large type, strong visual grouping
  Answer grid: 2-col desktop; 1-col mobile when tiles would be cramped
  No workspace nav, sidebars, or report elements during active answering

### Join page (MODE 2 → 3)
  Brand mark + title centered
  ONE dominant join-code field (large, easy-to-type)
  Primary "Gabung" / "Join" action directly tied to field
  Sign-in / help actions secondary
  Optimized for mobile, pasted codes, keyboard submission

### Resource library (MODE 1)
  Page title + primary "Buat" / "Create" action
  Search bar prominent near top
  Filters/tabs: type, ownership, subject, status
  Empty state with create/import action

### Quiz authoring (MODE 1)
  Persistent title + save/publish status badge
  Main canvas: question/slide editing
  Context panel: settings, question details
  Autosave: clearly distinguish "Menyimpan…" / "Tersimpan" / "Gagal simpan"

### Teacher report (MODE 1)
  Summary metrics first, then question/student drill-down
  Clear cohort, activity, and date context
  Labels on axes, units, and groups — provide text alternative for charts
  Color must NOT be the sole signal for student performance

## MOTION & ANIMATION

  --motion-fast   : 120ms  → Hover, focus, toggle
  --motion-normal : 180ms  → Answer selection, card open, menu
  --motion-slow   : 240ms  → Page transitions, celebration reveals
  --ease-standard : cubic-bezier(0.2, 0, 0, 1)

  Rules:
  → Use motion to communicate cause and effect: selection, progress, completion
  → ALWAYS respect prefers-reduced-motion — provide static/reduced alternative
  → Reserve confetti/celebration for milestones, not every small action
  → Never delay answering a learner's action with decorative motion
  → One orchestrated moment per screen (load or reveal) is enough
  → Avoid fade-and-slide-up on every section — reads as generic AI output

## ACCESSIBILITY (non-negotiable)

  → Target WCAG 2.2 AA for all new UI
  → Text contrast: min 4.5:1 normal, 3:1 large text
  → NEVER use color alone to communicate correctness, status, or errors
  → All interactive controls keyboard-accessible with visible focus ring
  → Semantic HTML: headings, landmarks, labels, meaningful icon-button names
  → Informative images: useful alt text; decorative: aria-hidden="true"
  → Support text zoom and reflow without loss of content/function
  → No fixed heights that clip translated text, captions, or enlarged answers
  → Avoid autoplay audio; provide captions/transcripts for media
  → Plain-language, specific, non-punitive error messages
  → Timer-based: clear timing info shown upfront; respect accommodations

  Learner supports to implement where scope allows:
  → Read-aloud / text-to-speech
  → UI and content translation (Bahasa Indonesia priority)
  → Dyslexia-friendly font toggle
  → Adjustable text size and line/letter spacing
  → Reduced-distraction mode (optional hiding of competitive elements)
  → Sound effects and music on/off

## GRADIENTS

  Brand gradient (icon, button fills, accents):
    linear-gradient(135deg, #5856F8 0%, #9333EA 100%)

  Hero background glow:
    radial-gradient(ellipse 80% 50% at 20% 10%, rgba(88,86,248,.18) 0%, transparent 55%)

  Progress / loader accent:
    linear-gradient(90deg, #5856F8, #B5FF4D)

  Quiz topbar bg:
    linear-gradient(160deg, #0E0B2E, #1A1248)

## WHAT NOT TO DO

  ✗ Never stretch, rotate, recolor, or rebuild the logo from text
  ✗ Never use ALL CAPS for the brand name — always lowercase "kuis"
  ✗ Never mix MODE 1 (light workspace) and MODE 2 (dark quiz canvas) visuals on one screen
  ✗ Never communicate correctness through color alone — always add icon + text label
  ✗ Never shrink answer tiles or text as the timer counts down
  ✗ Never use --color-accent lime (#B5FF4D) as a large background fill
  ✗ Never place full lockup in the quiz shell topbar (icon only there)
  ✗ Never use placeholder-only labels for any input field
  ✗ Never apply drop-shadow directly to the icon SVG (it has its own gradient bg)
  ✗ Never use only color shift for focus states — always show the focus ring
  ✗ Never truncate question or answer text in ways that change the meaning

## CSS TOKEN STARTER

:root {
  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, monospace;

  /* Brand */
  --color-brand-50: #eeecff;  --color-brand-100: #dad8ff;
  --color-brand-500: #5856f8; --color-brand-600: #4644d6;
  --color-brand-700: #3533b4;
  --color-secondary-500: #9333ea; --color-accent: #b5ff4d;

  /* Dark canvas */
  --color-purple-950: #07051a; --color-purple-900: #0e0b2e;
  --color-purple-800: #1a1248; --color-purple-700: #2a1b6e;

  /* Neutrals */
  --color-text-primary: #24232d; --color-text-secondary: #62616f;
  --color-text-muted: #767582;   --color-text-inverse: #ffffff;
  --color-bg: #ffffff;           --color-bg-subtle: #f7f7fa;
  --color-border: #e4e3ea;       --color-border-strong: #c9c7d3;
  --color-focus: #286fe8;

  /* Semantic */
  --color-success: #168653; --color-success-bg: #e8f7ef;
  --color-error: #c9364f;   --color-error-bg: #fff0f1;
  --color-warning: #946200; --color-warning-bg: #fff5d9;
  --color-info: #286fe8;    --color-info-bg: #edf4ff;

  /* Quiz answers */
  --answer-blue: #3f78b5; --answer-teal: #459d9b;
  --answer-gold: #d8a638; --answer-orange: #e66b35;
  --answer-purple: #8350c8; --answer-pink: #d94788;

  /* Spacing */
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-5:20px; --space-6:24px; --space-8:32px; --space-10:40px;
  --space-12:48px; --space-16:64px;

  /* Radius */
  --radius-sm:6px; --radius-md:8px; --radius-lg:12px;
  --radius-xl:16px; --radius-2xl:24px; --radius-pill:999px;

  /* Elevation */
  --shadow-sm:0 1px 2px rgb(28 18 40/6%);
  --shadow-md:0 4px 14px rgb(28 18 40/9%);
  --shadow-lg:0 12px 32px rgb(28 18 40/14%);

  /* Motion */
  --motion-fast:120ms; --motion-normal:180ms; --motion-slow:240ms;
  --ease-standard:cubic-bezier(0.2,0,0,1);

  /* Layout */
  --control-height:44px; --content-max:1280px;
}

# ═══════════════════════════════════════════════════════════════
# END OF KUIS DESIGN SYSTEM PROMPT  v2
# Brand Identity × Wayground-Inspired Structural Patterns
# ═══════════════════════════════════════════════════════════════