"use client";

import { useActionState } from "react";
import { enter, type EnterState } from "@/app/room/actions";

export function Gate() {
  const [state, action, pending] = useActionState<EnterState, FormData>(enter, {});

  return (
    <form className="gate" action={action}>
      <label className="gate-label" htmlFor="room-code">
        Access code
      </label>
      <div className="gate-row">
        <input
          id="room-code"
          className="gate-input"
          name="code"
          type="text"
          required
          maxLength={64}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="XXXX-XXXX-XXXX"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "room-error" : undefined}
        />
        <button className="button gate-button" type="submit" disabled={pending}>
          <span>{pending ? "Checking" : "Enter"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="gate-error" id="room-error" role="alert">
        {state.error}
      </p>
    </form>
  );
}
