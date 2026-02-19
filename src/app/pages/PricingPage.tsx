import { Header } from "../components/Header";
import { useLanguage } from "../components/LanguageContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export function PricingPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Update document title
  useEffect(() => {
    document.title = language === 'bg' ? 'Цени - SkyParking' : 'Prices - SkyParking';
  }, [language]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {language === 'bg' ? 'Цени за Паркиране' : 'Parking Prices'}
          </h1>
          
          <p className="text-center text-gray-600 mb-12 text-lg">
            {language === 'bg' 
              ? 'Прозрачни цени без скрити такси' 
              : 'Transparent pricing with no hidden fees'}
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Regular Parking */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#073590' }}>
                {language === 'bg' ? 'Стандартен Паркинг' : 'Standard Parking'}
              </h2>
              <div className="mb-6">
                <div className="text-5xl font-bold mb-2" style={{ color: '#f1c933' }}>
                  4€
                </div>
                <div className="text-gray-600">
                  {language === 'bg' ? 'на ден (7.82 лв)' : 'per day (7.82 BGN)'}
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{language === 'bg' ? 'Видеонаблюдение 24/7' : '24/7 video surveillance'}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{language === 'bg' ? 'Безплатен трансфер до летището' : 'Free airport transfer'}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{language === 'bg' ? 'Охранявана территория' : 'Secured premises'}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{language === 'bg' ? 'Онлайн резервация' : 'Online booking'}</span>
                </li>
              </ul>
            </div>

            {/* Car Keys Service */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2" style={{ borderColor: '#f1c933' }}>
              <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: '#f1c933', color: '#073590' }}>
                {language === 'bg' ? 'ПОПУЛЯРНО' : 'POPULAR'}
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#073590' }}>
                {language === 'bg' ? 'Услуга "Ключове"' : 'Car Keys Service'}
              </h2>
              <div className="mb-6">
                <div className="text-5xl font-bold mb-2" style={{ color: '#f1c933' }}>
                  5€
                </div>
                <div className="text-gray-600">
                  {language === 'bg' ? 'на ден (9.78 лв)' : 'per day (9.78 BGN)'}
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{language === 'bg' ? 'Всички предимства на стандартния паркинг' : 'All standard parking benefits'}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{language === 'bg' ? 'Оставяте ключовете - ние паркираме' : 'Leave keys - we park for you'}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{language === 'bg' ? 'Оптимизирано използване на пространството' : 'Optimized space usage'}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{language === 'bg' ? 'Готов автомобил при прибиране' : 'Car ready upon return'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 rounded-lg p-8 mb-8 border-2" style={{ borderColor: '#073590' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#073590' }}>
              {language === 'bg' ? 'Важна Информация' : 'Important Information'}
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• {language === 'bg' ? 'Плащане на място при пристигане' : 'Payment on arrival in cash or card'}</li>
              <li>• {language === 'bg' ? 'Безплатна отмяна до 24 часа преди резервацията' : 'Free cancellation up to 24 hours before reservation'}</li>
              <li>• {language === 'bg' ? 'Трансфер до летището: 5 минути' : 'Transfer to airport: 5 minutes'}</li>
              <li>• {language === 'bg' ? 'Отстъпки за по-дълги периоди' : 'Discounts for longer periods available'}</li>
              <li>• {language === 'bg' ? 'Фиксиран курс: 1 EUR = 1.95583 BGN' : 'Fixed rate: 1 EUR = 1.95583 BGN'}</li>
            </ul>
          </div>

          {/* CTA Button */}
          <div className="text-center">
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
