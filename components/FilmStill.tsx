import { cn } from "@/lib/cn";

type Props = {
  slug: string;
  time: string;
  className?: string;
  ariaLabel?: string;
};

export function FilmStill({ slug, time, className, ariaLabel }: Props) {
  return (
    <figure
      className={cn("flex flex-col gap-2", className)}
      aria-label={ariaLabel ?? `${slug} ${time}`}
    >
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden",
          "bg-[#080809] border border-rule",
        )}
      >
        {/* placeholder field — soft point-cloud style hint, no JS, respects reduced-motion */}
        <div className="absolute inset-0 opacity-60">
          <div
            aria-hidden
            className="drift absolute inset-0"
            style={{
              animation: "drift 18s ease-in-out infinite",
              backgroundImage:
                "radial-gradient(circle at 22% 38%, rgba(243,184,91,0.35) 0, transparent 22%), radial-gradient(circle at 70% 62%, rgba(126,140,255,0.22) 0, transparent 28%), radial-gradient(circle at 50% 80%, rgba(244,241,234,0.10) 0, transparent 35%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(244,241,234,0.06) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
            }}
          />
        </div>
        {/* matte vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(11,11,12,0.85) 100%)",
          }}
        />
      </div>
      <figcaption className="text-mono flex items-center justify-between">
        <span>{slug}</span>
        <span>{time}</span>
      </figcaption>
    </figure>
  );
}
