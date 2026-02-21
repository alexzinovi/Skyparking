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
            {language === 'bg' ? 'Цени за Паркиране' : 'Parking Prices'}
          </h1>
          
          <p className="text-center text-gray-600 mb-12 text-lg">
            {language === 'bg' 
              ? 'Прозрачни цени без скрити такси' 
              : 'Transparent pricing with no hidden fees'}
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-1 gap-8 mb-12 max-w-2xl mx-auto">
            {/* Regular Parking */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#073590' }}>
                {language === 'bg' ? 'Стандартен Паркинг' : 'Standard Parking'}
              </h2>
              <div className="mb-6">
                <div className="text-5xl font-bold mb-2" style={{ color: '#f1c933' }}>
                  {language === 'bg' ? 'от ' : 'from '}2.80€
                </div>
                <div className="text-gray-600">
                  {language === 'bg' ? 'на ден (от 5.48 лв)' : 'per day (from 5.48 BGN)'}
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
                  <span>{language === 'bg' ? 'Онлайн резервация' : 'Online booking'}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#f1c933' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{language === 'bg' ? 'Без предплащане' : 'No prepayment required'}</span>
                </li>
              </ul>
              <div className="bg-yellow-50 rounded-lg p-4 border-2" style={{ borderColor: '#f1c933' }}>
                <p className="font-semibold text-center text-[13px]" style={{ color: '#073590' }}>
                  {language === 'bg' 
                    ? 'За по-дълги периоди (3 седмици и повече) моля обадете се на +359 886 616 991'
                    : 'For longer periods (3 weeks and above) please call us at +359 886 616 991'}
                </p>
              </div>
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