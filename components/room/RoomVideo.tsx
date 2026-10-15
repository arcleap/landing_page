"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Video } from "@/lib/room";
import { loadYouTube, YTState, type YTPlayer } from "@/lib/youtube";

// A YouTube video played through our own surface and controls. A transparent
// layer covers the player so YouTube never sees the pointer and never draws its
// hover chrome; clicks, the timeline and the caption buttons drive it through
// the IFrame API instead. A poster covers YouTube's start and end screens.
//
// The size is set by dragging the corner handle, from MIN up to the window's
// width or height. It scales from the centre, so the handle tracks the pointer.
// Each video remembers its size in this browser; double-click resets it.
// The size lives on the element as --room-w, set directly so a drag doesn't re-render.

const MIN = 320;
// Largest size: 16px from each side of the window, and short enough to fit
// below the 56px header with 16px to spare above and below.
const EDGE = 32;
const ABOVE_BELOW = 88;
const STEP = 0.05;
const SEEK = 5;
const storageKey = (id: string) => `arcleap-room-size:${id}`;
const pad = (n: number) => String(n).padStart(2, "0");
const clock = (s: number) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

function remember(id: string, width: number | null) {
  try {
    if (width === null) localStorage.removeItem(storageKey(id));
    else localStorage.setItem(storageKey(id), String(Math.round(width)));
  } catch {
    // Sizes just don't persist when storage is unavailable.
  }
}

// "ours": our surface and controls. "native": YouTube refused a play we asked
// for, so the surface steps aside and YouTube's player takes clicks.
// "embed": the API didn't load, so it's a plain YouTube embed.
type Mode = "ours" | "native" | "embed";

