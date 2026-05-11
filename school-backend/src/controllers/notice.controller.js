import Notice from "../models/Notice.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

// ─── Get Public Notices (no auth) ─────────────
// Used by the landing page ticker — visible to everyone.
export const getPublicNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("title message date targetClass")
      .lean();
    return sendSuccess(res, notices);
  } catch (error) {
    next(error);
  }
};

// ─── Create Notice ─────────────────────────────
export const createNotice = async (req, res, next) => {
  try {
    const { title, message, date, targetClass } = req.body;

    if (!title || !message || !date || !targetClass) {
      // ✅ B-20: was res.status(400).json({ ... }) inline — now uses util
      return sendError(res, "All fields (title, message, date, targetClass) are required.", 400);
    }

    const createdBy = req.user?._id || req.user?.id || req.user?.userId;

    const notice = await Notice.create({
      title,
      message,
      date,
      targetClass,
      ...(createdBy && { createdBy }),
    });

    // ✅ B-20: was res.status(201).json({ ... }) inline
    return sendSuccess(res, notice, "Notice created successfully.", 201);
  } catch (error) {
    // ✅ B-20: was leaking error.message to client in production
    next(error);
  }
};

// ─── Get All Notices ───────────────────────────
export const getAllNotices = async (req, res, next) => {
  try {
    const { targetClass, search } = req.query;
    const filter = {};

    if (targetClass && targetClass !== "All Classes") {
      filter.targetClass = { $in: [targetClass, "All Classes"] };
    }

    if (search) {
      filter.$or = [
        { title:   { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const notices = await Notice.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    // ✅ B-20: was res.status(200).json({ success, count, data }) inline
    return sendSuccess(res, notices);
  } catch (error) {
    next(error); // ✅ B-20: error detail no longer leaks to client
  }
};

// ─── Get Single Notice ─────────────────────────
export const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate("createdBy", "name email");

    if (!notice) {
      return sendError(res, "Notice not found.", 404); // ✅ B-20
    }

    return sendSuccess(res, notice); // ✅ B-20
  } catch (error) {
    next(error); // ✅ B-20
  }
};

// ─── Update Notice ─────────────────────────────
export const updateNotice = async (req, res, next) => {
  try {
    const { title, message, date, targetClass } = req.body;
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return sendError(res, "Notice not found.", 404); // ✅ B-20
    }

    if (title)       notice.title       = title;
    if (message)     notice.message     = message;
    if (date)        notice.date        = date;
    if (targetClass) notice.targetClass = targetClass;

    await notice.save();

    return sendSuccess(res, notice, "Notice updated successfully."); // ✅ B-20
  } catch (error) {
    next(error); // ✅ B-20
  }
};

// ─── Delete Notice ─────────────────────────────
export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return sendError(res, "Notice not found.", 404); // ✅ B-20
    }

    await notice.deleteOne();

    return sendSuccess(res, null, "Notice deleted successfully."); // ✅ B-20
  } catch (error) {
    next(error); // ✅ B-20
  }
};