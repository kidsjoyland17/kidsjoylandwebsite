/**
 * cloudinary.js — on-the-fly image optimization helper
 *
 * All gallery/banner/feature images are already hosted on Cloudinary
 * (see backend upload.middleware.js). Cloudinary lets us request a
 * resized, compressed, auto-format version of ANY existing image just
 * by inserting a transformation segment into the URL — no re-upload
 * needed, no extra backend work.
 *
 * Before: <img src="https://res.cloudinary.com/xyz/image/upload/v123/photo.jpg" />
 *   -> downloads the full original (often 2-8MB from a phone camera)
 *
 * After:  optimizeImage(url, { width: 400 })
 *   -> "https://res.cloudinary.com/xyz/image/upload/w_400,q_auto,f_auto,c_fill/v123/photo.jpg"
 *   -> downloads a ~20-60KB image sized for exactly where it's displayed
 *
 * This is the single biggest fix for "images load slow".
 */

const UPLOAD_MARKER = "/upload/";

/**
 * @param {string} url - original Cloudinary URL (or any URL; non-Cloudinary URLs pass through untouched)
 * @param {object} opts
 * @param {number} [opts.width] - target display width in px
 * @param {number} [opts.height] - target display height in px
 * @param {string} [opts.crop] - cloudinary crop mode, default "fill" when width+height given, else "limit"
 * @param {string} [opts.quality] - default "auto"
 */
export function optimizeImage(url, opts = {}) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes(UPLOAD_MARKER)) {
    return url; // not a Cloudinary URL (e.g. local asset) — leave as-is
  }

  const { width, height, crop, quality = "auto" } = opts;

  const parts = [`q_${quality}`, "f_auto"];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop || (width && height ? "fill" : "limit")}`);

  const transform = parts.join(",");
  const [before, after] = url.split(UPLOAD_MARKER);
  return `${before}${UPLOAD_MARKER}${transform}/${after}`;
}

/** Build a srcSet string for responsive <img srcset> across common breakpoints. */
export function buildSrcSet(url, widths = [320, 480, 768, 1024, 1600]) {
  if (!url || !url.includes("res.cloudinary.com")) return undefined;
  return widths.map((w) => `${optimizeImage(url, { width: w })} ${w}w`).join(", ");
}

export default optimizeImage;
