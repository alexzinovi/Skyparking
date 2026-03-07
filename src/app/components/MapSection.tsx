import { MapPin, Navigation, Map } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useLanguage } from "./LanguageContext";

export function MapSection() {
  const { t } = useLanguage();

  const handleGoogleMaps = () => {
    // Opens official Google Maps location for SkyParking
    window.open("https://maps.app.goo.gl/Yt6YeQN5ECBSjVme8", "_blank");
  };

  const handleWaze = () => {
    // Opens official Waze navigation for SkyParking
    window.open("https://ul.waze.com/ul?place=ChIJ6eb_yAqHqkARRJP7h2zo5AU&ll=42.67676540%2C23.40033890&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location", "_blank");
  };

  return (
    <section id="location" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("howToFindUs")}</h2>
          </div>

          <Card className="overflow-hidden">
            <div className="relative w-full h-[500px] block">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7592.2122290288835!2d23.400915698865237!3d42.68238258465905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40aa870ac8ffe6e9%3A0x5e4e86c87fb9344!2zU2t5UGFya2luZyAtINCf0LDRgNC60LjQvdCzINCb0LXRgtC40YnQtSDQodC-0YTQuNGP!5e1!3m2!1sen!2sbg!4v1772892642254!5m2!1sen!2sbg"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SkyParking Location"
                className="block"
              ></iframe>
            </div>
            
            <div className="p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-semibold text-gray-900">SkyParking</p>
                <p className="text-sm text-gray-600">Ulitsa Nedelcho Bonchev 30, Sofia, Bulgaria</p>
              </div>
              <div className="flex flex-row gap-3">
                <Button 
                  onClick={handleGoogleMaps}
                  size="lg"
                  className="bg-[#f1c933] hover:bg-[#f1c933]/90 text-[#073590]"
                >
                  <img 
                    src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/google-map-icon.png" 
                    alt="Google Maps" 
                    className="mr-2 h-5 w-5"
                  />
                  {t("googleMaps")}
                </Button>
                <Button 
                  onClick={handleWaze}
                  size="lg"
                  className="bg-[#073590] hover:bg-[#073590]/90 text-white"
                >
                  <img 
                    src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/waze-icon.png" 
                    alt="Waze" 
                    className="mr-2 h-5 w-5"
                  />
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