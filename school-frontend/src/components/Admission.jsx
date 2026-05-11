import { useState } from "react";
import { CLASSES } from "@/constants/routes";
import {
  MdPerson,
  MdFamilyRestroom,
  MdSchool,
} from "react-icons/md";

const inputClass =
  "w-full bg-white border border-[#e2e8f0] text-[#334155] placeholder-[#94a3b8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e] transition-all duration-200";

const selectClass =
  "w-full bg-white border border-[#e2e8f0] text-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a237e] focus:ring-1 focus:ring-[#1a237e] transition-all duration-200 appearance-none cursor-pointer";

const labelClass =
  "block text-xs font-semibold text-[#475569] uppercase tracking-widest mb-2";

const errorClass = "text-xs text-red-500 mt-1";

const currentYear = new Date().getFullYear();
const nextYear    = currentYear + 1;

const classLabel = (cls) => (isNaN(Number(cls)) ? cls : `Class ${cls}`);

function SectionHeading({ icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-[#e8eaf6] border border-[#c5cae9] flex items-center justify-center text-[#1a237e]">
        {icon}
      </div>
      <h2 className="text-[#1a237e] text-sm font-bold uppercase tracking-widest">{title}</h2>
      <div className="flex-1 h-px bg-[#e2e8f0]" />
    </div>
  );
}

function Field({ label, children, full, error }) {
  return (
    <div className={full ? "col-span-2 sm:col-span-2" : "col-span-2 sm:col-span-1"}>
      <label className={labelClass}>
        {label} <span className="text-red-500">*</span>
      </label>
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

function SuccessModal({ email, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-[#e8eaf6] border-2 border-[#1a237e] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#1a237e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1a237e] mb-1">Application Submitted!</h2>
        <p className="text-[#64748b] text-sm mb-1">Your admission form has been sent successfully.</p>
        {email && (
          <p className="text-[#1a237e] text-xs font-semibold mb-4">
            Confirmation will be sent to {email}
          </p>
        )}
        <div className="bg-[#f8f9ff] rounded-xl p-3 mb-5 border border-[#e2e8f0]">
          <p className="text-xs text-[#94a3b8] mb-1">Application ID</p>
          <p className="text-[#1a237e] font-mono font-bold tracking-widest">
            ADM-{Date.now().toString().slice(-8)}
          </p>
        </div>
        <p className="text-[#64748b] text-xs mb-5">
          Please visit school office with hardcopy documents.<br />
          <span className="font-semibold">Mon – Sat, 9:00 AM – 4:00 PM</span>
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1a237e] to-[#3949ab] hover:opacity-90 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}

const emptyForm = {
  firstName: "", lastName: "", dob: "", gender: "",
  fatherName: "", motherName: "",
  email: "", phone: "",
  address: "", classApplying: "", year: "", admissionType: "",
};

const emptyErrors = Object.fromEntries(Object.keys(emptyForm).map((k) => [k, ""]));

export default function Admission({ onClose }) {
  const [submitted,      setSubmitted]      = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [form,           setForm]           = useState(emptyForm);
  const [errors,         setErrors]         = useState(emptyErrors);
  const [serverError,    setServerError]    = useState("");

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
    setServerError("");
  };

  const validate = () => {
    const e = { ...emptyErrors };
    let ok = true;

    if (!form.firstName.trim())    { e.firstName    = "First name is required";           ok = false; }
    if (!form.lastName.trim())     { e.lastName     = "Last name is required";            ok = false; }
    if (!form.dob)                 { e.dob          = "Date of birth is required";        ok = false; }
    if (!form.gender)              { e.gender       = "Gender is required";               ok = false; }
    if (!form.fatherName.trim())   { e.fatherName   = "Father's name is required";       ok = false; }
    if (!form.motherName.trim())   { e.motherName   = "Mother's name is required";       ok = false; }
    if (!form.phone.trim())        { e.phone        = "Phone number is required";         ok = false; }
    else if (!/^\d{10}$/.test(form.phone.trim())) {
                                     e.phone        = "Must be exactly 10 digits";        ok = false; }
    if (!form.email.trim())        { e.email        = "Email is required";                ok = false; }
    else if (!/\S+@\S+\.\S+/.test(form.email)) {
                                     e.email        = "Enter a valid email address";      ok = false; }
    if (!form.address.trim())      { e.address      = "Address is required";              ok = false; }
    if (!form.classApplying)       { e.classApplying = "Please select a class";          ok = false; }
    if (!form.year)                { e.year         = "Academic year is required";        ok = false; }
    if (!form.admissionType)       { e.admissionType = "Admission type is required";     ok = false; }

    setErrors(e);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      const formData = new FormData();
      formData.append("childName",     `${form.firstName.trim()} ${form.lastName.trim()}`);
      formData.append("applyingFor",   form.classApplying);
      formData.append("childDob",      form.dob);
      formData.append("childGender",   form.gender);
      formData.append("fatherName",    form.fatherName.trim());
      formData.append("motherName",    form.motherName.trim());
      formData.append("parentPhone",   form.phone.trim());
      formData.append("parentEmail",   form.email.trim());
      formData.append("address",       form.address.trim());
      formData.append("admissionType", form.admissionType);
      formData.append("year",          form.year);

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL || "http://localhost:5000/api"}/admission`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Submission failed. Please try again.");
        return;
      }

      setSubmittedEmail(form.email);
      setSubmitted(true);
      setForm(emptyForm);
      setErrors(emptyErrors);
    } catch (err) {
      setServerError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f8f9ff] py-6 px-3 sm:px-6" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {submitted && (
        <SuccessModal email={submittedEmail} onClose={() => setSubmitted(false)} />
      )}

      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a237e]">Admission Application</h1>
          <p className="text-sm text-[#64748b] mt-1">All fields marked <span className="text-red-500 font-bold">*</span> are required</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 space-y-6 sm:space-y-8">

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {serverError}
            </div>
          )}

          {/* STUDENT INFO */}
          <div>
            <SectionHeading icon={<MdPerson size={18} />} title="Student Info" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Field label="First Name" error={errors.firstName}>
                <input
                  className={`${inputClass} ${errors.firstName ? "border-red-400" : ""}`}
                  placeholder="Enter first name"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
              </Field>
              <Field label="Last Name" error={errors.lastName}>
                <input
                  className={`${inputClass} ${errors.lastName ? "border-red-400" : ""}`}
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </Field>
              <Field label="Date of Birth" error={errors.dob}>
                <input
                  type="date"
                  className={`${inputClass} ${errors.dob ? "border-red-400" : ""}`}
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                />
              </Field>
              <Field label="Gender" error={errors.gender}>
                <div className="relative">
                  <select
                    className={`${selectClass} ${errors.gender ? "border-red-400" : ""}`}
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#94a3b8]">▾</div>
                </div>
              </Field>
            </div>
          </div>

          {/* PARENT INFO */}
          <div>
            <SectionHeading icon={<MdFamilyRestroom size={18} />} title="Parent Info" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Field label="Father's Name" error={errors.fatherName}>
                <input
                  className={`${inputClass} ${errors.fatherName ? "border-red-400" : ""}`}
                  placeholder="Enter father's name"
                  value={form.fatherName}
                  onChange={(e) => set("fatherName", e.target.value)}
                />
              </Field>
              <Field label="Mother's Name" error={errors.motherName}>
                <input
                  className={`${inputClass} ${errors.motherName ? "border-red-400" : ""}`}
                  placeholder="Enter mother's name"
                  value={form.motherName}
                  onChange={(e) => set("motherName", e.target.value)}
                />
              </Field>
              <Field label="Phone Number" error={errors.phone}>
                <input
                  className={`${inputClass} ${errors.phone ? "border-red-400" : ""}`}
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  maxLength={10}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                />
              </Field>
              <Field label="Email Address" error={errors.email}>
                <input
                  type="email"
                  className={`${inputClass} ${errors.email ? "border-red-400" : ""}`}
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label="Home Address" full error={errors.address}>
                <input
                  className={`${inputClass} ${errors.address ? "border-red-400" : ""}`}
                  placeholder="Enter full address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* ADMISSION DETAILS */}
          <div>
            <SectionHeading icon={<MdSchool size={18} />} title="Admission Details" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Field label="Class Applying For" error={errors.classApplying}>
                <div className="relative">
                  <select
                    className={`${selectClass} ${errors.classApplying ? "border-red-400" : ""}`}
                    value={form.classApplying}
                    onChange={(e) => set("classApplying", e.target.value)}
                  >
                    <option value="">Select class</option>
                    {CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{classLabel(cls)}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#94a3b8]">▾</div>
                </div>
              </Field>
              <Field label="Academic Year" error={errors.year}>
                <div className="relative">
                  <select
                    className={`${selectClass} ${errors.year ? "border-red-400" : ""}`}
                    value={form.year}
                    onChange={(e) => set("year", e.target.value)}
                  >
                    <option value="">Select year</option>
                    <option value={`${currentYear}-${nextYear}`}>{currentYear}–{nextYear}</option>
                    <option value={`${nextYear}-${nextYear + 1}`}>{nextYear}–{nextYear + 1}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#94a3b8]">▾</div>
                </div>
              </Field>
              <Field label="Admission Type" full error={errors.admissionType}>
                <div className="relative">
                  <select
                    className={`${selectClass} ${errors.admissionType ? "border-red-400" : ""}`}
                    value={form.admissionType}
                    onChange={(e) => set("admissionType", e.target.value)}
                  >
                    <option value="">Select admission type</option>
                    <option value="New">New Admission</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Re-admission">Re-admission</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#94a3b8]">▾</div>
                </div>
              </Field>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1a237e] to-[#3949ab] hover:opacity-90 transition-all disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit Application"}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-[#1a237e] border border-[#1a237e] hover:bg-[#e8eaf6] transition-all disabled:opacity-60"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}