import { Header } from "../components/Header";
import { useLanguage } from "../components/LanguageContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { CalendarClock, MapPin, CarFront } from "lucide-react";

export function HowItWorksPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Update document title
  useEffect(() => {
    document.title = language === 'bg' ? 'Как Работи - SkyParking' : 'How It Works - SkyParking';
  }, [language]);

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
    navigate('/');
    setTimeout(() => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 md:pt-32 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {language === 'bg' ? 'Как Работи SkyParking?' : 'How Does SkyParking Work?'}
          </h1>
          
          <p className="text-center text-gray-600 mb-16 text-lg max-w-3xl mx-auto">
            {language === 'bg' 
              ? 'Процесът е лесен и прост - резервирайте, пристигнете и пътувайте спокойно' 
              : 'The process is easy and simple - book, arrive and travel worry-free'}
          </p>

          {/* Steps - Detailed 3-step version */}
          <div className="space-y-12 mb-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1c933' }}>
                        <Icon className="h-10 w-10" style={{ color: '#073590' }} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3" style={{ color: '#073590' }}>
                        {t(step.titleKey)}
                      </h3>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {index === 0 ? (
                          <>
                            {t("onlineTelephoneBookingText1")}{" "}
                            <a 
                              href="tel:+359886616991"
                              className="font-semibold hover:underline"
                              style={{ color: '#073590' }}
                            >
                              +359 886 616 991
                            </a>{" "}
                            {t("onlineTelephoneBookingText2")}{" "}
                            <a 
                              href="/"
                              onClick={handleScrollToBooking}
                              className="font-semibold hover:underline"
                              style={{ color: '#073590' }}
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
                              className="font-semibold hover:underline"
                              style={{ color: '#073590' }}
                            >
                              {t("callUs")}
                            </a>
                            {" "}{t("returnAndPickupText2")}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#073590' }}>
              {language === 'bg' ? 'Често Задавани Въпроси' : 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'Кога трябва да платя?' : 'When do I need to pay?'}
                </h4>
                <p className="text-gray-700">
                  {language === 'bg'
                    ? 'Плащането се извършва на място при пристигане - можете да платите в брой или с карта. Няма нужда от предплащане.'
                    : 'Payment is made on-site upon arrival - you can pay in cash or by card. No prepayment required.'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'Колко време отнема трансферът?' : 'How long does the transfer take?'}
                </h4>
                <p className="text-gray-700">
                  {language === 'bg'
                    ? 'Трансферът до летището отнема само 5 минути. Препоръчваме да пристигате 45-60 минути преди полета.'
                    : 'The transfer to the airport takes only 5 minutes. We recommend arriving 45-60 minutes before your flight.'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'Безопасен ли е моят автомобил?' : 'Is my car safe?'}
                </h4>
                <p className="text-gray-700">
                  {language === 'bg'
                    ? 'Да! Имаме видеонаблюдение 24/7, охранявана територия и пълна застраховка. Вашият автомобил е в сигурни ръце.'
                    : 'Yes! We have 24/7 video surveillance, secured premises and full insurance. Your car is in safe hands.'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'Мога ли да отменя резервацията?' : 'Can I cancel my reservation?'}
                </h4>
                <p className="text-gray-700">
                  {language === 'bg'
                    ? 'Да, можете да отмените безплатно ��о 24 часа преди началната дата на резервацията без никакви такси.'
                    : 'Yes, you can cancel for free up to 24 hours before the start date of your reservation without any fees.'}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#073590' }}>
              {language === 'bg' ? 'Готови да резервирате?' : 'Ready to book?'}
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              {language === 'bg'
                ? 'Започнете вашата резервация сега и пътувайте без грижи'
                : 'Start your booking now and travel worry-free'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 rounded-lg font-semibold text-white text-lg shadow-lg hover:shadow-xl transition-shadow"
              style={{ backgroundColor: '#073590' }}
            >
              {language === 'bg' ? 'Резервирайте Сега' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
