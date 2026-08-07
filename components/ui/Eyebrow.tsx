export function Eyebrow({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "inverse";
}) {
  const inverse = tone === "inverse";

  return (
    <p className={`mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] ${inverse ? "text-[#9ab6ff]" : "text-accent"}`}>
      <span aria-hidden className={`h-px w-8 ${inverse ? "bg-[#9ab6ff]" : "bg-accent/70"}`} />
      {children}
    </p>
  );
}
