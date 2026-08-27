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
        <p className="text-sm text-zinc-600">This batch has no units.</p>
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
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            ← Back to batches
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            {batch.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Part: {batch.part.name} · {batch.quantity} units ·{" "}
            <span
              className={
                batch.status === "OPEN" ? "text-emerald-600" : "text-zinc-500"
              }
            >
              {batch.status}
            </span>
          </p>
        </div>
        {batch.status === "OPEN" && (
          <form action={closeBatchAction.bind(null, batch.id)}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Close batch
            </button>
          </form>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {batch.units.map((unit) => {
          const isActive = unit.id === selectedUnit.id;
          const rejectCount = unit.rejects.length;
          return (
            <Link
              key={unit.id}
              href={`/inspect/${batch.id}?unit=${unit.id}`}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : unit.status === "REJECTED"
                    ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
              }`}
            >
              #{unit.serialNumber}
              {rejectCount > 0 && ` (${rejectCount})`}
            </Link>
          );
        })}
      </div>

      {!imageUrl ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          This part has no reference image. Upload an image on the part record
          to enable point-and-click inspection.
          <Link href="/parts" className="ml-1 underline">
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
