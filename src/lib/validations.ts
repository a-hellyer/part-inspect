import { z } from "zod";

export const registerSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const partSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  description: z.string().optional(),
});

export const rejectCodeSchema = z.object({
  code: z.string().min(1, "Code is required").max(10),
  description: z.string().min(1, "Description is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
});

export const batchSchema = z.object({
  partId: z.string().min(1),
  name: z.string().min(1, "Batch name is required"),
  quantity: z.coerce.number().int().min(1).max(10000),
});

export const rejectSchema = z.object({
  partUnitId: z.string().min(1),
  rejectCodeId: z.string().min(1),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
