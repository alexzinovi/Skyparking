import { Header } from "../components/Header";
import { useLanguage } from "../components/LanguageContext";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";

export function FAQPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Update document title and meta tags based on language
  useEffect(() => {
    try {
      // Set page title
      const title = language === 'bg' 
        ? 'Често задавани въпроси - SkyParking Летище София'
        : 'Frequently Asked Questions - SkyParking Sofia Airport';
      document.title = title;
      
      // Set or update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      const descriptionText = language === 'bg' 
        ? 'Отговори на най-често задаваните въпроси за паркиране в SkyParking. Информация за цени, резервации, трансфер и охрана.'
        : 'Answers to frequently asked questions about parking at SkyParking. Information about prices, reservations, transfers and security.';
      
      if (metaDescription) {
        metaDescription.setAttribute('content', descriptionText);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = descriptionText;
        document.head.appendChild(meta);
      }
      
      // Set language attribute on html element
      document.documentElement.lang = language;
    } catch (error) {
      console.error("Error updating document title and meta tags:", error);
    }
  }, [language]);

  const faqData = language === 'bg' ? [
    {
      question: "Къде се намира паркингът?",
      answer: (
        <>
          Нашият паркинг се намира в близост до летище София - само на 5 мин. от Терминал 1 и Терминал 2, на удобно и достъпно място, което осигурява лесен и бърз достъп с вашия автомобил. Може да видите точната локация, както и да използвате директно бутоните за Google Maps и Waze, в раздел{' '}
          <button 
            onClick={() => navigate('/contact')}
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            Контакти
          </button>.
        </>
      )
    },
    {
      question: "Има ли охрана и наблюдение?",
      answer: "Да, нашият паркинг разполага с 24/7 жива охрана и видеонаблюдение. Вашият автомобил ще бъде в сигурни ръце, докато сте на път."
    },
    {
      question: "Какво мога да направя ако полетът ми закъснява?",
      answer: "Ако вашият полет за отиване или връщане закъснява, няма проблем – просто се обадете или пишете във Viber, WhatsApp или e-mail за да знаем кога да ви очакваме."
    },
    {
      question: "Каква е цената на паркирането и какви са възможните пакети?",
      answer: (
        <>
          Предлагаме разнообразни ценови пакети за паркиране, които отговарят на различните нужди на нашите клиенти. За информация относно цените и наличните пакети, моля, посетете нашия уебсайт или се свържете с нас директно. За абонаменти и дългосрочно паркиране, моля обадете се на{' '}
          <a 
            href="tel:+359886616991"
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            +359 886 616 991
          </a>.
        </>
      )
    },
    {
      question: "Какви са условията за резервация и как мога да резервирам място?",
      answer: (
        <>
          За да резервирате място при нас, можете да използвате{' '}
          <button 
            onClick={() => navigate('/booking')}
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            онлайн формата
          </button>{' '}
          или да се свържете с нас на{' '}
          <a 
            href="tel:+359886616991"
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            +359 886 616 991
          </a>. Резервацията е бърза и лесна, а нашите служители ще се погрижат за подробностите и потвърждението ѝ.
        </>
      )
    },
    {
      question: "Предлагате ли трансфер до и от летището?",
      answer: "Да, предоставяме безплатен трансфер до и от летище София. Нашите автомобили осигуряват удобство и комфортно пътуване за нашите клиенти."
    },
    {
      question: "Какво трябва да направя, когато кацна обратно в София?",
      answer: (
        <>
          След като кацнете и вземете багажа си, просто трябва да се обадите на посочения телефонен номер{' '}
          <a 
            href="tel:+359886616991"
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            +359 886 616 991
          </a>{' '}
          и кажете на кой терминал сте кацнали. Наш служител ще ви посрещне с един от трансферите ни бусове. Точното местоположение на обособените места за чакане може да видите тук –{' '}
          <button 
            onClick={() => navigate('/how-it-works')}
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            Как работи
          </button>
        </>
      )
    },
    {
      question: "Кога трябва да платя?",
      answer: "Плащането се извършва на място при пристигане - можете да платите в брой или с карта. Няма нужда от предплащане."
    },
    {
      question: "Колко време преди полета си трябва да дойда на паркинга?",
      answer: "Препоръчваме ви да пристигнете при нас 3 часа преди полета за да избегнете притеснения и стрес."
    },
    {
      question: "Колко време отнема трансферът?",
      answer: "Трансферът до летище София отнема само 5 минути, до Терминал 1 и до Терминал 2, в нормален трафик. В пиковете часове може да отнеме до 15 минути. Препоръчваме ви да сте на паркинга 30 минути преди желания за ваш час на пристигане на летище София."
    },
    {
      question: "Мога ли да отменя резервацията?",
      answer: "Да, можете да отмените безплатно по всякое време, без допълнителни такси."
    }
  ] : [
    {
      question: "Where is the parking located?",
      answer: (
        <>
          Our parking is located near Sofia Airport - just 5 minutes from Terminal 1 and Terminal 2, in a convenient and accessible location that ensures easy and quick access with your car. You can see the exact location and use the Google Maps and Waze buttons directly in the{' '}
          <button 
            onClick={() => navigate('/contact')}
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            Contact
          </button>{' '}
          section.
        </>
      )
    },
    {
      question: "Is there security and surveillance?",
      answer: "Yes, our parking has 24/7 on-site security and video surveillance. Your car will be in safe hands while you're traveling."
    },
    {
      question: "What can I do if my flight is delayed?",
      answer: "If your outbound or return flight is delayed, no problem – just call or message us via Viber, WhatsApp or email so we know when to expect you."
    },
    {
      question: "What is the parking price and what packages are available?",
      answer: (
        <>
          We offer a variety of parking packages that meet the different needs of our customers. For information about prices and available packages, please visit our website or contact us directly. For subscriptions and long-term parking, please call{' '}
          <a 
            href="tel:+359886616991"
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            +359 886 616 991
          </a>.
        </>
      )
    },
    {
      question: "What are the reservation conditions and how can I book a spot?",
      answer: (
        <>
          To reserve a spot with us, you can use the{' '}
          <button 
            onClick={() => navigate('/booking')}
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            online form
          </button>{' '}
          or contact us at{' '}
          <a 
            href="tel:+359886616991"
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            +359 886 616 991
          </a>. Booking is quick and easy, and our staff will take care of the details and confirmation.
        </>
      )
    },
    {
      question: "Do you offer transfer to and from the airport?",
      answer: "Yes, we provide free transfer to and from Sofia Airport. Our vehicles ensure convenience and comfortable travel for our customers."
    },
    {
      question: "What should I do when I land back in Sofia?",
      answer: (
        <>
          After you land and collect your luggage, simply call the specified phone number{' '}
          <a 
            href="tel:+359886616991"
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            +359 886 616 991
          </a>{' '}
          and tell us which terminal you landed at. Our staff member will meet you with one of our transfer buses. You can see the exact location of the designated waiting areas here –{' '}
          <button 
            onClick={() => navigate('/how-it-works')}
            className="text-[#f1c933] hover:text-[#d4af2a] font-semibold underline"
          >
            How it Works
          </button>
        </>
      )
    },
    {
      question: "When do I need to pay?",
      answer: "Payment is made on-site upon arrival - you can pay in cash or by card. No prepayment needed."
    },
    {
      question: "How long before my flight should I arrive at the parking?",
      answer: "We recommend you arrive at our parking 3 hours before your flight to avoid worries and stress."
    },
    {
      question: "How long does the transfer take?",
      answer: "The transfer to Sofia Airport takes only 5 minutes to Terminal 1 and Terminal 2 in normal traffic. During peak hours it may take up to 15 minutes. We recommend you arrive at the parking 30 minutes before your desired arrival time at Sofia Airport."
    },
    {
      question: "Can I cancel my reservation?",
      answer: "Yes, you can cancel for free at any time, without additional fees."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="pt-24 md:pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#073590' }}>
            {language === 'bg' ? 'Често задавани въпроси' : 'Frequently Asked Questions'}
          </h1>
          
          <p className="text-center text-gray-600 mb-12 text-lg">
            {language === 'bg' 
              ? 'Отговори на най-често задаваните въпроси за паркиране в SkyParking'
              : 'Answers to the most frequently asked questions about parking at SkyParking'}
          </p>
          
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all hover:shadow-lg"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-[#073590] pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown 
                    className={`flex-shrink-0 w-5 h-5 text-[#f1c933] transition-transform duration-200 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-200 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-[#073590] rounded-xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">
              {language === 'bg' ? 'Все още имате въпроси?' : 'Still have questions?'}
            </h3>
            <p className="text-white/90 mb-6">
              {language === 'bg' 
                ? 'Не се колебайте да се свържете с нас - ще се радваме да ви помогнем!'
                : "Don't hesitate to contact us - we'll be happy to help!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:+359886616991"
                className="bg-[#f1c933] text-[#1a1a2e] px-6 py-3 rounded-full font-semibold hover:bg-[#d4af2a] transition-colors flex items-center gap-2"
              >
                <span>📞</span>
                <span>+359 886 616 991</span>
              </a>
              <button
                onClick={() => navigate('/contact')}
                className="bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors border border-white/30"
              >
                {language === 'bg' ? 'Към Контакти' : 'Go to Contact'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-12 bg-[#073590]">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-2 text-2xl font-bold">{t("heroTitle")}</h3>
          <p className="text-gray-300 mb-6">
            {t("footerTagline")}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm text-gray-300">
            <span>{t("footerLocation")}</span>
            <span className="hidden sm:inline">•</span>
            <span>📞 <a href="tel:+359886616991" className="hover:underline">+359 886 616 991</a></span>
            <span className="hidden sm:inline">•</span>
            <span>✉️ <a href="mailto:info@skyparking.bg" className="hover:underline">info@skyparking.bg</a></span>
          </div>
          
          {/* Social Media and Messaging Buttons */}
          <div className="flex gap-4 justify-center items-center mt-6">
            <a
              href="viber://chat?number=%2B359886616991"
              onClick={(e) => {
                // Fallback for desktop - open in new tab with viber public account link
                if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                  e.preventDefault();
                  window.open('https://invite.viber.com/?g2=AQBf3RxYEuuFaKrb%2BUXLQwLh3kOwxYCYXhV6hWtS0XNx1RDV0Lhk9oXx9KFRm9aT', '_blank');
                }
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#7360f2] hover:bg-[#5a4bc9] p-3 rounded-full transition-colors flex items-center justify-center"
              aria-label="Viber"
            >
              <img 
                src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/viberlogo.png" 
                alt="Viber" 
                className="w-7 h-7"
                style={{ mixBlendMode: 'multiply' }}
              />
            </a>
            
            <a
              href="https://wa.me/359886616991"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1da851] p-3 rounded-full transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
            
            <a
              href="https://www.facebook.com/share/1AvUJmhjvq/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1877f2] hover:bg-[#0c63d4] p-3 rounded-full transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            
            <a
              href="https://www.instagram.com/skyparking.bg?igsh=ZGEyc2F3MTc5azZ5&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-90 p-3 rounded-full transition-opacity"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
            </a>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400">
            {t("footerRights")}
          </div>
        </div>
      </footer>
    </div>
  );
}