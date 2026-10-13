"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Heart,
  ListChecks,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Timer,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { logOut } from "@/app/auth/logout";
import type { SessionProfile } from "@/lib/session";
import { AmbientBackdrop } from "./ambient-backdrop";
import { KuisLockup, KuisMark } from "./kuis-mark";

function navClass(pathname: string, href: string) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return active ? "nav-link is-active" : "nav-link";
}

function pageTitle(pathname: string) {
  if (pathname.startsWith("/admin/quizzes")) return "Quiz builder";
  if (pathname.startsWith("/admin/courses")) return "Courses";
  if (pathname.startsWith("/admin/classes")) return "Classes";
  if (pathname.startsWith("/admin/roster")) return "Roster";
  if (pathname.startsWith("/admin/leaderboard")) return "Leaderboard";
  if (pathname.startsWith("/leaderboard")) return "Leaderboard";
  if (pathname.startsWith("/unlimited")) return "Unlimited";
  if (pathname.startsWith("/quizzes")) return "Quizzes";
  return "kuis";
}

function AccountActions({ profile }: { profile: SessionProfile | null }) {
  if (profile) {
    return (
      <div className="topbar-actions">
        <span className="muted">{profile.displayName}</span>
        <form action={logOut}>
          <button className="btn btn-ghost btn-sm" type="submit">
            Log out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="topbar-actions">
      <Link className="btn btn-inverse btn-sm" href="/login">
        Log in
      </Link>
      <Link className="btn btn-quiz btn-sm" href="/signup">
        Sign up
      </Link>
    </div>
  );
}

function Sidebar({
  profile,
  pathname,
  open,
  collapsed,
  onNavigate,
  onToggleCollapsed,
}: {
  profile: SessionProfile;
  pathname: string;
  open: boolean;
  collapsed: boolean;
  onNavigate: () => void;
  onToggleCollapsed: () => void;
}) {
  const item = (href: string, label: string, icon: React.ReactNode) => (
    <Link
      className={navClass(pathname, href)}
      href={href}
      aria-label={collapsed ? label : undefined}
      onClick={onNavigate}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <aside
      id="workspace-nav"
      className={`sidebar${open ? " is-open" : ""}${collapsed ? " is-collapsed" : ""}`}
    >
      <div className="sidebar-head">
        <Link href="/" onClick={onNavigate} aria-label="Dirman Quiz home">
          <KuisLockup markSize={32} />
        </Link>
        <button
          className="btn btn-ghost btn-sm sidebar-collapse"
          type="button"
          aria-expanded={!collapsed}
          aria-controls="workspace-nav"
          onClick={onToggleCollapsed}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" size={18} />
          ) : (
            <PanelLeftClose aria-hidden="true" size={18} />
          )}
          <span className="sr-only">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
        </button>
      </div>
      <nav className="sidebar-nav" aria-label="Main">
        <p className="sidebar-label">Learn</p>
        {item("/quizzes", "Quizzes", <ListChecks aria-hidden="true" size={18} />)}
        {item("/unlimited", "Unlimited", <Timer aria-hidden="true" size={18} />)}
        {item("/leaderboard", "Leaderboard", <Trophy aria-hidden="true" size={18} />)}
        {profile.role === "admin" ? (
          <>
            <p className="sidebar-label">Manage</p>
            {item("/admin/quizzes", "Quiz builder", <PenLine aria-hidden="true" size={18} />)}
            {item("/admin/courses", "Courses", <BookOpen aria-hidden="true" size={18} />)}
            {item("/admin/classes", "Classes", <Users aria-hidden="true" size={18} />)}
            {item("/admin/roster", "Roster", <ClipboardList aria-hidden="true" size={18} />)}
            {item("/admin/leaderboard", "Leaderboard", <Trophy aria-hidden="true" size={18} />)}
          </>
        ) : null}
      </nav>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <KuisLockup tone="onDark" markSize={40} />
      <span className="footer-credit">
        <span>Made with Love</span>
        <Heart aria-hidden="true" size={14} strokeWidth={1.75} />
        <span>by G3 Dirman Development Team</span>
      </span>
    </footer>
  );
}

export function AppChrome({
  profile,
  children,
}: {
  profile: SessionProfile | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const marketing = pathname === "/" || pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("kuis-sidebar-collapsed") === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("kuis-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  }

  if (marketing || !profile) {
    return (
      <div className="marketing-frame">
        <AmbientBackdrop />
        <header className="marketing-header">
          <Link href="/" aria-label="Dirman Quiz home">
            <KuisLockup tone="onDark" markSize={52} />
          </Link>
          <AccountActions profile={profile} />
        </header>
        {children}
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-frame">
      {menuOpen ? (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <Sidebar
        profile={profile}
        pathname={pathname}
        open={menuOpen}
        collapsed={collapsed}
        onNavigate={() => setMenuOpen(false)}
        onToggleCollapsed={toggleCollapsed}
      />
      <div className="app-column">
        <header className="topbar">
          <button
            className="btn btn-ghost btn-sm menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="workspace-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          </button>
          <Link className="topbar-mark" href="/" aria-label="Dirman Quiz home">
            <KuisMark size={32} />
          </Link>
          <p className="topbar-title">{pageTitle(pathname)}</p>
          <AccountActions profile={profile} />
        </header>
        {children}
        <Footer />
      </div>
    </div>
  );
}
