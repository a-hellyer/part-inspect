/** MIME types we can store and display in <img>. */
export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const JPEG_TYPES = new Set(["image/jpeg", "image/jpg", "image/pjpeg"]);
const PNG_TYPES = new Set(["image/png", "image/x-png"]);
const WEBP_TYPES = new Set(["image/webp"]);
const GIF_TYPES = new Set(["image/gif"]);
const HEIC_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
};

export function sniffImageMimeFromBytes(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  // HEIC/HEIF: ISO BMFF with ftyp brand
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    const brand = String.fromCharCode(
      bytes[8],
      bytes[9],
      bytes[10],
      bytes[11],
    ).toLowerCase();
    if (
      brand === "heic" ||
      brand === "heix" ||
      brand === "heif" ||
      brand === "mif1" ||
      brand === "msf1" ||
      brand === "hevc" ||
      brand === "hevx"
    ) {
      return "image/heic";
    }
  }
  return null;
}

export function mimeFromFileName(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".jpe")) {
    return "image/jpeg";
  }
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".heic") || lower.endsWith(".heif") || lower.endsWith(".hif")) {
    return "image/heic";
  }
  return null;
}

export function normalizeDeclaredImageMime(type: string): string | null {
  const t = type.toLowerCase().trim();
  if (!t) return null;
  if (JPEG_TYPES.has(t)) return "image/jpeg";
  if (PNG_TYPES.has(t)) return "image/png";
  if (WEBP_TYPES.has(t)) return "image/webp";
  if (GIF_TYPES.has(t)) return "image/gif";
  if (HEIC_TYPES.has(t)) return "image/heic";
  return t.startsWith("image/") ? t : null;
}

export function extensionForMime(mime: string): string {
  return IMAGE_EXTENSIONS[mime] ?? ".jpg";
}

export async function resolveImageMime(file: File): Promise<string | null> {
  const declared = normalizeDeclaredImageMime(file.type || "");
  if (declared && ALLOWED_IMAGE_MIME.has(declared)) return declared;

  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const sniffed = sniffImageMimeFromBytes(buf);
  if (sniffed) return sniffed;

  if (declared === "image/heic") return declared;
  return mimeFromFileName(file.name);
}
