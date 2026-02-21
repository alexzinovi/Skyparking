import { Header } from "../components/Header";
import { useLanguage } from "../components/LanguageContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Calendar, Car, Plane, Key } from "lucide-react";

export function HowItWorksPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Update document title
  useEffect(() => {
    document.title = language === 'bg' ? 'Как Работи - SkyParking' : 'How It Works - SkyParking';
  }, [language]);

  const steps = [
    {
      number: 1,
      icon: Calendar,
      titleBg: 'Резервирайте Онлайн',
      titleEn: 'Book Online',
      descBg: 'Попълнете лесната форма за резервация с дати на пристигане и заминаване, имейл и телефон. Изберете дали искате стандартен паркинг или услугата "Ключове".',
      descEn: 'Fill out the easy booking form with arrival and departure dates, email and phone. Choose whether you want standard parking or "Car Keys" service.',
    },
    {
      number: 2,
      icon: Car,
      titleBg: 'Получете Потвърждение',
      titleEn: 'Receive Confirmation',
      descBg: 'Веднага след резервацията ще получите имейл с потвърждение и всички детайли - адрес, инструкции за пристигане и контактна информация.',
      descEn: 'Right after booking you\'ll receive an email with confirmation and all details - address, arrival instructions and contact information.',
    },
    {
      number: 3,
      icon: Plane,
      titleBg: 'Пристигнете и Паркирайте',
      titleEn: 'Arrive and Park',
      descBg: 'Идвате на посочения адрес (GPS координати в имейла). Паркирате автомобила си или, ако сте избрали услуга "Ключове", просто оставяте ключовете.',
      descEn: 'Come to the specified address (GPS coordinates in email). Park your car or, if you chose "Car Keys" service, simply leave the keys.',
    },
    {
      number: 4,
      icon: Key,
      titleBg: 'Трансфер и Път',
      titleEn: 'Transfer and Travel',
      descBg: 'Нашият безплатен трансфер ви откарва до летището за 5 минути. При завръщане ви вземаме от терминала и вашият автомобил ви очаква.',
      descEn: 'Our free transfer takes you to the airport in 5 minutes. Upon return we pick you up from the terminal and your car awaits you.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 md:pt-32 pb-16 px-4">{/* Added md:pt-32 for desktop to clear the taller header */}
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {language === 'bg' ? 'Как Работи SkyParking?' : 'How Does SkyParking Work?'}
          </h1>
          
          <p className="text-center text-gray-600 mb-16 text-lg max-w-3xl mx-auto">
            {language === 'bg' 
              ? 'Резервирайте вашето паркомясто за 4 лесни стъпки и пътувайте без притеснения' 
              : 'Book your parking spot in 4 easy steps and travel worry-free'}
          </p>

          {/* Steps */}
          <div className="space-y-12 mb-16">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Number Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white relative" style={{ backgroundColor: '#073590' }}>
                      {step.number}
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1c933' }}>
                        <step.icon className="w-6 h-6" style={{ color: '#073590' }} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: '#073590' }}>
                      {language === 'bg' ? step.titleBg : step.titleEn}
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {language === 'bg' ? step.descBg : step.descEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Two Parking Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Standard Parking */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#073590' }}>
                  <Car className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'Стандартен Паркинг' : 'Standard Parking'}
                </h3>
                <div className="text-3xl font-bold mb-1" style={{ color: '#f1c933' }}>
                  {language === 'bg' ? 'от ' : 'from '}2.80€
                </div>
                <div className="text-gray-600">{language === 'bg' ? 'на ден' : 'per day'}</div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                  <span>{language === 'bg' ? 'Вие паркирате автомобила си' : 'You park your car'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                  <span>{language === 'bg' ? 'Взимате си ключовете' : 'You keep your keys'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                  <span>{language === 'bg' ? 'Пълна сигурност и видеонаблюдение' : 'Full security and video surveillance'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                  <span>{language === 'bg' ? 'Безплатен трансфер' : 'Free transfer'}</span>
                </li>
              </ul>
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  {language === 'bg' 
                    ? '* За 3+ седмици се обадете' 
                    : '* For 3+ weeks please call'}
                </p>
              </div>
            </div>

            {/* Car Keys Service */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-8 border-2" style={{ borderColor: '#f1c933' }}>
              <div className="text-center mb-6">
                <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: '#073590', color: 'white' }}>
                  {language === 'bg' ? 'ПРЕМИУМ' : 'PREMIUM'}
                </div>
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#f1c933' }}>
                  <Key className="w-8 h-8" style={{ color: '#073590' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'Услуга "Ключове"' : '"Car Keys" Service'}
                </h3>
                <div className="text-lg font-semibold mb-1" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'За цени:' : 'For pricing:'}
                </div>
                <div className="text-2xl font-bold" style={{ color: '#073590' }}>+359 886 616 991</div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0" style={{ color: '#f1c933' }}>★</span>
                  <span className="font-semibold">{language === 'bg' ? 'Ние паркираме за вас' : 'We park for you'}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0" style={{ color: '#f1c933' }}>★</span>
                  <span className="font-semibold">{language === 'bg' ? 'Оставяте ключовете' : 'Leave your keys'}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0" style={{ color: '#f1c933' }}>★</span>
                  <span>{language === 'bg' ? 'Автомобилът е готов при връщане' : 'Car ready upon return'}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0" style={{ color: '#f1c933' }}>★</span>
                  <span>{language === 'bg' ? 'Всички стандартни предимства' : 'All standard benefits'}</span>
                </li>
              </ul>
            </div>
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
                    ? 'Трансферът до летището отнема само 5 минути. Препоръчваме да пристигете 45-60 минути преди полета.'
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
                    ? 'Да, можете да отмените безплатно до 24 часа преди началната дата на резервацията без никакви такси.'
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