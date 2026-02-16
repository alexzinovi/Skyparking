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
    heroTitle: "SkyParking - Паркинг Летище София",
    heroSubtitle: "Сигурен и достъпен паркинг на 5 минути от Терминал 1 и 2. Резервирайте сега и пътувайте със спокойствие.",
    bookNow: "Резервирай сега",
    callButton: "Обади се +359 886 616 991",
    
    // Navigation
    navFeatures: "Предимства",
    navBooking: "Резервация",
    navContact: "Контакти",
    navLocation: "Локация",
    callNow: "Обади се",
    
    // Features
    whyChooseUs: "Защо да изберете SkyParking?",
    whyChooseUsDesc: "Предлагаме най-надеждното и удобно решение за паркиране за пътници от Летище София",
    secureParking: "Охраняем паркинг 24/7",
    secureParkingDesc: "Видеонаблюдение + жива охрана - автомобилът Ви е в сигурни ръце",
    flexibleHours: "Лесна резервация, без предплащане",
    flexibleHoursDesc: "Плащате при пристигане — без допълнителни такси или скрити изненади.",
    airportShuttle: "Безплатен трансфер до и от Летище София",
    airportShuttleDesc: "Бърз и удобен — само 5 минути до Терминал 1 и 2.",
    allVehicles: "Всички превозни средства",
    allVehiclesDesc: "Приемаме автомобили, ванове и джипове",
    lowPricesEasyBooking: "Ниски цени",
    lowPricesEasyBookingDesc: "Достъпни цени за краткосрочен и дългосрочен престой",
    
    // Booking Form
    bookYourSpot: "Запазете Вашето Място",
    reservation: "Резервация",
    reservationSubtitle: "Без предплащане · Потвърждение по телефон",
    bookYourParking: "Резервирайте вашия паркинг",
    datesAndTimes: "Дати и часове",
    yourParkingCost: "Вашата цена за паркинг",
    reservationSummary: "Обобщение на резервацията",
    duration: "Продължителност",
    totalCost: "Обща сума",
    noPrePayment: "Без предплащане – плащате при пристигане",
    processing: "Обработка...",
    fillDetails: "Попълнете данните по-долу и осигурете вашето място за паркиране",
    arrivalDate: "Дата на пристигане",
    arrivalTime: "Час на пристигане",
    departureDate: "Дата на заминаване",
    departureTime: "Час на заминаване",
    estimatedTotal: "Очаквана сума",
    finalTotal: "Крайна сума",
    priceIncludesTransfers: "Цена с включени безплатни трансфери",
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
    perCar: "на кола",
    selectNumberOfCars: "Изберете колко автомобила ще паркирате (за големи групи или фирмени резервации)",
    vehicleInformation: "Информация за превозните средства",
    passenger: "пътник",
    passengersLabel: "пътници",
    selectTime: "Изберете час",
    timesApproximateHelp: "ℹ️ Часовете са ориентировъчни.\nАко пристигнете по-рано или по-късно, няма проблем – просто ни се обадете.",
    termsAndConditions: "Общи условия",
    termsAndConditionsLink: "Общите условия",
    agreeToTerms: "Съгласявам се с",
    termsRequired: "Трябва да се съгласите с общите условия",
    
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
    phoneInvalid: "Телефонният номер може да съдържа само цифри и + за код на държава (макс. 15 символа)",
    licensePlateRequired: "Регистрационен номер е задължителен",
    passengersRequired: "Брой пътници е задължителен",
    passengersMin: "Минимум 1 пътник",
    passengersMax: "Максимум 8 пътници",
    
    // Invoice Fields
    needInvoice: "Необходима ли ви е фактура?",
    yes: "Да",
    no: "Не",
    invoiceDetails: "Данни за фактура",
    companyName: "Име на фирма",
    companyNamePlaceholder: "ООД ПРИМЕРНА ФИРМА",
    companyNameRequired: "Име на фирма е задължително",
    companyOwner: "Управител",
    companyOwnerPlaceholder: "Иван Петров",
    companyOwnerRequired: "Управител е задължителен",
    taxNumber: "ЕИК / Булстат",
    taxNumberPlaceholder: "123456789",
    taxNumberRequired: "ЕИК е задължителен",
    isVAT: "Регистриран по ДДС",
    vatNumber: "ДДС номер",
    vatNumberPlaceholder: "BG123456789",
    vatNumberRequired: "ДДС номер е задължителен",
    autoGeneratedVAT: "Автоматично генериран ДДС номер на базата на ЕИК",
    enterTaxNumberFirst: "Моля, въведете ЕИК номер по-горе, за да бъде генериран ДДС номер",
    city: "Град",
    selectCity: "Изберете град",
    cityRequired: "Град е задължителен",
    address: "Адрес",
    addressPlaceholder: "ул. Примерна 123",
    addressRequired: "Адрес е задължителен",
    
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
    footerTagline: "Сигурни, достъпни и удобни паркин решения",
    footerLocation: "📍 Улица Неделчо Бончев 30",
    footerRights: "© 2026 SkyParking - Паркинг Летище София. Всички права запазени.",
    
    // Map Section
    ourLocation: "Нашата локация",
    findUs: "Намерете ни лесно до Терминал 2 на Летище София",
    takeMeThere: "Навигирай ме",
    takeMeThereWaze: "Навигирай ме с Waze",
    googleMaps: "Google Maps",
    waze: "Waze",
    howToFindUs: "Как да ни откриете",
    
    // How It Works Section
    howItWorks: "Как работи?",
    onlineTelephoneBooking: "Онлайн / Телефонна резервция",
    onlineTelephoneBookingText1: "Можете да направите резервация като ни се обадите на",
    onlineTelephoneBookingText2: "или като попълните",
    onlineTelephoneBookingText3: ". След като завършите резервацията, ще получите обаждане от нас, за да потвърдим всички ваши данни.",
    bookingForm: "формата за резервация",
    arrivalAndTransfer: "Пристигане на паркинга и трансфер до летището",
    arrivalAndTransferDesc: "При пристигане ще бъдете посрещнати от нашия персонал, който ще ви помогне с багажа и паркирането на вашето превозно средство. След това ще вземете включения безплатен трансфер до Летище София на терминала по ваш избор - и двата са на 5 минути от нашия паркинг.",
    returnAndPickup: "ръщане и вземане на превозното средство",
    returnAndPickupText1: "Веднага щом кацнете и вземете багажа си,",
    returnAndPickupText2: "и един от нашите трансферни автобуси ще дойде да ви вземе. Ще ви отведем до паркинга, където вашето превозно средство ще ви очаква - в безопасност и готово да тръгне.",
    callUs: "обадете ни се",
  },
  en: {
    // Hero Section
    heroTitle: "SkyParking - Sofia Airport Parking",
    heroSubtitle: "Secure, affordable parking 5 minutes from Terminal 1 and 2. Book now and travel with peace of mind.",
    bookNow: "Book Now",
    callButton: "Call +359 886 616 991",
    
    // Navigation
    navFeatures: "Features",
    navBooking: "Booking",
    navContact: "Contact",
    navLocation: "Location",
    callNow: "Call Now",
    
    // Features
    whyChooseUs: "Why Choose SkyParking?",
    whyChooseUsDesc: "We provide the most reliable and convenient parking solution for Sofia Airport travelers",
    secureParking: "Secure parking 24/7",
    secureParkingDesc: "Video surveillance + on-site security — your car is safe at all times.",
    flexibleHours: "Easy booking, no prepayment",
    flexibleHoursDesc: "Pay on arrival — no extra fees or hidden surprises.",
    airportShuttle: "Free transfer to and from Sofia Airport",
    airportShuttleDesc: "Fast and convenient — just 5 minutes to Terminal 1 and 2.",
    allVehicles: "All Vehicles",
    allVehiclesDesc: "We accommodate cars, vans, and SUVs",
    lowPricesEasyBooking: "Low Prices",
    lowPricesEasyBookingDesc: "Affordable rates for short and long stays.",
    
    // Booking Form
    bookYourSpot: "Book Now",
    reservation: "Reservation",
    reservationSubtitle: "No Prepayment · Confirmation by Phone",
    bookYourParking: "Book Your Parking",
    datesAndTimes: "Dates and Times",
    yourParkingCost: "Your Parking Cost",
    reservationSummary: "Reservation Summary",
    duration: "Duration",
    totalCost: "Total Cost",
    noPrePayment: "No Prepayment – Pay on Arrival",
    processing: "Processing...",
    fillDetails: "Fill in your details below and secure your parking spot",
    arrivalDate: "Arrival Date",
    arrivalTime: "Arrival Time",
    departureDate: "Departure Date",
    departureTime: "Departure Time",
    estimatedTotal: "Estimated Total",
    finalTotal: "Final Total",
    priceIncludesTransfers: "Price includes free shuttles",
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
    perCar: "per car",
    selectNumberOfCars: "Select how many cars you will park (for large groups or corporate reservations)",
    vehicleInformation: "Vehicle Information",
    passenger: "passenger",
    passengersLabel: "passengers",
    selectTime: "Select time",
    timesApproximateHelp: "ℹ️ Times are approximate.\nIf you arrive earlier or later, no problem – just call us.",
    termsAndConditions: "Terms and Conditions",
    termsAndConditionsLink: "Terms and Conditions",
    agreeToTerms: "I agree to the",
    termsRequired: "You must agree to the terms and conditions",
    
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
    phoneInvalid: "Phone number can only contain digits and + for country code (max. 15 characters)",
    licensePlateRequired: "License plate is required",
    passengersRequired: "Number of passengers is required",
    passengersMin: "At least 1 passenger required",
    passengersMax: "Maximum 8 passengers",
    
    // Invoice Fields
    needInvoice: "Do you need an invoice?",
    yes: "Yes",
    no: "No",
    invoiceDetails: "Invoice details",
    companyName: "Company Name",
    companyNamePlaceholder: "OOD EXAMPLE COMPANY",
    companyNameRequired: "Company name is required",
    companyOwner: "Owner",
    companyOwnerPlaceholder: "John Doe",
    companyOwnerRequired: "Owner is required",
    taxNumber: "EIK / Bulstat",
    taxNumberPlaceholder: "123456789",
    taxNumberRequired: "EIK is required",
    isVAT: "Registered for VAT",
    vatNumber: "VAT Number",
    vatNumberPlaceholder: "BG123456789",
    vatNumberRequired: "VAT number is required",
    autoGeneratedVAT: "Auto-generated VAT number based on EIK",
    enterTaxNumberFirst: "Please enter EIK number above to generate VAT number",
    city: "City",
    selectCity: "Select city",
    cityRequired: "City is required",
    address: "Address",
    addressPlaceholder: "ul. Example 123",
    addressRequired: "Address is required",
    
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
    footerLocation: "📍 Ulitsa Nedelcho Bonchev 30",
    footerRights: "© 2026 SkyParking - Sofia Airport Parking. All rights reserved.",
    
    // Map Section
    ourLocation: "Our Location",
    findUs: "Find us easily near Terminal 2 at Sofia Airport",
    takeMeThere: "Take Me There",
    takeMeThereWaze: "Navigate with Waze",
    googleMaps: "Google Maps",
    waze: "Waze",
    howToFindUs: "How to Find Us",
    
    // How It Works Section
    howItWorks: "How It Works?",
    onlineTelephoneBooking: "Online / Telephone Booking",
    onlineTelephoneBookingText1: "You can make a reservation by calling us at",
    onlineTelephoneBookingText2: "or by filling out",
    onlineTelephoneBookingText3: ". After completing the reservation, we will call you to confirm all your details.",
    bookingForm: "the booking form",
    arrivalAndTransfer: "Arrival at the parking and transfer to the airport",
    arrivalAndTransferDesc: "Upon arrival, you will be greeted by our staff who will help you with your luggage and parking your vehicle. Then you will take the included free shuttle to Sofia Airport at the terminal of your choice - both are 5 minutes from our parking.",
    returnAndPickup: "Return and pickup of the vehicle",
    returnAndPickupText1: "As soon as you land and collect your luggage,",
    returnAndPickupText2: "one of our transfer buses will come to pick you up. We will take you to the parking where your vehicle will be waiting for you - safely and ready to go.",
    callUs: "call us",
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