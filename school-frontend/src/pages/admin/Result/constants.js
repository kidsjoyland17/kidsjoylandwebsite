// ─── constants.js ─────────────────────────────────────────────────────────────

export const SKILL_MAX = { read: 10, recitation: 15, spelling: 10, writing: 15 };

export const GRADE_SCALE = [
  { min: 90, max: 100, grade: "A+" },
  { min: 80, max: 89,  grade: "A"  },
  { min: 70, max: 79,  grade: "B"  },
  { min: 60, max: 69,  grade: "C"  },
  { min: 50, max: 59,  grade: "D"  },
  { min: 40, max: 49,  grade: "E"  },
  { min: 0,  max: 39,  grade: "F"  },
];

// NOTE: SESSIONS constant removed — Bug 5.3 fix.
// Sessions must always be fetched from the backend (/admin/results/sessions)
// so they stay in sync with what's actually stored in the database.

export const PERSONALITY_GRADES = ["", "A+", "A", "B", "C", "D", "E", "F"];

export const inputCls =
  "w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl " +
  "focus:outline-none focus:border-blue-400 focus:bg-white transition-colors " +
  "placeholder:text-slate-400 text-slate-700";

export const markInputCls =
  "w-16 px-2 py-1 text-center text-sm bg-white border border-slate-200 rounded-lg " +
  "focus:outline-none focus:border-blue-400 transition-colors text-slate-700";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getGrade = (marks, fullMarks) => {
  if (marks === null || marks === undefined || marks === "") return "—";
  const pct = (Number(marks) / Number(fullMarks)) * 100;
  return GRADE_SCALE.find(g => pct >= g.min && pct <= g.max)?.grade || "F";
};

export const totalObtained = (subjects, term) =>
  subjects.reduce((sum, s) => {
    const v = typeof s[term] === "object" ? s[term]?.total : s[term];
    return sum + (v !== null && v !== undefined && v !== "" ? Number(v) : 0);
  }, 0);

export const totalFM = (subjects) =>
  subjects.reduce((s, sub) => s + Number(sub.fullMarks || 0), 0);

// ─── Empty builders ───────────────────────────────────────────────────────────

export const emptyTerm       = () => ({ unitTest: "", termExam: "", total: "" });
export const emptySkills     = () => ({ read: "", recitation: "", spelling: "", writing: "" });
export const emptyAttendance = () => ({ workingDays: "", daysAbsent: "", totalStudents: "" });
export const emptyPersonality= () => ({ firstTerm: "", secondTerm: "", final: "" });
export const emptyRank       = () => ({ firstTerm: "", secondTerm: "", final: "", overall: "" });

export function buildEmptyForm(subjects = [], session = "") {
  return {
    studentId: "",
    session,
    subjects: subjects.map(s => ({
      ...s,
      firstTerm:  emptyTerm(),
      secondTerm: emptyTerm(),
      final:      emptyTerm(),
    })),
    englishSkills: {
      firstTerm:  emptySkills(),
      secondTerm: emptySkills(),
      thirdTerm:  emptySkills(),
    },
    hindiSkills: {
      firstTerm:  emptySkills(),
      secondTerm: emptySkills(),
      thirdTerm:  emptySkills(),
    },
    attendance: {
      firstTerm:  emptyAttendance(),
      secondTerm: emptyAttendance(),
      final:      emptyAttendance(),
    },
    classParticipation:    emptyPersonality(),
    discipline:            emptyPersonality(),
    neatness:              emptyPersonality(),
    courteous:             emptyPersonality(),
    responsibleDependable: emptyPersonality(),
    attitudeTeachers:      emptyPersonality(),
    rank:    emptyRank(),
    remarks: { firstTerm: "", secondTerm: "", final: "" },
    promoted:        "",
    promotedToClass: "",
    rollNo:          "",
  };
}