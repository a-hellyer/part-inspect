"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveUpload } from "@/lib/uploads";
import {
  batchSchema,
  partSchema,
  rejectCodeSchema,
  rejectSchema,
} from "@/lib/validations";

export type ActionState = {
  error?: string;
};

async function requireCompanySession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    if (/body exceeded|too large|413/i.test(error.message)) {
      return "That photo is too large to upload. Try a smaller JPEG.";
    }
    return error.message;
  }
  return fallback;
}

export async function createPartAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireCompanySession();

  const parsed = partSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let imageUrl: string | undefined;
  let modelUrl: string | undefined;
  let modelType = "IMAGE";

  const imageFile = formData.get("image");
  const modelFile = formData.get("model");

  try {
    if (imageFile instanceof File && imageFile.size > 0) {
      imageUrl = await saveUpload(imageFile, "image", session.companyId);
    } else if (imageFile instanceof File && imageFile.name) {
      return {
        error: "The photo didn't attach correctly. Try choosing it again.",
      };
    }

    if (modelFile instanceof File && modelFile.size > 0) {
      modelUrl = await saveUpload(modelFile, "model", session.companyId);
      modelType = "MODEL_3D";
    }
  } catch (error) {
    return { error: errorMessage(error, "Failed to upload file") };
  }

  if (!imageUrl && !modelUrl) {
    return { error: "Upload at least an image or 3D model" };
  }

  try {
    await prisma.part.create({
      data: {
        companyId: session.companyId,
        name: parsed.data.name,
        description: parsed.data.description,
        imageUrl,
        modelUrl,
        modelType,
      },
    });
  } catch (error) {
    return {
      error: errorMessage(error, "Couldn't save the part. Please try again."),
    };
  }

  revalidatePath("/parts");
  redirect("/parts");
}

export async function createRejectCodeAction(formData: FormData): Promise<void> {
  const session = await requireCompanySession();

  const parsed = rejectCodeSchema.safeParse({
    code: formData.get("code"),
    description: formData.get("description"),
    color: formData.get("color") || "#ef4444",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    await prisma.rejectCode.create({
      data: {
        companyId: session.companyId,
        ...parsed.data,
      },
    });
  } catch {
    throw new Error("A reject code with this code already exists");
  }

  revalidatePath("/reject-codes");
  redirect("/reject-codes");
}

export async function createBatchAction(formData: FormData): Promise<void> {
  const session = await requireCompanySession();

  const parsed = batchSchema.safeParse({
    partId: formData.get("partId"),
    name: formData.get("name"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const part = await prisma.part.findFirst({
    where: { id: parsed.data.partId, companyId: session.companyId },
  });

  if (!part) {
    throw new Error("Part not found");
  }

  await prisma.batch.create({
    data: {
      companyId: session.companyId,
      partId: parsed.data.partId,
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      units: {
        create: Array.from({ length: parsed.data.quantity }, (_, i) => ({
          serialNumber: i + 1,
          status: "GOOD",
        })),
      },
    },
  });

  revalidatePath("/batches");
  redirect("/batches");
}

export async function addRejectAction(data: {
  partUnitId: string;
  rejectCodeId: string;
  x: number;
  y: number;
  notes?: string;
}) {
  const session = await requireCompanySession();

  const parsed = rejectSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const unit = await prisma.partUnit.findFirst({
    where: {
      id: parsed.data.partUnitId,
      batch: { companyId: session.companyId },
    },
  });

  if (!unit) {
    return { error: "Part unit not found" };
  }

  const rejectCode = await prisma.rejectCode.findFirst({
    where: {
      id: parsed.data.rejectCodeId,
      companyId: session.companyId,
    },
  });

  if (!rejectCode) {
    return { error: "Reject code not found" };
  }

  await prisma.$transaction([
    prisma.reject.create({
      data: {
        partUnitId: parsed.data.partUnitId,
        rejectCodeId: parsed.data.rejectCodeId,
        x: parsed.data.x,
        y: parsed.data.y,
        notes: parsed.data.notes,
        createdById: session.id,
      },
    }),
    prisma.partUnit.update({
      where: { id: parsed.data.partUnitId },
      data: { status: "REJECTED" },
    }),
  ]);

  revalidatePath(`/inspect/${unit.batchId}`);
  return { success: true };
}

export async function closeBatchAction(batchId: string): Promise<void> {
  const session = await requireCompanySession();

  await prisma.batch.updateMany({
    where: { id: batchId, companyId: session.companyId },
    data: { status: "CLOSED" },
  });

  revalidatePath("/batches");
  revalidatePath(`/inspect/${batchId}`);
}

export async function deleteRejectAction(rejectId: string, batchId: string) {
  const session = await requireCompanySession();

  const reject = await prisma.reject.findFirst({
    where: {
      id: rejectId,
      partUnit: { batch: { companyId: session.companyId } },
    },
    include: { partUnit: { include: { rejects: true } } },
  });

  if (!reject) return { error: "Reject not found" };

  await prisma.reject.delete({ where: { id: rejectId } });

  const remaining = reject.partUnit.rejects.filter((r) => r.id !== rejectId);
  if (remaining.length === 0) {
    await prisma.partUnit.update({
      where: { id: reject.partUnitId },
      data: { status: "GOOD" },
    });
  }

  revalidatePath(`/inspect/${batchId}`);
  return { success: true };
}
