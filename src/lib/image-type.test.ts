import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mimeFromFileName,
  normalizeDeclaredImageMime,
  resolveImageMime,
  sniffImageMimeFromBytes,
} from "./image-type.ts";

test("sniffs JPEG magic bytes used by phone camera photos", () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  assert.equal(sniffImageMimeFromBytes(jpeg), "image/jpeg");
});

test("sniffs PNG, GIF, and WebP", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  const webp = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]);
  assert.equal(sniffImageMimeFromBytes(png), "image/png");
  assert.equal(sniffImageMimeFromBytes(gif), "image/gif");
  assert.equal(sniffImageMimeFromBytes(webp), "image/webp");
});

test("sniffs iPhone HEIC ftyp brand", () => {
  const heic = new Uint8Array(12);
  heic[4] = 0x66; // f
  heic[5] = 0x74; // t
  heic[6] = 0x79; // y
  heic[7] = 0x70; // p
  heic[8] = 0x68; // h
  heic[9] = 0x65; // e
  heic[10] = 0x69; // i
  heic[11] = 0x63; // c
  assert.equal(sniffImageMimeFromBytes(heic), "image/heic");
});

test("normalizes mobile MIME aliases including empty type", () => {
  assert.equal(normalizeDeclaredImageMime("image/jpg"), "image/jpeg");
  assert.equal(normalizeDeclaredImageMime("image/pjpeg"), "image/jpeg");
  assert.equal(normalizeDeclaredImageMime("IMAGE/JPEG"), "image/jpeg");
  assert.equal(normalizeDeclaredImageMime(""), null);
  assert.equal(normalizeDeclaredImageMime("application/octet-stream"), null);
});

test("falls back to filename for iOS camera roll names", () => {
  assert.equal(mimeFromFileName("image.jpeg"), "image/jpeg");
  assert.equal(mimeFromFileName("IMG_1234.JPG"), "image/jpeg");
  assert.equal(mimeFromFileName("photo.HEIC"), "image/heic");
});

test("resolves iOS JPEG with empty MIME type from magic bytes", async () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  const file = new File([jpeg], "image.jpeg", { type: "" });
  assert.equal(await resolveImageMime(file), "image/jpeg");
});

test("resolves Android image/jpg alias", async () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x10]);
  const file = new File([jpeg], "IMG_1234.JPG", { type: "image/jpg" });
  assert.equal(await resolveImageMime(file), "image/jpeg");
});
