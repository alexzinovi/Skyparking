import { Header } from "../components/Header";
import { useLanguage } from "../components/LanguageContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Shield, Clock, Car, MapPin, CreditCard, CheckCircle } from "lucide-react";

export function ServicesPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Update document title
  useEffect(() => {
    document.title = language === 'bg' ? 'Услуги - SkyParking' : 'Services - SkyParking';
  }, [language]);

  const services = [
    {
      icon: Shield,
      titleBg: 'Сигурен Паркинг',
      titleEn: 'Secure Parking',
      descBg: 'Видеонаблюдение 24/7, охранявана територия и пълна застраховка за спокойствието ви',
      descEn: '24/7 video surveillance, secured premises, and full insurance for your peace of mind',
    },
    {
      icon: Car,
      titleBg: 'Безплатен Трансфер',
      titleEn: 'Free Transfer',
      descBg: 'Бърз и удобен трансфер до Терминал 1 и 2 на Летище София - само 5 минути път',
      descEn: 'Quick and convenient transfer to Terminal 1 and 2 of Sofia Airport - just 5 minutes away',
    },
    {
      icon: Clock,
      titleBg: 'Денонощна Работа',
      titleEn: '24/7 Service',
      descBg: 'Работим денонощно, без почивни дни - винаги сме на разположение за вас',
      descEn: 'Open 24/7, no days off - we\'re always available for you',
    },
    {
      icon: MapPin,
      titleBg: 'Перфектна Локация',
      titleEn: 'Perfect Location',
      descBg: 'На 5 минути от летището, лесен достъп и удобна близост до терминалите',
      descEn: '5 minutes from the airport, easy access and convenient proximity to terminals',
    },
    {
      icon: CreditCard,
      titleBg: 'Гъвкаво Плащане',
      titleEn: 'Flexible Payment',
      descBg: 'Плащате на място - кеш или карта. Без предплащане, без скрити такси',
      descEn: 'Pay on arrival - cash or card. No prepayment, no hidden fees',
    },
    {
      icon: CheckCircle,
      titleBg: 'Онлайн Резервация',
      titleEn: 'Online Booking',
      descBg: 'Лесна и бърза онлайн резервация за минути. Моментално потвърждение по имейл',
      descEn: 'Easy and quick online booking in minutes. Instant email confirmation',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 md:pt-32 pb-16 px-4">{/* Added md:pt-32 for desktop to clear the taller header */}
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {language === 'bg' ? 'Нашите Услуги' : 'Our Services'}
          </h1>
          
          <p className="text-center text-gray-600 mb-12 text-lg max-w-3xl mx-auto">
            {language === 'bg' 
              ? 'В SkyParking предлагаме пълен набор от услуги за удобството и сигурността на нашите клиенти' 
              : 'At SkyParking we offer a complete set of services for the comfort and safety of our customers'}
          </p>

          {/* Main Services Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f1c933' }}>
                  <service.icon className="w-8 h-8" style={{ color: '#073590' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#073590' }}>
                  {language === 'bg' ? service.titleBg : service.titleEn}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {language === 'bg' ? service.descBg : service.descEn}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Benefits */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#073590' }}>
              {language === 'bg' ? 'Допълнителни Удобства' : 'Additional Benefits'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#f1c933' }} />
                <div>
                  <h4 className="font-semibold mb-1">{language === 'bg' ? 'Безплатна Отмяна' : 'Free Cancellation'}</h4>
                  <p className="text-gray-600 text-sm">
                    {language === 'bg' 
                      ? 'До 24 часа преди резервацията без допълнителни такси'
                      : 'Up to 24 hours before reservation without additional fees'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#f1c933' }} />
                <div>
                  <h4 className="font-semibold mb-1">{language === 'bg' ? 'Измиване на Автомобили' : 'Car Wash'}</h4>
                  <p className="text-gray-600 text-sm">
                    {language === 'bg' 
                      ? 'Възможност за измиване на автомобила при поискване'
                      : 'Car wash service available upon request'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#f1c933' }} />
                <div>
                  <h4 className="font-semibold mb-1">{language === 'bg' ? 'Дългосрочен Паркинг' : 'Long-term Parking'}</h4>
                  <p className="text-gray-600 text-sm">
                    {language === 'bg' 
                      ? 'Специални отстъпки за резервации над 7 дни'
                      : 'Special discounts for bookings over 7 days'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#f1c933' }} />
                <div>
                  <h4 className="font-semibold mb-1">{language === 'bg' ? 'Телефонна Резервация' : 'Phone Booking'}</h4>
                  <p className="text-gray-600 text-sm">
                    {language === 'bg' 
                      ? 'Можете да резервирате и по телефона 24/7'
                      : 'You can also book by phone 24/7'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 rounded-lg font-semibold text-white text-lg shadow-lg hover:shadow-xl transition-shadow"
              style={{ backgroundColor: '#073590' }}
            >
              {language === 'bg' ? 'Резервирайте Сега' : 'Book Now'}
            </button>
            <p className="text-gray-600 mt-4">
              {language === 'bg' 
                ? 'Резервирайте онлайн за най-добрата цена'
                : 'Book online for the best price'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
