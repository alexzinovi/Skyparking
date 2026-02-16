import { MapPin, Navigation, Map } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useLanguage } from "./LanguageContext";

export function MapSection() {
  const { t } = useLanguage();

  const handleGoogleMaps = () => {
    // Opens Google Maps with directions to Ulitsa Nedelcho Bonchev 30
    window.open("https://www.google.com/maps/dir/?api=1&destination=Ulitsa+Nedelcho+Bonchev+30,Sofia,Bulgaria", "_blank");
  };

  const handleWaze = () => {
    // Opens Waze with directions to Ulitsa Nedelcho Bonchev 30
    window.open("https://waze.com/ul?q=Ulitsa+Nedelcho+Bonchev+30,Sofia,Bulgaria&navigate=yes", "_blank");
  };

  return (
    <section id="location" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("howToFindUs")}</h2>
          </div>

          <Card className="overflow-hidden">
            <div className="relative w-full h-[450px]">
              <iframe
                src="https://www.google.com/maps?q=Ulitsa+Nedelcho+Bonchev+30,+Sofia,+Bulgaria&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SkyParking Location"
              ></iframe>
            </div>
            
            <div className="p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-semibold text-gray-900">SkyParking</p>
                <p className="text-sm text-gray-600">Ulitsa Nedelcho Bonchev 30, Sofia, Bulgaria</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleGoogleMaps}
                  size="lg"
                  className="bg-[#f1c933] hover:bg-[#f1c933]/90 text-[#073590]"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  {t("googleMaps")}
                </Button>
                <Button 
                  onClick={handleWaze}
                  size="lg"
                  className="bg-[#073590] hover:bg-[#073590]/90 text-white"
                >
                  <Map className="mr-2 h-5 w-5" />
                  {t("waze")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}