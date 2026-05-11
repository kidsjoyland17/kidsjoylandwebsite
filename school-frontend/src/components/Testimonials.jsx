import { useState, useEffect } from "react";
import {
  MdPerson,
  MdSchool,
  MdChevronLeft,
  MdChevronRight,
  MdStar,
  MdWork,
  MdFamilyRestroom,
  MdFormatQuote,
} from "react-icons/md";
import api from "@/lib/api";

// Cycle icons by index since DB has no avatar field
const AVATAR_ICONS = [MdFamilyRestroom, MdPerson, MdSchool, MdWork, MdFamilyRestroom];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [current, setCurrent]           = useState(0);

  useEffect(() => {
    api.get('/testimonials')
      .then(({ data }) => {
        if (data.testimonials?.length) setTestimonials(data.testimonials);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setCurrent(0); }, [testimonials]);

  const count        = testimonials.length;
  const visibleCount = Math.min(3, count);
  const visible      = Array.from({ length: visibleCount }, (_, i) =>
    testimonials[(current + i) % count]
  );

  const prev = () => setCurrent(c => (c - 1 + count) % count);
  const next = () => setCurrent(c => (c + 1) % count);

  if (loading) {
    return (
      <section id="testimonials" style={{
        padding: "clamp(60px, 8vw, 100px) clamp(16px, 5vw, 40px)",
        background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
        minHeight: "360px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.2)",
          borderTopColor: "#FFD700",
          animation: "tspin 0.8s linear infinite",
        }} />
        <style>{`@keyframes tspin { to { transform: rotate(360deg); } }`}</style>
      </section>
    );
  }

  if (!count) return null;

  return (
    <section id="testimonials" style={{
      padding: "clamp(60px, 8vw, 100px) clamp(16px, 5vw, 40px)",
      background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative */}
      <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(36px, 5vw, 60px)" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            color: "#FFD700",
            borderRadius: "30px",
            padding: "8px 20px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}>Testimonials</div>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 44px)",
            fontFamily: "'Georgia', serif",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "14px",
          }}>What Our Community Says</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "clamp(14px, 2vw, 16px)", maxWidth: "500px", margin: "0 auto" }}>
            Hear from parents, students, and alumni about their experience at Orchids International School.
          </p>
        </div>

        {/* Cards */}
        <div className="testi-grid" style={{
          display: "grid",
          gridTemplateColumns: `repeat(${visibleCount}, 1fr)`,
          gap: "clamp(12px, 2vw, 24px)",
          marginBottom: "clamp(28px, 4vw, 48px)",
        }}>
          {visible.map((t, i) => {
            const globalIdx  = testimonials.findIndex(x => x._id === t._id);
            const AvatarIcon = AVATAR_ICONS[globalIdx % AVATAR_ICONS.length];
            const isCenter   = visibleCount === 3 && i === 1;
            return (
              <div key={`${t._id}-${i}`} style={{
                background: isCenter ? "#fff" : "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "clamp(20px, 3vw, 36px) clamp(16px, 2.5vw, 28px)",
                border: isCenter ? "none" : "1px solid rgba(255,255,255,0.2)",
                boxShadow: isCenter ? "0 20px 60px rgba(0,0,0,0.25)" : "none",
                transform: isCenter ? "translateY(-12px)" : "translateY(0)",
                transition: "transform 0.3s",
                position: "relative",
              }}>
                {/* Quote decoration */}
                <MdFormatQuote size={32} style={{
                  color: isCenter ? "#e8eaf6" : "rgba(255,255,255,0.12)",
                  position: "absolute", top: "16px", right: "16px",
                  transform: "scaleX(-1)",
                }} />

                {/* Stars */}
                <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <MdStar key={si} size={18} style={{ color: "#FFD700" }} />
                  ))}
                </div>

                <p style={{
                  fontSize: "clamp(13px, 1.5vw, 15px)",
                  lineHeight: 1.75,
                  color: isCenter ? "#333" : "rgba(255,255,255,0.9)",
                  marginBottom: "24px",
                  fontStyle: "italic",
                }}>"{t.text}"</p>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "50px", height: "50px", flexShrink: 0,
                    borderRadius: "50%",
                    background: isCenter ? "#e8eaf6" : "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isCenter ? "#1a237e" : "rgba(255,255,255,0.9)",
                  }}>
                    <AvatarIcon size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "clamp(13px, 1.5vw, 15px)", color: isCenter ? "#1a237e" : "#fff" }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: "12px", color: isCenter ? "#e53935" : "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                      {t.role}
                    </div>
                    <div style={{ fontSize: "11px", color: isCenter ? "#999" : "rgba(255,255,255,0.5)" }}>
                      {t.school}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        {count > visibleCount && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px" }}>
            <button onClick={prev} style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff", cursor: "pointer", transition: "background 0.2s",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            ><MdChevronLeft size={24} /></button>

            <div style={{ display: "flex", gap: "8px" }}>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} style={{
                  width: i === current ? "28px" : "10px", height: "10px",
                  borderRadius: "5px",
                  background: i === current ? "#FFD700" : "rgba(255,255,255,0.3)",
                  border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0,
                }} />
              ))}
            </div>

            <button onClick={next} style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff", cursor: "pointer", transition: "background 0.2s",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            ><MdChevronRight size={24} /></button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .testi-grid { grid-template-columns: 1fr !important; }
          .testi-grid > div { transform: none !important; }
        }
        @media (max-width: 480px) {
          .testi-grid { gap: 12px !important; }
        }
      `}</style>
    </section>
  );
}