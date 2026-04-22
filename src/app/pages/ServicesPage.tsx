import { Header } from "../components/Header";
import { useLanguage } from "../components/LanguageContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Shield, Clock, Car, MapPin, CreditCard, CheckCircle, Fuel, BatteryCharging, CircleDot, Key, XCircle, Droplets } from "lucide-react";

export function ServicesPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Update document title
  useEffect(() => {
    document.title = t('servicesPageTitle');
  }, [language, t]);

  const services = [
    {
      icon: Shield,
      titleKey: 'serviceSecureTitle',
      descKey: 'serviceSecureDesc',
    },
    {
      icon: Car,
      titleKey: 'serviceTransferTitle',
      descKey: 'serviceTransferDesc',
    },
    {
      icon: Clock,
      titleKey: 'service247Title',
      descKey: 'service247Desc',
    },
    {
      icon: MapPin,
      titleKey: 'serviceLocationTitle',
      descKey: 'serviceLocationDesc',
    },
    {
      icon: CreditCard,
      titleKey: 'servicePaymentTitle',
      descKey: 'servicePaymentDesc',
    },
    {
      icon: CheckCircle,
      titleKey: 'serviceOnlineTitle',
      descKey: 'serviceOnlineDesc',
    },
  ];

  const additionalBenefits = [
    {
      icon: XCircle,
      titleKey: 'benefitCancelTitle',
      descKey: 'benefitCancelDesc',
    },
    {
      icon: Droplets,
      titleKey: 'benefitWashTitle',
      descKey: 'benefitWashDesc',
    },
    {
      icon: Fuel,
      titleKey: 'benefitFuelTitle',
      descKey: 'benefitFuelDesc',
    },
    {
      icon: BatteryCharging,
      titleKey: 'benefitBatteryTitle',
      descKey: 'benefitBatteryDesc',
    },
    {
      icon: CircleDot,
      titleKey: 'benefitTireTitle',
      descKey: 'benefitTireDesc',
    },
    {
      icon: Key,
      titleKey: 'benefitKeyTitle',
      descKey: 'benefitKeyDesc',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-24 md:pt-32 pb-16 px-4">{/* Added md:pt-32 for desktop to clear the taller header */}
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {t('servicesTitle')}
          </h1>

          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto text-[16px]">
            {t('servicesSubtitle')}
          </p>

          {/* Main Services Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f1c933' }}>
                  <service.icon className="w-8 h-8" style={{ color: '#073590' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#073590' }}>
                  {t(service.titleKey)}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t(service.descKey)}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Benefits */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#073590' }}>
              {t('additionalBenefitsTitle')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {additionalBenefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f1c933' }}>
                    <benefit.icon className="w-8 h-8" style={{ color: '#073590' }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#073590' }}>
                    {t(benefit.titleKey)}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t(benefit.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 rounded-lg font-semibold text-white text-lg shadow-lg hover:shadow-xl transition-shadow"
              style={{ backgroundColor: '#073590' }}
            >
              {t('servicesBookNow')}
            </button>
            <p className="text-gray-600 mt-4">
              {t('servicesBookOnline')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
