import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Card } from "./ui/card";
import { useState, useRef, useEffect } from "react";

interface Review {
  id: number;
  name: string;
  nameBg: string;
  location: string;
  locationBg: string;
  rating: number;
  text: string;
  textBg: string;
  date: string;
  dateBg: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Maria Petrova",
    nameBg: "Мария Петрова",
    location: "Sofia, Bulgaria",
    locationBg: "София, България",
    rating: 5,
    text: "Excellent service! The shuttle was quick and the parking lot is very secure. I felt safe leaving my car there for a week.",
    textBg: "Отлично обслужване! Шатълът беше бърз и паркингът е много сигурен. Чувствах се спокойна, че оставям колата си там за седмица.",
    date: "January 2025",
    dateBg: "Януари 2025"
  },
  {
    id: 3,
    name: "Elena Dimitrova",
    nameBg: "Елена Димитрова",
    location: "Plovdiv, Bulgaria",
    locationBg: "Пловдив, България",
    rating: 5,
    text: "Very convenient and reliable. The free shuttle service is a great bonus. My car was exactly where I left it, clean and safe!",
    textBg: "Много удобно и надеждно. Безплатният трансфер е чудесен бонус. Колата ми беше точно там където я оставих, чиста и в безопасност!",
    date: "December 2024",
    dateBg: "Декември 2024"
  },
  {
    id: 4,
    name: "Stefan Ivanov",
    nameBg: "Стефан Иванов",
    location: "Varna, Bulgaria",
    locationBg: "Варна, България",
    rating: 5,
    text: "Used SkyParking for my business trip. Everything was smooth - from booking to pick-up. Will definitely use again!",
    textBg: "Използвах SkyParking за моето бизнес пътуване. Всичко беше гладко - от резервацията до вземането. Определено ще ползвам отново!",
    date: "January 2025",
    dateBg: "Януари 2025"
  },
  {
    id: 6,
    name: "Georgi Todorov",
    nameBg: "Георги Тодоров",
    location: "Sofia, Bulgaria",
    locationBg: "София, България",
    rating: 5,
    text: "Great value for money! Much cheaper than airport parking and just as convenient. 24/7 surveillance gives peace of mind.",
    textBg: "Чудесно съотношение цена-качество! Много по-евтино от летищния паркинг и също толкова удобно. 24/7 наблюдението дава спокойствие.",
    date: "January 2025",
    dateBg: "Януари 2025"
  }
];

export function Reviews() {
  const { language, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const reviewsPerPage = 3;
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const nextReview = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next >= reviews.length ? 0 : next;
    });
  };

  const prevReview = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return reviews.length - 1;
      }
      return prev - 1;
    });
  };

  // Create looped array for infinite effect
  const extendedReviews = [...reviews, ...reviews, ...reviews];
  const visibleReviews = extendedReviews.slice(
    currentIndex + reviews.length, 
    currentIndex + reviews.length + reviewsPerPage
  );

  // Create triple array for infinite loop effect
  const loopedReviews = [...reviews, ...reviews, ...reviews];

  // Handle mobile scroll for tracking current review and looping
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Start at the middle set of reviews
    const initialScroll = (scrollContainer.scrollWidth / 3);
    scrollContainer.scrollLeft = initialScroll;

    const handleScroll = () => {
      if (isScrollingRef.current) return;
      
      const scrollLeft = scrollContainer.scrollLeft;
      const itemWidth = scrollContainer.scrollWidth / loopedReviews.length;
      const currentScrollIndex = Math.round(scrollLeft / itemWidth);
      
      // Calculate actual review index (mod reviews.length)
      const actualIndex = currentScrollIndex % reviews.length;
      setMobileIndex(actualIndex);

      // Reset scroll position when reaching boundaries for infinite loop
      const reviewsLength = reviews.length;
      if (currentScrollIndex < reviewsLength * 0.5) {
        // Near start, jump to middle set
        isScrollingRef.current = true;
        scrollContainer.scrollLeft = scrollLeft + (itemWidth * reviewsLength);
        setTimeout(() => { isScrollingRef.current = false; }, 50);
      } else if (currentScrollIndex >= reviewsLength * 2.5) {
        // Near end, jump to middle set
        isScrollingRef.current = true;
        scrollContainer.scrollLeft = scrollLeft - (itemWidth * reviewsLength);
        setTimeout(() => { isScrollingRef.current = false; }, 50);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [loopedReviews.length]);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1a1a2e] mb-4">
            {language === "bg" ? "Какво Казват Нашите Клиенти" : "What Our Customers Say"}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {language === "bg" 
              ? "Хиляди доволни клиенти се доверяват на нас за своето паркиране"
              : "Thousands of satisfied customers trust us with their parking"}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 fill-[#ffd700] text-[#ffd700]" />
              ))}
            </div>
            <span className="text-xl font-bold text-gray-700">5.0</span>
          </div>
        </div>

        <div className="relative">
          {/* Desktop: Left Arrow */}
          <button
            onClick={prevReview}
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-[#f1c933] hover:bg-[#f5d54a] text-[#1a1a2e] rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Desktop Reviews Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 px-8">
            {visibleReviews.map((review) => (
              <Card key={review.id} className="p-6 hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-[#ffd700]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#ffd700] flex items-center justify-center text-white font-bold text-lg">
                    {(language === "bg" ? review.nameBg : review.name).charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1a1a2e]">
                      {language === "bg" ? review.nameBg : review.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {language === "bg" ? review.locationBg : review.location}
                    </p>
                  </div>
                </div>

                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#ffd700] text-[#ffd700]" />
                  ))}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{language === "bg" ? review.textBg : review.text}"
                </p>

                <p className="text-sm text-gray-400">
                  {language === "bg" ? review.dateBg : review.date}
                </p>
              </Card>
            ))}
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div 
            ref={scrollRef}
            className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 px-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {loopedReviews.map((review, index) => (
              <div key={`review-${index}`} className="snap-center flex-shrink-0 w-full">
                <Card className="p-6 border-2 border-transparent">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#ffd700] flex items-center justify-center text-white font-bold text-lg">
                      {(language === "bg" ? review.nameBg : review.name).charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1a1a2e]">
                        {language === "bg" ? review.nameBg : review.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {language === "bg" ? review.locationBg : review.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#ffd700] text-[#ffd700]" />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    "{language === "bg" ? review.textBg : review.text}"
                  </p>

                  <p className="text-sm text-gray-400">
                    {language === "bg" ? review.dateBg : review.date}
                  </p>
                </Card>
              </div>
            ))}
          </div>

          {/* Mobile: Dot Indicators */}
          <div className="md:hidden flex justify-center gap-2 mt-6">
            {reviews.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === mobileIndex ? 'bg-[#f1c933] w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Desktop: Right Arrow */}
          <button
            onClick={nextReview}
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-[#f1c933] hover:bg-[#f5d54a] text-[#1a1a2e] rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Next reviews"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}