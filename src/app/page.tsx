import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Quality inspection platform
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Point-and-click reject tracking for manufactured parts
        </h1>
        <p className="mt-6 text-lg text-zinc-600">
          Companies upload part images or 3D models, create inspection batches,
          and mark reject locations directly on the part. Every unit starts as
          good until a reject is recorded.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Start free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Upload parts",
            body: "Add reference images or 3D models for each part your team inspects.",
          },
          {
            title: "Create batches",
            body: "Start a batch of N units — all assumed good until a reject is entered.",
          },
          {
            title: "Click to reject",
            body: "Inspectors click the part image to pin reject codes at exact locations.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-zinc-900">{item.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
