import { MapPin, Navigation } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useLanguage } from "./LanguageContext";

export function MapSection() {
  const { t } = useLanguage();

  const handleNavigate = () => {
    // Opens Google Maps with directions to Sofia Airport parking area
    window.open("https://www.google.com/maps/dir/?api=1&destination=Sofia+Airport+Parking,Terminal+2,Sofia,Bulgaria", "_blank");
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="mb-4">
              <MapPin className="inline h-8 w-8 mr-2 text-blue-600" />
              {t("ourLocation")}
            </h2>
            <p className="text-gray-600">
              {t("findUs")}
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="relative w-full h-[450px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2935.8446878449894!2d23.406447315437887!3d42.69506317916515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40aa9775d2f20a75%3A0x4b10c6daa91bf05e!2sSofia%20Airport!5e0!3m2!1sen!2sbg!4v1639000000000!5m2!1sen!2sbg"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sofia Airport Parking Location"
              ></iframe>
            </div>
            
            <div className="p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-semibold text-gray-900">Sofia Airport Parking</p>
                <p className="text-sm text-gray-600">Terminal 2, Sofia Airport, Bulgaria</p>
              </div>
              <Button 
                onClick={handleNavigate}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Navigation className="mr-2 h-5 w-5" />
                {t("takeMeThere")}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
