import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { ROUTES } from "@/constants/routes";
import logo from "@/assets/logo.png";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            toast.error("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);
            const user = await login(form.email, form.password);
            toast.success(`Welcome, ${user.name}!`);
            if (user.role === "admin") {
                navigate(ROUTES.ADMIN_DASHBOARD);
            } else if (user.role === "teacher") {
                navigate(user.profileCompleted
                    ? ROUTES.TEACHER_DASHBOARD
                    : ROUTES.TEACHER_PROFILE
                );
            } else {
                navigate(ROUTES.HOME);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            <button type="button" onClick={() => navigate(ROUTES.HOME)} style={styles.backBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
            </button>

            {/* ── Background blobs ── */}
            <div style={{ position:"absolute", bottom:"-120px", left:"-80px", width:420, height:420, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.55)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:"40px", left:"80px", width:200, height:200, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.4)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", top:"20%", left:"-120px", width:380, height:380, borderRadius:"50%", background:"rgba(147,174,255,0.55)", filter:"blur(40px)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", top:"-80px", left:"8%", width:260, height:260, borderRadius:"50%", background:"rgba(180,200,255,0.45)", filter:"blur(30px)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", top:"-60px", right:"-80px", width:340, height:340, borderRadius:"50%", background:"rgba(90,130,245,0.65)", filter:"blur(45px)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", top:"38%", right:"-60px", width:260, height:260, borderRadius:"50%", background:"rgba(140,170,255,0.45)", filter:"blur(35px)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:"-40px", right:"8%", width:300, height:240, borderRadius:"50%", background:"rgba(160,185,255,0.4)", filter:"blur(40px)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:"15%", right:"8%", width:64, height:64, borderRadius:"50%", background:"radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85), rgba(100,140,255,0.7))", boxShadow:"0 8px 32px rgba(80,120,220,0.3), inset 0 1px 0 rgba(255,255,255,0.6)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.5)", pointerEvents:"none" }} />
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:1, opacity:0.18 }}>
                <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
                <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>
            <svg style={{ position:"absolute", top:"8%", left:"5%", width:200, pointerEvents:"none", opacity:0.55 }} viewBox="0 0 200 120" fill="none">
                <path d="M10 100 C50 60 120 20 195 10" stroke="rgba(200,215,255,0.7)" strokeWidth="1.5" fill="none"/>
            </svg>
            <svg style={{ position:"absolute", top:"40%", right:"14%", width:50, pointerEvents:"none", opacity:0.55 }} viewBox="0 0 50 50" fill="none">
                <circle cx="25" cy="25" r="22" stroke="rgba(200,215,255,0.7)" strokeWidth="1.5" fill="none"/>
            </svg>
            <div style={styles.dotGridLeft}>{Array.from({ length: 25 }).map((_, i) => <div key={i} style={styles.dot} />)}</div>
            <div style={styles.dotGridRight}>{Array.from({ length: 25 }).map((_, i) => <div key={i} style={styles.dot} />)}</div>

            {/* ── Card ── */}
            <div style={styles.card}>
                <div style={styles.brand}>
                    <img src={logo} alt="KJS Logo" style={styles.logo} onError={(e) => { e.target.style.display = "none"; }} />
                    <h1 style={styles.schoolName}>Kid's Joyland</h1>
                    <p style={styles.schoolTagline}>Smart English School</p>
                    <p style={styles.subtitle}>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email Address</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                            placeholder="you@school.com" style={styles.input} autoComplete="email" />
                    </div>

                    <div style={styles.field}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <label style={styles.label}>Password</label>
                            {/* ── Forgot Password link ── */}
                            <button type="button" onClick={() => navigate(ROUTES.FORGOT_PASSWORD)} style={styles.forgotLink}>
                                Forgot password?
                            </button>
                        </div>
                        <div style={styles.passwordWrapper}>
                            <input name="password" type={showPassword ? "text" : "password"} value={form.password}
                                onChange={handleChange} placeholder="••••••••"
                                style={{ ...styles.input, paddingRight: 44, width: "100%", boxSizing: "border-box" }}
                                autoComplete="current-password" />
                            <button type="button" onClick={() => setShowPassword((v) => !v)} style={styles.eyeBtn} tabIndex={-1}>
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                <p style={styles.footer}>Admin & Teacher login · KJS School Management</p>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg, #c8d9ff 0%, #dce8ff 35%, #b8cbff 65%, #a8bfff 100%)", padding:20, position:"relative", overflow:"hidden", fontFamily:"'Segoe UI', sans-serif" },
    backBtn: { position:"fixed", top:20, left:20, zIndex:100, display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.75)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.6)", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:600, color:"#1e3a8a", cursor:"pointer", boxShadow:"0 2px 10px rgba(37,99,235,0.12)", fontFamily:"'Segoe UI', sans-serif" },
    dotGridLeft: { position:"absolute", left:48, top:"12%", display:"grid", gridTemplateColumns:"repeat(5, 10px)", gap:9, pointerEvents:"none" },
    dotGridRight: { position:"absolute", right:48, bottom:"10%", display:"grid", gridTemplateColumns:"repeat(5, 10px)", gap:9, pointerEvents:"none" },
    dot: { width:4, height:4, borderRadius:"50%", background:"rgba(255,255,255,0.5)" },
    card: { position:"relative", zIndex:20, background:"#fff", borderRadius:20, padding:"44px 40px", width:"100%", maxWidth:420, boxShadow:"0 24px 60px rgba(37,99,235,0.13)" },
    brand: { textAlign:"center", marginBottom:32, display:"flex", flexDirection:"column", alignItems:"center", gap:6 },
    logo: { width:64, height:64, borderRadius:"50%", objectFit:"cover", boxShadow:"0 4px 14px rgba(26,35,126,0.25)", marginBottom:4 },
    schoolName: { fontSize:20, fontWeight:700, color:"#0d1f1a", margin:0, fontFamily:"Georgia, serif" },
    schoolTagline: { fontSize:11, fontWeight:700, color:"#dc2626", letterSpacing:"0.15em", textTransform:"uppercase", margin:0 },
    subtitle: { fontSize:13, color:"#6b7a77", margin:"6px 0 0 0" },
    form: { display:"flex", flexDirection:"column", gap:20 },
    field: { display:"flex", flexDirection:"column", gap:6 },
    label: { fontSize:13, fontWeight:600, color:"#334155" },
    forgotLink: { background:"none", border:"none", color:"#2563eb", fontSize:12, fontWeight:600, cursor:"pointer", padding:0, fontFamily:"'Segoe UI', sans-serif" },
    input: { padding:"12px 14px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:15, outline:"none", fontFamily:"inherit", transition:"border-color 0.2s", color:"#0d1f1a", caretColor:"#2563eb", background:"#fff" },
    passwordWrapper: { position:"relative", display:"flex", alignItems:"center" },
    eyeBtn: { position:"absolute", right:12, background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center", justifyContent:"center" },
    btn: { marginTop:8, padding:"13px", background:"linear-gradient(135deg, #1e3a8a, #2563eb)", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer" },
    footer: { marginTop:28, textAlign:"center", fontSize:12, color:"#9aada9" },
};