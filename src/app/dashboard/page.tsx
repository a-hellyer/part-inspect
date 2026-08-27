import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [partsCount, batchesCount, openBatches, recentBatches] =
    await Promise.all([
      prisma.part.count({ where: { companyId: session.companyId } }),
      prisma.batch.count({ where: { companyId: session.companyId } }),
      prisma.batch.count({
        where: { companyId: session.companyId, status: "OPEN" },
      }),
      prisma.batch.findMany({
        where: { companyId: session.companyId },
        include: {
          part: true,
          units: { include: { rejects: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const totalUnits = recentBatches.reduce((sum, b) => sum + b.quantity, 0);
  const rejectedUnits = recentBatches.reduce(
    (sum, b) => sum + b.units.filter((u) => u.status === "REJECTED").length,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Welcome back, {session.name} — {session.companyName}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Parts", value: partsCount },
          { label: "Total batches", value: batchesCount },
          { label: "Open batches", value: openBatches },
          {
            label: "Reject rate (recent)",
            value:
              totalUnits > 0
                ? `${((rejectedUnits / totalUnits) * 100).toFixed(1)}%`
                : "—",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/parts/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Add part
        </Link>
        <Link
          href="/batches/new"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          New batch
        </Link>
        <Link
          href="/reject-codes"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Manage reject codes
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900">Recent batches</h2>
        {recentBatches.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No batches yet. Create a part, then start your first batch.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Part</th>
                  <th className="px-4 py-3 font-medium">Units</th>
                  <th className="px-4 py-3 font-medium">Rejected</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recentBatches.map((batch) => {
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
                      <td className="px-4 py-3 text-zinc-600">{rejected}</td>
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
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/inspect/${batch.id}`}
                          className="text-zinc-900 underline"
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
      </section>
    </div>
  );
}
