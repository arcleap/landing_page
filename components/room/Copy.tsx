"use client";

import { useEffect, useState } from "react";

// Copies `text`, and says so for a moment.
export function Copy({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className="act-action"
      onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true), () => {})}
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
