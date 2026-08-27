import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12">
      <div className="pi-card w-full p-8">
        <p className="pi-label">Account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-muted">
          Access your company&apos;s inspection workspace.
        </p>
        <div className="mt-7">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          No account?{" "}
          <Link
            href="/register"
            className="text-foreground underline decoration-border-strong underline-offset-4"
          >
            Register your company
          </Link>
        </p>
      </div>
    </div>
  );
}
