import { cn } from "@/lib/cn";

type Props = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  badge?: string;
};

export function ArrowLink({
  href,
  children,
  external,
  variant = "primary",
  disabled,
  badge,
}: Props) {
  const isExternal =
    external ?? (href.startsWith("http") || href.startsWith("mailto:"));
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          "inline-flex items-center gap-2 text-body",
          "text-ink-faint cursor-not-allowed",
        )}
      >
        <span className="border-b border-transparent">{children}</span>
        <span aria-hidden>→</span>
        {badge && (
          <span className="text-mono ml-2 px-1.5 py-0.5 border border-rule">
            {badge}
          </span>
        )}
      </span>
    );
  }

  return (
    <a
      href={href}
      {...externalProps}
      className={cn(
        "group inline-flex items-center gap-2 text-body transition-colors",
        variant === "primary"
          ? "text-ink hover:text-accent"
          : "text-ink-dim hover:text-ink",
      )}
    >
      <span
        className={cn(
          "border-b border-transparent transition-colors",
          variant === "primary"
            ? "group-hover:border-accent"
            : "group-hover:border-ink",
        )}
      >
        {children}
      </span>
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </a>
  );
}
