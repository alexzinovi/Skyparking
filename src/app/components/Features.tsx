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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">{t("whyChooseUs")}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("whyChooseUsDesc")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 mx-auto">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2">{t(feature.titleKey)}</h3>
                <p className="text-gray-600">{t(feature.descKey)}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}