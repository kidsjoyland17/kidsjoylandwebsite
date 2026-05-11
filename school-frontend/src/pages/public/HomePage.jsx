import { useState } from "react";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import About from "../../components/About";
import Gallery from "../../components/Gallery";
import Testimonials from "../../components/Testimonials";
import Contact from "../../components/Contact";
import Admission from "../../components/Admission";
import Footer from "../../components/Footer";
import NoticeTicker from "../../components/NoticeTicker";  // ← new

export default function HomePage() {
  const [openAdmission, setOpenAdmission] = useState(false);

  return (
    <div className="bg-[#0A1628] text-white">
      <Navbar onOpenAdmission={() => setOpenAdmission(true)} />

      {/* Notice ticker — fetches public notices, no login needed */}
      <NoticeTicker />

      <Hero />
      <About />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />

      {openAdmission && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenAdmission(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenAdmission(false)}
              className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full"
            >
              ✕
            </button>
            <Admission onClose={() => setOpenAdmission(false)} />
          </div>
        </div>
      )}
    </div>
  );
}