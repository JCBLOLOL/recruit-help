import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-full bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4">
        <Link href="/" className="text-sm font-medium text-emerald-400">
          ← Recruit Help
        </Link>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-lg items-center justify-center px-6 py-12">
        <AuthForm mode="signup" />
      </main>
    </div>
  );
}
