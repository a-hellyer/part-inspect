"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { loginSchema, registerSchema, slugify } from "@/lib/validations";

export type AuthState = {
  error?: string;
};

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    companyName: formData.get("companyName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { companyName, name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  let slug = slugify(companyName);
  const slugTaken = await prisma.company.findUnique({ where: { slug } });
  if (slugTaken) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const company = await prisma.company.create({
    data: {
      name: companyName,
      slug,
      users: {
        create: {
          email,
          name,
          passwordHash,
          role: "ADMIN",
        },
      },
      rejectCodes: {
        createMany: {
          data: [
            {
              code: "SCR",
              description: "Scratch",
              color: "#f97316",
            },
            {
              code: "DIM",
              description: "Dimensional out of spec",
              color: "#ef4444",
            },
            {
              code: "POR",
              description: "Porosity / void",
              color: "#8b5cf6",
            },
          ],
        },
      },
    },
    include: { users: true },
  });

  const user = company.users[0];
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: company.id,
    companyName: company.name,
  });

  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    companyName: user.company.name,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  const { destroySession } = await import("@/lib/auth");
  await destroySession();
  redirect("/");
}
