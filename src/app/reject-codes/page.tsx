import Link from "next/link";
import { redirect } from "next/navigation";
import { createRejectCodeAction } from "@/app/actions/app";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function RejectCodesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const codes = await prisma.rejectCode.findMany({
    where: { companyId: session.companyId },
    orderBy: { code: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Reject codes</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Define the defect codes inspectors can assign when marking rejects.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Add code</h2>
          <form action={createRejectCodeAction} className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">Code</span>
              <input
                name="code"
                required
                maxLength={10}
                placeholder="e.g. SCR"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm uppercase outline-none focus:border-zinc-500"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">
                Description
              </span>
              <input
                name="description"
                required
                placeholder="e.g. Surface scratch"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">Color</span>
              <input
                name="color"
                type="color"
                defaultValue="#ef4444"
                className="h-10 w-full cursor-pointer rounded-lg border border-zinc-300"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Add reject code
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Active codes ({codes.length})
          </h2>
          {codes.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No reject codes yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {codes.map((code) => (
                <li
                  key={code.id}
                  className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2"
                >
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: code.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {code.code}
                    </p>
                    <p className="text-xs text-zinc-500">{code.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        <Link href="/dashboard" className="underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
