import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <AppShell backHref="/" backLabel="Recruit Help">
      <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center">
        <div className="w-full max-w-md">
          <AuthForm mode="signup" />
        </div>
      </div>
    </AppShell>
  );
}
