import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiPhoneLine,
  RiMailLine,
  RiTimeLine,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import logo from "../assets/logo.png";

const links = ["Home", "About", "Gallery", "Testimonials", "Contact"];

export default function Navbar({ onOpenAdmission }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNavClick = (e, link) => {
    e.preventDefault();
    const el = document.getElementById(link.toLowerCase());
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Top Info Bar */}
      <div
        className="top-bar"
        style={{
          background: "linear-gradient(90deg, #0d1b5e 0%, #1a237e 60%, #0d47a1 100%)",
          color: "#fff",
          fontSize: "12px",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          padding: "7px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
          <a
            href="tel:+917903495153"
            style={{ display: "flex", alignItems: "center", gap: "5px", color: "#fff", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FFD700")}
            onMouseLeave={e => (e.currentTarget.style.color = "#fff")}
          >
            <RiPhoneLine style={{ fontSize: "13px" }} />
            +91 79034 95153
          </a>
          <span style={{ opacity: 0.35 }}>|</span>
          <a
            href="tel:+918797288121"
            style={{ display: "flex", alignItems: "center", gap: "5px", color: "#fff", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FFD700")}
            onMouseLeave={e => (e.currentTarget.style.color = "#fff")}
          >
            <RiPhoneLine style={{ fontSize: "13px" }} />
            +91 87972 88121
          </a>
          <span style={{ opacity: 0.35 }} className="hide-sm">|</span>
          <a
            href="mailto:kidsjoyland17@gmail.com"
            className="hide-sm"
            style={{ display: "flex", alignItems: "center", gap: "5px", color: "#fff", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FFD700")}
            onMouseLeave={e => (e.currentTarget.style.color = "#fff")}
          >
            <RiMailLine style={{ fontSize: "13px" }} />
            kidsjoyland17@gmail.com
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "rgba(255,255,255,0.85)" }}>
          <RiTimeLine style={{ fontSize: "13px", color: "#FFD700" }} />
          Mon - Sat: 8:00 AM - 7:00 PM
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          background: "#fff",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.13)" : "0 2px 8px rgba(0,0,0,0.07)",
          transition: "box-shadow 0.3s",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0 4px 14px rgba(26,35,126,0.3)",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "'Georgia', serif",
                fontWeight: 700,
                fontSize: "20px",
                color: "#131313",
                lineHeight: 1.25,
              }}
            >
              {"Kid's Joyland"}
            </div>
            <div
              style={{
                color: "#FF0000",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Smart English School
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <ul
          className="nav-links"
          style={{ display: "flex", gap: "2px", listStyle: "none", margin: 0, padding: 0 }}
        >
          {links.map(link => (
            <li key={link}>
              <a
                href={"#" + link.toLowerCase()}
                onClick={e => handleNavClick(e, link)}
                style={{
                  display: "block",
                  color: "#1a237e",
                  fontWeight: 600,
                  fontSize: "13.5px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "background 0.18s, color 0.18s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#1a237e";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#1a237e";
                }}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop Buttons */}
        <div className="nav-buttons" style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
          <button
            onClick={onOpenAdmission}
            style={{
              background: "linear-gradient(135deg, #e53935, #c62828)",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "30px",
              fontWeight: 700,
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Admissions Open
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "linear-gradient(135deg, #1a237e, #0d47a1)",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "30px",
              fontWeight: 700,
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Login
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="hamburger"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#1a237e",
            fontSize: "26px",
            padding: "4px",
            lineHeight: 1,
          }}
        >
          <RiMenuLine />
        </button>
      </nav>

      {/* Mobile Full-Screen Menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#ffffff",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 24px 40px",
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            overflowY: "auto",
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(26,35,126,0.08)",
              border: "1px solid rgba(26,35,126,0.2)",
              color: "#1a237e",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RiCloseLine />
          </button>

          {/* Brand */}
          <div style={{ textAlign: "center", marginTop: "12px", marginBottom: "32px" }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid rgba(26,35,126,0.2)",
                display: "block",
                margin: "0 auto 12px",
              }}
            />
            <div
              style={{
                color: "#131313",
                fontFamily: "'Georgia', serif",
                fontWeight: 700,
                fontSize: "24px",
                letterSpacing: "0.5px",
                lineHeight: 1.2,
              }}
            >
              {"Kid's Joyland"}
            </div>
            <div
              style={{
                color: "#FF0000",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginTop: "4px",
              }}
            >
              Smart English School
            </div>
          </div>

          {/* Nav Links */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "4px" }}>
            {links.map(link => (
              <a
                key={link}
                href={"#" + link.toLowerCase()}
                onClick={e => {
                  setMenuOpen(false);
                  handleNavClick(e, link);
                }}
                style={{
                  color: "#1a237e",
                  fontSize: "18px",
                  fontWeight: 700,
                  textDecoration: "none",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  width: "100%",
                  textAlign: "center",
                  transition: "background 0.2s, color 0.2s",
                  boxSizing: "border-box",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#1a237e";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#1a237e";
                }}
              >
                {link}
              </a>
            ))}
          </div>

          <div style={{ height: "20px" }} />

          {/* Admission Button */}
          <button
            onClick={() => {
              setMenuOpen(false);
              onOpenAdmission();
            }}
            style={{
              background: "linear-gradient(135deg, #e53935, #c62828)",
              color: "#fff",
              padding: "14px 36px",
              borderRadius: "30px",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Admissions Open
          </button>

          <div style={{ height: "10px" }} />

          {/* Login Button */}
          <button
            onClick={() => {
              setMenuOpen(false);
              navigate("/login");
            }}
            style={{
              background: "transparent",
              color: "#1a237e",
              padding: "14px 36px",
              borderRadius: "30px",
              fontWeight: 700,
              fontSize: "15px",
              border: "2px solid #1a237e",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Login
          </button>

          {/* Spacer */}
          <div style={{ flex: 1, minHeight: "24px" }} />

          {/* Phone Numbers Row at Bottom */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
              paddingTop: "20px",
              borderTop: "1px solid rgba(26,35,126,0.1)",
              width: "100%",
            }}
          >
            <a
              href="tel:+917903495153"
              style={{
                color: "#1a237e",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RiPhoneLine /> +91 79034 95153
            </a>
            <a
              href="tel:+918797288121"
              style={{
                color: "#1a237e",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RiPhoneLine /> +91 87972 88121
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .nav-links   { display: none !important; }
          .nav-buttons { display: none !important; }
          .hamburger   { display: flex !important; }
        }
        @media (max-width: 600px) {
          .top-bar { justify-content: center !important; }
          .hide-sm { display: none !important; }
        }
      `}</style>
    </>
  );
}