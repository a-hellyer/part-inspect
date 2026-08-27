import Link from "next/link";
import { redirect } from "next/navigation";
import { createPartAction } from "@/app/actions/app";
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

      <form action={createPartAction} className="pi-card mt-8 space-y-5 p-6">
        <label className="block space-y-1.5">
          <span className="pi-label">Part name</span>
          <input name="name" required className="pi-input" />
        </label>

        <label className="block space-y-1.5">
          <span className="pi-label">Description</span>
          <textarea
            name="description"
            rows={3}
            className="pi-input resize-none"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="pi-label">Reference image</span>
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border file:border-border-strong file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-foreground"
          />
          <span className="text-xs text-muted-dim">
            Used for click-to-reject inspection. JPEG, PNG, WebP, or GIF.
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="pi-label">3D model (optional)</span>
          <input
            name="model"
            type="file"
            accept=".glb,.gltf,.stl,model/gltf-binary,model/gltf+json"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border file:border-border-strong file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-foreground"
          />
          <span className="text-xs text-muted-dim">
            GLB, GLTF, or STL for reference storage.
          </span>
        </label>

        <button type="submit" className="pi-btn pi-btn-primary">
          Save part
        </button>
      </form>
    </div>
  );
}
