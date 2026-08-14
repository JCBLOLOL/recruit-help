import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AppShell backHref="/" backLabel="Recruit Help">
      <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center">
        <div className="w-full max-w-md">
          {error && (
            <p className="mb-4 rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">
              {decodeURIComponent(error)}
            </p>
          )}
          <AuthForm mode="login" />
        </div>
      </div>
    </AppShell>
  );
}
