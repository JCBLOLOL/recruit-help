export default function Home() {
  return (
    <div className="min-h-full bg-slate-950 text-slate-50">
      <main className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-6 py-16">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-400">
          Recruit Help
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Your recruiting profile, one link.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-300">
          Built for baseball and softball athletes. Create a profile, add
          highlights, and share a simple page with college coaches.
        </p>
        <ul className="mt-8 space-y-2 text-slate-400">
          <li>✓ Athlete profiles</li>
          <li>✓ Highlight clips (coming soon)</li>
          <li>✓ Shareable coach-friendly page (coming soon)</li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/signup"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 font-medium text-slate-950 hover:bg-emerald-400"
          >
            Create account
          </a>
          <a
            href="/login"
            className="rounded-lg border border-slate-600 px-6 py-2.5 font-medium text-slate-200 hover:border-slate-400"
          >
            Log in
          </a>
        </div>
      </main>
    </div>
  );
}
