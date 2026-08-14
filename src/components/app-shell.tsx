import Link from "next/link";

export function AppShell({
  children,
  backHref,
  backLabel = "Back",
  right,
  wide = false,
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  right?: React.ReactNode;
  wide?: boolean;
}) {
  const width = wide ? "max-w-6xl" : "max-w-5xl";

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div
          className={`mx-auto flex ${width} items-center justify-between px-4 py-4 sm:px-8`}
        >
          {backHref ? (
            <Link
              href={backHref}
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              ← {backLabel}
            </Link>
          ) : (
            <Link
              href="/"
              className="text-sm font-semibold tracking-wide text-emerald-400"
            >
              Recruit Help
            </Link>
          )}
          {right ?? <span />}
        </div>
      </header>
      <main className={`mx-auto w-full flex-1 ${width} px-4 py-8 sm:px-8 sm:py-10`}>
        {children}
      </main>
    </div>
  );
}
