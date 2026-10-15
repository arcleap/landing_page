"use client";

import { useActionState } from "react";
import { enter, type EnterState } from "@/app/room/actions";

export function Gate() {
  const [state, action, pending] = useActionState<EnterState, FormData>(enter, {});

  return (
    <form className="gate" action={action}>
      <label className="gate-label" htmlFor="room-code">
        Passcode
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