export function RoomVideo({ video, index }: { video: Video; index: number }) {
  const itemRef = useRef<HTMLLIElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  // Set when YouTube actually starts after we ask it to play.
  const startedRef = useRef(false);
  const [mode, setMode] = useState<Mode>("ours");
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<number>(YTState.UNSTARTED);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [full, setFull] = useState(false);
  const [poster, setPoster] = useState(`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`);
  const fallbackPoster = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

  const playing = state === YTState.PLAYING || state === YTState.BUFFERING;
  const covered = state === YTState.UNSTARTED || state === YTState.CUED || state === YTState.ENDED;

  // Size

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

  // Player

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let player: YTPlayer | null = null;
    // The API replaces the element it's given, so give it one React doesn't own.
    const mount = document.createElement("div");
    host.append(mount);

    loadYouTube().then(
      (YT) => {
        if (cancelled) return;
        player = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId: video.id,
          width: "100%",
          height: "100%",
          playerVars: {
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (cancelled || !player) return;
              playerRef.current = player;
              setReady(true);
              setMuted(player.isMuted());
              setDuration(player.getDuration());
            },
            onStateChange: ({ data }) => {
              setState(data);
              const d = player?.getDuration();
              if (d) setDuration(d);
              if (data === YTState.PLAYING || data === YTState.BUFFERING || data === YTState.ENDED) {
                startedRef.current = true;
              }
              if (data === YTState.ENDED && d) setTime(d);
            },
          },
        });
      },
      () => {
        if (!cancelled) setMode("embed");
      },
    );

    return () => {
      cancelled = true;
      player?.destroy();
      playerRef.current = null;
      host.replaceChildren();
    };
  }, [video.id]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (player) setTime(player.getCurrentTime());
    }, 200);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === itemRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      player.pauseVideo();
      return;
    }
    if (state === YTState.ENDED) player.seekTo(0, true);
    startedRef.current = false;
    player.playVideo();
    // If YouTube won't start from our button (a browser's autoplay rules), step aside for a direct click.
    window.setTimeout(() => {
      if (!startedRef.current && playerRef.current) setMode("native");
    }, 2500);
  };

  const seek = (seconds: number) => {
    const player = playerRef.current;
    if (!player || !duration) return;
    const to = Math.min(Math.max(seconds, 0), duration);
    player.seekTo(to, true);
    setTime(to);
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted()) player.unMute();
    else player.mute();
    setMuted(!muted);
  };

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void itemRef.current?.requestFullscreen();
  };

  const onSurfaceKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight") seek(time + SEEK);
    else if (event.key === "ArrowLeft") seek(time - SEEK);
    else return;
    event.preventDefault();
  };

  const onTrackDown = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !duration || event.button !== 0) return;
    track.setPointerCapture(event.pointerId);
    const at = (x: number) => {
      const rect = track.getBoundingClientRect();
      seek(((x - rect.left) / rect.width) * duration);
    };
    at(event.clientX);
    const move = (e: globalThis.PointerEvent) => at(e.clientX);
    const end = () => {
      track.removeEventListener("pointermove", move);
      track.removeEventListener("pointerup", end);
      track.removeEventListener("pointercancel", end);
    };
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
  };

  // Resize

  const onHandleDown = (event: PointerEvent<HTMLButtonElement>) => {
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

  const onHandleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
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

  const resetSize = () => {
    setSize(null);
    remember(video.id, null);
  };

  // Our controls stay in "native" mode; only the surface steps aside.
  const controls = mode !== "embed";

  return (
    <li ref={itemRef} className="room-video">
      <div ref={frameRef} className="room-frame">
        {mode === "embed" ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&playsinline=1`}
            title={video.title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div ref={hostRef} className="room-player" />
        )}
        {mode === "ours" ? (
          <button
            type="button"
            className="room-surface"
            data-covered={covered ? "" : undefined}
            aria-label={`${playing ? "Pause" : "Play"} ${video.title}. Left and right arrows skip ${SEEK} seconds.`}
            disabled={!ready}
            onClick={toggle}
            onKeyDown={onSurfaceKey}
          >
            {covered ? (
              // eslint-disable-next-line @next/next/no-img-element -- a remote YouTube thumbnail, shown as-is
              <img
                className="room-poster"
                src={poster}
                alt=""
                onLoad={(e) => {
                  // YouTube answers a missing maxres thumbnail with a 120px placeholder.
                  if (e.currentTarget.naturalWidth <= 120) setPoster(fallbackPoster);
                }}
                onError={() => setPoster(fallbackPoster)}
              />
            ) : null}
            {!playing ? (
              <svg className="room-play" viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="32" cy="32" r="30" />
                <path d="M26 21 L45 32 L26 43 Z" />
              </svg>
            ) : null}
          </button>
        ) : null}
        <button
          type="button"
          className="room-handle"
          aria-label={`Resize ${video.title}. Arrow keys change the size; double-click resets.`}
          title="Drag to resize · double-click to reset"
          onPointerDown={onHandleDown}
          onKeyDown={onHandleKey}
          onDoubleClick={resetSize}
        />
      </div>

      {controls ? (
        <div
          ref={trackRef}
          className="room-track"
          role="slider"
          tabIndex={-1}
          aria-label={`${video.title} position`}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${clock(time)} of ${clock(duration)}`}
          onPointerDown={onTrackDown}
        >
          <span className="room-track-fill" style={{ width: duration ? `${(time / duration) * 100}%` : 0 }} />
        </div>
      ) : null}

      <div className="figure-caption room-caption">
        <span className="figure-label">FIG. {pad(index + 1)}</span>
        <span className="room-video-title">
          {video.title}
          {video.note ? <span className="room-note"> · {video.note}</span> : null}
        </span>
        {controls ? (
          <span className="room-controls">
            <button type="button" onClick={toggle} disabled={!ready}>
              {playing ? "Pause" : "Play"}
            </button>
            <span className="room-time">
              {clock(time)} / {clock(duration)}
            </span>
            <button type="button" onClick={toggleMute} disabled={!ready}>
              {muted ? "Unmute" : "Mute"}
            </button>
            <button type="button" onClick={toggleFull}>
              {full ? "Exit full screen" : "Full screen"}
            </button>
          </span>
        ) : null}
      </div>
    </li>
  );
}
