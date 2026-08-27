import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function PartsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const parts = await prisma.part.findMany({
    where: { companyId: session.companyId },
    include: { _count: { select: { batches: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="pi-label">Library</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Parts
          </h1>
          <p className="mt-1 text-sm text-muted">
            Reference images and 3D models for inspection.
          </p>
        </div>
        <Link href="/parts/new" className="pi-btn pi-btn-primary">
          Add part
        </Link>
      </div>

      {parts.length === 0 ? (
        <div className="pi-card border-dashed p-12 text-center">
          <p className="text-sm text-muted">No parts yet.</p>
          <Link
            href="/parts/new"
            className="mt-3 inline-block text-sm text-foreground underline decoration-border-strong underline-offset-4"
          >
            Upload your first part
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((part) => (
            <div key={part.id} className="pi-card overflow-hidden">
              <div className="aspect-video bg-[#0c0d0f]">
                {part.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={part.imageUrl}
                    alt={part.name}
                    className="h-full w-full object-cover opacity-90"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center pi-mono text-xs text-muted-dim">
                    3D model only
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-[15px] font-medium text-foreground">
                  {part.name}
                </h2>
                {part.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {part.description}
                  </p>
                )}
                <p className="pi-mono mt-3 text-[11px] text-muted-dim">
                  {part._count.batches} batch
                  {part._count.batches === 1 ? "" : "es"} ·{" "}
                  {part.modelType === "MODEL_3D" ? "3D model" : "Image"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
