import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { MdSchool, MdChevronRight, MdChevronLeft } from "react-icons/md";
import { PiWarningCircleBold } from "react-icons/pi";
import {
  PERSONALITY_GRADES,
  totalFM,
  emptySkills, emptyAttendance, emptyPersonality, emptyRank, emptyTerm,
  buildEmptyForm,
} from "./constants";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .rf-root * { box-sizing:border-box; font-family:'DM Sans',sans-serif; }
    @keyframes rf-slide-in { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
    .rf-slide-enter { animation:rf-slide-in 0.3s cubic-bezier(.22,1,.36,1) both; }
    @keyframes rf-spin { to{transform:rotate(360deg)} }
    .rf-spinner{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:rf-spin 0.7s linear infinite;display:inline-block;}
    .rf-root input[type=number]::-webkit-outer-spin-button,.rf-root input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
    .rf-root input[type=number]{-moz-appearance:textfield;}
    .rf-tc{border:1px solid #dce2ef;text-align:center;}
    .rf-tcl{border:1px solid #dce2ef;text-align:left;padding:0 10px;}
    .rf-connector{height:2px;width:52px;margin-bottom:20px;background:#e4e9f4;border-radius:2px;transition:background .35s;}
    .rf-connector.done{background:#10b981;}.rf-connector.active{background:linear-gradient(90deg,#10b981,#4f6ef7);}
    .rf-select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238492a6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:36px !important;}
    .rf-num:focus{background:#eef1fe !important;}.rf-grade:focus{background:#eef1fe !important;}
    .rf-remark{border-bottom:1px dashed #c9d2e3;}.rf-remark:focus{border-bottom-color:#4f6ef7;outline:none;}
    .rf-btn-cancel:hover{background:#e4e9f4 !important;}.rf-btn-prev:hover{background:#e4e9f4 !important;}
    .rf-btn-primary:hover{opacity:.9;}.rf-btn-primary:disabled{opacity:.55;cursor:not-allowed;}
    @keyframes rf-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
    .rf-shake{animation:rf-shake 0.4s ease;}
  `}</style>
);

const C = {
  navy:"#0f1f3d",indigo:"#4f6ef7",indigoL:"#eef1fe",indigoM:"#c7d0fb",
  violet:"#7c3aed",teal:"#0891b2",amber:"#d97706",green:"#10b981",
  danger:"#ef4444",text:"#1a2640",muted:"#8492a6",border:"#dce2ef",
  surface:"#ffffff",ground:"#f4f6fb",rowEven:"#ffffff",rowOdd:"#f7f9fd",
};
const SLIDE_ACCENT = [C.indigo, C.violet, C.teal, C.amber];
const SLIDE_BG     = ["#eef1fe","#f3f0ff","#e0f7fa","#fef3c7"];

const inputSt = { width:"100%",padding:"9px 13px",fontSize:13,fontWeight:500,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,outline:"none",transition:"border-color .15s, box-shadow .15s",fontFamily:"'DM Sans',sans-serif" };

function FieldGroup({ label, required, children, hint, error }) {
  return (
    <div>
      <label style={{ display:"block",marginBottom:6,fontSize:11,fontWeight:700,letterSpacing:"0.065em",textTransform:"uppercase",color:error?C.danger:C.muted }}>
        {label}{required && <span style={{ color:C.danger,marginLeft:2 }}>*</span>}
      </label>
      {children}
      {error  && <p style={{ fontSize:11,color:C.danger,marginTop:4,fontWeight:600 }}>⚠ {error}</p>}
      {!error && hint && <p style={{ fontSize:11,color:"#b0bace",marginTop:4 }}>{hint}</p>}
    </div>
  );
}

function Select({ value, onChange, disabled, children, placeholder, hasError }) {
  return (
    <select value={value} onChange={onChange} disabled={disabled} className="rf-select"
      style={{ ...inputSt,cursor:disabled?"not-allowed":"pointer",background:disabled?C.ground:C.surface,color:disabled?C.muted:C.text,borderColor:hasError?C.danger:C.border,boxShadow:hasError?`0 0 0 3px #fee2e2`:"none" }}
      onFocus={e  => { if (!hasError) { e.target.style.borderColor=C.indigo; e.target.style.boxShadow=`0 0 0 3px ${C.indigoL}`; } }}
      onBlur={e   => { e.target.style.borderColor=hasError?C.danger:C.border; e.target.style.boxShadow=hasError?`0 0 0 3px #fee2e2`:"none"; }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

function TextInput({ value, onChange, placeholder, readOnly, hasError }) {
  return (
    <input type="text" value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      style={{ ...inputSt,background:readOnly?C.ground:C.surface,cursor:readOnly?"default":"text",borderColor:hasError?C.danger:C.border,boxShadow:hasError?`0 0 0 3px #fee2e2`:"none" }}
      onFocus={e => { if (!readOnly && !hasError) { e.target.style.borderColor=C.indigo; e.target.style.boxShadow=`0 0 0 3px ${C.indigoL}`; } }}
      onBlur={e  => { e.target.style.borderColor=hasError?C.danger:C.border; e.target.style.boxShadow=hasError?`0 0 0 3px #fee2e2`:"none"; }}
    />
  );
}

const TH = (extra = {}) => ({ border:`1px solid ${C.border}`,padding:"8px 10px",fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:"#f0f3fa",color:C.navy,textAlign:"center",...extra });

function NumCell({ value, onChange, max, narrow }) {
  const hc = (e) => { let v = e.target.value; if (v !== "" && max !== undefined) { const n = Number(v); if (n > max) v = String(max); if (n < 0) v = "0"; } onChange({ ...e, target: { ...e.target, value: v } }); };
  return (
    <td className="rf-tc" style={{ padding:"2px 1px" }}>
      <input type="number" min="0" max={max} value={value ?? ""} onChange={hc} placeholder="—" className="rf-num"
        style={{ display:"block",margin:"0 auto",width:narrow?36:44,padding:"4px 2px",textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:500,background:"transparent",border:"none",outline:"none",color:C.text,borderRadius:4,transition:"background .15s" }}
      />
    </td>
  );
}

function GradeSelect({ value, onChange }) {
  return (
    <td className="rf-tc" style={{ padding:"2px 1px" }}>
      <select value={value ?? ""} onChange={onChange} className="rf-grade"
        style={{ width:50,textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,background:"transparent",border:"none",outline:"none",color:C.indigo,cursor:"pointer",padding:"4px 2px",borderRadius:4,transition:"background .15s",appearance:"none" }}
      >
        {PERSONALITY_GRADES.map(g => <option key={g} value={g}>{g || "—"}</option>)}
      </select>
    </td>
  );
}

function SectionHead({ children }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
      <div style={{ width:3,height:20,background:C.indigo,borderRadius:2,flexShrink:0 }}/>
      <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:14.5,color:C.navy }}>{children}</span>
      <div style={{ flex:1,height:1,background:C.border }}/>
    </div>
  );
}

const STEPS_META = [
  { label:"Basic Info",      emoji:"🎓" },
  { label:"Subject Marks",   emoji:"📖" },
  { label:"Lang & Attend.",  emoji:"🗣️" },
  { label:"Personality",     emoji:"⭐" },
];

function StepIndicator({ current }) {
  return (
    <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"center" }}>
      {STEPS_META.map(({ label, emoji }, idx) => {
        const step = idx + 1, isActive = step === current, isDone = step < current;
        return (
          <React.Fragment key={step}>
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",width:82 }}>
              <div style={{ width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:isDone?16:15,fontWeight:800,background:isActive?C.indigo:isDone?C.green:"#e4e9f4",color:(isActive||isDone)?"#fff":C.muted,boxShadow:isActive?`0 0 0 5px ${C.indigoL}`:"none",transition:"all .25s" }}>
                {isDone ? "✓" : emoji}
              </div>
              <div style={{ marginTop:8,fontSize:11,fontWeight:isActive?700:500,color:isActive?C.indigo:isDone?C.green:C.muted,textAlign:"center",lineHeight:1.3,whiteSpace:"nowrap" }}>{label}</div>
            </div>
            {idx < STEPS_META.length - 1 && (
              <div className={`rf-connector ${isDone ? "done" : isActive ? "active" : ""}`} style={{ marginTop:19 }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SlideCard({ index, title, children }) {
  const accent = SLIDE_ACCENT[index] || C.indigo, bg = SLIDE_BG[index] || C.indigoL;
  return (
    <div className="rf-slide-enter" style={{ background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 4px 24px rgba(15,31,61,0.07)",overflow:"hidden" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,padding:"15px 24px",background:bg,borderBottom:`2px solid ${accent}33` }}>
        <div style={{ width:30,height:30,borderRadius:8,background:accent,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0 }}>{index + 1}</div>
        <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:C.navy }}>{title}</span>
        <div style={{ flex:1 }}/>
        <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:accent,background:`${accent}1a`,padding:"4px 10px",borderRadius:20 }}>Step {index + 1} / 4</span>
      </div>
      <div style={{ padding:"24px 26px" }}>{children}</div>
    </div>
  );
}

function SlideActions({ slide, total, onCancel, onPrev, onNext, onSave, saving }) {
  const isLast = slide === total, isFirst = slide === 1;
  return (
    <div style={{ background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 2px 10px rgba(15,31,61,0.05)",padding:"15px 24px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
      <span style={{ fontSize:12,color:C.muted,fontWeight:500 }}>Step <strong style={{ color:C.text }}>{slide}</strong> of {total}</span>
      <div style={{ display:"flex",gap:10 }}>
        <button onClick={onCancel} className="rf-btn-cancel" style={{ padding:"9px 22px",borderRadius:10,border:`1px solid ${C.border}`,background:C.ground,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer",transition:"background .15s" }}>Cancel</button>
        {!isFirst && (
          <button onClick={onPrev} className="rf-btn-prev" style={{ padding:"9px 22px",borderRadius:10,border:`1px solid ${C.border}`,background:C.ground,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"background .15s" }}>
            <MdChevronLeft style={{ fontSize:14 }}/>Prev
          </button>
        )}
        {isLast ? (
          <button onClick={onSave} disabled={saving} className="rf-btn-primary" style={{ padding:"9px 26px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.indigo},${C.violet})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:7,boxShadow:"0 4px 14px rgba(79,110,247,0.35)",transition:"opacity .15s" }}>
            {saving ? <span className="rf-spinner"/> : <MdSchool style={{ fontSize:15 }}/>}
            {saving ? "Saving…" : "Submit Result"}
          </button>
        ) : (
          <button onClick={onNext} className="rf-btn-primary" style={{ padding:"9px 24px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.indigo},${C.violet})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:7,boxShadow:"0 4px 14px rgba(79,110,247,0.35)",transition:"opacity .15s" }}>
            Save &amp; Next <MdChevronRight style={{ fontSize:14 }}/>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Validators ────────────────────────────────────────────────────────────────
function validateSlide1(form, filterClass) {
  const e = {};
  if (!filterClass)          e.filterClass = "Please select a class";
  if (!form.session)         e.session     = "Please select a session";
  if (!form.studentId)       e.studentId   = "Please select a student";
  if (!form.promoted)        e.promoted    = "Please set a promotion status";
  if (form.promoted === "true" && !form.promotedToClass) e.promotedToClass = "Please select the class to promote to";
  return e;
}
function validateSlide2(form) {
  const e = {};
  const any = form.subjects.some(s => ["firstTerm","secondTerm","final"].some(t => s[t]?.unitTest !== "" || s[t]?.termExam !== "" || s[t]?.total !== ""));
  if (!any) e.subjects = "Please enter marks for at least one subject";
  return e;
}
function validateSlide3(form) {
  const e = {};
  if (["firstTerm","secondTerm","final"].some(t => !form.attendance[t]?.workingDays)) e.attendance = "Please enter working days for all attendance terms";
  return e;
}
function validateSlide4(form) {
  const e = {};
  const traits = ["classParticipation","discipline","neatness"], terms = ["firstTerm","secondTerm","final"];
  if (traits.some(t => terms.some(term => !form[t]?.[term]))) e.personality = "Please select grades for all personality traits across all terms";
  return e;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ResultForm({ students, initialData, onSave, onCancel, saving, formErr }) {
  const [slide,       setSlide]       = useState(1);
  const [slideErrors, setSlideErrors] = useState({});
  const [shaking,     setShaking]     = useState(false);
  const TOTAL = 4;

  // ── Backend-fetched meta ──
  const [classes,       setClasses]       = useState([]);
  const [sessions,      setSessions]      = useState([]);
  const [metaLoading,   setMetaLoading]   = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // ── Filters ──
  const [filterClass,   setFilterClass]   = useState(
    initialData
      ? (students.find(s => s._id === (initialData.student?._id || initialData.student))?.class || "")
      : ""
  );
  const [filterSection, setFilterSection] = useState("");

  // ── Fetch classes + sessions on mount ──
  useEffect(() => {
    const load = async () => {
      try {
        const [classRes, sessionRes] = await Promise.all([
          api.get("/admin/meta/classes"),
          api.get("/admin/results/sessions"),
        ]);
        setClasses(classRes.data?.data  || []);
        setSessions(sessionRes.data?.data || []);
      } catch { /* non-fatal */ }
      finally { setMetaLoading(false); }
    };
    load();
  }, []);

  // ── Normalise subjects from existing result ──
  const normSubjects = (raw) => {
    if (!raw?.length) return [];
    return raw.map(s => {
      const nt = (t) => {
        if (t && typeof t === "object" && "unitTest" in t) return t;
        return { unitTest: "", termExam: "", total: t ?? "" };
      };
      return { subject: s.subject, fullMarks: s.fullMarks, firstTerm: nt(s.firstTerm), secondTerm: nt(s.secondTerm), final: nt(s.final) };
    });
  };

  // ── Form state ──
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        studentId:             initialData.student?._id || initialData.student || "",
        session:               initialData.session || "",
        subjects:              normSubjects(initialData.subjects),
        englishSkills:         initialData.englishSkills  || { firstTerm: emptySkills(), secondTerm: emptySkills(), thirdTerm: emptySkills() },
        hindiSkills:           initialData.hindiSkills    || { firstTerm: emptySkills(), secondTerm: emptySkills(), thirdTerm: emptySkills() },
        attendance:            initialData.attendance     || { firstTerm: emptyAttendance(), secondTerm: emptyAttendance(), final: emptyAttendance() },
        classParticipation:    initialData.classParticipation    || emptyPersonality(),
        discipline:            initialData.discipline            || emptyPersonality(),
        neatness:              initialData.neatness              || emptyPersonality(),
        courteous:             initialData.courteous             || emptyPersonality(),
        responsibleDependable: initialData.responsibleDependable || emptyPersonality(),
        attitudeTeachers:      initialData.attitudeTeachers      || emptyPersonality(),
        rank:                  initialData.rank    || emptyRank(),
        remarks:               initialData.remarks || { firstTerm: "", secondTerm: "", final: "" },
        promoted:              initialData.promoted ?? "",
        promotedToClass:       initialData.promotedToClass || "",
        rollNo:                initialData.rollNo || "",
      };
    }
    // New form — subjects will be loaded once a class is selected
    return buildEmptyForm([], "");
  });

  // ── Once sessions load, set default session for new forms ──
  useEffect(() => {
    if (!initialData && sessions.length > 0 && !form.session) {
      setForm(p => ({ ...p, session: sessions[0] }));
    }
  }, [sessions, initialData]);

  // ── Fetch subjects when class changes (new form only) ──
  const fetchSubjectsForClass = useCallback(async (className) => {
    if (!className || initialData) return;
    setSubjectsLoading(true);
    try {
      const { data } = await api.get(`/admin/classes/${encodeURIComponent(className)}/subjects`);
      // data.data = { className, subjects: string[], isCustom }
      const subjectNames = data.data?.subjects || [];
      const FM_OVERRIDES = { "Drawing": 50, "EVS/Science+S.St": 200, "EVS": 200 };
      const subjectObjects = subjectNames.map(name => ({
        subject:   name,
        fullMarks: FM_OVERRIDES[name] ?? 100,
      }));
      setForm(p => ({
        ...p,
        subjects: subjectObjects.map(s => ({
          ...s,
          firstTerm:  emptyTerm(),
          secondTerm: emptyTerm(),
          final:      emptyTerm(),
        })),
      }));
    } catch {
      // fallback: keep existing subjects
    } finally {
      setSubjectsLoading(false);
    }
  }, [initialData]);

  // ── Handlers ──
  const handleClassChange = (e) => {
    const cls = e.target.value;
    setFilterClass(cls);
    setForm(p => ({ ...p, studentId: "", rollNo: "" }));
    setSlideErrors(prev => ({ ...prev, filterClass: undefined }));
    fetchSubjectsForClass(cls);
  };

  const handleStudentChange = (e) => {
    const id = e.target.value, stu = students.find(s => s._id === id);
    setForm(p => ({ ...p, studentId: id, rollNo: stu?.rollNo ?? stu?.roll_no ?? stu?.rollNumber ?? p.rollNo }));
    setSlideErrors(prev => ({ ...prev, studentId: undefined }));
  };

  const triggerShake = () => { setShaking(true); setTimeout(() => setShaking(false), 450); };

  const handleNext = () => {
    let e = {};
    if (slide === 1) e = validateSlide1(form, filterClass);
    if (slide === 2) e = validateSlide2(form);
    if (slide === 3) e = validateSlide3(form);
    if (Object.keys(e).length) { setSlideErrors(e); triggerShake(); return; }
    setSlideErrors({});
    setSlide(s => Math.min(s + 1, TOTAL));
  };
  const handleSave = () => {
    const e = validateSlide4(form);
    if (Object.keys(e).length) { setSlideErrors(e); triggerShake(); return; }
    setSlideErrors({});
    onSave(form);
  };

  const setSubjectField = (idx, term, field, val) => {
    setForm(p => {
      const subs = [...p.subjects];
      subs[idx] = { ...subs[idx], [term]: { ...subs[idx][term], [field]: val } };
      if (field === "unitTest" || field === "termExam") {
        const ut = field === "unitTest" ? val : subs[idx][term].unitTest;
        const te = field === "termExam" ? val : subs[idx][term].termExam;
        subs[idx][term].total = (ut !== "" && te !== "") ? String(Number(ut) + Number(te)) : "";
      }
      return { ...p, subjects: subs };
    });
    setSlideErrors(prev => ({ ...prev, subjects: undefined }));
  };

  const setSkill      = (lang, term, field, val) => setForm(p => ({ ...p, [`${lang}Skills`]: { ...p[`${lang}Skills`], [term]: { ...p[`${lang}Skills`][term], [field]: val } } }));
  const setAttendance = (term, field, val)        => setForm(p => ({ ...p, attendance: { ...p.attendance, [term]: { ...p.attendance[term], [field]: val } } }));
  const setPersonality = (key, term, val)         => setForm(p => ({ ...p, [key]: { ...p[key], [term]: val } }));
  const setRemarks    = (term, val)               => setForm(p => ({ ...p, remarks: { ...p.remarks, [term]: val } }));
  const setRank       = (term, val)               => setForm(p => ({ ...p, rank: { ...p.rank, [term]: val } }));

  const filteredStudents = students.filter(s => {
    if (filterClass   && s.class   !== filterClass)   return false;
    if (filterSection && s.section !== filterSection) return false;
    return true;
  });

  const SKILL_TERMS  = [{ label:"1st Term", key:"firstTerm" }, { label:"2nd Term", key:"secondTerm" }, { label:"3rd Term", key:"thirdTerm" }];
  const SKILL_FIELDS = [{ label:"Read", key:"read", max:10 }, { label:"Recl.", key:"recitation", max:15 }, { label:"Spl.", key:"spelling", max:10 }, { label:"Wrt.", key:"writing", max:15 }];
  const row          = (i) => ({ background: i % 2 === 0 ? C.rowEven : C.rowOdd });
  const TERM_COLS    = [
    { label:"1st Term", key:"firstTerm",  accent:C.indigo, bg:"#eef1fe" },
    { label:"2nd Term", key:"secondTerm", accent:C.violet, bg:"#f3f0ff" },
    { label:"Final",    key:"final",      accent:C.teal,   bg:"#e0f7fa" },
  ];
  const termTotal = (term) => form.subjects.reduce((acc, s) => { const v = s[term]?.total; return acc + (v !== "" && v != null && v !== undefined ? Number(v) : 0); }, 0);

  // ── Loading state for meta ──
  if (metaLoading) {
    return (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:48 }}>
        <div style={{ width:28,height:28,borderRadius:"50%",border:"3px solid #dce2ef",borderTopColor:C.indigo,animation:"rf-spin 0.7s linear infinite" }}/>
      </div>
    );
  }

  /* ── SLIDE 1 ── */
  const slide1 = (
    <SlideCard index={0} title="Basic Information">
      <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18 }}>
          <FieldGroup label="Class" required error={slideErrors.filterClass}>
            <Select value={filterClass} onChange={handleClassChange} disabled={!!initialData} placeholder="— Select Class —" hasError={!!slideErrors.filterClass}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FieldGroup>
          <FieldGroup label="Section">
            <Select value={filterSection} onChange={e => { setFilterSection(e.target.value); setForm(p => ({ ...p, studentId: "", rollNo: "" })); }} disabled={!!initialData} placeholder="— Section —">
              {["A","B","C","D"].map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </FieldGroup>
          <FieldGroup label="Session" required error={slideErrors.session}>
            <Select value={form.session} onChange={e => { setForm(p => ({ ...p, session: e.target.value })); setSlideErrors(prev => ({ ...prev, session: undefined })); }} disabled={!!initialData} hasError={!!slideErrors.session}>
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </FieldGroup>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:18 }}>
          <FieldGroup label="Student" required error={slideErrors.studentId}>
            <Select value={form.studentId} onChange={handleStudentChange} disabled={!!initialData} placeholder="— Select Student —" hasError={!!slideErrors.studentId}>
              {filteredStudents.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
          </FieldGroup>
          <FieldGroup label="Roll No." hint={form.studentId ? "Auto-filled" : "Select a student first"}>
            <div style={{ position:"relative" }}>
              <TextInput value={form.rollNo ?? ""} onChange={e => setForm(p => ({ ...p, rollNo: e.target.value }))} placeholder="Auto-filled"/>
              {form.rollNo && <span style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:10,fontWeight:700,background:C.green,color:"#fff",padding:"2px 7px",borderRadius:10 }}>AUTO</span>}
            </div>
          </FieldGroup>
          <FieldGroup label="Promotion Status" required error={slideErrors.promoted}>
            <Select value={form.promoted} onChange={e => { setForm(p => ({ ...p, promoted: e.target.value })); setSlideErrors(prev => ({ ...prev, promoted: undefined })); }} placeholder="—" hasError={!!slideErrors.promoted}>
              <option value="true">Promoted</option>
              <option value="false">Not Promoted</option>
            </Select>
          </FieldGroup>
        </div>
        {form.promoted === "true" && (
          <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:18 }}>
            <div/><div/>
            <FieldGroup label="Promoted To Class" required error={slideErrors.promotedToClass}>
              <Select value={form.promotedToClass} onChange={e => { setForm(p => ({ ...p, promotedToClass: e.target.value })); setSlideErrors(prev => ({ ...prev, promotedToClass: undefined })); }} placeholder="— Class —" hasError={!!slideErrors.promotedToClass}>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FieldGroup>
          </div>
        )}
        {form.promoted && (
          <div style={{ padding:"11px 16px",borderRadius:10,background:form.promoted==="true"?"#d1fae5":"#fee2e2",border:`1px solid ${form.promoted==="true"?"#6ee7b7":"#fca5a5"}`,fontSize:13,fontWeight:600,color:form.promoted==="true"?"#065f46":"#991b1b",display:"flex",alignItems:"center",gap:8 }}>
            {form.promoted === "true" ? "✅" : "❌"}
            {form.promoted === "true" ? `Student will be promoted${form.promotedToClass ? ` to Class ${form.promotedToClass}` : ""}` : "Student will not be promoted"}
          </div>
        )}
      </div>
    </SlideCard>
  );

  /* ── SLIDE 2 ── */
  const slide2 = (
    <SlideCard index={1} title="Subject Marks — Scholastic Progress">
      {subjectsLoading && (
        <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",marginBottom:14,borderRadius:8,background:"#eef1fe",border:`1px solid ${C.indigoM}`,fontSize:12,fontWeight:600,color:C.indigo }}>
          <div style={{ width:14,height:14,borderRadius:"50%",border:"2px solid #c7d0fb",borderTopColor:C.indigo,animation:"rf-spin 0.7s linear infinite" }}/>
          Loading subjects…
        </div>
      )}
      {!subjectsLoading && form.subjects.length === 0 && !initialData && (
        <div style={{ padding:"10px 14px",marginBottom:14,borderRadius:8,background:"#fef9c3",border:"1px solid #fde68a",fontSize:12,fontWeight:600,color:"#92400e" }}>
          ⚠ Please select a class in Step 1 to load subjects.
        </div>
      )}
      {slideErrors.subjects && (
        <div style={{ padding:"10px 14px",marginBottom:14,borderRadius:8,background:"#fef2f2",border:`1px solid #fca5a5`,fontSize:12,fontWeight:600,color:"#991b1b",display:"flex",alignItems:"center",gap:8 }}>
          ⚠ {slideErrors.subjects}
        </div>
      )}
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",minWidth:860 }}>
          <thead>
            <tr>
              <th style={{ ...TH({ textAlign:"left" }), width:"20%" }} rowSpan={2}>Subject</th>
              <th style={TH({ width:"5%" })} rowSpan={2}>F.M.</th>
              {TERM_COLS.map(({ label, accent, bg }) => (
                <th key={label} colSpan={3} style={{ ...TH(), color:accent, background:bg }}>{label}</th>
              ))}
            </tr>
            <tr>
              {TERM_COLS.map(({ key, accent }) => (
                <React.Fragment key={key}>
                  <th style={{ ...TH({ fontSize:10, fontWeight:600 }), color:accent }}>UT (20)</th>
                  <th style={{ ...TH({ fontSize:10, fontWeight:600 }), color:accent }}>TE (80)</th>
                  <th style={{ ...TH({ fontSize:10, fontWeight:700 }), color:accent, background:"#f5f5ff" }}>Total</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {form.subjects.map((sub, i) => (
              <tr key={i} style={row(i)}>
                <td className="rf-tcl" style={{ fontWeight:500,color:C.text,fontSize:13,padding:"5px 10px" }}>{sub.subject}</td>
                <td className="rf-tc" style={{ color:C.muted,fontSize:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:500 }}>{sub.fullMarks}</td>
                {TERM_COLS.map(({ key: term, accent }) => (
                  <React.Fragment key={term}>
                    <NumCell value={sub[term]?.unitTest} max={20} onChange={e => setSubjectField(i, term, "unitTest", e.target.value)}/>
                    <NumCell value={sub[term]?.termExam} max={sub.fullMarks <= 50 ? sub.fullMarks : 80} onChange={e => setSubjectField(i, term, "termExam", e.target.value)}/>
                    <td className="rf-tc" style={{ padding:"2px 1px", background:"#f7f9ff" }}>
                      <input type="number" min="0" max={sub.fullMarks} value={sub[term]?.total ?? ""} placeholder="—"
                        onChange={e => setSubjectField(i, term, "total", e.target.value)}
                        style={{ display:"block",margin:"0 auto",width:48,padding:"4px 2px",textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,background:"transparent",border:"none",outline:"none",color:accent,borderRadius:4 }}
                      />
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
            {form.subjects.length > 0 && (
              <tr style={{ background:"#eef1fe", borderTop:`2px solid ${C.indigoM}` }}>
                <td className="rf-tcl" style={{ fontWeight:800,fontSize:13,color:C.navy,padding:"7px 10px" }}>Total</td>
                <td className="rf-tc" style={{ fontWeight:700,fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.indigo }}>{totalFM(form.subjects)}</td>
                {TERM_COLS.map(({ key: term, accent }) => (
                  <React.Fragment key={term}>
                    <td className="rf-tc" style={{ color:C.muted,fontSize:11,fontFamily:"'JetBrains Mono',monospace" }}>{form.subjects.reduce((a,s)=>{ const v=s[term]?.unitTest; return a+(v!==""&&v!=null?Number(v):0); },0)||"—"}</td>
                    <td className="rf-tc" style={{ color:C.muted,fontSize:11,fontFamily:"'JetBrains Mono',monospace" }}>{form.subjects.reduce((a,s)=>{ const v=s[term]?.termExam; return a+(v!==""&&v!=null?Number(v):0); },0)||"—"}</td>
                    <td className="rf-tc" style={{ fontWeight:800,fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:accent }}>{termTotal(term)||"—"}</td>
                  </React.Fragment>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize:11,color:C.muted,marginTop:10,fontStyle:"italic" }}>💡 Total auto-calculates from Unit Test + Term Exam, but you can override it manually.</p>
    </SlideCard>
  );

  /* ── SLIDE 3 ── */
  const slide3 = (
    <SlideCard index={2} title="Language Skills & Attendance">
      <div style={{ display:"flex",flexDirection:"column",gap:26 }}>
        <div>
          <SectionHead>English &amp; Hindi Language Skills</SectionHead>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th style={{ ...TH({ textAlign:"left" }), width:"13%" }}>Term</th>
                <th style={TH({ background:"#eef1fe", color:C.indigo })} colSpan={4}>English Skills</th>
                <th style={TH({ background:"#f3f0ff", color:C.violet })} colSpan={4}>Hindi Skills</th>
              </tr>
              <tr>
                <th style={TH({ textAlign:"left", fontSize:10 })}></th>
                {["Read","Recl.","Spl.","Wrt.","Read","Recl.","Spl.","Wrt."].map((h, i) => (
                  <th key={i} style={TH({ fontSize:10, background:i<4?"#f0f4ff":"#f5f3ff" })}>{h}</th>
                ))}
              </tr>
              <tr>
                <td style={{ ...TH({ textAlign:"left" }), fontWeight:500, color:C.muted, fontSize:10 }}>Max</td>
                {[10,15,10,15,10,15,10,15].map((m, i) => (
                  <td key={i} style={{ border:`1px solid ${C.border}`,textAlign:"center",fontSize:11,fontWeight:600,color:C.muted,padding:"5px",background:i<4?"#f8f9ff":"#faf8ff",fontFamily:"'JetBrains Mono',monospace" }}>{m}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {SKILL_TERMS.map(({ label, key: tKey }, ri) => (
                <tr key={tKey} style={row(ri)}>
                  <td className="rf-tcl" style={{ fontWeight:600,color:C.text,fontSize:12,padding:"4px 10px" }}>{label}</td>
                  {SKILL_FIELDS.map(({ key: fKey, max }) => (<NumCell key={"en-"+fKey} value={form.englishSkills[tKey]?.[fKey]} max={max} onChange={e => setSkill("english", tKey, fKey, e.target.value)} narrow/>))}
                  {SKILL_FIELDS.map(({ key: fKey, max }) => (<NumCell key={"hi-"+fKey} value={form.hindiSkills[tKey]?.[fKey]}  max={max} onChange={e => setSkill("hindi",   tKey, fKey, e.target.value)} narrow/>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <SectionHead>Attendance Record</SectionHead>
          {slideErrors.attendance && (
            <div style={{ padding:"10px 14px",marginBottom:10,borderRadius:8,background:"#fef2f2",border:`1px solid #fca5a5`,fontSize:12,fontWeight:600,color:"#991b1b",display:"flex",alignItems:"center",gap:8 }}>
              ⚠ {slideErrors.attendance}
            </div>
          )}
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th style={{ ...TH({ textAlign:"left" }), width:"34%" }}></th>
                <th style={TH({ color:C.indigo })}>1st Term</th>
                <th style={TH({ color:C.violet })}>2nd Term</th>
                <th style={TH({ color:C.teal })}>Final</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label:"No. of Working Days", field:"workingDays",   max:365 },
                { label:"No. of Days Absent",  field:"daysAbsent",    max:365 },
                { label:"Total Students",       field:"totalStudents", max:undefined },
              ].map(({ label, field, max }, i) => (
                <tr key={field} style={row(i)}>
                  <td className="rf-tcl" style={{ fontWeight:500,fontSize:13,padding:"5px 10px" }}>{label}</td>
                  {["firstTerm","secondTerm","final"].map(term => (
                    <NumCell key={term} value={form.attendance[term]?.[field]} max={max}
                      onChange={e => { setAttendance(term, field, e.target.value); setSlideErrors(prev => ({ ...prev, attendance: undefined })); }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SlideCard>
  );

  /* ── SLIDE 4 ── */
  const slide4 = (
    <SlideCard index={3} title="Personality, Social Qualities & Remarks">
      <div style={{ display:"flex",flexDirection:"column",gap:22 }}>
        {slideErrors.personality && (
          <div style={{ padding:"10px 14px",borderRadius:8,background:"#fef2f2",border:`1px solid #fca5a5`,fontSize:12,fontWeight:600,color:"#991b1b",display:"flex",alignItems:"center",gap:8 }}>
            ⚠ {slideErrors.personality}
          </div>
        )}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
          <div>
            <SectionHead>Social Qualities (Left)</SectionHead>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead><tr><th style={{ ...TH({ textAlign:"left" }), width:"38%" }}>Trait</th><th style={TH({ color:C.indigo })}>1st</th><th style={TH({ color:C.violet })}>2nd</th><th style={TH({ color:C.teal })}>Final</th></tr></thead>
              <tbody>
                {[{ label:"Discipline", key:"discipline" },{ label:"Neatness", key:"neatness" },{ label:"Class Part.", key:"classParticipation" }].map(({ label, key }, i) => (
                  <tr key={key} style={row(i)}>
                    <td className="rf-tcl" style={{ fontWeight:500,fontSize:13,padding:"5px 10px" }}>{label}</td>
                    {["firstTerm","secondTerm","final"].map(term => (
                      <GradeSelect key={term} value={form[key]?.[term]} onChange={e => { setPersonality(key, term, e.target.value); setSlideErrors(prev => ({ ...prev, personality: undefined })); }}/>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <SectionHead>Social Qualities (Right)</SectionHead>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead><tr><th style={{ ...TH({ textAlign:"left" }), width:"38%" }}>Trait</th><th style={TH({ color:C.indigo })}>1st</th><th style={TH({ color:C.violet })}>2nd</th><th style={TH({ color:C.teal })}>Final</th></tr></thead>
              <tbody>
                {[{ label:"Courteous", key:"courteous" },{ label:"Responsible & dep.", key:"responsibleDependable" },{ label:"Attitude / Teachers", key:"attitudeTeachers" }].map(({ label, key }, i) => (
                  <tr key={key} style={row(i)}>
                    <td className="rf-tcl" style={{ fontWeight:500,fontSize:13,padding:"5px 10px" }}>{label}</td>
                    {["firstTerm","secondTerm","final"].map(term => (
                      <GradeSelect key={term} value={form[key]?.[term]} onChange={e => setPersonality(key, term, e.target.value)}/>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <SectionHead>Class Rank</SectionHead>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr><th style={{ ...TH({ textAlign:"left" }), width:"30%" }}>Term</th><th style={TH({ color:C.indigo })}>1st Term</th><th style={TH({ color:C.violet })}>2nd Term</th><th style={TH({ color:C.teal })}>Final</th><th style={TH({ color:C.amber })}>Overall</th></tr></thead>
            <tbody>
              <tr style={row(0)}>
                <td className="rf-tcl" style={{ fontWeight:600,fontSize:13,padding:"5px 10px" }}>Rank in Class</td>
                {["firstTerm","secondTerm","final","overall"].map(term => (
                  <td key={term} className="rf-tc" style={{ padding:"3px 2px" }}>
                    <input type="text" value={form.rank?.[term] ?? ""} onChange={e => setRank(term, e.target.value)} placeholder="—"
                      style={{ display:"block",margin:"0 auto",width:52,padding:"4px 2px",textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,background:"transparent",border:"none",outline:"none",color:C.text }}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <SectionHead>Teacher's Remarks</SectionHead>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr><th style={{ ...TH(), width:"13%" }}>Term</th><th style={TH()}>Comments</th><th style={{ ...TH(), width:"26%" }}>Parent's Signature</th></tr></thead>
            <tbody>
              {[{ label:"1st Term", key:"firstTerm" },{ label:"2nd Term", key:"secondTerm" },{ label:"Final", key:"final" }].map(({ label, key }, i) => (
                <tr key={key} style={row(i)}>
                  <td className="rf-tc" style={{ fontWeight:700,fontSize:12,color:C.text,padding:"7px 6px" }}>{label}</td>
                  <td className="rf-tc" style={{ padding:"6px 10px" }}>
                    <input placeholder="Enter remarks…" value={form.remarks[key]} onChange={e => setRemarks(key, e.target.value)} className="rf-remark"
                      style={{ width:"100%",fontSize:12.5,background:"transparent",border:"none",padding:"3px 2px",color:C.text,fontFamily:"'DM Sans',sans-serif",transition:"border-color .15s" }}
                    />
                  </td>
                  <td className="rf-tc" style={{ minHeight:34 }}/>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <SectionHead>Promotion &amp; Signatures</SectionHead>
          <div style={{ padding:"12px 18px",borderRadius:10,border:`1px solid ${C.border}`,background:C.ground,fontSize:13,fontWeight:500,color:C.text,marginBottom:18 }}>
            <span style={{ fontWeight:700 }}>Promotion: </span>
            <span style={{ display:"inline-block",borderBottom:`1.5px solid ${C.text}`,minWidth:180,marginLeft:8,paddingBottom:2,color:form.promoted==="true"?"#065f46":form.promoted==="false"?"#991b1b":C.muted,fontWeight:700 }}>
              {form.promoted === "true" ? `Promoted to Class ${form.promotedToClass || "___"}` : form.promoted === "false" ? "Not Promoted" : ""}
            </span>
          </div>
          <div style={{ display:"flex",gap:40 }}>
            {["Class Teacher","Principal"].map(role => (
              <div key={role} style={{ flex:1,textAlign:"center" }}>
                <div style={{ height:44,borderBottom:`1.5px solid ${C.navy}`,marginBottom:7 }}/>
                <span style={{ fontSize:12,fontWeight:700,color:C.navy }}>{role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideCard>
  );

  const slides = [slide1, slide2, slide3, slide4];

  return (
    <div className="rf-root" style={{ background:C.ground, paddingBottom:32 }}>
      <FontLoader/>
      {formErr && (
        <div style={{ display:"flex",alignItems:"center",gap:8,padding:"12px 16px",marginBottom:16,background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:12,color:"#991b1b",fontSize:13,fontWeight:500 }}>
          <PiWarningCircleBold style={{ fontSize:16, flexShrink:0 }}/>{formErr}
        </div>
      )}
      <div style={{ background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 2px 10px rgba(15,31,61,0.05)",padding:"22px 16px 18px",marginBottom:16 }}>
        <StepIndicator current={slide}/>
      </div>
      <div className={shaking ? "rf-shake" : ""}>{slides[slide - 1]}</div>
      <div style={{ marginTop:16 }}>
        <SlideActions slide={slide} total={TOTAL} onCancel={onCancel}
          onPrev={() => { setSlideErrors({}); setSlide(s => Math.max(s - 1, 1)); }}
          onNext={handleNext} onSave={handleSave} saving={saving}
        />
      </div>
    </div>
  );
}