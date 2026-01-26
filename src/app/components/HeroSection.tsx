import { Phone, Plane } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "./LanguageContext";

export function HeroSection() {
  const { t, language } = useLanguage();
  
  const handleCallClick = () => {
    window.location.href = "tel:+359888123456";
  };

  return (
    <section className="relative h-[700px] flex items-center justify-center overflow-hidden mt-20">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1705926984536-cf641440fd18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwb3J0JTIwcGFya2luZyUyMGxvdHxlbnwxfHx8fDE3NjY0MDEyMjR8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Airport parking lot"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/95 via-[#1e90ff]/40 to-[#1a1a2e]/95"></div>
      </div>
      
      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <Plane className="h-16 w-16 text-[#ffd700]" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          {t("heroTitle")}
        </h1>
        <p className="mb-10 text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
          {t("heroSubtitle")}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#ffd700] text-[#1a1a2e] hover:bg-[#ffed4e] text-lg px-8 py-6 font-bold shadow-2xl transform hover:scale-105 transition-all"
          >
            {t("bookNow")}
          </Button>
          <Button 
            size="lg" 
            onClick={handleCallClick}
            className="bg-[#ffd700] text-[#1a1a2e] hover:bg-[#ffed4e] text-lg px-8 py-6 font-bold shadow-2xl transform hover:scale-105 transition-all"
          >
            <Phone className="mr-2 h-5 w-5" />
            {t("callButton")}
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm opacity-90">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            <span>{language === "bg" ? "24/7 Охрана" : "24/7 Security"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚐</span>
            <span>{language === "bg" ? "безплатен траснфер" : "Free Shuttle"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span>{language === "bg" ? "5.0 Рейтинг" : "5.0 Rating"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span>{language === "bg" ? "Най-Добра Цена" : "Best Price"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}