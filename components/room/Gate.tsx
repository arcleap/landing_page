"use client";

import { useActionState } from "react";
import type { EnterState } from "@/lib/room-gate";

// A passcode form. `invite` is the token of the investor link it was opened from.
export function Gate({
  action: enter,
  invite,
  label = "Passcode",
}: {
  action: (state: EnterState, formData: FormData) => Promise<EnterState>;
  invite?: string;
  label?: string;
}) {
  const [state, action, pending] = useActionState<EnterState, FormData>(enter, {});

  return (
    <form className="gate" action={action}>
      {invite ? <input type="hidden" name="invite" value={invite} /> : null}
      <label className="gate-label" htmlFor="room-code">
        {label}
      </label>
      <div className="gate-row">
        {/* Masked, so it can't be read off a shared screen; a password manager can keep it. */}
        <input
          id="room-code"
          className="gate-input"
          name="code"
          type="password"
          required
          maxLength={64}
          autoComplete="current-password"
          spellCheck={false}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "room-error" : undefined}
        />
        <button className="button gate-button" type="submit" disabled={pending}>
          <span>{pending ? "Checking" : "Unlock"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="gate-error" id="room-error" role="alert">
        {state.error}
      </p>
    </form>
  );
}
