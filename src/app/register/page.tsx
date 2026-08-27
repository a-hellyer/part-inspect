import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12">
      <div className="pi-card w-full p-8">
        <p className="pi-label">Get started</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Register your company
        </h1>
        <p className="mt-2 text-sm text-muted">
          Create an account and start tracking part rejects in minutes.
        </p>
        <div className="mt-7">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-foreground underline decoration-border-strong underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
