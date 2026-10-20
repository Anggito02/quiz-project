import type { CSSProperties } from "react";

const ICON_SRC = "/DirmanQuiz-Logo-Kit/SVG/dirmanquiz-icon.svg";
const LETTER_SRC = "/DirmanQuiz-Logo-Kit/SVG/dirmanquiz-lettermark.svg";
const LOGO_LIGHT_SRC = "/DirmanQuiz-Logo-Kit/SVG/dirmanquiz-logo-light.svg";
const LOGO_DARK_SRC = "/DirmanQuiz-Logo-Kit/SVG/dirmanquiz-logo-dark.svg";

const LOGO_ASPECT = 900 / 220;
const MOBILE_QUERY = "(max-width: 767px)";

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
  return <img className="letter-mark" src={LETTER_SRC} width={400} height={400} alt="" />;
}

// One <picture> per lockup: a hidden <img> would still download.
// "compact" is the collapsed sidebar, which turns back into a full drawer on small screens.
export function KuisLockup({
  tone = "onLight",
  markSize = 36,
  variant = "responsive",
}: {
  tone?: "onLight" | "onDark";
  markSize?: number;
  variant?: "responsive" | "full" | "compact";
}) {
  const logoSrc = tone === "onDark" ? LOGO_DARK_SRC : LOGO_LIGHT_SRC;
  const logoWidth = Math.round(markSize * LOGO_ASPECT);
  const style = { "--lockup-size": `${markSize}px` } as CSSProperties;

  if (variant === "full") {
    return (
      <span className={`lockup lockup-${tone}`} style={style}>
        <img
          className="lockup-img"
          src={logoSrc}
          width={logoWidth}
          height={markSize}
          alt="Dirman Quiz"
        />
      </span>
    );
  }

  const compact = variant === "compact";

  return (
    <span className={`lockup lockup-${tone}`} style={style}>
      <picture>
        <source
          media={MOBILE_QUERY}
          srcSet={compact ? logoSrc : ICON_SRC}
          width={compact ? logoWidth : markSize}
          height={markSize}
        />
        <img
          className="lockup-img"
          src={compact ? ICON_SRC : logoSrc}
          width={compact ? markSize : logoWidth}
          height={markSize}
          alt="Dirman Quiz"
        />
      </picture>
    </span>
  );
}
