import { Header } from "../components/Header";
import { useLanguage } from "../components/LanguageContext";
import { useEffect } from "react";

export function AboutPage() {
  const { language } = useLanguage();

  // Update document title
  useEffect(() => {
    document.title = language === 'bg' ? 'За Нас - SkyParking' : 'About Us - SkyParking';
  }, [language]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 md:pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {language === 'bg' ? 'За Нас' : 'About Us'}
          </h1>
          
          <p className="text-center text-gray-600 mb-12 text-lg">
            {language === 'bg' 
              ? 'Вашият надежден партньор за паркиране на Летище София' 
              : 'Your trusted parking partner at Sofia Airport'}
          </p>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              {language === 'bg' ? (
                <>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#073590' }}>
                    Добре Дошли в SkyParking
                  </h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    SkyParking е модерен охраняем паркинг, разположен само на 5 минути от Терминал 1 и Терминал 2 на Летище София. 
                    Ние предлагаме сигурно и удобно решение за паркиране на Вашия автомобил по време на пътуване.
                  </p>

                  <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                    Нашата Мисия
                  </h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Да предоставим на нашите клиенти спокойствие и сигурност, знаейки че техният автомобил е в добри ръце, 
                    докато те пътуват. Стремим се да направим процеса на паркиране възможно най-лесен и безпроблемен.
                  </p>

                  <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                    Защо Да Изберете Нас?
                  </h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                      <span className="text-gray-700">
                        <strong>Сигурност:</strong> 24/7 видеонаблюдение и охрана на паркинга
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                      <span className="text-gray-700">
                        <strong>Удобство:</strong> Безплатен трансфер до и от летището
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                      <span className="text-gray-700">
                        <strong>Гъвкавост:</strong> Без предплащане - плащате при пристигане
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                      <span className="text-gray-700">
                        <strong>Достъпност:</strong> Конкурентни цени за краткосрочен и дългосрочен престой
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                      <span className="text-gray-700">
                        <strong>Професионализъм:</strong> Опитен и любезен персонал
                      </span>
                    </li>
                  </ul>

                  <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                    Нашите Услуги
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Предлагаме широка гама от услуги, за да направим Вашето преживяване възможно най-удобно:
                  </p>
                  <ul className="space-y-2 mb-6 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                      Стандартно паркиране с лесна онлайн резервация
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                      Услуга "Ключове" - оставяте ключовете, ние паркираме Вашия автомобил
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                      Безплатен трансфер до Терминал 1 и Терминал 2
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                      Приемане на всички видове превозни средства (автомобили, ванове, джипове)
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                      Специални условия за дългосрочно паркиране
                    </li>
                  </ul>

                  <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                    Свържете Се С Нас
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Имате въпроси или искате да направите резервация по телефона? Не се колебайте да се свържете с нас:
                  </p>
                  <div className="bg-blue-50 rounded-lg p-6 border-2" style={{ borderColor: '#073590' }}>
                    <p className="text-center font-semibold mb-2" style={{ color: '#073590' }}>
                      📞 Телефон за връзка
                    </p>
                    <p className="text-center text-2xl font-bold" style={{ color: '#f1c933' }}>
                      +359 886 616 991
                    </p>
                    <p className="text-center text-gray-600 mt-2">
                      Ние сме на линия 24/7 за Вашето удобство
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#073590' }}>
                    Welcome to SkyParking
                  </h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    SkyParking is a modern secured parking facility located just 5 minutes from Terminal 1 and Terminal 2 of Sofia Airport. 
                    We offer a safe and convenient solution for parking your car while you travel.
                  </p>

                  <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                    Our Mission
                  </h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    To provide our customers with peace of mind and security, knowing that their vehicle is in good hands 
                    while they travel. We strive to make the parking process as easy and hassle-free as possible.
                  </p>

                  <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                    Why Choose Us?
                  </h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                      <span className="text-gray-700">
                        <strong>Security:</strong> 24/7 video surveillance and on-site security
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                      <span className="text-gray-700">
                        <strong>Convenience:</strong> Free shuttle service to and from the airport
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                      <span className="text-gray-700">
                        <strong>Flexibility:</strong> No prepayment required - pay on arrival
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                      <span className="text-gray-700">
                        <strong>Affordability:</strong> Competitive rates for short and long-term stays
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                      <span className="text-gray-700">
                        <strong>Professionalism:</strong> Experienced and friendly staff
                      </span>
                    </li>
                  </ul>

                  <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                    Our Services
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    We offer a wide range of services to make your experience as convenient as possible:
                  </p>
                  <ul className="space-y-2 mb-6 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                      Standard parking with easy online reservation
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                      "Car Keys" service - leave your keys, we park your car
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                      Free shuttle to Terminal 1 and Terminal 2
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                      Accommodates all vehicle types (cars, vans, SUVs)
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                      Special rates for long-term parking
                    </li>
                  </ul>

                  <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                    Contact Us
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Have questions or want to make a phone reservation? Don't hesitate to contact us:
                  </p>
                  <div className="bg-blue-50 rounded-lg p-6 border-2" style={{ borderColor: '#073590' }}>
                    <p className="text-center font-semibold mb-2" style={{ color: '#073590' }}>
                      📞 Contact Number
                    </p>
                    <p className="text-center text-2xl font-bold" style={{ color: '#f1c933' }}>
                      +359 886 616 991
                    </p>
                    <p className="text-center text-gray-600 mt-2">
                      We are available 24/7 for your convenience
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#073590] to-[#0a4ab8] rounded-lg shadow-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              {language === 'bg' ? 'Готови да резервирате?' : 'Ready to book?'}
            </h3>
            <p className="mb-6 text-lg">
              {language === 'bg' 
                ? 'Резервирайте Вашето място сега и пътувайте със спокойствие!' 
                : 'Reserve your spot now and travel with peace of mind!'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{ backgroundColor: '#f1c933', color: '#073590' }}
              >
                {language === 'bg' ? 'Резервирайте Сега' : 'Book Now'}
              </button>
              <a
                href="tel:+359886616991"
                className="px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-white"
                style={{ color: '#073590' }}
              >
                {language === 'bg' ? 'Обадете Ни Се' : 'Call Us'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
