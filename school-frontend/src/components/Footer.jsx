import {
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiTimeLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import logo from "../assets/logo.png";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: "linear-gradient(135deg, #0d1b5e 0%, #1a237e 50%, #1565c0 100%)",
      color: "#fff",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* Top accent bar */}
      <div style={{ height: "4px", background: "linear-gradient(90deg, #FFD700, #FFA500, #FFD700)" }} />

      {/* Main content */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "56px 24px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "40px",
      }} className="footer-grid">

        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <img
              src={logo}
              alt="Kid's Joyland Smart English School logo"
              width={52}
              height={52}
              loading="lazy"
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(255,215,0,0.5)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                flexShrink: 0,
              }}
            />
            <div>
              <h2 style={{
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: 1.25,
                color: "#fff",
                fontFamily: "'Georgia', serif",
                margin: 0,
              }}>
                Kid's Joyland
              </h2>
              <p style={{
                color: "#dc2626",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: "3px 0 0",
              }}>
                Smart English School
              </p>
            </div>
          </div>

          <p style={{
            fontSize: "13.5px",
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.75,
            marginBottom: "20px",
          }}>
            A nurturing English-medium school focused on joyful learning,
            creativity, and holistic early childhood development.
          </p>

          {/* Office Hours */}
          <div style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "10px",
            padding: "12px 14px",
            marginBottom: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <RiTimeLine style={{ color: "#FFD700", fontSize: "14px", flexShrink: 0 }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#FFD700" }}>
                Office Hours
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5 }}>
              Mon – Sat: 8:00 AM – 7:00 PM
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#FFD700",
            marginBottom: "20px",
            paddingBottom: "10px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}>
            Quick Links
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "Home", href: "#home" },
              { label: "About", href: "#about" },
              { label: "Programs", href: "#programs" },
              { label: "Admissions", href: "#admissions" },
              { label: "Gallery", href: "#gallery" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13.5px",
                    color: "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#FFD700"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.72)"}
                >
                  <RiArrowRightSLine style={{ fontSize: "16px", flexShrink: 0 }} />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Programs */}
        <div>
          <h3 style={{
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#FFD700",
            marginBottom: "20px",
            paddingBottom: "10px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}>
            Programs
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              "Play Group",
              "Nursery",
              "LKG",
              "UKG",
              "Day Care",
              "Activity Classes",
            ].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13.5px",
                    color: "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#FFD700"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.72)"}
                >
                  <RiArrowRightSLine style={{ fontSize: "16px", flexShrink: 0 }} />
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#FFD700",
            marginBottom: "20px",
            paddingBottom: "10px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}>
            Contact Us
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <RiMapPinLine style={{ fontSize: "16px", color: "#FFD700", marginTop: "2px", flexShrink: 0 }} />
              <span style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.75)", lineHeight: 1.55 }}>
                Lal Building, Ghamaria,<br />Jamshedpur, Jharkhand
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a
                href="tel:+917903495153"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13.5px",
                  color: "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#FFD700"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
              >
                <RiPhoneLine style={{ fontSize: "16px", color: "#FFD700", flexShrink: 0 }} />
                +91 79034 95153
              </a>
              <a
                href="tel:+918797288121"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13.5px",
                  color: "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#FFD700"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
              >
                <RiPhoneLine style={{ fontSize: "16px", color: "#FFD700", flexShrink: 0 }} />
                +91 87972 88121
              </a>
            </div>

            <a
              href="mailto:kidsjoyland17@gmail.com"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13.5px",
                color: "rgba(255,255,255,0.75)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#FFD700"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
            >
              <RiMailLine style={{ fontSize: "16px", color: "#FFD700", flexShrink: 0 }} />
              kidsjoyland17@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.12)",
        textAlign: "center",
        padding: "18px 24px",
        fontSize: "12.5px",
        color: "rgba(255,255,255,0.5)",
      }}>
        © {year} Kid's Joyland Smart English School. All rights reserved.
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 540px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
      `}</style>
    </footer>
  );
}