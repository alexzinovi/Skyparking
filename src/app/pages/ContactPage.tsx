import { Header } from "../components/Header";
import { useLanguage } from "../components/LanguageContext";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function ContactPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Update document title
  useEffect(() => {
    document.title = language === 'bg' ? 'Контакти - SkyParking' : 'Contact - SkyParking';
  }, [language]);

  const handleGoogleMaps = () => {
    window.open("https://www.google.com/maps/dir/?api=1&destination=Ulitsa+Nedelcho+Bonchev+30,Sofia,Bulgaria", "_blank");
  };

  const handleWaze = () => {
    window.open("https://waze.com/ul?q=Ulitsa+Nedelcho+Bonchev+30,Sofia,Bulgaria&navigate=yes", "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/contact/inquiry`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ...formData,
            language
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 md:pt-32 pb-16 px-4">{/* Added md:pt-32 for desktop to clear the taller header */}
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {language === 'bg' ? 'Свържете се с Нас' : 'Contact Us'}
          </h1>
          
          <p className="text-center text-gray-600 mb-12 text-lg">
            {language === 'bg' 
              ? 'Тук сме, за да отговорим на всичките ви въпроси' 
              : 'We\'re here to answer all your questions'}
          </p>

          {/* Contact Information */}
          <div className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#073590' }}>
                {language === 'bg' ? 'Информация за Контакт' : 'Contact Information'}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Phone */}
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f1c933' }}>
                    <Phone className="w-6 h-6" style={{ color: '#073590' }} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg mb-1">{language === 'bg' ? 'Телефон' : 'Phone'}</h3>
                    <a href="tel:+359886616991" className="text-blue-600 hover:underline text-lg">
                      +359 886 616 991
                    </a>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'bg' ? 'На разположение сме 24/7' : 'For emergencies 24/7'}
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
                        ? 'Улица Неделчо Бончев 30'
                        : 'Ulitsa Nedelcho Bonchev 30'}
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

          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#073590' }}>
              {language === 'bg' ? 'Нашето Местоположение' : 'Our Location'}
            </h2>
            <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2932.8657!2d23.399816!3d42.677054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDQwJzM3LjQiTiAyM8KwMjMnNTkuMyJF!5e0!3m2!1sen!2sbg!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            
            
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <Button 
                onClick={handleGoogleMaps}
                size="lg"
                className="bg-[#f1c933] hover:bg-[#f1c933]/90 text-[#073590] font-semibold"
              >
                <img 
                  src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/google-map-icon.png" 
                  alt="Google Maps" 
                  className="mr-2 h-5 w-5"
                />
                {t("googleMaps")}
              </Button>
              <Button 
                onClick={handleWaze}
                size="lg"
                className="bg-[#073590] hover:bg-[#073590]/90 text-white font-semibold"
              >
                <img 
                  src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/waze-icon.png" 
                  alt="Waze" 
                  className="mr-2 h-5 w-5"
                />
                {t("waze")}
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#073590' }}>
                {language === 'bg' ? 'Форма за Контакт' : 'Contact Form'}
              </h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">
                    {language === 'bg' 
                      ? '✅ Съобщението ви беше изпратено успешно! Ще се свържем с вас скоро.' 
                      : '✅ Your message was sent successfully! We will contact you soon.'}
                  </p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">
                    {errorMessage || (language === 'bg' 
                      ? '❌ Възникна грешка. Моля, опитайте отново.' 
                      : '❌ An error occurred. Please try again.')}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'bg' ? 'Име и Фамилия' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'bg' ? 'Телефон' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'bg' ? 'Имейл' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'bg' ? 'Тема' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'bg' ? 'Съобщение' : 'Message'}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={5}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ backgroundColor: '#073590' }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {language === 'bg' ? 'Изпраща се...' : 'Sending...'}
                    </>
                  ) : (
                    language === 'bg' ? 'Изпрати' : 'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}