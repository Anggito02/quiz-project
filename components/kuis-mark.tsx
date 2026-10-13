import type { CSSProperties } from "react";

const ICON_SRC = "/DirmanQuiz-Logo-Kit/SVG/dirmanquiz-icon.svg";
const LETTER_SRC = "/DirmanQuiz-Logo-Kit/SVG/dirmanquiz-lettermark.svg";
const LOGO_LIGHT_SRC = "/DirmanQuiz-Logo-Kit/SVG/dirmanquiz-logo-light.svg";
const LOGO_DARK_SRC = "/DirmanQuiz-Logo-Kit/SVG/dirmanquiz-logo-dark.svg";

export function KuisMark({ size = 40 }: { size?: number }) {
  return (
    <img
      className="mark"
      src={ICON_SRC}
      width={size}
      height={size}
      alt=""
    />
  );
}

export function KuisLetterMark() {
  return <img className="letter-mark" src={LETTER_SRC} alt="" />;
}

export function KuisLockup({
  tone = "onLight",
  markSize = 36,
}: {
  tone?: "onLight" | "onDark";
  markSize?: number;
}) {
  return (
    <span
      className={`lockup lockup-${tone}`}
      style={{ "--lockup-size": `${markSize}px` } as CSSProperties}
    >
      <img className="lockup-icon" src={ICON_SRC} width={markSize} height={markSize} alt="" />
      <img
        className="lockup-full"
        src={tone === "onDark" ? LOGO_DARK_SRC : LOGO_LIGHT_SRC}
        alt="Dirman Quiz"
      />
    </span>
  );
}
