import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import {
  UserCircleIcon,
  PhoneIcon,
  BookOpenIcon,
  AcademicCapIcon,
  PencilSquareIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  BuildingLibraryIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const QUALIFICATIONS = [
  "B.Ed", "M.Ed", "B.A + B.Ed", "M.A + B.Ed",
  "B.Sc + B.Ed", "M.Sc + B.Ed", "Ph.D", "Other",
];

const SUBJECTS = [
  "Mathematics", "Science", "Physics", "Chemistry", "Biology",
  "English", "Hindi", "History", "Geography", "Civics",
  "Computer Science", "Physical Education", "Art", "Music", "Other",
];

const InfoRow = ({ icon: Icon, label, value, accent = "blue" }) => {
  const colors = {
    blue:    "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet:  "bg-violet-50 text-violet-600",
    amber:   "bg-amber-50 text-amber-600",
    rose:    "bg-rose-50 text-rose-600",
    slate:   "bg-slate-100 text-slate-500",
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[accent]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 mt-0.5 leading-snug">
          {value || <span className="text-slate-300 italic font-normal">Not provided</span>}
        </p>
      </div>
    </div>
  );
};

const FormField = ({ label, required, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
      {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
      )}
      <div className={Icon ? "[&>*]:pl-9" : ""}>{children}</div>
    </div>
  </div>
);

const inputCls =
  "w-full pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl " +
  "focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:bg-white " +
  "transition-all placeholder-slate-300 text-slate-700";

export default function TeacherProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [form, setForm] = useState({
    phone: "", subject: "", qualification: "", bio: "",
    experience: "", address: "",
  });

  const isComplete = profile?.phone && profile?.subject && profile?.qualification;

  useEffect(() => {
    api.get("/teacher/profile")
      .then(res => {
        const data = res.data.data;
        setProfile(data);
        setForm({
          phone:         data?.phone         || "",
          subject:       data?.subject       || "",
          qualification: data?.qualification || "",
          bio:           data?.bio           || "",
          experience:    data?.experience != null ? String(data.experience) : "",
          address:       data?.address       || "",
        });
        if (!data?.phone || !data?.subject || !data?.qualification) setEditing(true);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.phone.trim() || !form.subject.trim() || !form.qualification) {
      toast.warning("Phone, subject, and qualification are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.put("/teacher/profile", {
        ...form,
        experience: form.experience !== "" ? Number(form.experience) : 0,
      });
      const data = res.data.data;
      setProfile(data);
      if (updateUser) updateUser(data);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm({
      phone:         profile?.phone         || "",
      subject:       profile?.subject       || "",
      qualification: profile?.qualification || "",
      bio:           profile?.bio           || "",
      experience:    profile?.experience != null ? String(profile.experience) : "",
      address:       profile?.address       || "",
    });
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "T";

  const joiningDate = profile?.joiningDate
    ? new Date(profile.joiningDate).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[200, 300, 180].map((h, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse"
            style={{ height: h }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Incomplete banner */}
      {!isComplete && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Complete your profile</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Phone number, subject, and qualification are required to activate all features.
            </p>
          </div>
        </div>
      )}

      {/* Hero card — no banner, just white */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-8 pb-6">
          {/* Avatar row */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white select-none">
                {initials}
              </div>
              {isComplete && (
                <CheckBadgeIcon className="absolute -bottom-1 -right-1 w-6 h-6 text-blue-500 bg-white rounded-full" />
              )}
            </div>

            {/* Name / email */}
            <h2 className="text-xl font-bold text-slate-800 leading-tight">{user?.name || "Teacher"}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {profile?.subject && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                  <BookOpenIcon className="w-3 h-3" />
                  {profile.subject}
                </span>
              )}
              {profile?.assignedClass && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full">
                  <BuildingLibraryIcon className="w-3 h-3" />
                  Class {profile.assignedClass}
                </span>
              )}
              {profile?.experience > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                  <BriefcaseIcon className="w-3 h-3" />
                  {profile.experience} yr{profile.experience !== 1 ? "s" : ""} exp.
                </span>
              )}
              {isComplete && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  <CheckIcon className="w-3 h-3" />
                  Profile complete
                </span>
              )}
            </div>

            {/* Edit button */}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="mt-4 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Bio */}
          {profile?.bio && !editing && (
            <p className="mt-2 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4 text-center">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <PencilSquareIcon className="w-4 h-4 text-blue-500" />
              Edit Professional Details
            </h3>
            {isComplete && (
              <button
                onClick={cancelEdit}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Phone Number" required icon={PhoneIcon}>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className={`${inputCls} pl-9`}
              />
            </FormField>

            <FormField label="Subject Taught" required icon={BookOpenIcon}>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className={`${inputCls} pl-9 appearance-none`}
              >
                <option value="">Select subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>

            <FormField label="Qualification" required icon={AcademicCapIcon}>
              <select
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                className={`${inputCls} pl-9 appearance-none`}
              >
                <option value="">Select qualification</option>
                {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </FormField>

            <FormField label="Years of Experience" icon={BriefcaseIcon}>
              <input
                type="number"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                min="0"
                max="50"
                placeholder="e.g. 5"
                className={`${inputCls} pl-9`}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Address" icon={MapPinIcon}>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. 12 MG Road, Jamshedpur, Jharkhand"
                  className={`${inputCls} pl-9`}
                />
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Short Bio">
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell students a bit about yourself, your teaching philosophy…"
                  className={`${inputCls} pl-4 resize-none`}
                />
              </FormField>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {saving ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : <CheckIcon className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {isComplete && (
              <button
                onClick={cancelEdit}
                className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Info cards (view mode) */}
      {!editing && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={PhoneIcon}          label="Phone Number"   value={profile?.phone}         accent="blue" />
              <InfoRow icon={BookOpenIcon}        label="Subject"        value={profile?.subject}       accent="blue" />
              <InfoRow icon={AcademicCapIcon}     label="Qualification"  value={profile?.qualification} accent="violet" />
              <InfoRow icon={BriefcaseIcon}       label="Experience"
                value={profile?.experience != null && profile.experience > 0
                  ? `${profile.experience} year${profile.experience !== 1 ? "s" : ""}`
                  : null}
                accent="amber"
              />
              <InfoRow icon={BuildingLibraryIcon} label="Assigned Class" value={profile?.assignedClass} accent="emerald" />
              <InfoRow icon={MapPinIcon}          label="Address"        value={profile?.address}       accent="rose" />
              <InfoRow icon={IdentificationIcon}  label="Teacher ID"     value={profile?.teacherId}     accent="slate" />
              <InfoRow icon={CalendarDaysIcon}    label="Joining Date"   value={joiningDate}            accent="slate" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={UserCircleIcon}     label="Full Name"     value={user?.name}  accent="blue" />
              <InfoRow icon={IdentificationIcon} label="Email Address" value={user?.email} accent="blue" />
              <InfoRow icon={AcademicCapIcon}    label="Account Role"  value="Teacher"     accent="violet" />
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-50">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Account Status</p>
                  <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}