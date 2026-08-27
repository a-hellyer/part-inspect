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
        <p className="text-sm text-zinc-600">
          You need at least one part before creating a batch.
        </p>
        <Link
          href="/parts/new"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
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
        className="text-sm text-zinc-500 hover:text-zinc-700"
      >
        ← Back to batches
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">New batch</h1>
      <p className="mt-1 text-sm text-zinc-600">
        All units in the batch are created as good. Rejects are recorded during
        inspection.
      </p>

      <form action={createBatchAction} className="mt-8 space-y-5">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">Part</span>
          <select
            name="partId"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          >
            {parts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">Batch name</span>
          <input
            name="name"
            required
            placeholder="e.g. Lot 2024-0815-A"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">Quantity</span>
          <input
            name="quantity"
            type="number"
            min={1}
            max={10000}
            defaultValue={10}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Create batch
        </button>
      </form>
    </div>
  );
}
