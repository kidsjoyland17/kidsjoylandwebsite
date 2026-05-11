import mongoose from "mongoose";

// ── NEW: per-term breakdown ───────────────────────────────────────────────────
const termMarkSchema = new mongoose.Schema({
  unitTest: { type: Number, default: null },
  termExam: { type: Number, default: null },
  total:    { type: Number, default: null },
}, { _id: false });

const subjectMarkSchema = new mongoose.Schema({
  subject:    { type: String, required: true },
  fullMarks:  { type: Number, default: 100 },
  firstTerm:  { type: termMarkSchema, default: () => ({}) },
  secondTerm: { type: termMarkSchema, default: () => ({}) },
  final:      { type: termMarkSchema, default: () => ({}) },
}, { _id: false });

const skillMarkSchema = new mongoose.Schema({
  read:       { type: Number, default: null },
  recitation: { type: Number, default: null },
  spelling:   { type: Number, default: null },
  writing:    { type: Number, default: null },
}, { _id: false });

const personalitySchema = new mongoose.Schema({
  firstTerm:  { type: String, default: "" },
  secondTerm: { type: String, default: "" },
  final:      { type: String, default: "" },
}, { _id: false });

const attendanceTermSchema = new mongoose.Schema({
  workingDays:   { type: Number, default: null },
  daysAbsent:    { type: Number, default: null },
  totalStudents: { type: Number, default: null },
}, { _id: false });

const rankSchema = new mongoose.Schema({
  firstTerm:  { type: String, default: "" },
  secondTerm: { type: String, default: "" },
  final:      { type: String, default: "" },
  overall:    { type: String, default: "" },
}, { _id: false });

const resultSchema = new mongoose.Schema({
  // ── Student reference ────────────────────────────────────────────────────
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  // ── Snapshot fields (copied from Student at time of creation) ────────────
  studentName: { type: String,  required: true },
  rollNo:      { type: String,  default: "" },
  className:   { type: String,  required: true },
  section:     { type: String,  default: "A" },
  session:     { type: String,  required: true },

  fatherName:  { type: String, default: "" },
  motherName:  { type: String, default: "" },
  dob:         { type: Date,   default: null },
  admNo:       { type: String, default: "" },
  aadharNo:    { type: String, default: "" },

  // ── Scholastic Progress ──────────────────────────────────────────────────
  subjects: [subjectMarkSchema],

  // ── Language Skills ──────────────────────────────────────────────────────
  englishSkills: {
    firstTerm:  { type: skillMarkSchema, default: () => ({}) },
    secondTerm: { type: skillMarkSchema, default: () => ({}) },
    thirdTerm:  { type: skillMarkSchema, default: () => ({}) },
  },
  hindiSkills: {
    firstTerm:  { type: skillMarkSchema, default: () => ({}) },
    secondTerm: { type: skillMarkSchema, default: () => ({}) },
    thirdTerm:  { type: skillMarkSchema, default: () => ({}) },
  },

  // ── Attendance ───────────────────────────────────────────────────────────
  attendance: {
    firstTerm:  { type: attendanceTermSchema, default: () => ({}) },
    secondTerm: { type: attendanceTermSchema, default: () => ({}) },
    final:      { type: attendanceTermSchema, default: () => ({}) },
  },

  // ── Personality / Social Qualities ───────────────────────────────────────
  classParticipation:    { type: personalitySchema, default: () => ({}) },
  discipline:            { type: personalitySchema, default: () => ({}) },
  neatness:              { type: personalitySchema, default: () => ({}) },
  courteous:             { type: personalitySchema, default: () => ({}) },
  responsibleDependable: { type: personalitySchema, default: () => ({}) },
  attitudeTeachers:      { type: personalitySchema, default: () => ({}) },

  // ── Rank ─────────────────────────────────────────────────────────────────
  rank: { type: rankSchema, default: () => ({}) },

  // ── Teacher remarks ───────────────────────────────────────────────────────
  remarks: {
    firstTerm:  { type: String, default: "" },
    secondTerm: { type: String, default: "" },
    final:      { type: String, default: "" },
  },

  // ── Promotion ────────────────────────────────────────────────────────────
  promoted:        { type: Boolean, default: null },
  promotedToClass: { type: String,  default: "" },

  // ── Audit ─────────────────────────────────────────────────────────────────
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

resultSchema.index({ student: 1, session: 1 }, { unique: true });
resultSchema.index({ className: 1, session: 1 });

const Result = mongoose.model("Result", resultSchema);
export default Result;