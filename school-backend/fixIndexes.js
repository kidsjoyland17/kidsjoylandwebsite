// fixIndexes.js
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    await mongoose.connection.db.collection("students").dropIndex("phone_1");
    console.log("✅ Dropped stale phone_1 index");
  } catch (e) {
    console.log("ℹ️ Index not found or already dropped:", e.message);
  } finally {
    await mongoose.disconnect();
  }
});