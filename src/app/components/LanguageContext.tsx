import { createContext, useContext, useState, ReactNode } from "react";

type Language = "bg" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  bg: {
    // Hero Section
    heroTitle: "SkyParking - София Аеропорт",
    heroSubtitle: "Сигурен и достъпен паркинг на минути от Летище София. Резервирайте сега и пътувайте със спокойствие.",
    bookNow: "Резервирай сега",
    callButton: "Обади се +359 888 123 456",
    
    // Features
    whyChooseUs: "Защо да изберете нас?",
    whyChooseUsDesc: "Предлагаме най-надеждното и удобно решение за паркиране за пътници от Летище София",
    secureParking: "Сигурен паркинг",
    secureParkingDesc: "24/7 видеонаблюдение и охрана на вашия автомобил",
    flexibleHours: "Гъвкави часове",
    flexibleHoursDesc: "Оставяне и вземане по всяко време, денонощно",
    airportShuttle: "Трансфер до летището",
    airportShuttleDesc: "Безплатен трансфер от и до терминала",
    allVehicles: "Всички превозни средства",
    allVehiclesDesc: "Приемаме автомобили, ванове и джипове",
    
    // Booking Form
    bookYourParking: "Резервирайте вашия паркинг",
    fillDetails: "Попълнете данните по-долу и осигурете вашето място за паркиране",
    arrivalDate: "Дата на пристигане",
    arrivalTime: "Час на пристигане",
    departureDate: "Дата на заминаване",
    departureTime: "Час на заминаване",
    estimatedTotal: "Очаквана сума",
    days: "дни",
    personalInfo: "Лична информация",
    fullName: "Пълно име",
    email: "Имейл",
    phone: "Телефонен номер",
    licensePlate: "Регистрационен номер",
    passengers: "Брой пътници",
    proceedToPayment: "Потвърди резервация",
    numberOfCars: "Брой автомобили",
    car: "автомобил",
    cars: "автомобила",
    selectNumberOfCars: "Изберете колко автомобила ще паркирате (за големи групи или фирмени резервации)",
    vehicleInformation: "Информация за превозните средства",
    passenger: "пътник",
    passengersLabel: "пътници",
    selectTime: "Изберете час",
    
    // Form Placeholders
    namePlaceholder: "Иван Петров",
    emailPlaceholder: "ivan@example.com",
    phonePlaceholder: "+359 888 123 456",
    licensePlatePlaceholder: "СВ 1234 АВ",
    
    // Validation Messages
    arrivalDateRequired: "Дата на пристигане е задължителна",
    arrivalTimeRequired: "Час на пристигане е задължителен",
    departureDateRequired: "Дата на заминаване е задължителна",
    departureTimeRequired: "Час на заминаване е задължителен",
    nameRequired: "Име е задължително",
    emailRequired: "Имейл е задължителен",
    emailInvalid: "Невалиден имейл адрес",
    phoneRequired: "Телефонен номер е задължителен",
    licensePlateRequired: "Регистрационен номер е задължителен",
    passengersRequired: "Брой пътници е задължителен",
    passengersMin: "Минимум 1 пътник",
    passengersMax: "Максимум 8 пътници",
    
    // Contact Form
    haveQuestions: "Имате въпроси?",
    inquiryDesc: "Изпратете ни вашето запитване и ще отговорим възможно най-скоро",
    name: "Име",
    phoneOptional: "Телефонен номер (по избор)",
    message: "Съобщение",
    sendInquiry: "Изпрати запитване",
    messagePlaceholder: "Как можем да ви помогнем?",
    messageRequired: "Съобщение е задължително",
    orContactDirectly: "Или се свържете с нас директно:",
    
    // Toast Messages
    checkDates: "Моля, проверете датите и часовете",
    bookingConfirmed: "Резервация потвърдена! Сума: €",
    paymentProcessing: ". Обработка на плащането...",
    inquirySuccess: "Благодарим за вашето запитване! Ще се свържем с вас скоро.",
    
    // Footer
    footerTagline: "Сигурни, достъпни и удобни паркинг решения",
    footerLocation: "📍 Летище София, България",
    footerRights: "© 2024 Паркинг София Аеропорт. Всички права запазени.",
    
    // Map Section
    ourLocation: "Нашата локация",
    findUs: "Намерете ни лесно до Терминал 2 на Летище София",
    takeMeThere: "Навигирай ме",
  },
  en: {
    // Hero Section
    heroTitle: "SkyParking - Sofia Airport",
    heroSubtitle: "Secure, affordable parking just minutes from Sofia Airport. Book now and travel with peace of mind.",
    bookNow: "Book Now",
    callButton: "Call +359 888 123 456",
    
    // Features
    whyChooseUs: "Why Choose Us?",
    whyChooseUsDesc: "We provide the most reliable and convenient parking solution for Sofia Airport travelers",
    secureParking: "Secure Parking",
    secureParkingDesc: "24/7 surveillance and security for your vehicle",
    flexibleHours: "Flexible Hours",
    flexibleHoursDesc: "Drop-off and pick-up anytime, day or night",
    airportShuttle: "Airport Shuttle",
    airportShuttleDesc: "Free shuttle service to and from the terminal",
    allVehicles: "All Vehicles",
    allVehiclesDesc: "We accommodate cars, vans, and SUVs",
    
    // Booking Form
    bookYourParking: "Book Your Parking",
    fillDetails: "Fill in your details below and secure your parking spot",
    arrivalDate: "Arrival Date",
    arrivalTime: "Arrival Time",
    departureDate: "Departure Date",
    departureTime: "Departure Time",
    estimatedTotal: "Estimated Total",
    days: "days",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone Number",
    licensePlate: "License Plate",
    passengers: "Number of Passengers",
    proceedToPayment: "Confirm Reservation",
    numberOfCars: "Number of Cars",
    car: "car",
    cars: "cars",
    selectNumberOfCars: "Select how many cars you will park (for large groups or corporate reservations)",
    vehicleInformation: "Vehicle Information",
    passenger: "passenger",
    passengersLabel: "passengers",
    selectTime: "Select time",
    
    // Form Placeholders
    namePlaceholder: "John Doe",
    emailPlaceholder: "john@example.com",
    phonePlaceholder: "+359 888 123 456",
    licensePlatePlaceholder: "CB 1234 AB",
    
    // Validation Messages
    arrivalDateRequired: "Arrival date is required",
    arrivalTimeRequired: "Arrival time is required",
    departureDateRequired: "Departure date is required",
    departureTimeRequired: "Departure time is required",
    nameRequired: "Name is required",
    emailRequired: "Email is required",
    emailInvalid: "Invalid email address",
    phoneRequired: "Phone number is required",
    licensePlateRequired: "License plate is required",
    passengersRequired: "Number of passengers is required",
    passengersMin: "At least 1 passenger required",
    passengersMax: "Maximum 8 passengers",
    
    // Contact Form
    haveQuestions: "Have Questions?",
    inquiryDesc: "Send us your inquiry and we'll respond as soon as possible",
    name: "Name",
    phoneOptional: "Phone Number (Optional)",
    message: "Message",
    sendInquiry: "Send Inquiry",
    messagePlaceholder: "How can we help you?",
    messageRequired: "Message is required",
    orContactDirectly: "Or contact us directly:",
    
    // Toast Messages
    checkDates: "Please check your dates and times",
    bookingConfirmed: "Booking confirmed! Total: €",
    paymentProcessing: ". Payment processing...",
    inquirySuccess: "Thank you for your inquiry! We'll get back to you shortly.",
    
    // Footer
    footerTagline: "Secure, affordable, and convenient parking solutions",
    footerLocation: "📍 Sofia Airport, Bulgaria",
    footerRights: "© 2024 Sofia Airport Parking. All rights reserved.",
    
    // Map Section
    ourLocation: "Our Location",
    findUs: "Find us easily near Terminal 2 at Sofia Airport",
    takeMeThere: "Take Me There",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("bg"); // Default to Bulgarian

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.bg] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}