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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#073590] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 md:h-[110px]">
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
              className="absolute left-1/2 transform -translate-x-1/2 flex items-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffd700] rounded-lg z-10 overflow-visible"
              aria-label="Return to homepage"
            >
              {/* Desktop Logo */}
              <img
                src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/white%20web%20header.png"
                alt="SkyParking Logo"
                className="h-30 w-auto hidden md:block"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.logo-fallback')) {
                    const fallback = document.createElement('span');
                    fallback.className = 'text-[#ffd700] text-3xl font-bold logo-fallback';
                    fallback.textContent = 'SkyParking';
                    parent.appendChild(fallback);
                  }
                }}
              />
              {/* Mobile Logo */}
              <img
                src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/header%20mobile.png"
                alt="SkyParking Logo"
                className="w-52 h-auto md:hidden max-w-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.logo-fallback')) {
                    const fallback = document.createElement('span');
                    fallback.className = 'text-[#ffd700] text-2xl font-bold logo-fallback';
                    fallback.textContent = 'SkyParking';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </button>

            {/* Right Side - Language & Call Button */}
            <div className="flex items-center gap-2 md:gap-4 relative z-20 md:-mr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === "bg" ? "en" : "bg")}
                className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white px-2 min-w-[2.5rem] text-[13px]"
              >
                {language === "bg" ? "EN" : "БГ"}
              </Button>
              <a
                href="tel:+359886616991"
                className="bg-[#f1c933] text-[#1a1a2e] px-3 py-2 md:px-4 md:py-2 rounded-full font-semibold text-sm whitespace-nowrap flex items-center gap-2"
              >
                <span className="text-[13px]">📞</span>
                <span className="hidden md:inline text-[15px]">{t("callNow")}</span>
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
        className={`fixed top-0 left-0 h-full w-72 bg-[#073590] z-50 transform transition-transform duration-300 ease-in-out ${
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