import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { closeBatchAction } from "@/app/actions/app";
import { InspectionCanvas } from "@/components/inspection-canvas";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{ batchId: string }>;
  searchParams: Promise<{ unit?: string }>;
};

export default async function InspectPage({ params, searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { batchId } = await params;
  const { unit: unitParam } = await searchParams;

  const batch = await prisma.batch.findFirst({
    where: { id: batchId, companyId: session.companyId },
    include: {
      part: true,
      units: {
        include: {
          rejects: { include: { rejectCode: true } },
        },
        orderBy: { serialNumber: "asc" },
      },
    },
  });

  if (!batch) notFound();

  const rejectCodes = await prisma.rejectCode.findMany({
    where: { companyId: session.companyId },
    orderBy: { code: "asc" },
  });

  const selectedUnit =
    batch.units.find((u) => u.id === unitParam) ?? batch.units[0];

  if (!selectedUnit) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm text-muted">This batch has no units.</p>
      </div>
    );
  }

  const imageUrl = batch.part.imageUrl;
  const readOnly = batch.status === "CLOSED";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/batches"
            className="text-[13px] text-muted transition hover:text-foreground"
          >
            ← Back to batches
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {batch.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Part: {batch.part.name}{" "}
            <span className="text-muted-dim">·</span>{" "}
            <span className="pi-mono">{batch.quantity} units</span>{" "}
            <span className="text-muted-dim">·</span>{" "}
            <span
              className={
                batch.status === "OPEN"
                  ? "pi-badge pi-badge-open"
                  : "pi-badge pi-badge-closed"
              }
            >
              {batch.status}
            </span>
          </p>
        </div>
        {batch.status === "OPEN" && (
          <form action={closeBatchAction.bind(null, batch.id)}>
            <button type="submit" className="pi-btn pi-btn-ghost">
              Close batch
            </button>
          </form>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {batch.units.map((unit) => {
          const isActive = unit.id === selectedUnit.id;
          const rejectCount = unit.rejects.length;
          return (
            <Link
              key={unit.id}
              href={`/inspect/${batch.id}?unit=${unit.id}`}
              className={`pi-mono rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-border-strong bg-accent text-accent-fg"
                  : unit.status === "REJECTED"
                    ? "border-danger/25 bg-danger/10 text-danger hover:border-danger/40"
                    : "border-border bg-transparent text-muted hover:border-border-strong hover:text-foreground"
              }`}
            >
              #{unit.serialNumber}
              {rejectCount > 0 && ` (${rejectCount})`}
            </Link>
          );
        })}
      </div>

      {!imageUrl ? (
        <div className="rounded-xl border border-warning/20 bg-warning/10 p-6 text-sm text-warning">
          This part has no reference image. Upload an image on the part record
          to enable point-and-click inspection.
          <Link href="/parts" className="ml-1 underline underline-offset-4">
            Go to parts
          </Link>
        </div>
      ) : (
        <InspectionCanvas
          partUnitId={selectedUnit.id}
          batchId={batch.id}
          imageUrl={imageUrl}
          rejectCodes={rejectCodes}
          existingRejects={selectedUnit.rejects}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
