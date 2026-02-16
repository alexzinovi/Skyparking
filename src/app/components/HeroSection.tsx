import { Phone, Plane } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "./LanguageContext";

export function HeroSection() {
  const { t, language } = useLanguage();
  
  const handleCallClick = () => {
    window.location.href = "tel:+359886616991";
  };

  return (
    <>
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden mt-20 md:mt-[90px]">
        <div className="absolute inset-0 md:inset-0 bottom-0 md:bottom-0">
          <ImageWithFallback
            src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/iStock-1458801953.jpg"
            alt="Airport parking lot"
            className="w-full h-full object-cover object-[40%_center] md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#073590]/60 via-[#1e5ba8]/35 to-[#073590]/60"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto py-12 md:py-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {t("heroTitle")}
          </h1>
          <p className="mb-10 text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            {t("heroSubtitle")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 md:mb-0">
            <Button 
              size="lg" 
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#f1c933] text-[#1a1a2e] hover:bg-[#f5d54a] px-8 py-6 font-bold shadow-2xl transform hover:scale-105 transition-all text-[16px]"
            >
              {t("bookNow")}
            </Button>
            <Button 
              size="lg" 
              onClick={handleCallClick}
              className="bg-[#f1c933] text-[#1a1a2e] hover:bg-[#f5d54a] text-lg px-8 py-6 font-bold shadow-2xl transform hover:scale-105 transition-all"
            >
              <Phone className="mr-2 h-5 w-5" />
              {t("callButton")}
            </Button>
          </div>
        </div>
      </section>

      {/* Trust badges - outside hero on mobile, inside on desktop */}
      
    </>
  );
}