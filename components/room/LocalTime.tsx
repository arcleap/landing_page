"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// A time in the reader's own time zone. The server doesn't know it, so the
// first paint shows UTC and the browser swaps in local time.
export function LocalTime({ t }: { t: number }) {
  const local = useSyncExternalStore(subscribe, () => true, () => false);
  const date = new Date(t);
  const text = local
    ? date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : `${date.toISOString().slice(5, 16).replace("T", " ")} UTC`;
  return <time dateTime={date.toISOString()}>{text}</time>;
}
