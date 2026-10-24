"use client";

// A submit button that asks first.
export function Confirm({ label, question }: { label: string; question: string }) {
  return (
    <button
      type="submit"
      className="act-action act-danger"
      onClick={(event) => {
        if (!window.confirm(question)) event.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
