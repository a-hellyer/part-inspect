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
        <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="pi-btn pi-btn-primary w-full py-2.5"
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
      <span className="pi-label">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="pi-input"
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
      <p className="text-xs text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline decoration-border-strong underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthForm>
  );
}
