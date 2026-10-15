"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import type { Video } from "@/lib/room";

// A video whose size is set by dragging its corner handle, from MIN up to the
// window's width. It scales from the centre, so the handle tracks the pointer.
// Each video remembers its size in this browser; double-click resets it.
// The size lives on the element as --room-w, set directly so a drag doesn't re-render.

const MIN = 320;
// Largest size: 16px from each side of the window, and short enough to fit
// below the 56px header with 16px to spare above and below.
const EDGE = 32;
const ABOVE_BELOW = 88;
const STEP = 0.05;
const storageKey = (id: string) => `arcleap-room-size:${id}`;
const pad = (n: number) => String(n).padStart(2, "0");

function remember(id: string, width: number | null) {
  try {
    if (width === null) localStorage.removeItem(storageKey(id));
    else localStorage.setItem(storageKey(id), String(Math.round(width)));
  } catch {
    // Sizes just don't persist when storage is unavailable.
  }
}

export function RoomVideo({ video, index }: { video: Video; index: number }) {
  const itemRef = useRef<HTMLLIElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const limit = (w: number) =>
    Math.min(Math.max(w, MIN), window.innerWidth - EDGE, ((window.innerHeight - ABOVE_BELOW) * 16) / 9);
  const current = () => itemRef.current?.getBoundingClientRect().width ?? MIN;
  // null returns to the default: the width of the grid.
  const setSize = (w: number | null) => {
    const item = itemRef.current;
    if (!item) return;
    if (w === null) item.style.removeProperty("--room-w");
    else item.style.setProperty("--room-w", `${Math.round(w)}px`);
  };

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(storageKey(video.id)));
      if (stored >= MIN) setSize(stored);
    } catch {
      // Default size.
    }
  }, [video.id]);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    const frame = frameRef.current;
    handle.setPointerCapture(event.pointerId);
    frame?.setAttribute("data-resizing", "");
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = current();
    let width = startWidth;

    const move = (e: globalThis.PointerEvent) => {
      // Centred, so the corner moves half the width change sideways and the full height change down.
      const byX = startWidth + 2 * (e.clientX - startX);
      const byY = startWidth + ((e.clientY - startY) * 16) / 9;
      width = limit(Math.abs(byX - startWidth) >= Math.abs(byY - startWidth) ? byX : byY);
      setSize(width);
    };
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      frame?.removeAttribute("data-resizing");
      if (width === startWidth) return;
      remember(video.id, width);
      itemRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = window.innerWidth * STEP;
    const sizes: Record<string, () => number> = {
      ArrowRight: () => current() + step,
      ArrowUp: () => current() + step,
      ArrowLeft: () => current() - step,
      ArrowDown: () => current() - step,
      Home: () => MIN,
      End: () => window.innerWidth,
    };
    const next = sizes[event.key];
    if (!next) return;
    event.preventDefault();
    const width = limit(next());
    setSize(width);
    remember(video.id, width);
  };

  const reset = () => {
    setSize(null);
    remember(video.id, null);
  };

  return (
    <li ref={itemRef} className="room-video">
      <div ref={frameRef} className="room-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&playsinline=1`}
          title={video.title}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
        <button
          type="button"
          className="room-handle"
          aria-label={`Resize ${video.title}. Arrow keys change the size; double-click resets.`}
          title="Drag to resize · double-click to reset"
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          onDoubleClick={reset}
        />
      </div>
      <div className="figure-caption">
        <span className="figure-label">FIG. {pad(index + 1)}</span>
        <span className="room-video-title">{video.title}</span>
        <span>{video.note}</span>
      </div>
    </li>
  );
}
