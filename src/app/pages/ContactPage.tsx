import { Header } from "../components/Header";
import { useLanguage } from "../components/LanguageContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function ContactPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Update document title
  useEffect(() => {
    document.title = language === 'bg' ? 'Контакти - SkyParking' : 'Contact - SkyParking';
  }, [language]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {language === 'bg' ? 'Свържете се с Нас' : 'Contact Us'}
          </h1>
          
          <p className="text-center text-gray-600 mb-12 text-lg">
            {language === 'bg' 
              ? 'Тук сме, за да отговорим на всичките ви въпроси' 
              : 'We\'re here to answer all your questions'}
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'Информация за Контакт' : 'Contact Information'}
                </h2>

                <div className="space-y-6">
                  {/* Phone */}
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f1c933' }}>
                      <Phone className="w-6 h-6" style={{ color: '#073590' }} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg mb-1">{language === 'bg' ? 'Телефон' : 'Phone'}</h3>
                      <a href="tel:+359878123456" className="text-blue-600 hover:underline text-lg">
                        +359 878 123 456
                      </a>
                      <p className="text-sm text-gray-600 mt-1">
                        {language === 'bg' ? 'За спешни случаи 24/7' : 'For emergencies 24/7'}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f1c933' }}>
                      <Mail className="w-6 h-6" style={{ color: '#073590' }} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg mb-1">{language === 'bg' ? 'Имейл' : 'Email'}</h3>
                      <a href="mailto:info@skyparking.bg" className="text-blue-600 hover:underline">
                        info@skyparking.bg
                      </a>
                      <p className="text-sm text-gray-600 mt-1">
                        {language === 'bg' ? 'Отговаряме в рамките на 2 часа' : 'We respond within 2 hours'}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f1c933' }}>
                      <MapPin className="w-6 h-6" style={{ color: '#073590' }} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg mb-1">{language === 'bg' ? 'Адрес' : 'Address'}</h3>
                      <p className="text-gray-700">
                        {language === 'bg' 
                          ? 'София, близо до Терминал 1 и 2'
                          : 'Sofia, near Terminal 1 and 2'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {language === 'bg' ? '5 минути от летището' : '5 minutes from airport'}
                      </p>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f1c933' }}>
                      <Clock className="w-6 h-6" style={{ color: '#073590' }} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg mb-1">{language === 'bg' ? 'Работно Време' : 'Working Hours'}</h3>
                      <p className="text-gray-700 font-semibold">
                        {language === 'bg' ? 'Денонощно' : '24/7'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {language === 'bg' ? 'Винаги на ваше разположение' : 'Always at your service'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact / Map */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'Бърз Контакт' : 'Quick Contact'}
                </h2>
                
                <div className="space-y-4">
                  <p className="text-gray-700">
                    {language === 'bg'
                      ? 'За най-бърза резервация, моля използвайте нашата онлайн форма или ни се обадете директно.'
                      : 'For fastest booking, please use our online form or call us directly.'}
                  </p>

                  <div className="bg-yellow-50 border-2 rounded-lg p-6" style={{ borderColor: '#f1c933' }}>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: '#073590' }}>
                      {language === 'bg' ? 'Имате въпроси?' : 'Have questions?'}
                    </h3>
                    <p className="text-gray-700 mb-4">
                      {language === 'bg'
                        ? 'Нашият екип е на разположение денонощно, за да ви помогне с всичко свързано с вашата резервация.'
                        : 'Our team is available 24/7 to help you with anything related to your booking.'}
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                      style={{ backgroundColor: '#073590' }}
                    >
                      {language === 'bg' ? 'Резервирайте Онлайн' : 'Book Online'}
                    </button>
                  </div>

                  {/* Social / Additional Info */}
                  <div className="bg-blue-50 border-2 rounded-lg p-6" style={{ borderColor: '#073590' }}>
                    <h3 className="font-semibold text-lg mb-3" style={{ color: '#073590' }}>
                      {language === 'bg' ? 'Защо SkyParking?' : 'Why SkyParking?'}
                    </h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>✓ {language === 'bg' ? 'Гарантирана сигурност' : 'Guaranteed security'}</li>
                      <li>✓ {language === 'bg' ? 'Безплатен трансфер' : 'Free transfer'}</li>
                      <li>✓ {language === 'bg' ? 'Онлайн резервация' : 'Online booking'}</li>
                      <li>✓ {language === 'bg' ? 'Конкурентни цени' : 'Competitive prices'}</li>
                      <li>✓ {language === 'bg' ? '24/7 поддръжка' : '24/7 support'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#073590' }}>
              {language === 'bg' ? 'Нашето Местоположение' : 'Our Location'}
            </h2>
            <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2933.0!2d23.4!3d42.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDQyJzAwLjAiTiAyM8KwMjQnMDAuMCJF!5e0!3m2!1sen!2sbg!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-center text-gray-600 mt-4">
              {language === 'bg'
                ? 'Точната локация ще получите след потвърждаване на резервацията'
                : 'Exact location will be provided after booking confirmation'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
