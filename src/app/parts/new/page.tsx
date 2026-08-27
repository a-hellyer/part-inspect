import Link from "next/link";
import { redirect } from "next/navigation";
import { PartForm } from "@/components/part-form";
import { getSession } from "@/lib/auth";

export default async function NewPartPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <Link
        href="/parts"
        className="text-[13px] text-muted transition hover:text-foreground"
      >
        ← Back to parts
      </Link>
      <p className="pi-label mt-6">New</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        Add part
      </h1>
      <p className="mt-1 text-sm text-muted">
        Upload a reference image for point-and-click inspection. You can also
        attach a 3D model (GLB, GLTF, STL) for reference.
      </p>

      <PartForm />
    </div>
  );
}
