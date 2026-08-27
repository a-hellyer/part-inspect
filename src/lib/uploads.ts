import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";
import {
  ALLOWED_IMAGE_MIME,
  extensionForMime,
  resolveImageMime,
} from "@/lib/image-type";

const ALLOWED_MODEL_TYPES = new Set([
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream",
  "application/sla",
  "application/vnd.ms-pki.stl",
]);

const MODEL_EXTENSIONS: Record<string, string> = {
  "model/gltf-binary": ".glb",
  "model/gltf+json": ".gltf",
  "application/octet-stream": ".stl",
  "application/sla": ".stl",
  "application/vnd.ms-pki.stl": ".stl",
};

const HEIC_ERROR =
  "iPhone HEIC photos aren't supported for inspection. Export the photo as JPEG and try again.";

export async function saveUpload(
  file: File,
  kind: "image" | "model",
  companyId: string,
) {
  if (file.size === 0) {
    throw new Error(
      kind === "image"
        ? "The photo didn't attach correctly. Try choosing it again."
        : "The 3D model didn't attach correctly. Try choosing it again.",
    );
  }

  let contentType = file.type || undefined;
  let ext: string;

  if (kind === "image") {
    const mime = await resolveImageMime(file);
    if (mime === "image/heic") {
      throw new Error(HEIC_ERROR);
    }
    if (!mime || !ALLOWED_IMAGE_MIME.has(mime)) {
      throw new Error(
        `Unsupported image file type: ${file.type || file.name || "unknown"}. Use JPEG, PNG, WebP, or GIF.`,
      );
    }
    contentType = mime;
    ext = extensionForMime(mime);
  } else {
    const allowed = ALLOWED_MODEL_TYPES.has(file.type);
    const name = file.name.toLowerCase();
    if (
      !allowed &&
      !name.endsWith(".glb") &&
      !name.endsWith(".gltf") &&
      !name.endsWith(".stl")
    ) {
      throw new Error(`Unsupported model file type: ${file.type || file.name}`);
    }
    ext =
      MODEL_EXTENSIONS[file.type] ??
      (file.name.includes(".")
        ? `.${file.name.split(".").pop()}`
        : ".glb");
  }

  const filename = `${companyId}/${uuidv4()}${ext}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType,
  });

  return blob.url;
}
