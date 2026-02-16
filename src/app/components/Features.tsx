import { Shield, Clock, Plane, MousePointerClick } from "lucide-react";
import { Card } from "./ui/card";
import { useLanguage } from "./LanguageContext";

export function Features() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: MousePointerClick,
      titleKey: "lowPricesEasyBooking",
      descKey: "lowPricesEasyBookingDesc"
    },
    {
      icon: Shield,
      titleKey: "secureParking",
      descKey: "secureParkingDesc"
    },
    {
      icon: Clock,
      titleKey: "flexibleHours",
      descKey: "flexibleHoursDesc"
    },
    {
      icon: Plane,
      titleKey: "airportShuttle",
      descKey: "airportShuttleDesc"
    }
  ];

  return (
    <section id="features" className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-bold text-gray-900 mb-6 text-[27px]">{t("whyChooseUs")}</h2>
          
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isBookingCard = feature.titleKey === "lowPricesEasyBooking";
            return (
              <Card key={index} className="p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#f1c933] hover:-translate-y-2 h-full">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#f1c933] text-white shadow-lg flex-shrink-0 mb-6">
                    <Icon className="h-8 w-8 text-[#073590]" />
                  </div>
                  <div className="flex flex-col items-center text-center w-full max-w-[280px]">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 w-full leading-[1.4] min-h-[3.5rem]">{t(feature.titleKey)}</h3>
                    <p className="text-gray-700 w-full leading-[1.7]">{t(feature.descKey)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}