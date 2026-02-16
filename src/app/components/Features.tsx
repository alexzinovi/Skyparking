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
    <section id="features" className="py-8 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-bold text-gray-900 mb-6 text-[27px]">{t("whyChooseUs")}</h2>
          
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isBookingCard = feature.titleKey === "lowPricesEasyBooking";
            return (
              <Card key={index} className="p-8 text-center hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#f1c933] hover:-translate-y-2 -mt-8 md:mt-0">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f1c933] text-white mb-6 mx-auto shadow-lg">
                  <Icon className="h-10 w-10 text-[#073590]" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">{t(feature.titleKey)}</h3>
                <p className="leading-relaxed text-gray-700">{t(feature.descKey)}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}