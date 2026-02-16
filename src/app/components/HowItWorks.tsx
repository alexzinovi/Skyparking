import { Phone, UserCheck, CarFront, CalendarClock, ParkingCircle, MapPin } from "lucide-react";
import { Card } from "./ui/card";
import { useLanguage } from "./LanguageContext";

export function HowItWorks() {
  const { t } = useLanguage();
  
  const steps = [
    {
      icon: CalendarClock,
      titleKey: "onlineTelephoneBooking",
      descKey: "onlineTelephoneBookingDesc"
    },
    {
      icon: MapPin,
      titleKey: "arrivalAndTransfer",
      descKey: "arrivalAndTransferDesc"
    },
    {
      icon: CarFront,
      titleKey: "returnAndPickup",
      descKey: "returnAndPickupDesc"
    }
  ];

  const handleScrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCall = () => {
    window.location.href = 'tel:+359886616991';
  };

  return (
    <section id="how-it-works" className="py-8 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-bold text-gray-900 mb-6 text-[27px]">{t("howItWorks")}</h2>
        </div>
        
        {/* Desktop Version - Horizontal */}
        <div className="hidden md:block max-w-6xl mx-auto">
          <Card className="p-12 bg-white shadow-lg">
            <div className="flex items-start justify-between relative">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex flex-col items-center text-center flex-1 relative h-full">
                    {/* Dotted line connector - positioned between content areas */}
                    {index < steps.length - 1 && (
                      null
                    )}
                    
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f1c933] mb-6 relative z-10 shadow-lg">
                      <Icon className="h-10 w-10 text-[#073590]" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-gray-900 min-h-[3.5rem] flex items-center">{t(step.titleKey)}</h3>
                    <p className="leading-relaxed text-gray-700 text-sm max-w-[250px] text-justify mt-auto">
                      {index === 0 ? (
                        <>
                          {t("onlineTelephoneBookingText1")}{" "}
                          <a 
                            href="tel:+359886616991"
                            className="text-[#073590] font-semibold hover:underline"
                          >
                            +359 886 616 991
                          </a>{" "}
                          {t("onlineTelephoneBookingText2")}{" "}
                          <a 
                            href="#booking"
                            onClick={handleScrollToBooking}
                            className="text-[#073590] font-semibold hover:underline"
                          >
                            {t("bookingForm")}
                          </a>
                          {t("onlineTelephoneBookingText3")}
                        </>
                      ) : index === 1 ? (
                        t(step.descKey)
                      ) : (
                        <>
                          {t("returnAndPickupText1")}{" "}
                          <a
                            href="tel:+359886616991"
                            className="text-[#073590] font-semibold hover:underline"
                          >
                            {t("callUs")}
                          </a>
                          {" "}{t("returnAndPickupText2")}
                        </>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Mobile Version - Vertical */}
        <div className="md:hidden max-w-md mx-auto">
          <Card className="p-8 bg-white shadow-lg">
            <div className="flex flex-col items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex flex-col items-center text-center w-full relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f1c933] mb-4 relative z-10 shadow-lg">
                      <Icon className="h-10 w-10 text-[#073590]" />
                    </div>
                    
                    <h3 className="mb-3 text-xl font-bold text-gray-900">{t(step.titleKey)}</h3>
                    <p className="leading-relaxed text-gray-700 text-[14px] text-justify mx-[0px] mt-[0px] mb-[25px]">
                      {index === 0 ? (
                        <>
                          {t("onlineTelephoneBookingText1")}{" "}
                          <a 
                            href="tel:+359886616991"
                            className="text-[#073590] font-semibold hover:underline"
                          >
                            +359 886 616 991
                          </a>{" "}
                          {t("onlineTelephoneBookingText2")}{" "}
                          <a 
                            href="#booking"
                            onClick={handleScrollToBooking}
                            className="text-[#073590] font-semibold hover:underline"
                          >
                            {t("bookingForm")}
                          </a>
                          {t("onlineTelephoneBookingText3")}
                        </>
                      ) : index === 1 ? (
                        t(step.descKey)
                      ) : (
                        <>
                          {t("returnAndPickupText1")}{" "}
                          <a
                            href="tel:+359886616991"
                            className="text-[#073590] font-semibold hover:underline"
                          >
                            {t("callUs")}
                          </a>
                          {" "}{t("returnAndPickupText2")}
                        </>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}