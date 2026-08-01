/**
 * Resizes and compresses an image file in the browser before upload, using
 * the Canvas API. Keeps storage usage down and pages fast to load, without
 * needing a server-side image pipeline.
 *
 * - Scales down to fit within maxDimension (preserving aspect ratio) --
 *   most photos from phones are far larger than anything the site displays.
 * - Re-encodes as JPEG at the given quality. This is fine for regular
 *   photos (the vast majority of what gets uploaded); it isn't used for
 *   one-off transparent assets like logos.
 */
export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<Blob> {
  // Skip compression for very small files or non-standard image types
  // where re-encoding wouldn't help (e.g. already-tiny icons, or gif/svg
  // where a canvas re-encode would lose animation/vector fidelity).
  if (file.size < 80_000 || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height / width) * maxDimension);
      width = maxDimension;
    } else {
      width = Math.round((width / height) * maxDimension);
      height = maxDimension;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file; // canvas unsupported, fall back to the original file

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  // If compression somehow produced a larger file than the original (rare,
  // e.g. already-compressed source), just use the original.
  if (!blob || blob.size >= file.size) return file;
  return blob;
}

/** Swaps a filename's extension for .jpg, matching compressImage's output. */
export function jpegFilename(originalName: string): string {
  const withoutExt = originalName.replace(/\.[^.]+$/, "");
  return `${withoutExt}.jpg`;
}
