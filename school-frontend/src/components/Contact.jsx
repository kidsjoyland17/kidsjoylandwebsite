import { useRef, useState } from "react";
import {
  RiMapPin2Line,
  RiMailLine,
  RiPhoneLine,
  RiTimeLine,
  RiGlobalLine,
  RiSendPlaneLine,
} from "react-icons/ri";
import api from "@/lib/api";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const nameRef    = useRef();
  const emailRef   = useRef();
  const phoneRef   = useRef();
  const gradeRef   = useRef();
  const messageRef = useRef();

  const clearForm = () => {
    nameRef.current.value    = "";
    emailRef.current.value   = "";
    phoneRef.current.value   = "";
    gradeRef.current.value   = "";
    messageRef.current.value = "";
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const grade = gradeRef.current.value;
    try {
      await api.post("/messages", {
        name:    nameRef.current.value,
        email:   emailRef.current.value,
        phone:   phoneRef.current.value,
        grade,
        message: messageRef.current.value,
        subject: grade ? `Admission enquiry – ${grade}` : "General enquiry",
      });
      clearForm();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: "10px",
    border: "1.5px solid #e0e0e0", fontSize: "14px", outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box",
    fontFamily: "inherit", background: "#fff", color: "#333",
  };

  const labelStyle = {
    display: "block", fontSize: "12.5px", fontWeight: 700,
    color: "#333", marginBottom: "7px",
  };

  const infoCards = [
    { icon: RiMailLine,   label: "Email Us",     value: "kidsjoyland17@gmail.com" },
    { icon: RiTimeLine,   label: "Office Hours",  value: "Mon – Sat: 8:00 AM – 7:00 PM" },
    { icon: RiGlobalLine, label: "Website",       value: "www.kidsjoyland.com" },
    { icon: RiPhoneLine,  label: "Helpline",      value: "+91 79034 95153" },
  ];

  return (
    <section id="contact" style={{
      padding: "80px 24px",
      background: "#f8f9ff",
      color: "#333",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{
            display: "inline-block", background: "#e8eaf6", color: "#1a237e",
            borderRadius: "30px", padding: "8px 20px", fontSize: "11px",
            fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase",
            marginBottom: "14px",
          }}>Contact Us</div>
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 44px)",
            fontFamily: "'Georgia', serif",
            fontWeight: 700, color: "#1a237e", marginBottom: "12px",
          }}>Get in Touch With Us</h2>
          <p style={{ color: "#666", fontSize: "15px", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
            Interested in admissions or have questions? We'd love to hear from you.
            Reach out and our team will respond within 24 hours.
          </p>
        </div>

        {/* Main Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "40px",
          alignItems: "start",
        }} className="contact-grid">

          {/* Left */}
          <div>
            <h3 style={{
              fontFamily: "'Georgia', serif", color: "#1a237e",
              fontSize: "20px", marginBottom: "14px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <RiMapPin2Line style={{ color: "#e53935" }} />
              Find Us on Map
            </h3>
            <div style={{
              borderRadius: "16px", overflow: "hidden",
              border: "2px solid #e8eaf6",
              boxShadow: "0 4px 20px rgba(26,35,126,0.1)",
              marginBottom: "24px",
            }}>
              <iframe
                title="School Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3677.636526489018!2d86.1011832!3d22.815928300000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5e58694b52c27%3A0x15c00c6679da129a!2sKID'S%20JOYLAND%20Smart%20Play%20School!5e0!3m2!1sen!2sin!4v1775362998389!5m2!1sen!2sin"
                width="100%"
                height="280"
                style={{ border: 0, display: "block" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Info Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {infoCards.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{
                    background: "#fff", borderRadius: "12px", padding: "16px",
                    border: "1px solid #e8eaf6", textAlign: "center",
                  }}>
                    <div style={{
                      width: "36px", height: "36px",
                      borderRadius: "50%",
                      background: "#e8eaf6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 8px",
                      color: "#1a237e",
                      fontSize: "18px",
                    }}>
                      <Icon />
                    </div>
                    <div style={{
                      fontSize: "10px", fontWeight: 700, color: "#1a237e",
                      letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px",
                    }}>{item.label}</div>
                    <div style={{ fontSize: "11.5px", color: "#555", lineHeight: 1.4 }}>{item.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Form */}
          <div style={{
            background: "#fff", borderRadius: "24px", padding: "36px 32px",
            boxShadow: "0 8px 40px rgba(26,35,126,0.1)", border: "1px solid #e8eaf6",
          }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "#e8eaf6", border: "2px solid #1a237e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "#1a237e", fontSize: "28px",
                }}>
                  <RiSendPlaneLine />
                </div>
                <h3 style={{ fontFamily: "'Georgia', serif", color: "#1a237e", fontSize: "22px", marginBottom: "8px" }}>
                  Thank You!
                </h3>
                <p style={{ color: "#666", fontSize: "14px" }}>
                  We've received your inquiry and will get back to you shortly.
                </p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Georgia', serif", color: "#1a237e", fontSize: "22px", marginBottom: "24px" }}>
                  Enquire Now
                </h3>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "18px" }}>
                    <label style={labelStyle}>Full Name *</label>
                    <input ref={nameRef} type="text" placeholder="Your full name" required style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#1a237e"}
                      onBlur={e  => e.target.style.borderColor = "#e0e0e0"} />
                  </div>
                  <div style={{ marginBottom: "18px" }}>
                    <label style={labelStyle}>Email Address *</label>
                    <input ref={emailRef} type="email" placeholder="your@email.com" required style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#1a237e"}
                      onBlur={e  => e.target.style.borderColor = "#e0e0e0"} />
                  </div>
                  <div style={{ marginBottom: "18px" }}>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                      ref={phoneRef}
                      type="tel"
                      placeholder="98765 43210"
                      maxLength={10}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#1a237e"}
                      onBlur={e  => e.target.style.borderColor = "#e0e0e0"}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        e.target.value = digits;
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "18px" }}>
                    <label style={labelStyle}>Admission For Grade</label>
                    <select ref={gradeRef} defaultValue="" style={{ ...inputStyle, cursor: "pointer" }}
                      onFocus={e => e.target.style.borderColor = "#1a237e"}
                      onBlur={e  => e.target.style.borderColor = "#e0e0e0"}
                    >
                      <option value="">Select Grade</option>
                      {["Nursery / KG", "Grade 1–3", "Grade 4–6", "Grade 7–9", "Grade 10"].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: "24px" }}>
                    <label style={labelStyle}>Message</label>
                    <textarea ref={messageRef} placeholder="Any specific questions or requirements..." rows={4}
                      style={{ ...inputStyle, resize: "vertical" }}
                      onFocus={e => e.target.style.borderColor = "#1a237e"}
                      onBlur={e  => e.target.style.borderColor = "#e0e0e0"} />
                  </div>
                  <button type="submit" disabled={loading} style={{
                    width: "100%", padding: "14px",
                    background: loading ? "#9fa8da" : "linear-gradient(135deg, #1a237e, #3949ab)",
                    color: "#fff", border: "none", borderRadius: "12px",
                    fontWeight: 700, fontSize: "15px",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 6px 24px rgba(26,35,126,0.3)",
                    transition: "transform 0.2s, opacity 0.2s",
                    fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.02)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    {loading ? "Sending..." : (
                      <>
                        Submit Enquiry
                        <RiSendPlaneLine style={{ fontSize: "16px" }} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        #contact input::placeholder,
        #contact textarea::placeholder { color: #aaa; }
        #contact input,
        #contact textarea,
        #contact select { color: #333 !important; }
      `}</style>
    </section>
  );
}