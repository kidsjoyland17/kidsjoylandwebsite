/**
 * seedAdmin.js — Seeds a single admin user
 *
 * Edit the ADMIN object below, then run:  node seedAdmin.js
 * Env: MONGO_URI in .env
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./src/models/User.model.js";

const ADMIN = {
  name:     "Biswajit Paul",
  email:    "kidsjoyland17@gmail.com",
  password: "biswajit@123",
};

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("❌  MONGO_URI is not set. Add it to your .env file.");

  console.log("Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("Connected.\n");

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log(`⚠  Removing existing user "${ADMIN.email}"…`);
    await User.deleteOne({ email: ADMIN.email });
  }

  await User.create({
    name:     ADMIN.name,
    email:    ADMIN.email,
    password: ADMIN.password, // plain text — pre("save") hook hashes it
    role:     "admin",
    isActive: true,
  });

  console.log(`✅  Admin "${ADMIN.name}" created successfully!\n`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  mongoose.disconnect();
  process.exit(1);
});