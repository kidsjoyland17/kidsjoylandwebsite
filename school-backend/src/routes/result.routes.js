import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import {
  upsertResult,
  getAllResults,
  getSessions,
  getResultById,
  getResultByStudent,
  deleteResult,
  getSubjectsByClass,
} from "../controllers/result.controller.js";

const router = express.Router();

router.use(protect, isAdmin);

// NOTE: specific routes BEFORE /:id to avoid param conflicts
router.get("/sessions",                getSessions);
router.get("/subjects/:className",     getSubjectsByClass);
router.get("/student/:studentId",      getResultByStudent);

router.get("/",    getAllResults);
router.post("/",   upsertResult);

router.get("/:id",    getResultById);
router.put("/:id",    upsertResult);   // same controller handles create + update
router.delete("/:id", deleteResult);

export default router;