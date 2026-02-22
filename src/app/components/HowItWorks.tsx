import { Calendar, Car, Plane, Key, Mail, Bus } from "lucide-react";
import { Card } from "./ui/card";
import { useLanguage } from "./LanguageContext";
import { Link } from "react-router";

export function HowItWorks() {
  const { t, language } = useLanguage();
  
  const steps = [
    {
      number: 1,
      icon: Calendar,
      titleBg: 'Направете Резервация',
      titleEn: 'Book Online',
      descBg: (
        <>
          Можете да направите резервация чрез <Link to="/booking" onClick={() => window.scrollTo(0, 0)} className="font-semibold underline hover:no-underline" style={{ color: '#073590' }}>формата на сайта</Link> или като се свържете с нас на <a href="tel:+359886616991" className="font-semibold underline hover:no-underline" style={{ color: '#073590' }}>+359 886 616 991</a>.
        </>
      ),
      descEn: 'Fill out the easy booking form with arrival and departure dates, email and phone. Choose whether you want standard parking or "Car Keys" service.',
    },
    {
      number: 2,
      icon: Mail,
      titleBg: 'Получете Потвърждение',
      titleEn: 'Receive Confirmation',
      descBg: 'До няколко минути ще получите телефонно потвърждение от наш служител, след което ще Ви изпратим имейл с точния адрес на паркинга и инструкции за пристигане.',
      descEn: 'Right after booking you\'ll receive an email with confirmation and all details - address, arrival instructions and contact information.',
    },
    {
      number: 3,
      icon: Bus,
      titleBg: 'Пристигане и Трансфер',
      titleEn: 'Arrive and Park',
      descBg: 'Бутоните за Google Maps и Waze (ще ги откриете по-долу) ще Ви отведат точно до нас. Наш служител ще Ви помогне с багажа и ще Ви откара до терминала, от който летите.',
      descEn: 'Come to the specified address (GPS coordinates in email). Park your car or, if you chose "Car Keys" service, simply leave the keys.',
    },
    {
      number: 4,
      icon: Plane,
      titleBg: 'Кацане и Връщане',
      titleEn: 'Transfer and Travel',
      descBg: 'След като получите багажа си, моля обадете ни се. До броени минути нашият трансферен бус ще Ви вземе от терминала и ще Ви откара до Вашия автомобил.',
      descEn: 'Our free transfer takes you to the airport in 5 minutes. Upon return we pick you up from the terminal and your car awaits you.',
    },
  ];

  return (
    <section id="how-it-works" className="py-8 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-bold text-gray-900 mb-6 text-[27px]">{t("howItWorks")}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {language === 'bg' 
              ? 'Само 4 лесни стъпки до спокойно пътуване' 
              : 'Book your parking spot in 4 easy steps and travel worry-free'}
          </p>
        </div>
        
        {/* Desktop Version - 2x2 Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Number Badge with Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white relative" style={{ backgroundColor: '#073590' }}>
                      {step.number}
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1c933' }}>
                        <Icon className="w-4 h-4" style={{ color: '#073590' }} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3" style={{ color: '#073590' }}>
                      {language === 'bg' ? step.titleBg : step.titleEn}
                    </h3>
                    <p className="text-gray-700 leading-relaxed p-[0px] m-[0px] text-justify">
                      {language === 'bg' ? step.descBg : step.descEn}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Mobile Version - Vertical */}
        <div className="md:hidden max-w-md mx-auto space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="p-6 bg-white shadow-lg">
                <div className="flex flex-col items-center text-center">
                  {/* Number Badge with Icon */}
                  <div className="flex-shrink-0 mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white relative" style={{ backgroundColor: '#073590' }}>
                      {step.number}
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1c933' }}>
                        <Icon className="w-4 h-4" style={{ color: '#073590' }} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: '#073590' }}>
                      {language === 'bg' ? step.titleBg : step.titleEn}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {language === 'bg' ? step.descBg : step.descEn}
                    </p>
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