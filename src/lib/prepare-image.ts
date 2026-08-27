import {
  ALLOWED_IMAGE_MIME,
  extensionForMime,
  resolveImageMime,
} from "@/lib/image-type";

const MAX_DIMENSION = 2048;
const MAX_OUTPUT_BYTES = 3.5 * 1024 * 1024;
const MAX_INPUT_BYTES = 40 * 1024 * 1024;

const HEIC_HINT =
  "Couldn't read this photo. If it's an iPhone HEIC image, export it as JPEG (Photos → Share) or set Camera → Formats → Most Compatible, then try again.";

async function decodeImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error(HEIC_HINT));
          el.src = url;
        });
        return await createImageBitmap(img);
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Couldn't encode this photo as JPEG."));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function compressDecoded(bitmap: ImageBitmap): Promise<Blob> {
  let { width, height } = bitmap;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Couldn't process this photo in the browser.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.88;
  let blob = await canvasToBlob(canvas, quality);
  while (blob.size > MAX_OUTPUT_BYTES && quality > 0.5) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }
  if (blob.size > MAX_OUTPUT_BYTES) {
    throw new Error(
      "That photo is still too large after shrinking. Try a smaller JPEG.",
    );
  }
  return blob;
}

function fileNameAsJpeg(name: string): string {
  const base = name.replace(/\.[^.]+$/, "") || "part";
  return `${base}.jpg`;
}

/**
 * Resize and re-encode phone photos so they fit under Vercel/Next.js
 * upload limits, bake in EXIF orientation, and always produce image/jpeg.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.size === 0) {
    throw new Error("The photo didn't attach correctly. Try choosing it again.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("That photo is too large (over 40MB). Try a smaller JPEG.");
  }

  try {
    const bitmap = await decodeImage(file);
    const blob = await compressDecoded(bitmap);
    return new File([blob], fileNameAsJpeg(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    const mime = await resolveImageMime(file);
    if (mime === "image/heic") {
      throw new Error(HEIC_HINT);
    }
    if (
      mime &&
      ALLOWED_IMAGE_MIME.has(mime) &&
      file.size <= MAX_OUTPUT_BYTES
    ) {
      if (file.type === mime) return file;
      const ext = extensionForMime(mime);
      const named = file.name.includes(".")
        ? file.name
        : `${file.name || "part"}${ext}`;
      return new File([file], named, { type: mime, lastModified: Date.now() });
    }
    throw error instanceof Error ? error : new Error(HEIC_HINT);
  }
}
