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
    name: "Yana Markova",
    nameBg: "Яна Маркова",
    location: "Google Review",
    locationBg: "Google Отзив",
    rating: 5,
    text: "Great place! I recommend it - easy and convenient location, includes two free transfers which were extremely punctual! Safe and well-lit place!",
    textBg: "Супер място! Препоръчвам лесно и удобно като локация, включва два безплатни трансфера, които бяха изключително точни на време! Безопасно и осветено място !",
    date: "March 2026",
    dateBg: "Март 2026"
  },
  {
    id: 2,
    name: "Milena Ilieva",
    nameBg: "Милена Илиева",
    location: "Google Review",
    locationBg: "Google Отзив",
    rating: 5,
    text: "Excellent value for money! Fast and free transfers! Highly recommend!",
    textBg: "Чудесно съотношение цена-качество! Бързи и безплатни трансфери! Искрено препоръчвам!",
    date: "February 2026",
    dateBg: "Февруари 2026"
  },
  {
    id: 3,
    name: "Stanislav Stavrev",
    nameBg: "Станислав Ставрев",
    location: "Google Review",
    locationBg: "Google Отзив",
    rating: 5,
    text: "Absolutely amazing customer service !!! I was about to miss my flight, but the transport driver managed to save my vacation. Thank you!",
    textBg: "Абсолютно невероятно обслужване на клиенти!!! Щях да изпусна полета си, но шофьорът на трансфера успя да спаси ваканцията ми. Благодаря!",
    date: "March 2026",
    dateBg: "Март 2026"
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
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-3">
            {language === "bg" 
              ? "Хиляди доволни клиенти се доверяват на нас за своето паркиране"
              : "Thousands of satisfied customers trust us with their parking"}
          </p>
          
          {/* Google Reviews Badge */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            <span className="text-sm font-semibold" style={{ color: '#073590' }}>
              {language === "bg" ? "Google Отзиви" : "Google Reviews"}
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-2">
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
              <Card key={review.id} className="p-6 hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-[#ffd700] relative">
                {/* Google Badge on Card */}
                <div className="absolute top-4 right-4">
                  <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                    <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                    <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                    <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                  </svg>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#f1c933] flex items-center justify-center font-bold text-lg" style={{ color: '#073590' }}>
                    {(language === "bg" ? review.nameBg : review.name).charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: '#073590' }}>
                      {language === "bg" ? review.nameBg : review.name}
                    </h3>
                    <p className="text-xs text-gray-500">
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
                <Card className="p-6 border-2 border-transparent relative">
                  {/* Google Badge on Card */}
                  <div className="absolute top-4 right-4">
                    <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                      <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                    </svg>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#f1c933] flex items-center justify-center font-bold text-lg" style={{ color: '#073590' }}>
                      {(language === "bg" ? review.nameBg : review.name).charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#073590' }}>
                        {language === "bg" ? review.nameBg : review.name}
                      </h3>
                      <p className="text-xs text-gray-500">
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
        
        {/* View All on Google Button */}
        <div className="text-center mt-10">
          <a
            href="https://share.google/vmafBFlebQvN85aRH"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            style={{ backgroundColor: '#073590' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            <span>
              {language === "bg" ? "Виж всички отзиви в Google" : "View all reviews on Google"}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}