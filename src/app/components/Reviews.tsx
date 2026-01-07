import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Card } from "./ui/card";
import { useState } from "react";

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
    id: 2,
    name: "John Anderson",
    nameBg: "Джон Андерсън",
    location: "London, UK",
    locationBg: "Лондон, Великобритания",
    rating: 5,
    text: "Best parking option near Sofia Airport! Professional staff, easy booking process, and great prices. Highly recommend!",
    textBg: "Най-добрата опция за паркинг близо до Летище София! Професионален персонал, лесен процес на резервация и чудесни цени. Горещо препоръчвам!",
    date: "December 2024",
    dateBg: "Декември 2024"
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
    id: 5,
    name: "Anna Schmidt",
    nameBg: "Ана Шмит",
    location: "Munich, Germany",
    locationBg: "Мюнхен, Германия",
    rating: 5,
    text: "Perfect location and service! Staff was very friendly and helpful. The shuttle runs frequently which is very convenient.",
    textBg: "Перфектна локация и обслужване! Персоналът беше много приветлив и полезен. Шатълът курсира често, което е много удобно.",
    date: "November 2024",
    dateBg: "Ноември 2024"
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
  const reviewsPerPage = 3;

  const nextReview = () => {
    setCurrentIndex((prev) => 
      prev + reviewsPerPage >= reviews.length ? 0 : prev + reviewsPerPage
    );
  };

  const prevReview = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, reviews.length - reviewsPerPage) : Math.max(0, prev - reviewsPerPage)
    );
  };

  const visibleReviews = reviews.slice(currentIndex, currentIndex + reviewsPerPage);

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
            <span className="text-2xl font-bold text-[#1a1a2e]">5.0</span>
            <span className="text-gray-600">
              {language === "bg" ? "(500+ отзива)" : "(500+ reviews)"}
            </span>
          </div>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-[#ffd700] hover:bg-[#ffed4e] text-[#1a1a2e] rounded-full p-3 shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
            aria-label="Previous reviews"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-6 px-8">
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

          {/* Right Arrow */}
          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-[#ffd700] hover:bg-[#ffed4e] text-[#1a1a2e] rounded-full p-3 shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex + reviewsPerPage >= reviews.length}
            aria-label="Next reviews"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}