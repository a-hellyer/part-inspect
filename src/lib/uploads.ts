import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_MODEL_TYPES = new Set([
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream",
  "application/sla",
  "application/vnd.ms-pki.stl",
]);

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MODEL_EXTENSIONS: Record<string, string> = {
  "model/gltf-binary": ".glb",
  "model/gltf+json": ".gltf",
  "application/octet-stream": ".stl",
  "application/sla": ".stl",
  "application/vnd.ms-pki.stl": ".stl",
};

export async function saveUpload(
  file: File,
  kind: "image" | "model",
  companyId: string,
) {
  const allowed =
    kind === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_MODEL_TYPES;
  const extensions =
    kind === "image" ? IMAGE_EXTENSIONS : MODEL_EXTENSIONS;

  if (!allowed.has(file.type) && kind === "image") {
    throw new Error(`Unsupported ${kind} file type: ${file.type || "unknown"}`);
  }

  // STL uploads often come through as empty/octet-stream; allow by extension too
  if (kind === "model" && !allowed.has(file.type)) {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".glb") && !name.endsWith(".gltf") && !name.endsWith(".stl")) {
      throw new Error(`Unsupported model file type: ${file.type || file.name}`);
    }
  }

  const ext =
    extensions[file.type] ??
    (file.name.includes(".")
      ? `.${file.name.split(".").pop()}`
      : kind === "image"
        ? ".jpg"
        : ".glb");

  const filename = `${companyId}/${uuidv4()}${ext}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type || undefined,
  });

  return blob.url;
}
