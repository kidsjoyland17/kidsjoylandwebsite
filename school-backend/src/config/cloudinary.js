import { v2 as cloudinary } from "cloudinary";

// dotenv is already loaded by server.js before this module is imported.
// Calling dotenv.config() here again is redundant and order-dependent in ESM.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;