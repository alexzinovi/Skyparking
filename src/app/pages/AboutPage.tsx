import { Header } from "../components/Header";
import { useLanguage } from "../components/LanguageContext";
import { useEffect } from "react";

export function AboutPage() {
  const { t, language } = useLanguage();

  // Update document title
  useEffect(() => {
    document.title = t('aboutPageTitle');
  }, [language, t]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-24 md:pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {t('aboutTitle')}
          </h1>

          <p className="text-center text-gray-600 mb-12 text-lg">
            {t('aboutSubtitle')}
          </p>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#073590' }}>
                {t('aboutWelcomeTitle')}
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {t('aboutWelcomeText')}
              </p>

              <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                {t('aboutMissionTitle')}
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {t('aboutMissionText')}
              </p>

              <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                {t('aboutWhyUsTitle')}
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                  <span className="text-gray-700">
                    <strong>{t('aboutBenefitSecurity')}</strong> {t('aboutBenefitSecurityDesc')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                  <span className="text-gray-700">
                    <strong>{t('aboutBenefitConvenience')}</strong> {t('aboutBenefitConvenienceDesc')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                  <span className="text-gray-700">
                    <strong>{t('aboutBenefitFlexibility')}</strong> {t('aboutBenefitFlexibilityDesc')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                  <span className="text-gray-700">
                    <strong>{t('aboutBenefitAffordability')}</strong> {t('aboutBenefitAffordabilityDesc')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>✓</span>
                  <span className="text-gray-700">
                    <strong>{t('aboutBenefitProfessionalism')}</strong> {t('aboutBenefitProfessionalismDesc')}
                  </span>
                </li>
              </ul>

              <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                {t('aboutServicesTitle')}
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {t('aboutServicesIntro')}
              </p>
              <ul className="space-y-2 mb-6 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                  {t('aboutService1')}
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                  {t('aboutService2')}
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                  {t('aboutService3')}
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                  {t('aboutService4')}
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1" style={{ color: '#f1c933' }}>•</span>
                  {t('aboutService5')}
                </li>
              </ul>

              <h3 className="text-xl font-bold mb-3 mt-8" style={{ color: '#073590' }}>
                {t('aboutContactTitle')}
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {t('aboutContactIntro')}
              </p>
              <div className="bg-blue-50 rounded-lg p-6 border-2" style={{ borderColor: '#073590' }}>
                <p className="text-center font-semibold mb-2" style={{ color: '#073590' }}>
                  {t('aboutContactLabel')}
                </p>
                <p className="text-center text-2xl font-bold" style={{ color: '#f1c933' }}>
                  +359 886 616 991
                </p>
                <p className="text-center text-gray-600 mt-2">
                  {t('aboutAvailable247')}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#073590] to-[#0a4ab8] rounded-lg shadow-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              {t('aboutReadyToBook')}
            </h3>
            <p className="mb-6 text-lg">
              {t('aboutBookNowDesc')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{ backgroundColor: '#f1c933', color: '#073590' }}
              >
                {t('aboutBookNowBtn')}
              </button>
              <a
                href="tel:+359886616991"
                className="px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-white"
                style={{ color: '#073590' }}
              >
                {t('aboutCallUsBtn')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
