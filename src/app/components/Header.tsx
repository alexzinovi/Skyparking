import { useLanguage } from "@/app/components/LanguageContext";
import { Button } from "@/app/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMenuOpen(false); // Close menu after clicking
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-28">
            {/* Hamburger Menu Button - Left */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col gap-1.5 w-8 h-8 justify-center items-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#ffd700] rounded-lg p-1"
              aria-label="Toggle menu"
            >
              <span className="w-6 h-0.5 bg-[#ffd700] rounded-full"></span>
              <span className="w-6 h-0.5 bg-[#ffd700] rounded-full"></span>
              <span className="w-6 h-0.5 bg-[#ffd700] rounded-full"></span>
            </button>

            {/* Logo - Center */}
            <button
              onClick={handleLogoClick}
              className="absolute left-1/2 transform -translate-x-1/2 flex items-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffd700] rounded-lg z-10 px-4 py-2"
              aria-label="Return to homepage"
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://raw.githubusercontent.com/alexzinovi/Skyparking/main/public/logo-header.png?v=2"
                  alt="SkyParking Logo"
                  className="h-20 w-auto"
                  onError={(e) => {
                    // Hide broken image and show text fallback
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-[#ffd700] text-3xl font-bold">SkyParking</span>
              </div>
            </button>

            {/* Right Side - Language & Call Button */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <Button
                  variant={language === "bg" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("bg")}
                  className={language === "bg" ? "bg-[#ffd700] text-[#1a1a2e] hover:bg-[#ffed4e] border-[#ffd700] text-xs px-2" : "bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white text-xs px-2"}
                >
                  БГ
                </Button>
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className={language === "en" ? "bg-[#ffd700] text-[#1a1a2e] hover:bg-[#ffed4e] border-[#ffd700] text-xs px-2" : "bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white text-xs px-2"}
                >
                  EN
                </Button>
              </div>
              <a
                href="tel:+359888123456"
                className="bg-[#ffd700] text-[#1a1a2e] px-3 py-2 md:px-4 md:py-2 rounded-full font-semibold text-sm whitespace-nowrap flex items-center gap-2"
              >
                <span className="text-lg">📞</span>
                <span className="hidden md:inline">{t("callNow")}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Drawer Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#1a1a2e] z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:text-[#ffd700] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ffd700] rounded-lg p-2"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col px-6 py-4 gap-4">
            <button
              onClick={() => scrollToSection("features")}
              className="text-white hover:text-[#ffd700] transition-colors font-medium text-left py-3 px-4 hover:bg-white/5 rounded-lg"
            >
              {t("navFeatures")}
            </button>
            <button
              onClick={() => scrollToSection("booking")}
              className="text-white hover:text-[#ffd700] transition-colors font-medium text-left py-3 px-4 hover:bg-white/5 rounded-lg"
            >
              {t("navBooking")}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-white hover:text-[#ffd700] transition-colors font-medium text-left py-3 px-4 hover:bg-white/5 rounded-lg"
            >
              {t("navContact")}
            </button>
            <button
              onClick={() => scrollToSection("location")}
              className="text-white hover:text-[#ffd700] transition-colors font-medium text-left py-3 px-4 hover:bg-white/5 rounded-lg"
            >
              {t("navLocation")}
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}