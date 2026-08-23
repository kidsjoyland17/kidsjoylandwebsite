import { RiCheckLine } from "react-icons/ri";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { optimizeImage } from "@/lib/cloudinary";

const highlights = [
  "Value-Based Education",
  "Experienced Faculty",
  "Inclusive Environment",
  "Parent Partnership",
];

export default function About() {
  const [features, setFeatures] = useState([]);
  const [aboutImgError, setAboutImgError] = useState(false);

  useEffect(() => {
    api.get('/about/features')
      .then(({ data }) => setFeatures(data.features))
      .catch(() => {});
  }, []);

  return (
    <section id="about" style={{
      padding: "clamp(48px, 8vw, 80px) clamp(16px, 5vw, 24px)",
      background: "#f8f9ff",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── Top Grid ─────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "56px",
          alignItems: "center",
          marginBottom: "clamp(40px, 6vw, 72px)",
        }} className="about-grid">

          {/* Left: Image */}
          <div style={{ position: "relative", height: "520px" }} className="about-images">
            <div style={{
              position: "absolute", top: 60, left: 0,
              width: "78%", height: "420px",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(26,35,126,0.25)",
            }}>
              {aboutImgError ? (
                <div style={{
                  width: "100%", height: "100%",
                  background: "linear-gradient(135deg, #1a237e, #3949ab)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.7)", fontFamily: "'Georgia', serif", fontSize: 14,
                }}>
                  School Photo
                </div>
              ) : (
                <img
                  src={optimizeImage(
                    "https://res.cloudinary.com/dnubtrt0q/image/upload/v1777394005/20241129_112922_na3eyd.heic",
                    { width: 900 }
                  )}
                  alt="School campus"
                  width={900}
                  height={420}
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setAboutImgError(true)}
                />
              )}
            </div>
          </div>

          {/* Right: Text */}
          <div>
            <div style={{
              display: "inline-block",
              background: "#e8eaf6",
              color: "#1a237e",
              borderRadius: "30px",
              padding: "8px 20px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "18px",
            }}>About Our School</div>

            <h2 style={{
              fontSize: "clamp(24px, 4vw, 44px)",
              fontFamily: "'Georgia', serif",
              fontWeight: 700,
              color: "#1a237e",
              lineHeight: 1.2,
              marginBottom: "18px",
            }}>
              Building Bright Futures<br />
              <span style={{ color: "#e53935" }}>Since 2002</span>
            </h2>

            <p style={{ fontSize: "clamp(14px, 1.5vw, 15px)", color: "#555", lineHeight: 1.8, marginBottom: "14px" }}>
              Orchids International School is a premier educational institution committed to delivering
              a balanced curriculum that fosters intellectual curiosity, emotional intelligence, and
              social responsibility.
            </p>
            <p style={{ fontSize: "clamp(14px, 1.5vw, 15px)", color: "#555", lineHeight: 1.8, marginBottom: "28px" }}>
              Our unique pedagogy — "The Orchids Way" — combines traditional academic rigour with
              modern pedagogical practices to create a learning experience that is engaging, inclusive,
              and future-ready.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "28px",
            }} className="highlights-grid">
              {highlights.map(item => (
                <div key={item} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "clamp(12px, 1.3vw, 13.5px)",
                  fontWeight: 600,
                  color: "#333",
                }}>
                  <span style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #1a237e, #3949ab)",
                    color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <RiCheckLine style={{ fontSize: "13px" }} />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <a href="#contact" style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #1a237e, #3949ab)",
              color: "#fff",
              padding: "13px 30px",
              borderRadius: "50px",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
              boxShadow: "0 6px 24px rgba(26,35,126,0.3)",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Learn More About Us
            </a>
          </div>
        </div>

        {/* ── Features Grid ─────────────────────────────── */}
        {features.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }} className="features-grid">
            {features.map((f, i) => (
              <div key={f._id ?? i} className="flip-card">
                <div className="flip-card-inner">

                  {/* FRONT */}
                  <div className="flip-card-front" style={{
                    backgroundImage: `url(${optimizeImage(f.imageUrl, { width: 500, height: 400 })})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "16px",
                  }}>
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.1) 100%)",
                      borderRadius: "16px",
                    }} />
                    <div style={{
                      position: "absolute", bottom: "20px",
                      left: 0, right: 0, textAlign: "center", zIndex: 2,
                    }}>
                      <h3 style={{
                        fontFamily: "'Georgia', serif",
                        fontWeight: 700, color: "#fff", fontSize: "17px",
                        margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                      }}>{f.title}</h3>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="flip-card-back" style={{ borderRadius: "16px" }}>
                    <h3 style={{
                      fontFamily: "'Georgia', serif",
                      fontWeight: 700, color: "#1a237e",
                      fontSize: "17px", marginBottom: "12px",
                    }}>{f.title}</h3>
                    <p style={{ color: "#444", fontSize: "13.5px", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .flip-card {
          height: 210px;
          perspective: 1000px;
          cursor: pointer;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 1.1s cubic-bezier(0.4, 0.2, 0.2, 1);
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
        }
        .flip-card-front { z-index: 2; }
        .flip-card-back {
          background: #ffffff;
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 20px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          border: 1px solid #e8eaf6;
        }

        @media (max-width: 900px) {
          .about-grid        { grid-template-columns: 1fr !important; gap: 32px !important; }
          .about-images      { display: none !important; }
          .features-grid     { grid-template-columns: repeat(2, 1fr) !important; }
          .highlights-grid   { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .features-grid     { grid-template-columns: 1fr !important; }
          .flip-card         { height: 180px; }
        }
        @media (max-width: 400px) {
          .flip-card         { height: 160px; }
        }
      `}</style>
    </section>
  );
}