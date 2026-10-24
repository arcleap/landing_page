"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { watch } from "@/components/room/watch";
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

// The parts of the YouTube IFrame API used to follow playback. The player
// itself stays YouTube's own, with its usual controls.
type YouTubePlayer = { getCurrentTime(): number; getDuration(): number };
type YouTubeApi = {
  Player: new (frame: HTMLIFrameElement, options: { events: { onStateChange(event: { data: number }): void } }) => YouTubePlayer;
};
const PLAYING = 1;
const ENDED = 0;

let youtubeApi: Promise<YouTubeApi> | undefined;

function loadYouTube(): Promise<YouTubeApi> {
  youtubeApi ??= new Promise((resolve) => {
    const w = window as Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void };
    if (w.YT?.Player) return resolve(w.YT);
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (w.YT) resolve(w.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.append(script);
  });
  return youtubeApi;
}

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      const stored = Number(localStorage.getItem(storageKey(video.key)));
      if (stored >= MIN) setSize(stored);
    } catch {
      // Default size.
    }
  }, [video.key]);

  // Reports how much of the video is watched, for the room's activity log.
  useEffect(() => {
    const file = videoRef.current;
    if (file) {
      const tracker = watch(video.key, () => file.duration);
      const handlers: [string, () => void][] = [
        ["playing", () => tracker.playing(file.currentTime)],
        ["timeupdate", () => tracker.time(file.currentTime)],
        ["pause", () => tracker.paused()],
        ["waiting", () => tracker.paused()],
        ["ended", () => tracker.ended()],
      ];
      for (const [type, handler] of handlers) file.addEventListener(type, handler);
      return () => {
        for (const [type, handler] of handlers) file.removeEventListener(type, handler);
        tracker.close();
      };
    }

    const frame = iframeRef.current;
    if (!frame) return;
    let player: YouTubePlayer | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    let closed = false;
    const tracker = watch(video.key, () => player?.getDuration() ?? 0);
    const stopPolling = () => {
      clearInterval(poll);
      poll = undefined;
    };
    loadYouTube().then((api) => {
      if (closed) return;
      player = new api.Player(frame, {
        events: {
          onStateChange({ data }) {
            if (!player) return;
            if (data === PLAYING) {
              tracker.playing(player.getCurrentTime());
              poll ??= setInterval(() => player && tracker.time(player.getCurrentTime()), 1000);
              return;
            }
            stopPolling();
            if (data === ENDED) tracker.ended();
            else tracker.paused();
          },
        },
      });
    });
    return () => {
      closed = true;
      stopPolling();
      tracker.close();
    };
  }, [video.key]);

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
      remember(video.key, width);
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
    remember(video.key, width);
  };

  const reset = () => {
    setSize(null);
    remember(video.key, null);
  };

  return (
    <li ref={itemRef} className="room-video">
      <div ref={frameRef} className="room-frame">
        {video.file ? (
          // Served only to an unlocked room, from a link that expires (app/room/video).
          <video
            ref={videoRef}
            src={`/room/video/${index + 1}`}
            aria-label={video.title}
            controls
            controlsList="nodownload"
            playsInline
            preload="metadata"
            onContextMenu={(event) => event.preventDefault()}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${video.youtube}?rel=0&playsinline=1&enablejsapi=1`}
            title={video.title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          />
        )}
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
