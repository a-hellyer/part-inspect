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
          <p className="pi-label">Production</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Batches
          </h1>
          <p className="mt-1 text-sm text-muted">
            Production runs where each unit starts as good until rejected.
          </p>
        </div>
        <Link href="/batches/new" className="pi-btn pi-btn-primary">
          New batch
        </Link>
      </div>

      {batches.length === 0 ? (
        <div className="pi-card border-dashed p-12 text-center">
          <p className="text-sm text-muted">No batches yet.</p>
          <Link
            href="/batches/new"
            className="mt-3 inline-block text-sm text-foreground underline decoration-border-strong underline-offset-4"
          >
            Create your first batch
          </Link>
        </div>
      ) : (
        <div className="pi-card overflow-hidden">
          <table className="pi-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Part</th>
                <th>Quantity</th>
                <th>Rejected</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
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
                    <td className="pi-mono">
                      {rejected}{" "}
                      <span className="text-muted-dim">
                        ({((rejected / batch.quantity) * 100).toFixed(0)}%)
                      </span>
                    </td>
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
                    <td className="pi-mono text-muted-dim">
                      {batch.createdAt.toLocaleDateString()}
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
    </div>
  );
}
