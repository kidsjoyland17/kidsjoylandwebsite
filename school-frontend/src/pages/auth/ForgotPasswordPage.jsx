import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/lib/api.js";
import { ROUTES } from "@/constants/routes";
import logo from "@/assets/logo.png";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = email, 2 = OTP
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email.");
        try {
            setLoading(true);
            await api.post("/auth/forgot-password", { email });
            toast.success("OTP sent! Check your email.");
            setStep(2);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error("Enter the 6-digit OTP.");
        try {
            setLoading(true);
            const { data } = await api.post("/auth/verify-otp", { email, otp });
            toast.success("OTP verified!");
            // Pass resetToken to next page via state
            navigate(ROUTES.RESET_PASSWORD, { state: { resetToken: data.data.resetToken, email } });
        } catch (err) {
            toast.error(err?.response?.data?.message || "Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            <button type="button" onClick={() => step === 2 ? setStep(1) : navigate(ROUTES.LOGIN)} style={styles.backBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                {step === 2 ? "Back" : "Login"}
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

                {/* Brand */}
                <div style={styles.brand}>
                    <img src={logo} alt="KJS Logo" style={styles.logo} onError={(e) => { e.target.style.display = "none"; }} />
                    <h1 style={styles.schoolName}>Kid's Joyland</h1>
                    <p style={styles.schoolTagline}>Smart English School</p>
                </div>

                {/* Step indicator */}
                <div style={styles.stepRow}>
                    {/* Step 1 */}
                    <div style={styles.stepItem}>
                        <div style={{ ...styles.stepCircle, background: step > 1 ? "#22c55e" : "#2563eb", color: "#fff" }}>
                            {step > 1 ? "✓" : "1"}
                        </div>
                        <span style={{ ...styles.stepLabel, color: "#2563eb" }}>Email</span>
                    </div>
                    <div style={{ ...styles.stepLine, background: step > 1 ? "#22c55e" : "#e2e8f0" }} />
                    {/* Step 2 */}
                    <div style={styles.stepItem}>
                        <div style={{ ...styles.stepCircle, background: step >= 2 ? "#2563eb" : "#e2e8f0", color: step >= 2 ? "#fff" : "#94a3b8" }}>
                            2
                        </div>
                        <span style={{ ...styles.stepLabel, color: step >= 2 ? "#2563eb" : "#94a3b8" }}>OTP</span>
                    </div>
                    <div style={{ ...styles.stepLine, background: "#e2e8f0" }} />
                    {/* Step 3 */}
                    <div style={styles.stepItem}>
                        <div style={{ ...styles.stepCircle, background: "#e2e8f0", color: "#94a3b8" }}>3</div>
                        <span style={{ ...styles.stepLabel, color: "#94a3b8" }}>Reset</span>
                    </div>
                </div>

                {/* ── Step 1: Email ── */}
                {step === 1 && (
                    <form onSubmit={handleRequestOTP} style={styles.form}>
                        <p style={styles.hint}>Enter your registered email address and we'll send you a 6-digit OTP.</p>
                        <div style={styles.field}>
                            <label style={styles.label}>Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@school.com" style={styles.input} autoComplete="email" />
                        </div>
                        <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Sending OTP…" : "Send OTP"}
                        </button>
                    </form>
                )}

                {/* ── Step 2: OTP ── */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} style={styles.form}>
                        <p style={styles.hint}>
                            Enter the 6-digit OTP sent to <strong>{email}</strong>. Valid for 10 minutes.
                        </p>
                        <div style={styles.field}>
                            <label style={styles.label}>One-Time Password</label>
                            <input
                                type="text" value={otp} maxLength={6} inputMode="numeric"
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                placeholder="• • • • • •"
                                style={{ ...styles.input, letterSpacing:"0.45em", fontSize:24, textAlign:"center", fontWeight:700, fontFamily:"monospace" }}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Verifying…" : "Verify OTP"}
                        </button>
                        <button type="button" onClick={handleRequestOTP} disabled={loading} style={styles.resendBtn}>
                            Didn't receive it? Resend OTP
                        </button>
                    </form>
                )}

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
    brand: { textAlign:"center", marginBottom:24, display:"flex", flexDirection:"column", alignItems:"center", gap:6 },
    logo: { width:56, height:56, borderRadius:"50%", objectFit:"cover", boxShadow:"0 4px 14px rgba(26,35,126,0.25)", marginBottom:4 },
    schoolName: { fontSize:20, fontWeight:700, color:"#0d1f1a", margin:0, fontFamily:"Georgia, serif" },
    schoolTagline: { fontSize:11, fontWeight:700, color:"#dc2626", letterSpacing:"0.15em", textTransform:"uppercase", margin:0 },
    stepRow: { display:"flex", alignItems:"center", justifyContent:"center", marginBottom:28, gap:0 },
    stepItem: { display:"flex", flexDirection:"column", alignItems:"center", gap:4 },
    stepCircle: { width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, transition:"background 0.3s" },
    stepLabel: { fontSize:10, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" },
    stepLine: { width:52, height:2, marginBottom:14, transition:"background 0.3s" },
    hint: { fontSize:13, color:"#64748b", margin:"0 0 4px", lineHeight:1.6 },
    form: { display:"flex", flexDirection:"column", gap:18 },
    field: { display:"flex", flexDirection:"column", gap:6 },
    label: { fontSize:13, fontWeight:600, color:"#334155" },
    input: { padding:"12px 14px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:15, outline:"none", fontFamily:"inherit", color:"#0d1f1a", caretColor:"#2563eb", background:"#fff", transition:"border-color 0.2s" },
    btn: { marginTop:4, padding:"13px", background:"linear-gradient(135deg, #1e3a8a, #2563eb)", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer" },
    resendBtn: { background:"none", border:"none", color:"#2563eb", fontSize:13, fontWeight:600, cursor:"pointer", textAlign:"center", padding:"4px 0", fontFamily:"'Segoe UI', sans-serif" },
    footer: { marginTop:28, textAlign:"center", fontSize:12, color:"#9aada9" },
};