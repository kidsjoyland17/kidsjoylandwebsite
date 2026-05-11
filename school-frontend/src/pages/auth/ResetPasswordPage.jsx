import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/lib/api.js";
import { ROUTES } from "@/constants/routes";
import logo from "@/assets/logo.png";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Passed from ForgotPasswordPage after OTP verified
    const resetToken = location.state?.resetToken;
    const email = location.state?.email;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    // Guard — if someone lands here without a token, send them back
    if (!resetToken) {
        navigate(ROUTES.FORGOT_PASSWORD);
        return null;
    }

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");
        try {
            setLoading(true);
            await api.post("/auth/reset-password", { resetToken, newPassword });
            setDone(true);
            toast.success("Password reset successfully!");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Reset failed. Please start over.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            <button type="button" onClick={() => navigate(ROUTES.FORGOT_PASSWORD)} style={styles.backBtn}>
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

                {/* Brand */}
                <div style={styles.brand}>
                    <img src={logo} alt="KJS Logo" style={styles.logo} onError={(e) => { e.target.style.display = "none"; }} />
                    <h1 style={styles.schoolName}>Kid's Joyland</h1>
                    <p style={styles.schoolTagline}>Smart English School</p>
                </div>

                {/* Step indicator */}
                <div style={styles.stepRow}>
                    <div style={styles.stepItem}>
                        <div style={{ ...styles.stepCircle, background:"#22c55e", color:"#fff" }}>✓</div>
                        <span style={{ ...styles.stepLabel, color:"#22c55e" }}>Email</span>
                    </div>
                    <div style={{ ...styles.stepLine, background:"#22c55e" }} />
                    <div style={styles.stepItem}>
                        <div style={{ ...styles.stepCircle, background:"#22c55e", color:"#fff" }}>✓</div>
                        <span style={{ ...styles.stepLabel, color:"#22c55e" }}>OTP</span>
                    </div>
                    <div style={{ ...styles.stepLine, background: done ? "#22c55e" : "#2563eb" }} />
                    <div style={styles.stepItem}>
                        <div style={{ ...styles.stepCircle, background: done ? "#22c55e" : "#2563eb", color:"#fff" }}>
                            {done ? "✓" : "3"}
                        </div>
                        <span style={{ ...styles.stepLabel, color: done ? "#22c55e" : "#2563eb" }}>Reset</span>
                    </div>
                </div>

                {/* ── Success state ── */}
                {done ? (
                    <div style={styles.successBox}>
                        <div style={styles.successIcon}>✓</div>
                        <p style={styles.successTitle}>Password Reset!</p>
                        <p style={styles.successSub}>Your password has been updated successfully.</p>
                        <button onClick={() => navigate(ROUTES.LOGIN)} style={{ ...styles.btn, marginTop: 8 }}>
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleReset} style={styles.form}>
                        <p style={styles.hint}>
                            Setting password for <strong>{email}</strong>. Choose something strong.
                        </p>

                        <div style={styles.field}>
                            <label style={styles.label}>New Password</label>
                            <div style={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    style={{ ...styles.input, paddingRight:44, width:"100%", boxSizing:"border-box" }}
                                />
                                <button type="button" onClick={() => setShowPassword(v => !v)} style={styles.eyeBtn} tabIndex={-1}>
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

                        <div style={styles.field}>
                            <label style={styles.label}>Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                style={styles.input}
                            />
                        </div>

                        {/* Password match indicator */}
                        {confirmPassword.length > 0 && (
                            <p style={{ fontSize:12, margin:"-8px 0 0", color: newPassword === confirmPassword ? "#22c55e" : "#ef4444" }}>
                                {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                            </p>
                        )}

                        <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Resetting…" : "Reset Password"}
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
    stepRow: { display:"flex", alignItems:"center", justifyContent:"center", marginBottom:28 },
    stepItem: { display:"flex", flexDirection:"column", alignItems:"center", gap:4 },
    stepCircle: { width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, transition:"background 0.3s" },
    stepLabel: { fontSize:10, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" },
    stepLine: { width:52, height:2, marginBottom:14, transition:"background 0.3s" },
    hint: { fontSize:13, color:"#64748b", margin:"0 0 4px", lineHeight:1.6 },
    form: { display:"flex", flexDirection:"column", gap:18 },
    field: { display:"flex", flexDirection:"column", gap:6 },
    label: { fontSize:13, fontWeight:600, color:"#334155" },
    input: { padding:"12px 14px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:15, outline:"none", fontFamily:"inherit", color:"#0d1f1a", caretColor:"#2563eb", background:"#fff", transition:"border-color 0.2s" },
    passwordWrapper: { position:"relative", display:"flex", alignItems:"center" },
    eyeBtn: { position:"absolute", right:12, background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center" },
    btn: { marginTop:4, padding:"13px", background:"linear-gradient(135deg, #1e3a8a, #2563eb)", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer" },
    successBox: { display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"24px 0 8px" },
    successIcon: { width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:700, boxShadow:"0 8px 24px rgba(34,197,94,0.3)" },
    successTitle: { fontSize:20, fontWeight:700, color:"#0d1f1a", margin:0 },
    successSub: { fontSize:13, color:"#64748b", margin:0, textAlign:"center" },
    footer: { marginTop:28, textAlign:"center", fontSize:12, color:"#9aada9" },
};