export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent">
      <span aria-hidden className="h-px w-8 bg-accent/70" />
      {children}
    </p>
  );
}
