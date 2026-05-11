// src/models/Message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true },
  phone:   { type: String, default: "" },
  grade:   { type: String, default: "" },
  subject: { type: String, default: "" },
  message: { type: String, default: "" },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);