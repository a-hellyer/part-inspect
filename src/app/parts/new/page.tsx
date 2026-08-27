import Link from "next/link";
import { redirect } from "next/navigation";
import { createPartAction } from "@/app/actions/app";
import { getSession } from "@/lib/auth";

export default async function NewPartPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <Link href="/parts" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to parts
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Add part</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Upload a reference image for point-and-click inspection. You can also
        attach a 3D model (GLB, GLTF, STL) for reference.
      </p>

      <form action={createPartAction} className="mt-8 space-y-5">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">Part name</span>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">Description</span>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">
            Reference image
          </span>
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-zinc-600"
          />
          <span className="text-xs text-zinc-500">
            Used for click-to-reject inspection. JPEG, PNG, WebP, or GIF.
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">
            3D model (optional)
          </span>
          <input
            name="model"
            type="file"
            accept=".glb,.gltf,.stl,model/gltf-binary,model/gltf+json"
            className="block w-full text-sm text-zinc-600"
          />
          <span className="text-xs text-zinc-500">
            GLB, GLTF, or STL for reference storage.
          </span>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Save part
        </button>
      </form>
    </div>
  );
}
