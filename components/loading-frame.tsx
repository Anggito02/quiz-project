function Bone({ className }: { className: string }) {
  return <span className={`skeleton ${className}`} />;
}

function LoadingShell({
  tone = "dark",
  className = "page",
  children,
}: {
  tone?: "dark" | "light";
  className?: string;
  children: React.ReactNode;
}) {
  const toneClass = tone === "light" ? " loading-frame is-light" : " loading-frame";
  return (
    <main className={`${className}${toneClass}`} aria-busy="true">
      <p className="sr-only">Loading</p>
      <div aria-hidden="true">{children}</div>
    </main>
  );
}

function CardGrid() {
  return (
    <ul className="card-grid">
      {Array.from({ length: 6 }, (_, index) => (
        <li className="resource-card skeleton-card" key={index}>
          <Bone className="skeleton-pill" />
          <Bone className="skeleton-title" />
          <Bone className="skeleton-line" />
          <Bone className="skeleton-line is-short" />
          <span className="skeleton-actions">
            <Bone className="skeleton-button is-sm" />
            <Bone className="skeleton-button is-sm" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function QuizCardsLoading() {
  return (
    <section className="course-group" aria-busy="true">
      <p className="sr-only">Loading quizzes</p>
      <div aria-hidden="true">
        <CardGrid />
      </div>
    </section>
  );
}

function TableRows({ count = 5 }: { count?: number }) {
  return (
    <div className="table-wrap">
      <div className="skeleton-table">
        {Array.from({ length: count }, (_, index) => (
          <div className="skeleton-table-row" key={index}>
            <Bone className="skeleton-line" />
            <Bone className="skeleton-line" />
            <Bone className="skeleton-line is-short" />
            <Bone className="skeleton-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuizzesLoading() {
  return (
    <LoadingShell>
      <Bone className="skeleton-title is-page" />
      <Bone className="skeleton-line is-lede" />
      <div className="tab-row">
        {Array.from({ length: 4 }, (_, index) => (
          <Bone className="skeleton-pill" key={index} />
        ))}
      </div>
      <div className="search-row">
        <Bone className="skeleton-input" />
        <Bone className="skeleton-button" />
      </div>
      <div className="course-group">
        <CardGrid />
      </div>
    </LoadingShell>
  );
}

export function QuizStartLoading() {
  return (
    <LoadingShell className="page quiz-detail">
      <section className="board-panel quiz-start-card">
        <Bone className="skeleton-pill" />
        <Bone className="skeleton-title is-page" />
        <Bone className="skeleton-line" />
        <Bone className="skeleton-line is-short" />
        <Bone className="skeleton-title" />
        <div className="skeleton-list">
          <Bone className="skeleton-line" />
          <Bone className="skeleton-line" />
        </div>
        <div className="quiz-start-actions">
          <Bone className="skeleton-button" />
          <Bone className="skeleton-pill" />
        </div>
      </section>
    </LoadingShell>
  );
}

export function ResultLoading() {
  return (
    <LoadingShell>
      <div className="board-stack">
        <Bone className="skeleton-button" />
        <section className="board-panel">
          <Bone className="skeleton-title is-page" />
          <Bone className="skeleton-score" />
          <span className="skeleton-actions">
            <Bone className="skeleton-pill" />
            <Bone className="skeleton-pill" />
          </span>
          <Bone className="skeleton-line is-short" />
        </section>
        <section className="board-panel">
          <Bone className="skeleton-title is-page" />
          <div className="board-hero">
            <Bone className="skeleton-circle" />
            <Bone className="skeleton-line is-short" />
          </div>
          <TableRows />
        </section>
      </div>
    </LoadingShell>
  );
}

export function LeaderboardLoading({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <LoadingShell tone={tone}>
      <div className="board-stack">
        <section className="board-panel">
          <Bone className="skeleton-title is-page" />
          <Bone className="skeleton-line is-lede" />
          <div className="tab-row">
            {Array.from({ length: 3 }, (_, index) => (
              <Bone className="skeleton-pill" key={index} />
            ))}
          </div>
          <div className="tab-row">
            {Array.from({ length: 5 }, (_, index) => (
              <Bone className="skeleton-chip" key={index} />
            ))}
          </div>
          <Bone className="skeleton-input" />
          <div className="tab-row">
            {Array.from({ length: 3 }, (_, index) => (
              <Bone className="skeleton-pill" key={index} />
            ))}
          </div>
        </section>
        <section className="board-panel">
          <Bone className="skeleton-title is-page" />
          <Bone className="skeleton-title" />
          <TableRows />
        </section>
      </div>
    </LoadingShell>
  );
}

export function UnlimitedLoading() {
  return (
    <LoadingShell>
      <Bone className="skeleton-title is-page" />
      <Bone className="skeleton-line is-lede" />
      <Bone className="skeleton-line is-short" />
      <span className="skeleton-actions">
        <Bone className="skeleton-pill" />
        <Bone className="skeleton-pill" />
        <Bone className="skeleton-pill" />
      </span>
      <section className="card skeleton-form">
        <Bone className="skeleton-title" />
        <Bone className="skeleton-line" />
        <Bone className="skeleton-line" />
        <Bone className="skeleton-line is-short" />
        <Bone className="skeleton-button" />
      </section>
      <Bone className="skeleton-title" />
      <div className="skeleton-list">
        <Bone className="skeleton-line" />
        <Bone className="skeleton-line" />
        <Bone className="skeleton-line" />
      </div>
    </LoadingShell>
  );
}

export function BoardPageLoading() {
  return (
    <LoadingShell>
      <section className="board-panel">
        <Bone className="skeleton-pill" />
        <Bone className="skeleton-title is-page" />
        <div className="tab-row">
          {Array.from({ length: 3 }, (_, index) => (
            <Bone className="skeleton-pill" key={index} />
          ))}
        </div>
        <TableRows />
      </section>
    </LoadingShell>
  );
}

export function AdminLoading() {
  return (
    <LoadingShell tone="light">
      <Bone className="skeleton-title is-page" />
      <Bone className="skeleton-line is-lede" />
      <section className="card skeleton-form">
        <Bone className="skeleton-title" />
        <Bone className="skeleton-input" />
        <Bone className="skeleton-button" />
      </section>
      <div className="skeleton-list">
        {Array.from({ length: 4 }, (_, index) => (
          <Bone className="skeleton-line" key={index} />
        ))}
      </div>
    </LoadingShell>
  );
}
