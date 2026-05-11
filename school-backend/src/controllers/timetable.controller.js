import Timetable from "../models/Timetable.model.js";
import Teacher   from "../models/Teacher.model.js";
// ✅ B-19: import shared utils instead of local ok/err helpers
import { sendSuccess, sendError } from "../utils/response.js";

/* ── default periods ──────────────────────────────────────── */
const DEFAULT_SLOTS = [
  { period: 1, startTime: "08:00", endTime: "08:45", subject: "", teacher: null, type: "class" },
  { period: 2, startTime: "08:45", endTime: "09:30", subject: "", teacher: null, type: "class" },
  { period: 3, startTime: "09:30", endTime: "10:15", subject: "", teacher: null, type: "class" },
  { period: 4, startTime: "10:15", endTime: "10:30", subject: "", teacher: null, type: "break" },
  { period: 5, startTime: "10:30", endTime: "11:15", subject: "", teacher: null, type: "class" },
  { period: 6, startTime: "11:15", endTime: "12:00", subject: "", teacher: null, type: "class" },
  { period: 7, startTime: "12:00", endTime: "12:30", subject: "", teacher: null, type: "break" },
  { period: 8, startTime: "12:30", endTime: "13:15", subject: "", teacher: null, type: "class" },
  { period: 9, startTime: "13:15", endTime: "14:00", subject: "", teacher: null, type: "class" },
];

/**
 * GET /api/timetable?class=5&day=Monday
 */
export const getTimetable = async (req, res, next) => {
  try {
    const { class: cls, day } = req.query;
    const filter = {};
    if (cls) filter.class = cls;
    if (day) filter.day   = day;

    const timetables = await Timetable.find(filter)
      .populate({ path: "slots.teacher", populate: { path: "user", select: "name" } })
      .lean();

    // ✅ B-19: was ok(res, timetables) — local helper, inconsistent shape
    sendSuccess(res, timetables);
  } catch (e) { next(e); }
};

/**
 * GET /api/timetable/:class/:day
 */
export const getTimetableByClassDay = async (req, res, next) => {
  try {
    const { class: cls, day } = req.params;

    let tt = await Timetable.findOne({ class: cls, day })
      .populate({ path: "slots.teacher", populate: { path: "user", select: "name" } })
      .lean();

    if (!tt) {
      tt = { class: cls, day, slots: DEFAULT_SLOTS, status: "draft" };
    }

    sendSuccess(res, tt); // ✅ B-19
  } catch (e) { next(e); }
};

/**
 * POST /api/timetable
 */
export const upsertTimetable = async (req, res, next) => {
  try {
    const { class: cls, day, slots, status } = req.body;

    if (!cls || !day)
      return sendError(res, "class and day are required"); // ✅ B-19
    if (!Array.isArray(slots) || slots.length === 0)
      return sendError(res, "slots array is required");    // ✅ B-19

    const teacherIds = slots
      .filter((s) => s.teacher && s.type === "class")
      .map((s) => s.teacher.toString());

    if (teacherIds.length) {
      const conflicts = await Timetable.find({
        day,
        class: { $ne: cls },
        "slots.teacher": { $in: teacherIds },
      })
        .populate({ path: "slots.teacher", populate: { path: "user", select: "name" } })
        .lean();

      for (const conflict of conflicts) {
        // ✅ B-10: was slots.find() — only checked the FIRST slot a teacher
        //    appeared in. If a teacher had multiple slots, conflicts on the
        //    others were silently missed. Now uses filter() to get ALL slots.
        for (const slot of conflict.slots.filter(
          (s) => s.teacher && teacherIds.includes(
            s.teacher._id?.toString() || s.teacher.toString()
          )
        )) {
          const tid = slot.teacher._id?.toString() || slot.teacher.toString();

          // ✅ B-10: also check ALL requesting slots for that teacher, not just
          //    the first one found (was slots.find — same bug on the req side).
          const reqSlots = slots.filter((s) => s.teacher?.toString() === tid);
          for (const reqSlot of reqSlots) {
            if (reqSlot.startTime < slot.endTime && reqSlot.endTime > slot.startTime) {
              const tName = slot.teacher.user?.name || "A teacher";
              return sendError( // ✅ B-19
                res,
                `Conflict: ${tName} is already assigned to Class ${conflict.class} on ${day} from ${slot.startTime}–${slot.endTime}`,
                409
              );
            }
          }
        }
      }
    }

    const tt = await Timetable.findOneAndUpdate(
      { class: cls, day },
      {
        slots,
        status: status || "draft",
        createdBy: req.user?._id || req.user?.id,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate({ path: "slots.teacher", populate: { path: "user", select: "name" } });

    sendSuccess(res, tt, "Timetable saved"); // ✅ B-19
  } catch (e) { next(e); }
};

/**
 * PATCH /api/timetable/:class/:day/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { class: cls, day } = req.params;
    const { status }          = req.body;

    if (!["draft", "published"].includes(status))
      return sendError(res, "status must be draft or published"); // ✅ B-19

    const tt = await Timetable.findOneAndUpdate(
      { class: cls, day },
      { status },
      { returnDocument: "after" }
    );
    if (!tt) return sendError(res, "Timetable not found", 404); // ✅ B-19

    sendSuccess(res, tt, `Timetable ${status}`); // ✅ B-19
  } catch (e) { next(e); }
};

/**
 * DELETE /api/timetable/:class/:day
 */
export const deleteTimetable = async (req, res, next) => {
  try {
    const { class: cls, day } = req.params;
    const tt = await Timetable.findOneAndDelete({ class: cls, day });
    if (!tt) return sendError(res, "Timetable not found", 404); // ✅ B-19
    sendSuccess(res, null, "Timetable deleted");                 // ✅ B-19
  } catch (e) { next(e); }
};

/**
 * POST /api/timetable/:class/:day/copy
 */
export const copyDay = async (req, res, next) => {
  try {
    const { class: cls, day } = req.params;
    const { targetDay }       = req.body;

    if (!targetDay) return sendError(res, "targetDay is required"); // ✅ B-19

    const source = await Timetable.findOne({ class: cls, day }).lean();
    if (!source) return sendError(res, "Source timetable not found", 404); // ✅ B-19

    const copied = await Timetable.findOneAndUpdate(
      { class: cls, day: targetDay },
      { slots: source.slots, status: "draft", createdBy: req.user?._id || req.user?.id },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate({ path: "slots.teacher", populate: { path: "user", select: "name" } });

    sendSuccess(res, copied, `Timetable copied to ${targetDay}`); // ✅ B-19
  } catch (e) { next(e); }
};

/**
 * GET /api/timetable/teacher/:teacherId
 */
export const getTeacherTimetable = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    const timetables = await Timetable.find({
      "slots.teacher": teacherId,
      status: "published",
    })
      .populate({ path: "slots.teacher", populate: { path: "user", select: "name" } })
      .lean();

    sendSuccess(res, timetables); // ✅ B-19
  } catch (e) { next(e); }
};