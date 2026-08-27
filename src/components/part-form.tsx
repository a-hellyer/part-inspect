"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createPartAction,
  type ActionState,
} from "@/app/actions/app";
import { prepareImageForUpload } from "@/lib/prepare-image";

export function PartForm() {
  const [state, formAction, pending] = useActionState(
    createPartAction,
    {} as ActionState,
  );
  const [preparing, setPreparing] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const busy = preparing || pending;
  const error = clientError || state.error;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const image = formData.get("image");

    if (image instanceof File && image.size > 0) {
      try {
        setPreparing(true);
        const prepared = await prepareImageForUpload(image);
        formData.set("image", prepared);
      } catch (err) {
        setClientError(
          err instanceof Error ? err.message : "Couldn't prepare this photo.",
        );
        setPreparing(false);
        return;
      }
      setPreparing(false);
    }

    formAction(formData);
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setClientError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setFileLabel(null);
      setPreviewUrl(null);
      return;
    }
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    setFileLabel(`${file.name || "photo"} · ${sizeKb.toLocaleString()} KB`);
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="pi-card mt-8 space-y-5 p-6"
      encType="multipart/form-data"
    >
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
          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif"
          onChange={handleImageChange}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border file:border-border-strong file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-foreground"
        />
        <span className="text-xs text-muted-dim">
          Phone photos are fine — JPEG, PNG, WebP, or GIF. Large camera images
          are resized automatically.
        </span>
        {fileLabel && (
          <span className="block text-xs text-muted">{fileLabel}</span>
        )}
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Selected part"
            className="mt-2 max-h-56 w-full rounded-lg bg-black/40 object-contain"
          />
        )}
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

      {error && (
        <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="pi-btn pi-btn-primary w-full py-2.5 sm:w-auto"
      >
        {preparing
          ? "Preparing photo..."
          : pending
            ? "Saving..."
            : "Save part"}
      </button>
    </form>
  );
}
