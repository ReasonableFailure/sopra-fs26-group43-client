"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import styles from "@/styles/expandableText.module.css";

interface ExpandableTextProps {
  text: string;
  /** Number of lines to clamp to before truncating. Defaults to 3. */
  lines?: number;
  /**
   * When provided, "Show more" calls this instead of expanding inline.
   * Use this when a dedicated detail page or modal is the right
   * destination for the full text (e.g., a dashboard teaser linking to
   * /news). Omit it to get the default inline expand/collapse toggle.
   */
  onShowMore?: () => void;
  /** Applied to the wrapper; typography styles inherit down to the text. */
  className?: string;
}

/**
 * Clamps a body of text to N lines and surfaces a toggle only when the
 * text actually overflows — short strings render with no extra UI.
 *
 * Overflow is measured against the clamped element (scrollHeight vs.
 * clientHeight) and re-checked on every container resize via
 * ResizeObserver, so the toggle appears/disappears correctly when the
 * card width changes (responsive layouts, sidebar collapses, etc.).
 */
export function ExpandableText({
  text,
  lines = 3,
  onShowMore,
  className,
}: ExpandableTextProps) {
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const check = () => {
      // Only measure while collapsed; an expanded element has no clamp
      // so scrollHeight always equals clientHeight, which would falsely
      // hide the toggle and prevent the user from collapsing again.
      if (expanded) return;
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, lines, expanded]);

  const showToggle = overflows || expanded;

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    // The component is often rendered inside clickable cards. Without
    // stopPropagation, clicking the toggle would also fire the card's
    // navigation handler.
    e.stopPropagation();
    if (onShowMore) {
      onShowMore();
      return;
    }
    setExpanded((v) => !v);
  };

  return (
    <div className={className}>
      <p
        ref={textRef}
        className={expanded ? styles.expanded : styles.clamped}
        style={{ "--lines": lines } as CSSProperties}
      >
        {text}
      </p>
      {showToggle && (
        <button
          type="button"
          className={styles.toggle}
          onClick={handleToggle}
        >
          {onShowMore
            ? "Show more"
            : expanded
            ? "Show less"
            : "Show more"}
        </button>
      )}
    </div>
  );
}
