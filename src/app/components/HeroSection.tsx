import { Phone } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "./LanguageContext";

export function HeroSection() {
  const { t } = useLanguage();
  
  const handleCallClick = () => {
    window.location.href = "tel:+359888123456";
  };

  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1705926984536-cf641440fd18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwb3J0JTIwcGFya2luZyUyMGxvdHxlbnwxfHx8fDE3NjY0MDEyMjR8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Airport parking lot"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/70"></div>
      </div>
      
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="mb-6">
          {t("heroTitle")}
        </h1>
        <p className="mb-8 text-xl opacity-90">
          {t("heroSubtitle")}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-blue-900 hover:bg-gray-100"
          >
            {t("bookNow")}
          </Button>
          <Button 
            size="lg" 
            onClick={handleCallClick}
            variant="outline"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900"
          >
            <Phone className="mr-2 h-5 w-5" />
            {t("callButton")}
          </Button>
        </div>
      </div>
    </section>
  );
}