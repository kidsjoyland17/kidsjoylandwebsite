/**
 * env.js — Environment variable validation
 * Imported by server.js BEFORE anything else.
 * Fails fast with a clear message if any required variable is missing.
 */

const REQUIRED = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach((k) => console.error(`   - ${k}`));
  console.error("\n👉 Copy .env.example to .env and fill in the values.");
  process.exit(1);
}

console.log("✅ Environment variables validated");