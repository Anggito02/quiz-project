"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { useEffect, useRef } from "react";

function PendingMark() {
  const { pending } = useLinkStatus();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const link = ref.current?.closest("a");
    if (link instanceof HTMLAnchorElement) link.ariaBusy = pending ? "true" : "false";
  }, [pending]);

  return (
    <span
      ref={ref}
      className={pending ? "link-spinner" : "link-spinner is-idle"}
      aria-hidden="true"
    />
  );
}

export function PendingLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link className={className} href={href} onClick={onClick}>
      {children}
      <PendingMark />
    </Link>
  );
}
