import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  UserCircleIcon,
  BookOpenIcon,
  ArrowPathIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const SUBJECT_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-sky-50 text-sky-700 border-sky-200",
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-pink-50 text-pink-700 border-pink-200",
];

const subjectColor = (subject) => {
  let hash = 0;
  for (const ch of (subject || "")) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

const Badge = ({ children, color = "slate" }) => {
  const map = {
    slate:   "bg-slate-100 text-slate-600",
    blue:    "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber:   "bg-amber-50 text-amber-600",
    rose:    "bg-rose-50 text-rose-600",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[color]}`}>
      {children}
    </span>
  );
};

// Subjects section — shown inside ClassCard when expanded
const ClassSubjects = ({ className }) => {
  const [subjects,   setSubjects]   = useState([]);
  const [isCustom,   setIsCustom]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [adding,     setAdding]     = useState(false);
  const [removing,   setRemoving]   = useState(null);
  const [resetting,  setResetting]  = useState(false);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/classes/${encodeURIComponent(className)}/subjects`);
      setSubjects(data.data?.subjects || []);
      setIsCustom(data.data?.isCustom || false);
    } catch {
      toast.error(`Failed to load subjects for Class ${className}`);
    } finally {
      setLoading(false);
    }
  }, [className]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const handleAdd = async () => {
    const name = newSubject.trim();
    if (!name) return;
    setAdding(true);
    try {
      const { data } = await api.post(
        `/admin/classes/${encodeURIComponent(className)}/subjects`,
        { subject: name }
      );
      setSubjects(data.data?.subjects || []);
      setIsCustom(true);
      setNewSubject("");
      toast.success(`"${name}" added to Class ${className}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add subject");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (subject) => {
    setRemoving(subject);
    try {
      const { data } = await api.delete(
        `/admin/classes/${encodeURIComponent(className)}/subjects/${encodeURIComponent(subject)}`
      );
      setSubjects(data.data?.subjects || []);
      setIsCustom(true);
      toast.success(`"${subject}" removed`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove subject");
    } finally {
      setRemoving(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Reset Class ${className} subjects back to defaults?`)) return;
    setResetting(true);
    try {
      const { data } = await api.delete(
        `/admin/classes/${encodeURIComponent(className)}/subjects/reset`
      );
      setSubjects(data.data?.subjects || []);
      setIsCustom(false);
      toast.success("Reset to default subjects");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-3 border-t border-slate-100 space-y-2 animate-pulse">
        <div className="h-3 bg-slate-100 rounded w-1/4 mb-3" />
        <div className="flex gap-2 flex-wrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 w-16 bg-slate-100 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 border-t border-slate-100 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BookOpenIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subjects</span>
          <span className="text-xs text-slate-400">({subjects.length})</span>
          {isCustom && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-50 text-violet-600 text-xs rounded-full border border-violet-100">
              <SparklesIcon className="w-2.5 h-2.5" /> Custom
            </span>
          )}
        </div>
        {isCustom && (
          <button
            onClick={handleReset}
            disabled={resetting}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            {resetting ? "Resetting..." : "Reset to defaults"}
          </button>
        )}
      </div>

      {subjects.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No subjects yet. Add one below.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((subject) => (
            <span
              key={subject}
              className={`group inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${subjectColor(subject)} transition-all`}
            >
              {subject}
              <button
                onClick={() => handleRemove(subject)}
                disabled={removing === subject}
                className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-600 disabled:opacity-50"
              >
                {removing === subject
                  ? <ArrowPathIcon className="w-3 h-3 animate-spin" />
                  : <XMarkIcon className="w-3 h-3" />
                }
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add subject..."
          className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-300 focus:bg-white transition-colors placeholder:text-slate-400"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newSubject.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-40"
        >
          {adding ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <PlusIcon className="w-3 h-3" />}
          Add
        </button>
      </div>
    </div>
  );
};

const AssignTeacherModal = ({ classInfo, teachers, onClose, onSaved }) => {
  const [teacherId,     setTeacherId]     = useState("");
  const [subject,       setSubject]       = useState("");
  const [saving,        setSaving]        = useState(false);
  const [classSubjects, setClassSubjects] = useState([]);

  useEffect(() => {
    api.get(`/admin/classes/${encodeURIComponent(classInfo.name)}/subjects`)
      .then((r) => setClassSubjects(r.data.data?.subjects || []))
      .catch(() => {});
  }, [classInfo.name]);

  const assignedTeacherIds = new Set(classInfo.teachers.map((t) => String(t._id)));
  const coveredSubjects    = classInfo.teachers.map((t) => t.subject.toLowerCase());
  const selectedTeacher    = teachers.find((t) => t._id === teacherId);

  const handleTeacherChange = (id) => {
    setTeacherId(id);
    const t = teachers.find((tt) => tt._id === id);
    if (t?.subject) setSubject(t.subject);
  };

  const handleSubmit = async () => {
    if (!teacherId)      return toast.error("Please select a teacher");
    if (!subject.trim()) return toast.error("Please enter a subject");
    if (coveredSubjects.includes(subject.trim().toLowerCase()))
      return toast.error(`${subject} is already covered in this class`);
    setSaving(true);
    try {
      await api.post(`/admin/classes/${encodeURIComponent(classInfo.name)}/assign-teacher`, {
        teacherId, subject: subject.trim(),
      });
      toast.success(`Teacher assigned for ${subject}`);
      onSaved(); onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign teacher");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Assign Teacher</h3>
            <p className="text-xs text-slate-400 mt-0.5">Class {classInfo.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <XMarkIcon className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Teacher</label>
            <select value={teacherId} onChange={(e) => handleTeacherChange(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
              <option value="">Select a teacher...</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.user?.name}{t.subject ? ` - ${t.subject}` : ""}
                  {assignedTeacherIds.has(t._id) ? " (already in class)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Subject</label>
            {classSubjects.length > 0 ? (
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                <option value="">Select a subject...</option>
                {classSubjects.map((s) => (
                  <option key={s} value={s} disabled={coveredSubjects.includes(s.toLowerCase())}>
                    {s}{coveredSubjects.includes(s.toLowerCase()) ? " (taken)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics, Physics..."
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            )}
            {coveredSubjects.length > 0 && (
              <p className="text-xs text-slate-400 mt-1.5">
                Already covered: <span className="font-medium text-slate-600">{classInfo.teachers.map((t) => t.subject).join(", ")}</span>
              </p>
            )}
          </div>
          {selectedTeacher && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold flex-shrink-0">
                {selectedTeacher.user?.name?.[0] || "T"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{selectedTeacher.user?.name}</p>
                <p className="text-xs text-slate-500">{selectedTeacher.user?.email}</p>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !teacherId || !subject.trim()}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
            {saving ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ClassStudentsModal = ({ className, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    api.get(`/admin/classes/${encodeURIComponent(className)}/students`)
      .then((r) => setStudents(r.data.data || []))
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoading(false));
  }, [className]);

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.parentName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-semibold text-slate-800">Class {className} - Students</h3>
            <p className="text-xs text-slate-400 mt-0.5">{students.length} total</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <XMarkIcon className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="divide-y divide-slate-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <UsersIcon className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-400">
                {search ? "No students match your search" : "No students in this class"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((s) => (
                <div key={s._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                    {s.name?.[0] || "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">Parent: {s.parentName || "-"}{s.parentPhone ? ` . ${s.parentPhone}` : ""}</p>
                  </div>
                  {s.rollNo && <Badge color="blue">#{s.rollNo}</Badge>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CLASS_COLORS = [
  "border-l-blue-400", "border-l-emerald-400", "border-l-amber-400", "border-l-rose-400",
  "border-l-violet-400", "border-l-sky-400", "border-l-teal-400", "border-l-pink-400",
];

const ClassCard = ({ classInfo, teachers, colorClass, onRefresh, onViewStudents }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSubjects,    setShowSubjects]    = useState(false);
  const [removing,        setRemoving]        = useState(null);

  const handleRemove = async (teacherId, teacherName) => {
    if (!window.confirm(`Remove ${teacherName} from Class ${classInfo.name}?`)) return;
    setRemoving(teacherId);
    try {
      await api.delete(`/admin/classes/${encodeURIComponent(classInfo.name)}/teachers/${teacherId}`);
      toast.success(`${teacherName} removed from Class ${classInfo.name}`);
      onRefresh();
    } catch {
      toast.error("Failed to remove teacher");
    } finally { setRemoving(null); }
  };

  return (
    <>
      <div className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${colorClass} shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Class {classInfo.name}</h3>
            <button onClick={onViewStudents} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-0.5">
              <UsersIcon className="w-3.5 h-3.5" />
              {classInfo.studentCount} student{classInfo.studentCount !== 1 ? "s" : ""}
            </button>
          </div>
          {classInfo.teachers.length > 0
            ? <Badge color="emerald">{classInfo.teachers.length} teacher{classInfo.teachers.length > 1 ? "s" : ""}</Badge>
            : <Badge color="amber">No Teachers</Badge>
          }
        </div>

        {/* Teachers */}
        <div className="space-y-2">
          {classInfo.teachers.length === 0 ? (
            <div className="flex items-center gap-2.5 p-3 bg-amber-50 rounded-xl border border-dashed border-amber-200">
              <UserCircleIcon className="w-8 h-8 text-amber-300 flex-shrink-0" />
              <p className="text-xs text-amber-600 font-medium">No teachers assigned yet</p>
            </div>
          ) : classInfo.teachers.map((t) => (
            <div key={t._id} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl group">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                {t.name?.[0] || "T"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{t.name}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-md border font-medium mt-0.5 ${subjectColor(t.subject)}`}>
                  {t.subject}
                </span>
              </div>
              <button onClick={() => handleRemove(t._id, t.name)} disabled={removing === t._id}
                className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50 flex-shrink-0">
                {removing === t._id ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <TrashIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>

        {/* Add teacher */}
        <button onClick={() => setShowAssignModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 border border-dashed border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors">
          <PlusIcon className="w-3.5 h-3.5" /> Add Teacher
        </button>

        {/* Subjects toggle */}
        <button onClick={() => setShowSubjects((p) => !p)}
          className="w-full inline-flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
          <span className="inline-flex items-center gap-1.5">
            <BookOpenIcon className="w-3.5 h-3.5" /> Manage Subjects
          </span>
          {showSubjects ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
        </button>

        {/* Subjects section — lazy loaded */}
        {showSubjects && <ClassSubjects className={classInfo.name} />}
      </div>

      {showAssignModal && (
        <AssignTeacherModal classInfo={classInfo} teachers={teachers}
          onClose={() => setShowAssignModal(false)} onSaved={onRefresh} />
      )}
    </>
  );
};

export default function AdminClasses() {
  const [classes,        setClasses]        = useState([]);
  const [teachers,       setTeachers]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [filterAssigned, setFilterAssigned] = useState("all");
  const [selectedClass,  setSelectedClass]  = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [classRes, teacherRes] = await Promise.all([
        api.get("/admin/classes"),
        api.get("/admin/teachers"),
      ]);
      setClasses(classRes.data.data?.classes || []);
      setTeachers(teacherRes.data.data       || []);
    } catch { toast.error("Failed to load classes"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalStudents   = classes.reduce((s, c) => s + c.studentCount, 0);
  const assignedCount   = classes.filter((c) => c.teachers.length > 0).length;
  const unassignedCount = classes.filter((c) => c.teachers.length === 0).length;

const filtered = classes.filter((c) => {
  const matchSearch = (() => {
    if (!search.trim()) return true;
    const words = search.trim().toLowerCase().split(/\s+/);
    const classNameStr = String(c.name).toLowerCase();
    const teacherTexts = c.teachers.map((t) =>
      `${t.name || ""} ${t.subject || ""}`.toLowerCase()
    );
    // Every word in the query must match something
    return words.every((word) =>
      classNameStr.includes(word) ||
      teacherTexts.some((text) => text.includes(word))
    );
  })();
  const matchFilter =
    filterAssigned === "all" ||
    (filterAssigned === "assigned"   && c.teachers.length > 0) ||
    (filterAssigned === "unassigned" && c.teachers.length === 0);
  return matchSearch && matchFilter;
});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classes</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage teachers and subjects per class</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-colors border border-slate-200">
          <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Classes",    value: classes.length,  icon: BookOpenIcon,    bg: "bg-blue-500"    },
          { label: "Total Students",   value: totalStudents,   icon: UsersIcon,       bg: "bg-emerald-500" },
          { label: "Assigned Classes", value: assignedCount,   icon: CheckCircleIcon, bg: "bg-violet-500"  },
          { label: "Need Teacher",     value: unassignedCount, icon: UserCircleIcon,  bg: "bg-amber-500"   },
        ].map(({ label, value, icon: Icon, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {loading ? <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" /> : value}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by class, teacher, or subject..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {[{ value: "all", label: "All" }, { value: "assigned", label: "Assigned" }, { value: "unassigned", label: "No Teacher" }].map((opt) => (
            <button key={opt.value} onClick={() => setFilterAssigned(opt.value)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                filterAssigned === opt.value
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 h-52 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
              <div className="h-12 bg-slate-100 rounded-xl mb-2" />
              <div className="h-12 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <ChartBarIcon className="w-12 h-12 text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-400">No classes found</p>
          <p className="text-xs text-slate-300 mt-1">Classes appear automatically when students are enrolled</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <ClassCard key={c.name} classInfo={c} teachers={teachers}
              colorClass={CLASS_COLORS[i % CLASS_COLORS.length]}
              onRefresh={fetchData} onViewStudents={() => setSelectedClass(c.name)} />
          ))}
        </div>
      )}

      {selectedClass && (
        <ClassStudentsModal className={selectedClass} onClose={() => setSelectedClass(null)} />
      )}
    </div>
  );
}