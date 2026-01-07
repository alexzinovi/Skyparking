import { Shield, Clock, Plane, Car } from "lucide-react";
import { Card } from "./ui/card";
import { useLanguage } from "./LanguageContext";

export function Features() {
  const { t } = useLanguage();
  
  const features = [
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
    },
    {
      icon: Car,
      titleKey: "allVehicles",
      descKey: "allVehiclesDesc"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-4xl font-bold text-[#1a1a2e]">{t("whyChooseUs")}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {t("whyChooseUsDesc")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-8 text-center hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#ffd700] hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#ffd700] text-white mb-6 mx-auto shadow-lg">
                  <Icon className="h-10 w-10" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#1a1a2e]">{t(feature.titleKey)}</h3>
                <p className="text-gray-600 leading-relaxed">{t(feature.descKey)}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}