"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PENDING_EVENT = "kuis:search-params-pending";

export function markSearchParamsPending() {
  window.dispatchEvent(new Event(PENDING_EVENT));
}

function samePathQueryHref(pathname: string, href: string) {
  try {
    const url = new URL(href, window.location.origin);
    return url.pathname === pathname;
  } catch {
    return false;
  }
}

export function SearchParamsPending({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
  }, [pathname, query]);

  useEffect(() => {
    function onPending() {
      setPending(true);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (!samePathQueryHref(pathname, href)) return;
      const next = new URL(href, window.location.origin);
      const nextQuery = next.searchParams.toString();
      if (nextQuery === query) return;
      setPending(true);
    }

    function onSubmit(event: Event) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if ((form.getAttribute("method") ?? "get").toLowerCase() !== "get") return;
      const action = form.getAttribute("action") || pathname;
      if (!samePathQueryHref(pathname, action)) return;
      setPending(true);
    }

    window.addEventListener(PENDING_EVENT, onPending);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      window.removeEventListener(PENDING_EVENT, onPending);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [pathname, query]);

  return (
    <>
      <div hidden={pending} aria-hidden={pending || undefined}>
        {children}
      </div>
      {pending ? fallback : null}
    </>
  );
}
