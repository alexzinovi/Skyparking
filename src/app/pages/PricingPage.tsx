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
      
      <div className="pt-24 md:pt-32 pb-16 px-4">{/* Added md:pt-32 for desktop to clear the taller header */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {language === 'bg' ? 'Цени за Престой' : 'Parking Prices'}
          </h1>
          
          <p className="text-center text-gray-600 mb-12 text-lg">
            {language === 'bg' 
              ? 'Прозрачни цени без скрити такси започващи от 2.80€ (5.48 лева)' 
              : 'Transparent pricing with no hidden fees'}
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Weekend Package */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-[#f1c933] transition-colors">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-3" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'Уикенд Пакет' : 'Weekend Package'}
                </h2>
                <div className="mb-4">
                  <div className="text-4xl font-bold mb-1" style={{ color: '#f1c933' }}>
                    19€
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'bg' ? '3 дни' : '3 days'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    (37.16 {language === 'bg' ? 'лв' : 'BGN'})
                  </div>
                  <div className="text-xs font-semibold mt-2" style={{ color: '#073590' }}>
                    {language === 'bg' ? '6.33€ (12.38 лв) на ден' : '6.33€ per day'}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'bg' 
                    ? 'Идеално за кратки пътувания'
                    : 'Perfect for short trips'}
                </p>
              </div>
            </div>

            {/* Weekly Package - FEATURED */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-4 relative transform md:scale-105" style={{ borderColor: '#f1c933' }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#f1c933] text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                  {language === 'bg' ? 'ПОПУЛЯРНО' : 'POPULAR'}
                </span>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold mb-3" style={{ color: '#073590' }}>
                  {language === 'bg' ? '1 Седмица' : '1 Week'}
                </h2>
                <div className="mb-4">
                  <div className="text-5xl font-bold mb-1" style={{ color: '#f1c933' }}>
                    28€
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'bg' ? '7 дни' : '7 days'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    (54.76 {language === 'bg' ? 'лв' : 'BGN'})
                  </div>
                  <div className="text-xs font-semibold mt-2" style={{ color: '#073590' }}>
                    {language === 'bg' ? '4€ (7.82 лв) на ден' : '4€ per day'}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'bg' 
                    ? 'Най-добрата цена за седмица'
                    : 'Best value for a week'}
                </p>
              </div>
            </div>

            {/* Monthly Package */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-[#f1c933] transition-colors">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-3" style={{ color: '#073590' }}>
                  {language === 'bg' ? '1 Месец' : '1 Month'}
                </h2>
                <div className="mb-4">
                  <div className="text-4xl font-bold mb-1" style={{ color: '#f1c933' }}>
                    84€
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'bg' ? '30 дни' : '30 days'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    (164.29 {language === 'bg' ? 'лв' : 'BGN'})
                  </div>
                  <div className="text-xs font-semibold mt-2" style={{ color: '#073590' }}>
                    {language === 'bg' ? '2.80€ (5.48 лв) на ден' : '2.80€ per day'}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'bg' 
                    ? 'Максимална икономия'
                    : 'Maximum savings'}
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#073590' }}>
              {language === 'bg' ? 'Включено във всички цени' : 'Included in all prices'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-1" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">{language === 'bg' ? 'Видеонаблюдение 24/7' : '24/7 video surveillance'}</span>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-1" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">{language === 'bg' ? '2 безплатни трансфера от и до летището' : '2 free transfers to and from the airport'}</span>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-1" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">{language === 'bg' ? 'Онлайн резервация' : 'Online booking'}</span>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-1" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">{language === 'bg' ? 'Без предплащане' : 'No prepayment required'}</span>
              </div>
            </div>
            <div className="mt-6 bg-yellow-50 rounded-lg p-4 border-2" style={{ borderColor: '#f1c933' }}>
              <p className="font-semibold text-center" style={{ color: '#073590' }}>
                {language === 'bg' 
                  ? 'За по-дълги периоди (повече от 1 месец) моля обадете се на +359 886 616 991'
                  : 'For longer periods (more than 1 month) please call us at +359 886 616 991'}
              </p>
            </div>
          </div>

          {/* Car Keys Service Note */}
          <div className="bg-blue-50 rounded-lg p-8 mb-8 border-2" style={{ borderColor: '#073590' }}>
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#073590' }}>
              {language === 'bg' ? 'Услуга "Ключове"' : 'Car Keys Service'}
            </h3>
            <p className="text-center text-gray-700 text-lg mb-4">
              {language === 'bg' 
                ? 'Максимално удобство - оставяте ключовете, ние паркираме вашия автомобил'
                : 'Maximum convenience - leave your keys, we park your car'}
            </p>
            <p className="text-center font-semibold" style={{ color: '#073590' }}>
              {language === 'bg' 
                ? 'За цени и повече информация, моля обадете се на:'
                : 'For pricing and more information, please call:'}
            </p>
            <p className="text-center text-2xl font-bold mt-2" style={{ color: '#f1c933' }}>
              +359 886 616 991
            </p>
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