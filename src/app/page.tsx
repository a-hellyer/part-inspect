import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="pi-label mb-5">Quality inspection platform</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Point-and-click reject tracking for manufactured parts
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-muted">
          Companies upload part images or 3D models, create inspection batches,
          and mark reject locations directly on the part. Every unit starts as
          good until a reject is recorded.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="pi-btn pi-btn-primary px-5 py-2.5">
            Start free
          </Link>
          <Link href="/login" className="pi-btn pi-btn-ghost px-5 py-2.5">
            Sign in
          </Link>
        </div>
      </div>

      <div className="mt-24 grid gap-3 md:grid-cols-3">
        {[
          {
            step: "01",
            title: "Upload parts",
            body: "Add reference images or 3D models for each part your team inspects.",
          },
          {
            step: "02",
            title: "Create batches",
            body: "Start a batch of N units — all assumed good until a reject is entered.",
          },
          {
            step: "03",
            title: "Click to reject",
            body: "Inspectors click the part image to pin reject codes at exact locations.",
          },
        ].map((item) => (
          <div key={item.title} className="pi-card p-5">
            <p className="pi-mono text-xs text-muted-dim">{item.step}</p>
            <h2 className="mt-3 text-[15px] font-medium text-foreground">
              {item.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
