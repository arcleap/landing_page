// The parts of the YouTube IFrame Player API the room uses, and a loader that
// fetches the API script once. https://developers.google.com/youtube/iframe_api_reference

export const YTState = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

export type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  destroy(): void;
};

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      host?: string;
      videoId: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: () => void;
      };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let loading: Promise<YTNamespace> | null = null;

// Resolves with the API, or rejects if the script fails or takes over 10s.
export function loadYouTube(): Promise<YTNamespace> {
  if (loading) return loading;
  loading = new Promise<YTNamespace>((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT);
    const timer = window.setTimeout(() => reject(new Error("YouTube API timed out")), 10_000);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      window.clearTimeout(timer);
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("YouTube API failed to load"));
    };
    document.head.append(script);
  }).catch((error) => {
    loading = null;
    throw error;
  });
  return loading;
}
