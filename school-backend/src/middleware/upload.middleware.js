import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// ─────────────────────────────────────────────────────────────────
// Shared file filter — images only (no PDF for gallery/banners)
// ─────────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const mime = file.mimetype;                       // e.g. "image/jpeg"
  if (allowed.test(mime)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, and WebP images are allowed."));
};

const SIZE_5MB = { fileSize: 5 * 1024 * 1024 };

// ─────────────────────────────────────────────────────────────────
// Banner storage  →  kidsjoyland/banners
// ─────────────────────────────────────────────────────────────────
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kidsjoyland/banners",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1600, height: 900, crop: "fill", quality: "auto", fetch_format: "auto" },
    ],
  },
});

// ─────────────────────────────────────────────────────────────────
// Gallery storage  →  kidsjoyland/gallery
// ─────────────────────────────────────────────────────────────────
const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Organise by category sub-folder: kidsjoyland/gallery/sports, /arts, etc.
    const category = (req.body.category || "general")
      .toLowerCase()
      .replace(/\s+/g, "-");

    return {
      folder: `kidsjoyland/gallery/${category}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 1200, height: 900, crop: "limit", quality: "auto", fetch_format: "auto" },
      ],
    };
  },
});

// ─────────────────────────────────────────────────────────────────
// Exported middleware
// ─────────────────────────────────────────────────────────────────

export const uploadBannerImage = multer({
  storage: bannerStorage,
  fileFilter: imageFilter,
  limits: SIZE_5MB,
}).single("image");

export const uploadGalleryImage = multer({
  storage: galleryStorage,
  fileFilter: imageFilter,
  limits: SIZE_5MB,
}).single("image");