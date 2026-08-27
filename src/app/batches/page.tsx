import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function BatchesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const batches = await prisma.batch.findMany({
    where: { companyId: session.companyId },
    include: {
      part: true,
      units: { include: { rejects: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Batches</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Production runs where each unit starts as good until rejected.
          </p>
        </div>
        <Link
          href="/batches/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New batch
        </Link>
      </div>

      {batches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-sm text-zinc-500">No batches yet.</p>
          <Link
            href="/batches/new"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Create your first batch
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Batch</th>
                <th className="px-4 py-3 font-medium">Part</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Rejected</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const rejected = batch.units.filter(
                  (u) => u.status === "REJECTED",
                ).length;
                return (
                  <tr key={batch.id} className="border-t border-zinc-100">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {batch.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {batch.part.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {batch.quantity}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {rejected} ({((rejected / batch.quantity) * 100).toFixed(0)}%)
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          batch.status === "OPEN"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {batch.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/inspect/${batch.id}`}
                        className="font-medium text-zinc-900 underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
