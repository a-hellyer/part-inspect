import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

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

  if (!allowed.has(file.type)) {
    throw new Error(`Unsupported ${kind} file type: ${file.type}`);
  }

  const ext =
    extensions[file.type] ??
    path.extname(file.name) ??
    (kind === "image" ? ".jpg" : ".glb");

  await mkdir(path.join(UPLOAD_DIR, companyId), { recursive: true });

  const filename = `${uuidv4()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, companyId, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${companyId}/${filename}`;
}
