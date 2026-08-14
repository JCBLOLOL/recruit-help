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
          className={`mx-auto flex ${width} items-center justify-between gap-4 px-4 py-4 sm:px-8`}
        >
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            {backHref && (
              <Link
                href={backHref}
                className="shrink-0 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-900"
              >
                ← {backLabel}
              </Link>
            )}
            <Link
              href="/"
              className="truncate text-sm font-semibold tracking-wide text-emerald-400 hover:text-emerald-300"
            >
              Recruit Help
            </Link>
          </div>
          <div className="shrink-0">{right ?? null}</div>
        </div>
      </header>
      <main
        className={`mx-auto w-full flex-1 ${width} px-4 py-8 sm:px-8 sm:py-10`}
      >
        {children}
      </main>
    </div>
  );
}
