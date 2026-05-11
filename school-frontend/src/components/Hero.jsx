import { useState, useEffect, useRef } from "react";
import { RiArrowRightLine, RiCompassDiscoverLine } from "react-icons/ri";
import api from "@/lib/api";

const stats = [
  { number: "500+", label: "Happy Students" },
  { number: "24+",   label: "Years of Excellence" },
  { number: "20+",  label: "Expert Faculty" },
  { number: "5+",   label: "Awards Won" },
];

const DEFAULT_TITLE     = "Nurturing Tomorrow's";
const DEFAULT_HIGHLIGHT = "Global Leaders";
const DEFAULT_SUBTITLE  = "A world-class education that blends academic brilliance with holistic development, shaping confident, compassionate, and curious minds.";

/* ─── Lens Component ─────────────────────────────────────────────────── */
function DistortText({ text, color }) {
  const wrapRef             = useRef(null);
  const [pos, setPos]       = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const uid    = useRef("l" + Math.random().toString(36).substr(2, 6)).current;
  const LENS_R = 60;

  const onMove = (e) => {
    const r = wrapRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <span
      ref={wrapRef}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={onMove}
      style={{ position: "relative", display: "inline-block", cursor: "none" }}
    >
      {color === "gold" ? (
        <span style={{
          background: "linear-gradient(90deg, #FFD700, #FFA500)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          {text}
        </span>
      ) : (
        <span style={{ color: "#ffffff" }}>{text}</span>
      )}

      {active && (
        <svg style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
          pointerEvents: "none", overflow: "visible",
        }}>
          <defs>
            <filter id={`${uid}-f`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={
                color === "gold"
                  ? "0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 1 0"
                  : "0 0 0 0 1   0 0 0 0 0.84   0 0 0 0 0   0 0 0 1 0"
              } />
            </filter>
            <clipPath id={`${uid}-clip`}>
              <circle cx={pos.x} cy={pos.y} r={LENS_R} />
            </clipPath>
          </defs>
          <foreignObject x="0" y="0" width="100%" height="100%"
            clipPath={`url(#${uid}-clip)`} filter={`url(#${uid}-f)`}
            style={{ overflow: "visible" }}
          >
            <div xmlns="http://www.w3.org/1999/xhtml" style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center",
              justifyContent: "flex-start", pointerEvents: "none",
            }}>
              <span style={{
                fontSize: "inherit", fontFamily: "inherit",
                fontWeight: "inherit", lineHeight: "inherit",
                letterSpacing: "inherit", whiteSpace: "nowrap",
                background: color === "gold" ? "linear-gradient(90deg,#FFD700,#FFA500)" : "none",
                WebkitBackgroundClip: color === "gold" ? "text" : "unset",
                WebkitTextFillColor: color === "gold" ? "transparent" : "#ffffff",
                backgroundClip: color === "gold" ? "text" : "unset",
                color: color === "gold" ? "#FFD700" : "#ffffff",
              }}>
                {text}
              </span>
            </div>
          </foreignObject>
          <circle cx={pos.x} cy={pos.y} r={LENS_R}
            fill={color === "gold" ? "rgba(255,255,255,0.08)" : "rgba(255,215,0,0.08)"}
            stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"
          />
          <ellipse
            cx={pos.x - LENS_R * 0.25} cy={pos.y - LENS_R * 0.3}
            rx={LENS_R * 0.28} ry={LENS_R * 0.12}
            fill="rgba(255,255,255,0.32)"
            transform={`rotate(-35, ${pos.x - LENS_R * 0.25}, ${pos.y - LENS_R * 0.3})`}
          />
        </svg>
      )}
    </span>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────── */
export default function Hero() {
  const [banners, setBanners]     = useState([]);
  const [current, setCurrent]     = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get("/banners")
      .then(({ data }) => {
        const active = (data.banners || []).sort((a, b) => a.order - b.order);
        setBanners(active);
      })
      .catch(err => console.error("BANNER ERROR:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent(c => (c + 1) % banners.length);
        setAnimating(false);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const goTo = (i) => {
    if (i === current) return;
    setAnimating(true);
    setTimeout(() => { setCurrent(i); setAnimating(false); }, 400);
  };

  if (loading) {
    return (
      <section id="home">
        <div style={{
          minHeight: "92vh",
          background: "linear-gradient(135deg, #0d47a1 0%, #1a237e 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.2)",
            borderTopColor: "#FFD700",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section id="home">
        <div style={{
          minHeight: "92vh",
          background: "linear-gradient(135deg, #0d47a1 0%, #1a237e 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", textAlign: "center", padding: "40px",
        }}>
          <div>
            <h1 style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              fontFamily: "'Georgia', serif", fontWeight: 700, marginBottom: 16,
            }}>
              Welcome to Our School
            </h1>
            <p style={{ fontSize: 18, opacity: 0.8 }}>Nurturing tomorrow's global leaders.</p>
          </div>
        </div>
      </section>
    );
  }

  const banner        = banners[current];
  const titleText     = banner.title?.trim()     || DEFAULT_TITLE;
  const highlightText = banner.highlight?.trim() || DEFAULT_HIGHLIGHT;

  return (
    <section id="home" style={{ position: "relative" }}>

      <div style={{
        minHeight: "92vh", position: "relative",
        overflow: "hidden", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>

        {/* Background images */}
        {banners.map((b, i) => (
          <div key={b._id} style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${b.imageUrl})`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.8s ease",
            zIndex: 0,
          }} />
        ))}

        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 100%)",
          zIndex: 1,
        }} />

        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 2,
          maxWidth: 1100, margin: "0 auto", padding: "60px 24px",
          textAlign: "center", color: "#fff",
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(20px)" : "translateY(0)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>

          {/* Label badge */}
          <div style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 30, padding: "8px 20px",
            fontSize: 13, fontWeight: 600,
            letterSpacing: "1.5px", textTransform: "uppercase",
            marginBottom: 28,
          }}>
            {banner.label}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(32px, 6vw, 72px)",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontWeight: 700, lineHeight: 1.15, marginBottom: 16,
            textShadow: "0 2px 20px rgba(0,0,0,0.2)",
          }}>
            <DistortText text={titleText} color="white" />
            <br />
            <DistortText text={highlightText} color="gold" />
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "clamp(14px, 2vw, 19px)",
            maxWidth: 680, margin: "0 auto 40px",
            lineHeight: 1.75, opacity: 0.9,
          }}>
            {DEFAULT_SUBTITLE}
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: "flex", gap: 14, justifyContent: "center",
            flexWrap: "wrap", marginTop: 40,
          }}>
            <a href="#about" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#fff", color: "#1a237e",
              padding: "14px 32px", borderRadius: 50,
              fontWeight: 700, fontSize: 14, textDecoration: "none",
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
              transition: "transform 0.2s",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <RiCompassDiscoverLine style={{ fontSize: "17px" }} />
              Discover More
            </a>
            <a href="#contact" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "transparent", color: "#fff",
              padding: "14px 32px", borderRadius: 50,
              fontWeight: 700, fontSize: 14, textDecoration: "none",
              border: "2px solid rgba(255,255,255,0.6)",
              transition: "background 0.2s, transform 0.2s",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              Apply Now
              <RiArrowRightLine style={{ fontSize: "17px" }} />
            </a>
          </div>

          {/* Slide indicators */}
          {banners.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 48 }}>
              {banners.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} style={{
                  width: i === current ? 32 : 10, height: 10,
                  borderRadius: 5,
                  background: i === current ? "#FFD700" : "rgba(255,255,255,0.4)",
                  border: "none", cursor: "pointer",
                  transition: "all 0.3s ease", padding: 0,
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: "#fff",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }} className="stats-bar">
        {stats.map((stat, i) => (
          <div key={i} style={{
            padding: "32px 16px", textAlign: "center",
            borderRight: i < stats.length - 1 ? "1px solid #e8eaf6" : "none",
          }}>
            <div style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 900, fontFamily: "'Georgia', serif",
              color: "#1a237e", lineHeight: 1,
            }}>
              {stat.number}
            </div>
            <div style={{ fontSize: 13, color: "#666", fontWeight: 600, marginTop: 8, letterSpacing: "0.5px" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .stats-bar { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-bar > div { border-right: none !important; border-bottom: 1px solid #e8eaf6; }
        }
      `}</style>
    </section>
  );
}