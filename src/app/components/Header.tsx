import logo from "figma:asset/752cb5fa34e556225adeb99828b6f5740fe05a54.png";
import { useLanguage } from "./LanguageContext";
import { Button } from "./ui/button";

export function Header() {
  const { t, language, setLanguage } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffd700] rounded-lg"
            aria-label="Return to homepage"
          >
            <img
              src={logo}
              alt="SkyParking Logo"
              className="h-14 w-auto"
            />
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-white hover:text-[#ffd700] transition-colors font-medium"
            >
              {t("navFeatures")}
            </button>
            <button
              onClick={() => scrollToSection("booking")}
              className="text-white hover:text-[#ffd700] transition-colors font-medium"
            >
              {t("navBooking")}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-white hover:text-[#ffd700] transition-colors font-medium"
            >
              {t("navContact")}
            </button>
            <button
              onClick={() => scrollToSection("location")}
              className="text-white hover:text-[#ffd700] transition-colors font-medium"
            >
              {t("navLocation")}
            </button>

            {/* Language Switcher */}
            <div className="flex gap-2">
              <Button
                variant={language === "bg" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("bg")}
                className={language === "bg" ? "bg-[#ffd700] text-[#1a1a2e] hover:bg-[#ffed4e] border-[#ffd700]" : "bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white"}
              >
                БГ
              </Button>
              <Button
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("en")}
                className={language === "en" ? "bg-[#ffd700] text-[#1a1a2e] hover:bg-[#ffed4e] border-[#ffd700]" : "bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white"}
              >
                EN
              </Button>
            </div>

            <a
              href="tel:+359888123456"
              className="bg-[#ffd700] text-[#1a1a2e] px-6 py-2 rounded-full font-semibold hover:bg-[#ffed4e] transition-colors shadow-lg"
            >
              📞 {t("callNow")}
            </a>
          </nav>

          {/* Mobile menu button with language switcher */}
          <div className="md:hidden flex items-center gap-2">
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
            <button
              onClick={() => scrollToSection("booking")}
              className="bg-[#ffd700] text-[#1a1a2e] px-4 py-2 rounded-full font-semibold text-sm"
            >
              {t("bookNow")}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}