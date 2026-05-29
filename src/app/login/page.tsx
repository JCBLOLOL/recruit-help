import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-full bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4">
        <Link href="/" className="text-sm font-medium text-emerald-400">
          ← Recruit Help
        </Link>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-lg items-center justify-center px-6 py-12">
        {error && (
          <p className="mb-4 max-w-md rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {decodeURIComponent(error)}
          </p>
        )}
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
