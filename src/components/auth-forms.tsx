"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  loginAction,
  registerAction,
  type AuthState,
} from "@/app/actions/auth";

function AuthForm({
  action,
  submitLabel,
  children,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {children}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? "Please wait..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
      />
    </label>
  );
}

export function LoginForm() {
  return (
    <AuthForm action={loginAction} submitLabel="Sign in">
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required />
    </AuthForm>
  );
}

export function RegisterForm() {
  return (
    <AuthForm action={registerAction} submitLabel="Create account">
      <Field label="Company name" name="companyName" required />
      <Field label="Your name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required />
      <p className="text-xs text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-zinc-900 underline">
          Sign in
        </Link>
      </p>
    </AuthForm>
  );
}
