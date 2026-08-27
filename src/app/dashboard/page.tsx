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
        <p className="pi-label">Overview</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Welcome back, {session.name}{" "}
          <span className="text-muted-dim">·</span>{" "}
          <span className="pi-mono text-muted-dim">{session.companyName}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Parts", value: String(partsCount) },
          { label: "Total batches", value: String(batchesCount) },
          { label: "Open batches", value: String(openBatches) },
          {
            label: "Reject rate",
            value:
              totalUnits > 0
                ? `${((rejectedUnits / totalUnits) * 100).toFixed(1)}%`
                : "—",
          },
        ].map((stat) => (
          <div key={stat.label} className="pi-card p-4">
            <p className="pi-label">{stat.label}</p>
            <p className="pi-mono mt-2 text-3xl font-medium tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/parts/new" className="pi-btn pi-btn-primary">
          Add part
        </Link>
        <Link href="/batches/new" className="pi-btn pi-btn-ghost">
          New batch
        </Link>
        <Link href="/reject-codes" className="pi-btn pi-btn-ghost">
          Manage reject codes
        </Link>
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-foreground">
            Recent batches
          </h2>
        </div>
        {recentBatches.length === 0 ? (
          <div className="pi-card p-8 text-center">
            <p className="text-sm text-muted">
              No batches yet. Create a part, then start your first batch.
            </p>
          </div>
        ) : (
          <div className="pi-card overflow-hidden">
            <table className="pi-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Part</th>
                  <th>Units</th>
                  <th>Rejected</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentBatches.map((batch) => {
                  const rejected = batch.units.filter(
                    (u) => u.status === "REJECTED",
                  ).length;
                  return (
                    <tr key={batch.id} className="hover:bg-white/[0.02]">
                      <td className="!text-foreground font-medium">
                        {batch.name}
                      </td>
                      <td>{batch.part.name}</td>
                      <td className="pi-mono">{batch.quantity}</td>
                      <td className="pi-mono">{rejected}</td>
                      <td>
                        <span
                          className={
                            batch.status === "OPEN"
                              ? "pi-badge pi-badge-open"
                              : "pi-badge pi-badge-closed"
                          }
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/inspect/${batch.id}`}
                          className="text-[13px] text-foreground underline decoration-border-strong underline-offset-4"
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
