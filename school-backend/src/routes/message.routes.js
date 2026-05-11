// routes/message.routes.js  (naya file)
import express from "express";
import Message from "../models/Message.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

const router = express.Router();

// Contact form — public (no auth needed)
router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone, grade, message, subject } = req.body;
    if (!name || !email) return sendError(res, "Name and email required", 400);
    const msg = await Message.create({ name, email, phone, grade, message, subject });
    sendSuccess(res, msg, "Message sent successfully", 201);
  } catch (err) {
    next(err);
  }
});

export default router;