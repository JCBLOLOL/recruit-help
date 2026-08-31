import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-slate-950 text-slate-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(52,211,153,0.12),_transparent_55%)]"
      />
      <header className="relative z-10 border-b border-slate-800/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
          <p className="text-sm font-semibold tracking-wide text-emerald-400">
            Recruit Help
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:border-slate-500"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
            Baseball &amp; softball recruiting
          </p>
          <p className="mb-4 text-base text-slate-400">
            Built for athletes, by athletes.
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your recruiting profile,{" "}
            <span className="text-emerald-400">one link.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
            Build a coach-ready page with your stats, bio, and game film
            highlights — then share one simple link. Free to start.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-emerald-500 px-7 py-3 font-medium text-slate-950 hover:bg-emerald-400"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-600 px-7 py-3 font-medium text-slate-200 hover:border-slate-400"
            >
              Log in
            </Link>
          </div>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            "Complete athlete profiles",
            "Shareable coach page",
            "Highlight clips from game film",
          ].map((item) => (
            <li
              key={item}
              className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-slate-300"
            >
              <span className="mr-2 text-emerald-400">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </main>

      <footer className="relative z-10 border-t border-slate-800/60 py-6 text-center text-sm text-slate-500">
        Recruit Help · Built for athletes, by athletes
      </footer>
    </div>
  );
}
