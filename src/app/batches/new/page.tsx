import Link from "next/link";
import { redirect } from "next/navigation";
import { createBatchAction } from "@/app/actions/app";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function NewBatchPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const parts = await prisma.part.findMany({
    where: { companyId: session.companyId },
    orderBy: { name: "asc" },
  });

  if (parts.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-10">
        <p className="text-sm text-muted">
          You need at least one part before creating a batch.
        </p>
        <Link
          href="/parts/new"
          className="mt-4 inline-block text-sm text-foreground underline decoration-border-strong underline-offset-4"
        >
          Add a part first
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <Link
        href="/batches"
        className="text-[13px] text-muted transition hover:text-foreground"
      >
        ← Back to batches
      </Link>
      <p className="pi-label mt-6">New</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        New batch
      </h1>
      <p className="mt-1 text-sm text-muted">
        All units in the batch are created as good. Rejects are recorded during
        inspection.
      </p>

      <form action={createBatchAction} className="pi-card mt-8 space-y-5 p-6">
        <label className="block space-y-1.5">
          <span className="pi-label">Part</span>
          <select name="partId" required className="pi-input">
            {parts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="pi-label">Batch name</span>
          <input
            name="name"
            required
            placeholder="e.g. Lot 2024-0815-A"
            className="pi-input pi-mono"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="pi-label">Quantity</span>
          <input
            name="quantity"
            type="number"
            min={1}
            max={10000}
            defaultValue={10}
            required
            className="pi-input pi-mono"
          />
        </label>

        <button type="submit" className="pi-btn pi-btn-primary">
          Create batch
        </button>
      </form>
    </div>
  );
}
