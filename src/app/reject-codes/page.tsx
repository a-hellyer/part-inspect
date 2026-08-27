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
        <p className="pi-label">Configuration</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Reject codes
        </h1>
        <p className="mt-1 text-sm text-muted">
          Define the defect codes inspectors can assign when marking rejects.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="pi-card p-6">
          <h2 className="pi-label">Add code</h2>
          <form action={createRejectCodeAction} className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className="pi-label">Code</span>
              <input
                name="code"
                required
                maxLength={10}
                placeholder="e.g. SCR"
                className="pi-input pi-mono uppercase"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="pi-label">Description</span>
              <input
                name="description"
                required
                placeholder="e.g. Surface scratch"
                className="pi-input"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="pi-label">Color</span>
              <input
                name="color"
                type="color"
                defaultValue="#ef4444"
                className="h-10 w-full cursor-pointer rounded-lg border border-border-strong bg-[#0c0d0f] p-1"
              />
            </label>
            <button type="submit" className="pi-btn pi-btn-primary">
              Add reject code
            </button>
          </form>
        </div>

        <div className="pi-card p-6">
          <h2 className="pi-label">Active codes · {codes.length}</h2>
          {codes.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No reject codes yet.</p>
          ) : (
            <ul className="mt-4 space-y-1.5">
              {codes.map((code) => (
                <li
                  key={code.id}
                  className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: code.color }}
                  />
                  <div>
                    <p className="pi-mono text-sm font-medium text-foreground">
                      {code.code}
                    </p>
                    <p className="text-xs text-muted">{code.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        <Link
          href="/dashboard"
          className="underline decoration-border-strong underline-offset-4 hover:text-foreground"
        >
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
