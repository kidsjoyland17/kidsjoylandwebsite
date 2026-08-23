import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { totalFM, totalObtained } from "./constants";
import report from "../../../assets/report.png";
import logo from "../../../assets/logo.png";

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, size = "lg" }) {
  const widths = { sm: "max-w-sm", md: "max-w-2xl", lg: "max-w-5xl", xl: "max-w-7xl" };
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${widths[size]} my-8`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white rounded-t-2xl">
          <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 border-b border-indigo-100 pb-1.5 mb-3">
      {children}
    </h3>
  );
}

// ─── PrintReportCard ──────────────────────────────────────────────────────────
export function PrintReportCard({ result }) {
  const s        = result;
  const subjects = s.subjects || [];
  const totalFm  = totalFM(subjects);

  const t1 = totalObtained(subjects, "firstTerm");
  const t2 = totalObtained(subjects, "secondTerm");
  const tf = totalObtained(subjects, "final");

  const sumField = (term, field) =>
    subjects.reduce((acc, sub) => {
      const v = sub[term]?.[field];
      return acc + (v !== null && v !== undefined && v !== "" ? Number(v) : 0);
    }, 0);

  const t1ut = sumField("firstTerm",  "unitTest");
  const t1te = sumField("firstTerm",  "termExam");
  const t2ut = sumField("secondTerm", "unitTest");
  const t2te = sumField("secondTerm", "termExam");
  const tfut = sumField("final",      "unitTest");
  const tfte = sumField("final",      "termExam");

  const socialLeft = [
    { label: "Discipline",  key: "discipline" },
    { label: "Neatness",    key: "neatness" },
    { label: "Class Part.", key: "classParticipation" },
  ];
  const socialRight = [
    { label: "Courteous",            key: "courteous" },
    { label: "Responsible & dep.",   key: "responsibleDependable" },
    { label: "Attitude to teachers", key: "attitudeTeachers" },
  ];

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Poppins:wght@400;600;700;800;900&display=swap');

    *, *::before, *::after {
      margin: 0; padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body { font-family: 'Nunito', sans-serif; background: #fff; }

    .rc-wrapper {
      display: flex;
      flex-direction: column;
      width: 210mm;
      background: #fff;
    }

    /* ── Hard A4 page ── */
    .rc-page {
      position: relative;
      width: 210mm;
      height: 297mm;
      box-sizing: border-box;
      overflow: hidden;
      flex-shrink: 0;
      page-break-after: always;
      break-after: page;
    }
    .rc-page:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    /* ══ INNER PAGE ══ */
    .inner-wrap {
      width: 210mm;
      height: 297mm;
      background: #fff;
      padding: 5mm 6mm 4mm;
      display: flex;
      flex-direction: column;
      gap: 2.5mm;
      box-sizing: border-box;
    }

    /* Header */
    .inner-header {
      display: flex;
      align-items: center;
      gap: 3mm;
      border-bottom: 2.5px solid #1a3a8c;
      padding-bottom: 3mm;
      flex-shrink: 0;
    }
    .inner-logo-wrap {
      width: 20mm;
      height: 20mm;
      border-radius: 50%;
      overflow: hidden;
      border: 2.5px solid #1a3a8c;
      flex-shrink: 0;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .inner-logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .inner-school-info {
      flex: 1;
      text-align: center;
    }
    .inner-school-name {
      font-family: 'Poppins', sans-serif;
      font-size: 14pt;
      font-weight: 900;
      color: #1a3a8c;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      line-height: 1.15;
    }
    .inner-school-address {
      font-size: 7pt;
      color: #555;
      margin-top: 1.5mm;
    }
    .inner-report-title {
      font-family: 'Poppins', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: #fff;
      background: #1a3a8c;
      padding: 2mm 5mm;
      border-radius: 4px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Student info */
    .student-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5mm 6mm;
      font-size: 7.5pt;
      border: 1.5px solid #1a3a8c;
      padding: 2.5mm 4mm;
      border-radius: 4px;
      flex-shrink: 0;
      background: #f8faff;
    }
    .si-row {
      display: flex;
      align-items: baseline;
      gap: 1.5mm;
    }
    .si-label {
      font-weight: 800;
      white-space: nowrap;
      min-width: 24mm;
      color: #1a3a8c;
    }
    .si-value {
      border-bottom: 1px dotted #999;
      flex: 1;
      font-style: italic;
      padding-bottom: 1px;
      color: #222;
    }

    /* Marks table */
    .marks-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 6.5pt;
      flex-shrink: 0;
    }
    .marks-table th,
    .marks-table td {
      border: 1px solid #555;
      padding: 2.5px 2px;
      text-align: center;
    }
    .marks-table .th-main {
      background: #d0d8f0;
      font-weight: 800;
      font-size: 7pt;
      color: #0f1f3d;
    }
    .marks-table .th-sub {
      background: #e8ecf8;
      font-weight: 700;
      font-size: 6pt;
      line-height: 1.3;
      color: #333;
    }
    .marks-table .td-subject {
      text-align: left;
      padding-left: 4px;
      font-weight: 600;
      font-size: 6.5pt;
    }
    .marks-table .td-total  { font-weight: 800; background: #efefef; }
    .marks-table .td-highlight { font-weight: 800; background: #e8f4e8; }

    /* Social qualities */
    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3mm;
      flex-shrink: 0;
    }
    .section-title {
      font-family: 'Poppins', sans-serif;
      font-size: 7pt;
      font-weight: 800;
      background: #d0d8f0;
      border: 1px solid #555;
      text-align: center;
      padding: 2px 3px;
      letter-spacing: 0.3px;
      color: #0f1f3d;
    }
    .social-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 6.5pt;
    }
    .social-table th,
    .social-table td {
      border: 1px solid #555;
      padding: 2.5px 3px;
      text-align: center;
    }
    .social-table .th-main {
      background: #d0d8f0;
      font-weight: 800;
      font-size: 7pt;
      color: #0f1f3d;
    }
    .social-table .td-label {
      text-align: left;
      padding-left: 5px;
      font-size: 6.5pt;
    }

    /* Remarks */
    .remarks-block {
      border: 1.5px solid #1a3a8c;
      padding: 2mm 3mm;
      font-size: 7pt;
      border-radius: 3px;
      flex-shrink: 0;
      background: #f8faff;
    }
    .remarks-label {
      font-weight: 800;
      font-size: 7pt;
      margin-bottom: 1mm;
      color: #1a3a8c;
    }
    .remarks-text {
      min-height: 7mm;
      font-style: italic;
      color: #333;
    }

    /* Spacer pushes signatures to bottom */
    .spacer { flex: 1; }

    /* Signatures */
    .date-row {
      display: flex;
      justify-content: flex-end;
      font-size: 6.5pt;
      font-weight: 700;
      color: #333;
    }
    .sigs-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .sig-block { text-align: center; flex: 1; }
    .sig-line  {
      border-bottom: 1px solid #333;
      margin: 0 4mm;
      height: 12mm;
    }
    .sig-label {
      font-size: 6pt;
      font-weight: 700;
      color: #333;
      margin-top: 1.5mm;
    }

    /* Print */
    @media print {
      @page { size: A4 portrait; margin: 0; }
      html, body { margin: 0; }
      .rc-wrapper { display: block; width: 210mm; }
      .rc-page {
        width: 210mm;
        height: 297mm;
        overflow: hidden;
        page-break-after: always;
        break-after: page;
      }
      .rc-page:last-child {
        page-break-after: avoid;
        break-after: avoid;
      }
    }
  `;

  /* Cover page overlay text style */
  const valStyle = {
    position:      "absolute",
    fontFamily:    "'Poppins', sans-serif",
    fontWeight:    900,
    color:         "#0f1f63",
    fontSize:      "14pt",
    lineHeight:    1,
    whiteSpace:    "nowrap",
    letterSpacing: "0.4px",
  };

  /* ══ PAGE 1 — COVER ══
     Only Name, Class, Section, Roll No overlaid.
     Admission No completely removed.
  ══════════════════════ */
  const CoverPage = (
    <div className="rc-page">
      <img
        src={report}
        alt="cover"
        style={{ width: "210mm", height: "297mm", objectFit: "fill", display: "block" }}
      />

      {/* NAME */}
      <div style={{ ...valStyle, top: "256mm", left: "65mm", width: "118mm", fontSize: "14pt" }}>
        {s.studentName || ""}
      </div>

      {/* CLASS */}
      <div style={{ ...valStyle, top: "266mm", left: "65mm", width: "34mm" }}>
        {s.className || ""}
      </div>

      {/* SECTION */}
      <div style={{ ...valStyle, top: "266mm", left: "95mm", width: "18mm", textAlign: "center" }}>
        {s.section || "A"}
      </div>

      {/* ROLL NO */}
      <div style={{ ...valStyle, top: "266mm", left: "150mm", width: "28mm" }}>
        {s.rollNo || ""}
      </div>

      {/* ── Admission No intentionally removed ── */}
    </div>
  );

  /* ══ PAGE 2 — ACHIEVEMENT REPORT ══ */
  const InnerPage = (
    <div className="rc-page">
      <div className="inner-wrap">

        {/* Header with real logo */}
        <div className="inner-header">
          <div className="inner-logo-wrap">
            <img src={logo} alt="School Logo" />
          </div>
          <div className="inner-school-info">
            <div className="inner-school-name">KID'S JOYLAND SMART ENGLISH SCHOOL</div>
            <div className="inner-school-address">Jamshedpur, Jharkhand</div>
          </div>
          <div className="inner-report-title">Achievement Report : {s.session || ""}</div>
        </div>

        {/* Student info — 8 fields, 2 columns */}
        <div className="student-info">
          <div className="si-row">
            <span className="si-label">Student's Name :</span>
            <span className="si-value">{s.studentName || ""}</span>
          </div>
          <div className="si-row">
            <span className="si-label">Admission No. :</span>
            <span className="si-value">{s.admNo || s.admissionNo || ""}</span>
          </div>
          <div className="si-row">
            <span className="si-label">Father's Name :</span>
            <span className="si-value">{s.fatherName || s.student?.fatherName || ""}</span>
          </div>
          <div className="si-row">
            <span className="si-label">Class / Section :</span>
            <span className="si-value">{s.className ? `${s.className} / ${s.section || "A"}` : ""}</span>
          </div>
          <div className="si-row">
            <span className="si-label">Mother's Name :</span>
            <span className="si-value">{s.motherName || s.student?.motherName || ""}</span>
          </div>
          <div className="si-row">
            <span className="si-label">Roll No :</span>
            <span className="si-value">{s.rollNo || ""}</span>
          </div>
          <div className="si-row">
            <span className="si-label">Date of Birth :</span>
            <span className="si-value">
              {(s.dob || s.student?.dob)
                ? new Date(s.dob || s.student?.dob).toLocaleDateString("en-IN")
                : ""}
            </span>
          </div>
          <div className="si-row">
            <span className="si-label">Aadhar No :</span>
            <span className="si-value">{s.aadharNo || s.student?.aadharNo || ""}</span>
          </div>
        </div>

        {/* Marks table */}
        <table className="marks-table">
          <thead>
            <tr>
              <th className="th-main" rowSpan={2} style={{ width: "18%", textAlign: "left", paddingLeft: 4 }}>Subject</th>
              <th className="th-main" rowSpan={2} style={{ width: "5%" }}>F.M.</th>
              <th className="th-main" colSpan={3} style={{ background: "#bccce8" }}>FIRST TERM</th>
              <th className="th-main" colSpan={3} style={{ background: "#bccce8" }}>2ND TERM</th>
              <th className="th-main" colSpan={3} style={{ background: "#bccce8" }}>FINAL TERM</th>
              <th className="th-main" rowSpan={2} style={{ background: "#b0e0c0", width: "6%" }}>AVG</th>
            </tr>
            <tr>
              {["firstTerm", "secondTerm", "final"].map(t => (
                <React.Fragment key={t}>
                  <th className="th-sub" style={{ background: "#d4e0f4", width: "7%" }}>UNIT<br/>TEST<br/>(20)</th>
                  <th className="th-sub" style={{ background: "#d4e0f4", width: "7%" }}>TERM<br/>EXAM<br/>(80)</th>
                  <th className="th-sub" style={{ background: "#d4e0f4", width: "7%" }}>TOTAL<br/>(100)</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, i) => {
              const vals = ["firstTerm","secondTerm","final"]
                .map(t => sub[t]?.total)
                .filter(v => v !== null && v !== "" && v !== undefined);
              const avg = vals.length
                ? Math.round(vals.reduce((a, b) => a + Number(b), 0) / vals.length)
                : "";
              const v = (term, field) => {
                const val = sub[term]?.[field];
                return (val !== null && val !== undefined && val !== "") ? val : "";
              };
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f7f9fd" }}>
                  <td className="td-subject">{sub.subject}</td>
                  <td style={{ fontWeight: 600 }}>{sub.fullMarks}</td>
                  <td>{v("firstTerm",  "unitTest")}</td>
                  <td>{v("firstTerm",  "termExam")}</td>
                  <td style={{ fontWeight: 700 }}>{v("firstTerm",  "total")}</td>
                  <td>{v("secondTerm", "unitTest")}</td>
                  <td>{v("secondTerm", "termExam")}</td>
                  <td style={{ fontWeight: 700 }}>{v("secondTerm", "total")}</td>
                  <td>{v("final",      "unitTest")}</td>
                  <td>{v("final",      "termExam")}</td>
                  <td style={{ fontWeight: 700 }}>{v("final",      "total")}</td>
                  <td className="td-highlight">{avg}</td>
                </tr>
              );
            })}

            {/* Total */}
            <tr className="td-total" style={{ background: "#e8ecf8" }}>
              <td className="td-subject" style={{ fontWeight: 800 }}>TOTAL MARKS</td>
              <td style={{ fontWeight: 800 }}>{totalFm}</td>
              <td style={{ fontWeight: 700 }}>{t1ut || ""}</td>
              <td style={{ fontWeight: 700 }}>{t1te || ""}</td>
              <td style={{ fontWeight: 800 }}>{t1   || ""}</td>
              <td style={{ fontWeight: 700 }}>{t2ut || ""}</td>
              <td style={{ fontWeight: 700 }}>{t2te || ""}</td>
              <td style={{ fontWeight: 800 }}>{t2   || ""}</td>
              <td style={{ fontWeight: 700 }}>{tfut || ""}</td>
              <td style={{ fontWeight: 700 }}>{tfte || ""}</td>
              <td style={{ fontWeight: 800 }}>{tf   || ""}</td>
              <td className="td-highlight" style={{ fontWeight: 800 }}>
                {t1 && t2 && tf ? Math.round((t1 + t2 + tf) / 3) : ""}
              </td>
            </tr>

            {/* Rank */}
            <tr style={{ background: "#f0f4ff" }}>
              <td className="td-subject" style={{ fontWeight: 800 }}>RANK</td>
              <td /><td /><td />
              <td style={{ fontWeight: 800 }}>{s.rank?.firstTerm  || ""}</td>
              <td /><td />
              <td style={{ fontWeight: 800 }}>{s.rank?.secondTerm || ""}</td>
              <td /><td />
              <td style={{ fontWeight: 800 }}>{s.rank?.final      || ""}</td>
              <td className="td-highlight" style={{ fontWeight: 800 }}>{s.rank?.overall || ""}</td>
            </tr>

            {/* Attendance */}
            <tr style={{ background: "#f0f4ff" }}>
              <td className="td-subject" style={{ fontWeight: 800 }}>ATTENDANCE</td>
              <td /><td /><td />
              <td style={{ fontWeight: 700 }}>
                {s.attendance?.firstTerm?.workingDays
                  ? `${s.attendance.firstTerm.workingDays - (s.attendance.firstTerm.daysAbsent || 0)}/${s.attendance.firstTerm.workingDays}`
                  : ""}
              </td>
              <td /><td />
              <td style={{ fontWeight: 700 }}>
                {s.attendance?.secondTerm?.workingDays
                  ? `${s.attendance.secondTerm.workingDays - (s.attendance.secondTerm.daysAbsent || 0)}/${s.attendance.secondTerm.workingDays}`
                  : ""}
              </td>
              <td /><td />
              <td style={{ fontWeight: 700 }}>
                {s.attendance?.final?.workingDays
                  ? `${s.attendance.final.workingDays - (s.attendance.final.daysAbsent || 0)}/${s.attendance.final.workingDays}`
                  : ""}
              </td>
              <td />
            </tr>
          </tbody>
        </table>

        {/* Social Qualities */}
        <div className="bottom-grid">
          <div>
            <div className="section-title">Social Qualities</div>
            <table className="social-table">
              <thead>
                <tr>
                  <th className="th-main" style={{ textAlign: "left", paddingLeft: 5 }}>Subject</th>
                  <th className="th-main">1st Term</th>
                  <th className="th-main">IInd Term</th>
                  <th className="th-main">Final Term</th>
                </tr>
              </thead>
              <tbody>
                {socialLeft.map(({ label, key }, i) => (
                  <tr key={key} style={{ background: i % 2 === 0 ? "#fff" : "#f7f9fd" }}>
                    <td className="td-label">{label}</td>
                    <td style={{ fontWeight: 700 }}>{s[key]?.firstTerm  || ""}</td>
                    <td style={{ fontWeight: 700 }}>{s[key]?.secondTerm || ""}</td>
                    <td style={{ fontWeight: 700 }}>{s[key]?.final      || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="section-title">Social Qualities</div>
            <table className="social-table">
              <thead>
                <tr>
                  <th className="th-main" style={{ textAlign: "left", paddingLeft: 5 }}>Subject</th>
                  <th className="th-main">1st Term</th>
                  <th className="th-main">IInd Term</th>
                  <th className="th-main">Final Term</th>
                </tr>
              </thead>
              <tbody>
                {socialRight.map(({ label, key }, i) => (
                  <tr key={key} style={{ background: i % 2 === 0 ? "#fff" : "#f7f9fd" }}>
                    <td className="td-label">{label}</td>
                    <td style={{ fontWeight: 700 }}>{s[key]?.firstTerm  || ""}</td>
                    <td style={{ fontWeight: 700 }}>{s[key]?.secondTerm || ""}</td>
                    <td style={{ fontWeight: 700 }}>{s[key]?.final      || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remarks */}
        <div className="remarks-block">
          <div className="remarks-label">Remarks :</div>
          <div className="remarks-text">
            {s.promoted === true
              ? `Promoted to Class ${s.promotedToClass || ""}.`
              : s.promoted === false ? "Not promoted." : ""}
            {s.remarks?.final ? ` ${s.remarks.final}` : ""}
          </div>
        </div>

        {/* Spacer pushes signatures to the very bottom */}
        <div className="spacer" />

        {/* Date */}
        <div className="date-row">
          Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </div>

        {/* Signatures */}
        <div className="sigs-row">
          {["Parent's Signature", "School Stamp", "Class Teacher's Signature", "Principal Signature"].map(label => (
            <div key={label} className="sig-block">
              <div className="sig-line" />
              <div className="sig-label">{label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div id="report-card-print" className="rc-wrapper">
        {CoverPage}
        {InnerPage}
      </div>
    </>
  );
}