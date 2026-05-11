/**
 * seed.js — School Management System
 *
 * Populates: Users, Students, Teachers, Attendance, Results,
 *            Admissions, Notices, Timetable, Messages, ClassSubjects, Passouts
 *
 * Rules:
 *  • Never seeds an admin user
 *  • Never overwrites existing documents (insertMany with ordered:false skips duplicates)
 *  • Run:  node seed.js
 *  • Env:  MONGO_URI in .env (or set inline below)
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// ─── Models ──────────────────────────────────────────────────────────────────
import User         from "./src/models/User.model.js";
import Student      from "./src/models/Student.model.js";
import Teacher      from "./src/models/Teacher.model.js";
import Attendance   from "./src/models/Attendance.model.js";
import Result       from "./src/models/Result.model.js";
import Admission    from "./src/models/Admission.model.js";
import Notice       from "./src/models/Notice.model.js";
import Timetable    from "./src/models/Timetable.model.js";
import Message      from "./src/models/Message.model.js";
import ClassSubject from "./src/models/ClassSubject.model.js";
import Passout      from "./src/models/Passout.model.js";

// ─── Constants ────────────────────────────────────────────────────────────────
import { CLASS_LIST }       from "./src/constants/classes.js";
import { DEFAULT_SUBJECTS } from "./src/constants/classSubjects.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SESSIONS = ["2024-2025", "2025-2026"];
const SECTIONS = ["A", "B", "C", "D"];
const DAYS     = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const rand    = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Realistic Indian names
const FIRST_NAMES = [
  "Aarav","Aditya","Akash","Anjali","Ananya","Arjun","Deepak","Divya",
  "Gaurav","Ishaan","Kavya","Kiran","Meera","Mohit","Neha","Nikhil",
  "Pooja","Priya","Rahul","Rajesh","Riya","Rohan","Sakshi","Sanjay",
  "Shreya","Siddharth","Simran","Sneha","Suresh","Tanvi","Varun","Vijay",
  "Vikram","Vishal","Yash","Zara","Amit","Bhavna","Chetan","Dhruv",
];
const LAST_NAMES = [
  "Kumar","Sharma","Singh","Verma","Gupta","Patel","Mehta","Shah",
  "Joshi","Mishra","Pandey","Rao","Reddy","Nair","Iyer","Pillai",
  "Chatterjee","Banerjee","Das","Bose","Malhotra","Kapoor","Chopra","Khanna",
];
const randName = () => `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;

const REMARKS_LIST = [
  "Excellent performance. Keep it up!",
  "Good effort. Needs improvement in a few subjects.",
  "Satisfactory. Encourage more participation.",
  "Outstanding student. Well done!",
  "Needs to focus more on studies.",
  "Hardworking and dedicated. Great progress.",
];

// Safe insertMany — ignores duplicate key errors, throws on anything else
const safeInsert = async (Model, docs, chunk = 500) => {
  if (!docs.length) return;
  for (let i = 0; i < docs.length; i += chunk) {
    try {
      await Model.insertMany(docs.slice(i, i + chunk), { ordered: false });
    } catch (e) {
      if (e.code !== 11000 && e.writeErrors?.every(we => we.code === 11000)) return;
      if (e.code !== 11000) throw e;
    }
  }
};

// ─── 1. USERS (teachers + students) ──────────────────────────────────────────

async function seedUsers() {
  console.log("\n── Seeding Users ──");
  const hashedPw = await bcrypt.hash("Password@123", 10);

  const teacherUsers = Array.from({ length: 15 }, (_, i) => ({
    name:     `${randName()}`,
    email:    `teacher${i + 1}@school.edu`,
    password: hashedPw,
    role:     "teacher",
    isActive: true,
  }));

  // 150 student users to cover 15 classes × 10 students
  const studentUsers = Array.from({ length: 150 }, (_, i) => ({
    name:     randName(),
    email:    `student${i + 1}@school.edu`,
    password: hashedPw,
    role:     "student",
    isActive: true,
  }));

  await safeInsert(User, [...teacherUsers, ...studentUsers]);

  const allTeacherUsers = await User.find({ role: "teacher" }).lean();
  const allStudentUsers = await User.find({ role: "student" }).lean();
  console.log(`  ✓ ${allTeacherUsers.length} teacher users, ${allStudentUsers.length} student users`);
  return { teacherUsers: allTeacherUsers, studentUsers: allStudentUsers };
}

// ─── 2. TEACHERS ─────────────────────────────────────────────────────────────

async function seedTeachers(teacherUsers) {
  console.log("\n── Seeding Teachers ──");

  const existingUserIds = new Set(
    (await Teacher.find({}, "user").lean()).map(t => String(t.user))
  );

  const SUBJECTS = ["Mathematics","English","Hindi","Science","Social Studies",
                    "Computer","G.K.","Drawing","EVS","M. Science"];
  const QUALIFS  = ["B.Ed","M.Ed","B.Sc B.Ed","M.A. B.Ed","Ph.D"];
  const classes  = CLASS_LIST.filter(c => c !== "Pre-Nursery");

  const docs = teacherUsers
    .filter(u => !existingUserIds.has(String(u._id)))
    .map((u, i) => {
      const primarySubject = SUBJECTS[i % SUBJECTS.length];
      return {
        user:            u._id,
        teacherId:       `TCH${String(i + 1).padStart(4, "0")}`,
        subject:         primarySubject,
        assignedClasses: [
          { className: classes[i % classes.length],           subject: primarySubject },
          { className: classes[(i + 3) % classes.length],     subject: primarySubject },
        ],
        phone:           `98${randInt(10000000, 99999999)}`,
        qualification:   rand(QUALIFS),
        experience:      randInt(1, 20),
        address:         `${randInt(1, 200)}, MG Road, Patna, Bihar`,
        joiningDate:     new Date(`${randInt(2010, 2023)}-${String(randInt(1,12)).padStart(2,"0")}-01`),
        bio:             `Experienced ${primarySubject} teacher with ${randInt(1,20)} years in education.`,
        profileCompleted: true,
      };
    });

  await safeInsert(Teacher, docs);
  const teachers = await Teacher.find().lean();
  console.log(`  ✓ ${teachers.length} teachers`);
  return teachers;
}

// ─── 3. STUDENTS ─────────────────────────────────────────────────────────────

async function seedStudents(studentUsers) {
  console.log("\n── Seeding Students ──");

  const existingUserIds = new Set(
    (await Student.find({}, "user").lean()).map(s => String(s.user))
  );

  const LOCALITIES = ["Gandhi Nagar","Boring Road","Kankarbagh","Rajendra Nagar","Patliputra"];
  const PER_CLASS  = 10;

  const docs = [];
  let userIdx = 0;

  for (const cls of CLASS_LIST) {
    for (let j = 0; j < PER_CLASS; j++) {
      const u = studentUsers[userIdx % studentUsers.length];
      userIdx++;
      if (existingUserIds.has(String(u._id))) continue;

      docs.push({
        user:        u._id,
        name:        u.name,
        class:       cls,
        section:     SECTIONS[j % 4],
        rollNo:      `${cls.replace(/\s/g,"").toUpperCase()}${String(j + 1).padStart(3,"0")}`,
        gender:      rand(["Male","Female"]),
        dob:         new Date(
          `${randInt(2005,2018)}-${String(randInt(1,12)).padStart(2,"0")}-${String(randInt(1,28)).padStart(2,"0")}`
        ),
        parentName:  randName(),
        parentPhone: `9${randInt(100000000, 999999999)}`,
        address:     `${randInt(1,200)}, ${rand(LOCALITIES)}, Patna`,
      });
    }
  }

  await safeInsert(Student, docs);
  const students = await Student.find().lean();
  console.log(`  ✓ ${students.length} students`);
  return students;
}

// ─── 4. CLASS SUBJECTS ────────────────────────────────────────────────────────

async function seedClassSubjects() {
  console.log("\n── Seeding ClassSubjects ──");

  const existing = new Set(
    (await ClassSubject.find({}, "className").lean()).map(d => d.className)
  );

  const docs = CLASS_LIST
    .filter(cls => !existing.has(cls))
    .map(cls => ({
      className: cls,
      subjects:  DEFAULT_SUBJECTS[cls] ?? ["English","Mathematics","Hindi","Drawing","EVS"],
    }));

  await safeInsert(ClassSubject, docs);
  console.log(`  ✓ ${CLASS_LIST.length} class-subject configs`);
}

// ─── 5. ATTENDANCE ────────────────────────────────────────────────────────────

async function seedAttendance(students, teachers) {
  console.log("\n── Seeding Attendance ──");

  if (!teachers.length) { console.log("  ⚠ No teachers found, skipping."); return; }

  const existing = new Set(
    (await Attendance.find({}, "student date").lean())
      .map(a => `${a.student}_${a.date.toISOString().slice(0,10)}`)
  );

  // Realistic ratio: mostly Present
  const STATUSES = ["Present","Present","Present","Present","Absent","Late"];

  // Build ~20 school dates per session (Mon–Sat, one per week, June–Oct)
  const buildDates = (startYear) => {
    const dates = [];
    for (let m = 6; m <= 10; m++) {
      for (let d = 1; d <= 28; d += 7) {
        const dt  = new Date(`${startYear}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
        const dow = dt.getDay();
        if (dow >= 1 && dow <= 6) dates.push(dt);
      }
    }
    return dates;
  };

  const docs = [];
  for (const session of SESSIONS) {
    const year  = parseInt(session.split("-")[0]);
    const dates = buildDates(year);

    for (const student of students) {
      const teacher = rand(teachers);
      for (const date of dates) {
        const key = `${student._id}_${date.toISOString().slice(0,10)}`;
        if (existing.has(key)) continue;
        existing.add(key);
        docs.push({
          student: student._id,
          teacher: teacher.user,   // Teacher stores User ObjectId in .user
          date,
          status:  rand(STATUSES),
          class:   student.class,
        });
      }
    }
  }

  await safeInsert(Attendance, docs, 500);
  const total = await Attendance.countDocuments();
  console.log(`  ✓ ${total} attendance records`);
}

// ─── 6. RESULTS ──────────────────────────────────────────────────────────────

async function seedResults(students) {
  console.log("\n── Seeding Results ──");

  const existing = new Set(
    (await Result.find({}, "student session").lean())
      .map(r => `${r.student}_${r.session}`)
  );

  const skillMark = () => ({
    read:       randInt(8, 15),
    recitation: randInt(8, 15),
    spelling:   randInt(8, 15),
    writing:    randInt(8, 15),
  });

  const pgGrade = () => rand(["A+","A","A","B","B","C"]);

  const docs = [];
  for (const session of SESSIONS) {
    for (const student of students) {
      const key = `${student._id}_${session}`;
      if (existing.has(key)) continue;
      existing.add(key);

      const rawSubs = DEFAULT_SUBJECTS[student.class] ?? ["English","Mathematics","Hindi","Drawing","EVS"];

      const subjects = rawSubs.map(name => {
        const full  = name === "Drawing" ? 50 : name === "EVS" ? 200 : 100;
        const t1    = randInt(Math.round(full * 0.33), full);
        const t2    = randInt(Math.round(full * 0.33), full);
        const final = randInt(Math.round(full * 0.33), full);
        return { subject: name, fullMarks: full, firstTerm: t1, secondTerm: t2, final };
      });

      const promoted = subjects.every(s => s.final / s.fullMarks >= 0.33);
      const currIdx  = CLASS_LIST.indexOf(student.class);

      docs.push({
        student:     student._id,
        studentName: student.name,
        rollNo:      student.rollNo ?? "",
        className:   student.class,
        section:     student.section ?? "A",
        session,
        subjects,

        englishSkills: {
          firstTerm:  skillMark(),
          secondTerm: skillMark(),
          thirdTerm:  skillMark(),
        },
        hindiSkills: {
          firstTerm:  skillMark(),
          secondTerm: skillMark(),
          thirdTerm:  skillMark(),
        },

        attendance: {
          firstTerm:  { workingDays: 80,  daysAbsent: randInt(0,10), totalStudents: 10 },
          secondTerm: { workingDays: 90,  daysAbsent: randInt(0,10), totalStudents: 10 },
          final:      { workingDays: 170, daysAbsent: randInt(0,15), totalStudents: 10 },
        },

        classParticipation: { firstTerm: pgGrade(), secondTerm: pgGrade(), final: pgGrade() },
        discipline:         { firstTerm: pgGrade(), secondTerm: pgGrade(), final: pgGrade() },
        neatness:           { firstTerm: pgGrade(), secondTerm: pgGrade(), final: pgGrade() },

        remarks: {
          firstTerm:  rand(REMARKS_LIST),
          secondTerm: rand(REMARKS_LIST),
          final:      rand(REMARKS_LIST),
        },

        promoted,
        promotedToClass: promoted
          ? (CLASS_LIST[currIdx + 1] ?? "Passed Out")
          : student.class,
      });
    }
  }

  await safeInsert(Result, docs, 100);
  const total = await Result.countDocuments();
  console.log(`  ✓ ${total} result records`);
}

// ─── 7. ADMISSIONS ────────────────────────────────────────────────────────────

async function seedAdmissions() {
  console.log("\n── Seeding Admissions ──");

  const existing = await Admission.countDocuments();
  if (existing >= 30) { console.log(`  ✓ Already ${existing} admissions, skipping.`); return; }

  const STATUSES  = ["pending","pending","approved","approved","rejected","waitlisted"];
  const ADM_TYPES = ["New Admission","Transfer","Re-Admission"];
  const AREAS     = ["Gandhi Nagar","Ashok Rajpath","Fraser Road","Boring Road","Kankarbagh"];

  const docs = Array.from({ length: 30 }, (_, i) => {
    const year   = rand(["2024","2025","2026"]);
    const issued = rand([true, false]);
    return {
      childName:    randName(),
      applyingFor:  rand(CLASS_LIST.slice(0, 8)),
      childDob:     `${randInt(2010,2020)}-${String(randInt(1,12)).padStart(2,"0")}-${String(randInt(1,28)).padStart(2,"0")}`,
      childGender:  rand(["Male","Female"]),
      parentPhone:  `9${randInt(100000000, 999999999)}`,
      parentEmail:  `parent${i + 1}@gmail.com`,
      address:      `${randInt(1,200)}, ${rand(AREAS)}, Patna`,
      year,
      admissionType: rand(ADM_TYPES),
      fatherName:   randName(),
      motherName:   randName(),
      status:       rand(STATUSES),
      notes:        rand(["","","Documents pending","Needs interview","Fee concession requested"]),
    };
  });

  await safeInsert(Admission, docs);
  console.log(`  ✓ 30 admission applications`);
}

// ─── 8. NOTICES ──────────────────────────────────────────────────────────────

async function seedNotices() {
  console.log("\n── Seeding Notices ──");

  const existing = await Notice.countDocuments();
  if (existing >= 20) { console.log(`  ✓ Already ${existing} notices, skipping.`); return; }

  const TARGETS = [
    "All Classes","Nursery","LKG","UKG",
    "Class 1","Class 2","Class 3","Class 4","Class 5",
    "Class 6","Class 7","Class 8","Class 9","Class 10",
  ];

  const NOTICE_DATA = [
    { title: "Annual Sports Day",         message: "Annual Sports Day will be held on 15th March. All students must participate." },
    { title: "Parent-Teacher Meeting",    message: "PTM scheduled for this Saturday. Parents are requested to attend without fail." },
    { title: "Summer Vacation Notice",    message: "School will remain closed from 1st May to 15th June for summer vacation." },
    { title: "Fee Submission Reminder",   message: "Last date for fee submission is 10th of this month. Avoid late fee charges." },
    { title: "Republic Day Celebration",  message: "Republic Day will be celebrated on 26th Jan. All students to dress in white." },
    { title: "Half-Yearly Exam Schedule", message: "Half-yearly exams begin 20th September. Collect timetable from class teacher." },
    { title: "Annual Function",           message: "Annual function is on 5th December. Rehearsals begin next week." },
    { title: "Science Exhibition",        message: "Inter-school science exhibition on 10th November. Entries are now open." },
    { title: "Diwali Holiday",            message: "School closed for Diwali from 20–25 October. Happy Diwali to all!" },
    { title: "New Session Begins",        message: "New academic session starts 1st April. Collect new books from the school office." },
    { title: "Independence Day",          message: "Independence Day celebrated with flag hoisting on 15th August at 8 AM." },
    { title: "Library Day",               message: "Library Day on 14th November. Book fair open in the school premises." },
    { title: "Yoga Day",                  message: "International Yoga Day on 21st June. All students must participate." },
    { title: "Examination Guidelines",    message: "Students must carry their hall tickets during all examinations. No entry without it." },
    { title: "ID Card Mandatory",         message: "School ID cards are mandatory from next week. Collect from the school office." },
    { title: "Computer Lab Rules",        message: "New computer lab rules are now in effect. No food or drink allowed inside." },
    { title: "Eco-Club Plantation Drive", message: "Plantation drive on World Environment Day. Students to bring saplings." },
    { title: "Board Exam Results",        message: "Class 10 board results declared. Heartiest congratulations to all students!" },
    { title: "Winter Uniform",            message: "Winter uniform is mandatory from 1st November onwards." },
    { title: "Mid-Term Break",            message: "Mid-term break from 15–20 October. School resumes normally on 21st October." },
  ];

  const docs = NOTICE_DATA.map((n, i) => ({
    ...n,
    date:        new Date(Date.now() - randInt(0, 180) * 24 * 60 * 60 * 1000),
    targetClass: TARGETS[i % TARGETS.length],
  }));

  await safeInsert(Notice, docs);
  console.log(`  ✓ 20 notices`);
}

// ─── 9. TIMETABLE ────────────────────────────────────────────────────────────

async function seedTimetable(teachers) {
  console.log("\n── Seeding Timetable ──");

  // Classes supported by the Timetable model enum
  const TT_CLASSES = ["Nursery","LKG","UKG","1","2","3","4","5","6","7","8","9","10"];

  const existing = new Set(
    (await Timetable.find({}, "class day").lean()).map(t => `${t.class}_${t.day}`)
  );

  // Period template (9 slots including 2 breaks)
  const PERIOD_TEMPLATE = [
    { period:1, startTime:"08:00", endTime:"08:45", type:"class" },
    { period:2, startTime:"08:45", endTime:"09:30", type:"class" },
    { period:3, startTime:"09:30", endTime:"10:15", type:"class" },
    { period:4, startTime:"10:15", endTime:"10:30", type:"break" },
    { period:5, startTime:"10:30", endTime:"11:15", type:"class" },
    { period:6, startTime:"11:15", endTime:"12:00", type:"class" },
    { period:7, startTime:"12:00", endTime:"12:45", type:"class" },
    { period:8, startTime:"12:45", endTime:"13:00", type:"break" },
    { period:9, startTime:"13:00", endTime:"13:45", type:"class" },
  ];

  const docs = [];
  for (const cls of TT_CLASSES) {
    const subs = DEFAULT_SUBJECTS[cls] ?? ["English","Mathematics","Hindi","Drawing","EVS"];
    for (const day of DAYS) {
      if (existing.has(`${cls}_${day}`)) continue;

      const slots = PERIOD_TEMPLATE.map(p => {
        if (p.type === "break") {
          return { period: p.period, startTime: p.startTime, endTime: p.endTime,
                   subject: "Break", teacher: null, type: "break" };
        }
        return {
          period:    p.period,
          startTime: p.startTime,
          endTime:   p.endTime,
          subject:   rand(subs),
          teacher:   rand(teachers)._id,
          type:      "class",
        };
      });

      docs.push({ class: cls, day, slots, status: "published" });
    }
  }

  await safeInsert(Timetable, docs);
  const total = await Timetable.countDocuments();
  console.log(`  ✓ ${total} timetable entries`);
}

// ─── 10. MESSAGES ────────────────────────────────────────────────────────────

async function seedMessages() {
  console.log("\n── Seeding Messages ──");

  const existing = await Message.countDocuments();
  if (existing >= 20) { console.log(`  ✓ Already ${existing} messages, skipping.`); return; }

  const SUBJECTS = [
    "Enquiry about admission","Fee structure request","Scholarship information",
    "Transfer certificate query","Bus route enquiry","Child progress enquiry",
    "Sports activity details","Library card request","School timing change","General enquiry",
  ];
  const MESSAGES = [
    "Hello, I wanted to know more about the admission process for next year.",
    "Could you please share the complete fee structure for this class?",
    "My child is interested in applying for a merit scholarship. Please guide.",
    "We are relocating from another city. What documents are needed for admission?",
    "Is there a school bus available for the Kankarbagh area?",
    "I would like to discuss my child's recent performance in exams.",
    "What sports activities are available for students in Classes 6–8?",
    "Can my child get a library card for borrowing books at home?",
    "Has the school timing changed for the winter months?",
    "Please send me information about extra-curricular activities available.",
  ];

  const docs = Array.from({ length: 20 }, (_, i) => ({
    name:    randName(),
    email:   `enquiry${i + 1}@gmail.com`,
    phone:   `9${randInt(100000000, 999999999)}`,
    grade:   rand(CLASS_LIST),
    subject: SUBJECTS[i % SUBJECTS.length],
    message: MESSAGES[i % MESSAGES.length],
    read:    rand([true, false, false]),  // mostly unread
  }));

  await safeInsert(Message, docs);
  console.log(`  ✓ 20 messages`);
}

// ─── 11. PASSOUTS ────────────────────────────────────────────────────────────

async function seedPassouts() {
  console.log("\n── Seeding Passouts ──");

  const existing = await Passout.countDocuments();
  if (existing >= 20) { console.log(`  ✓ Already ${existing} passout records, skipping.`); return; }

  const REASONS = ["Completed","Completed","Completed","Transfer","Dropout"];
  let certNo = 1001;

  const docs = Array.from({ length: 20 }, (_, i) => {
    const year   = randInt(2019, 2024);
    const issued = rand([true, true, false]);
    return {
      name:                randName(),
      rollNo:              `10-${String(i + 1).padStart(3,"0")}`,
      gender:              rand(["Male","Female"]),
      dob:                 new Date(`${randInt(2004,2010)}-06-15`),
      address:             `${randInt(1,200)}, Patna, Bihar`,
      parentName:          randName(),
      parentPhone:         `9${randInt(100000000,999999999)}`,
      finalClass:          rand(["9","10"]),
      passoutYear:         year,
      reason:              rand(REASONS),
      remarks:             rand(["","Passed with distinction","Transferred to another school",""]),
      certificateNo:       issued ? `CERT-${year}-${certNo++}` : undefined,
      certificateIssued:   issued,
      certificateIssuedAt: issued ? new Date(`${year}-04-${randInt(1,28)}`) : undefined,
    };
  });

  await safeInsert(Passout, docs);
  console.log(`  ✓ 20 passout records`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("❌  MONGO_URI is not set. Add it to your .env file.");

  console.log("Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("Connected.\n");

  const { teacherUsers, studentUsers } = await seedUsers();
  const teachers = await seedTeachers(teacherUsers);
  const students = await seedStudents(studentUsers);

  await seedClassSubjects();
  await seedAttendance(students, teachers);
  await seedResults(students);
  await seedAdmissions();
  await seedNotices();
  await seedTimetable(teachers);
  await seedMessages();
  await seedPassouts();

  console.log("\n✅  Seeding complete!\n");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  mongoose.disconnect();
  process.exit(1);
});