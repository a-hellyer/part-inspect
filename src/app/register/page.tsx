import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Register your company
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Create an account and start tracking part rejects in minutes.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Already registered?{" "}
          <Link href="/login" className="text-zinc-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
