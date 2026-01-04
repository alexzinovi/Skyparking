import { Button } from "./ui/button";
import { useLanguage } from "./LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Button
        variant={language === "bg" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("bg")}
        className={language === "bg" ? "bg-white text-blue-900 hover:bg-gray-100" : "bg-white/90 text-blue-900 hover:bg-white"}
      >
        БГ
      </Button>
      <Button
        variant={language === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("en")}
        className={language === "en" ? "bg-white text-blue-900 hover:bg-gray-100" : "bg-white/90 text-blue-900 hover:bg-white"}
      >
        EN
      </Button>
    </div>
  );
}
