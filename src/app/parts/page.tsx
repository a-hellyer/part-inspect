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
          <h1 className="text-2xl font-semibold text-zinc-900">Parts</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Reference images and 3D models for inspection.
          </p>
        </div>
        <Link
          href="/parts/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Add part
        </Link>
      </div>

      {parts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-sm text-zinc-500">No parts yet.</p>
          <Link
            href="/parts/new"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Upload your first part
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((part) => (
            <div
              key={part.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="aspect-video bg-zinc-100">
                {part.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={part.imageUrl}
                    alt={part.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                    3D model only
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-zinc-900">{part.name}</h2>
                {part.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                    {part.description}
                  </p>
                )}
                <p className="mt-3 text-xs text-zinc-500">
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
