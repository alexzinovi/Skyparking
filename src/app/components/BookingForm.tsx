import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { CalendarIcon, CreditCard, Loader2, ChevronDown, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";
import { calculatePrice } from "@/app/utils/pricing";

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

interface BookingFormData {
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  name: string;
  email: string;
  phone: string;
  numberOfCars: number;
  licensePlate: string;
  licensePlate2?: string;
  licensePlate3?: string;
  licensePlate4?: string;
  licensePlate5?: string;
  passengers: number;
  needsInvoice: boolean;
  carKeys: boolean;
  carKeysNotes?: string;
  companyName?: string;
  companyOwner?: string;
  taxNumber?: string;
  isVAT?: boolean;
  vatNumber?: string;
  city?: string;
  address?: string;
  agreeToTerms: boolean;
}

export function BookingForm() {
  const { t, language } = useLanguage();
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numberOfCars, setNumberOfCars] = useState(1);
  const [needsInvoice, setNeedsInvoice] = useState(false);
  const [isVAT, setIsVAT] = useState(false);
  const [autoVatNumber, setAutoVatNumber] = useState("");
  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormData>();

  const arrivalDate = watch("arrivalDate");
  const arrivalTime = watch("arrivalTime");
  const departureDate = watch("departureDate");
  const departureTime = watch("departureTime");
  const taxNumber = watch("taxNumber");

  // Auto-calculate price when dates change
  useEffect(() => {
    async function updatePrice() {
      const price = await calculatePrice(arrivalDate, arrivalTime, departureDate, departureTime, numberOfCars);
      setTotalPrice(price);
    }
    updatePrice();
  }, [arrivalDate, arrivalTime, departureDate, departureTime, numberOfCars]);

  // Auto-populate VAT number when VAT is checked and tax number exists
  useEffect(() => {
    if (isVAT && taxNumber) {
      const cleanTaxNumber = taxNumber.trim();
      if (cleanTaxNumber) {
        setAutoVatNumber(`BG${cleanTaxNumber}`);
      } else {
        setAutoVatNumber("");
      }
    } else {
      setAutoVatNumber("");
    }
  }, [isVAT, taxNumber]);

  const onSubmit = async (data: BookingFormData) => {
    if (!totalPrice) {
      toast.error(t("checkDates"));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create reservation in database
      const bookingData = {
        ...data,
        totalPrice,
        numberOfCars,
        needsInvoice,
        language, // Add the current language to the booking
        paymentStatus: "unpaid",
        status: "new", // All new bookings start as "new"
      };

      console.log("Submitting booking with needsInvoice:", needsInvoice);
      console.log("Full booking data:", bookingData);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to create reservation");
      }

      // Show success message with reservation details
      toast.success(t("bookingConfirmed") + " €" + totalPrice);
      toast.info("Reservation ID: " + (result.booking.bookingCode || result.booking.id)); // Use bookingCode
      
      // Optionally reset the form or show confirmation
      console.log("Reservation created:", result.booking);
      
    } catch (error: any) {
      console.error("Reservation error:", error);
      toast.error("Failed to create reservation: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t("reservation")}</h2>
            <p className="text-sm text-gray-500">{t("reservationSubtitle")}</p>
          </div>

          <Card className="p-6 md:p-12 shadow-lg bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Number of Cars Selection */}
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{t("numberOfCars")}</h3>
                <select
                  id="numberOfCars"
                  className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  value={numberOfCars}
                  onChange={(e) => setNumberOfCars(parseInt(e.target.value))}
                >
                  <option value="1">1 {t("car")}</option>
                  <option value="2">2 {t("cars")}</option>
                  <option value="3">3 {t("cars")}</option>
                  <option value="4">4 {t("cars")}</option>
                  <option value="5">5 {t("cars")}</option>
                </select>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Date and Time Section */}
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{t("datesAndTimes")}</h3>
                
                {/* Reassurance microcopy */}
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {t("timesApproximateHelp")}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2 md:space-y-3">
                    <Label className="text-sm md:text-base font-medium text-gray-700" htmlFor="arrivalDate">
                      <CalendarIcon className="inline h-4 w-4 mr-2" />
                      {t("arrivalDate")}
                    </Label>
                    <Input
                      id="arrivalDate"
                      type="date"
                      {...register("arrivalDate", { required: t("arrivalDateRequired") })}
                      className={`h-11 md:h-12 text-sm md:text-base [&::-webkit-date-and-time-value]:leading-none ${errors.arrivalDate ? "border-red-500" : "border-gray-300"}`}
                      style={{ WebkitAppearance: 'none', lineHeight: 'normal' } as any}
                    />
                    {errors.arrivalDate && (
                      <p className="text-sm text-red-500">{errors.arrivalDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <Label className="text-sm md:text-base font-medium text-gray-700" htmlFor="arrivalTime">
                      <Clock className="inline h-4 w-4 mr-2" />
                      {t("arrivalTime")}
                    </Label>
                    <select
                      id="arrivalTime"
                      {...register("arrivalTime", { required: t("arrivalTimeRequired") })}
                      className={`w-full h-11 md:h-12 px-3 md:px-4 text-sm md:text-base border rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors ${errors.arrivalTime ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">{t("selectTime")}</option>
                      <option value="00:00">00:00</option>
                      <option value="00:30">00:30</option>
                      <option value="01:00">01:00</option>
                      <option value="01:30">01:30</option>
                      <option value="02:00">02:00</option>
                      <option value="02:30">02:30</option>
                      <option value="03:00">03:00</option>
                      <option value="03:30">03:30</option>
                      <option value="04:00">04:00</option>
                      <option value="04:30">04:30</option>
                      <option value="05:00">05:00</option>
                      <option value="05:30">05:30</option>
                      <option value="06:00">06:00</option>
                      <option value="06:30">06:30</option>
                      <option value="07:00">07:00</option>
                      <option value="07:30">07:30</option>
                      <option value="08:00">08:00</option>
                      <option value="08:30">08:30</option>
                      <option value="09:00">09:00</option>
                      <option value="09:30">09:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                      <option value="17:00">17:00</option>
                      <option value="17:30">17:30</option>
                      <option value="18:00">18:00</option>
                      <option value="18:30">18:30</option>
                      <option value="19:00">19:00</option>
                      <option value="19:30">19:30</option>
                      <option value="20:00">20:00</option>
                      <option value="20:30">20:30</option>
                      <option value="21:00">21:00</option>
                      <option value="21:30">21:30</option>
                      <option value="22:00">22:00</option>
                      <option value="22:30">22:30</option>
                      <option value="23:00">23:00</option>
                      <option value="23:30">23:30</option>
                    </select>
                    {errors.arrivalTime && (
                      <p className="text-sm text-red-500">{errors.arrivalTime.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <Label className="text-sm md:text-base font-medium text-gray-700" htmlFor="departureDate">
                      <CalendarIcon className="inline h-4 w-4 mr-2" />
                      {t("departureDate")}
                    </Label>
                    <Input
                      id="departureDate"
                      type="date"
                      {...register("departureDate", { required: t("departureDateRequired") })}
                      className={`h-11 md:h-12 text-sm md:text-base [&::-webkit-date-and-time-value]:leading-none ${errors.departureDate ? "border-red-500" : "border-gray-300"}`}
                      style={{ WebkitAppearance: 'none', lineHeight: 'normal' } as any}
                    />
                    {errors.departureDate && (
                      <p className="text-sm text-red-500">{errors.departureDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <Label className="text-sm md:text-base font-medium text-gray-700" htmlFor="departureTime">
                      <Clock className="inline h-4 w-4 mr-2" />
                      {t("departureTime")}
                    </Label>
                    <select
                      id="departureTime"
                      {...register("departureTime", { required: t("departureTimeRequired") })}
                      className={`w-full h-11 md:h-12 px-3 md:px-4 text-sm md:text-base border rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors ${errors.departureTime ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">{t("selectTime")}</option>
                      <option value="00:00">00:00</option>
                      <option value="00:30">00:30</option>
                      <option value="01:00">01:00</option>
                      <option value="01:30">01:30</option>
                      <option value="02:00">02:00</option>
                      <option value="02:30">02:30</option>
                      <option value="03:00">03:00</option>
                      <option value="03:30">03:30</option>
                      <option value="04:00">04:00</option>
                      <option value="04:30">04:30</option>
                      <option value="05:00">05:00</option>
                      <option value="05:30">05:30</option>
                      <option value="06:00">06:00</option>
                      <option value="06:30">06:30</option>
                      <option value="07:00">07:00</option>
                      <option value="07:30">07:30</option>
                      <option value="08:00">08:00</option>
                      <option value="08:30">08:30</option>
                      <option value="09:00">09:00</option>
                      <option value="09:30">09:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                      <option value="17:00">17:00</option>
                      <option value="17:30">17:30</option>
                      <option value="18:00">18:00</option>
                      <option value="18:30">18:30</option>
                      <option value="19:00">19:00</option>
                      <option value="19:30">19:30</option>
                      <option value="20:00">20:00</option>
                      <option value="20:30">20:30</option>
                      <option value="21:00">21:00</option>
                      <option value="21:30">21:30</option>
                      <option value="22:00">22:00</option>
                      <option value="22:30">22:30</option>
                      <option value="23:00">23:00</option>
                      <option value="23:30">23:30</option>
                    </select>
                    {errors.departureTime && (
                      <p className="text-sm text-red-500">{errors.departureTime.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Display */}
              {totalPrice && arrivalDate && departureDate && arrivalTime && departureTime && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t("yourParkingCost")}</p>
                      <p className="text-4xl font-bold text-blue-600">€{totalPrice}</p>
                      <p className="text-sm text-gray-600 mt-2">{t("priceIncludesTransfers")}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-2xl font-semibold text-gray-700">
                        {Math.ceil((new Date(`${departureDate}T${departureTime}`).getTime() - new Date(`${arrivalDate}T${arrivalTime}`).getTime()) / (1000 * 60 * 60 * 24))} {t("days")}
                      </p>
                      {numberOfCars > 1 && (
                        <p className="text-sm text-gray-600 mt-1">
                          €{totalPrice / numberOfCars} × {numberOfCars} {numberOfCars === 1 ? t("car") : t("cars")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Personal Information */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{t("personalInfo")}</h3>
                
                <div className="space-y-3">
                  <Label className="text-base font-medium text-gray-700" htmlFor="name">{t("fullName")}</Label>
                  <Input
                    id="name"
                    {...register("name", { required: t("nameRequired") })}
                    placeholder={t("namePlaceholder")}
                    className={`h-12 text-base bg-white ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700" htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", { 
                        required: t("emailRequired"),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t("emailInvalid")
                        }
                      })}
                      placeholder={t("emailPlaceholder")}
                      className={`h-12 text-base bg-white ${errors.email ? "border-red-500" : "border-gray-300"}`}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700" htmlFor="phone">{t("phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone", { required: t("phoneRequired") })}
                      placeholder={t("phonePlaceholder")}
                      className={`h-12 text-base bg-white ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Section */}
              <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{t("needInvoice")}</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer text-base">
                    <input
                      type="radio"
                      value="yes"
                      checked={needsInvoice === true}
                      onChange={() => setNeedsInvoice(true)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-medium">{t("yes")}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-base">
                    <input
                      type="radio"
                      value="no"
                      checked={needsInvoice === false}
                      onChange={() => setNeedsInvoice(false)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-medium">{t("no")}</span>
                  </label>
                </div>

                {/* Conditional Invoice Fields */}
                {needsInvoice && (
                  <div className="space-y-4 mt-6 bg-white p-6 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-lg text-gray-900">{t("invoiceDetails")}</h4>
                    
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700" htmlFor="companyName">{t("companyName")}</Label>
                      <Input
                        id="companyName"
                        {...register("companyName", { required: needsInvoice ? t("companyNameRequired") : false })}
                        placeholder={t("companyNamePlaceholder")}
                        className={`h-12 text-base ${errors.companyName ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.companyName && (
                        <p className="text-sm text-red-500">{errors.companyName.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700" htmlFor="taxNumber">{t("taxNumber")}</Label>
                      <Input
                        id="taxNumber"
                        {...register("taxNumber", { required: needsInvoice ? t("taxNumberRequired") : false })}
                        placeholder={t("taxNumberPlaceholder")}
                        className={`h-12 text-base ${errors.taxNumber ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.taxNumber && (
                        <p className="text-sm text-red-500">{errors.taxNumber.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* License Plates and Passengers Section */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{t("vehicleInformation")}</h3>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700" htmlFor="licensePlate">{t("licensePlate")} 1</Label>
                    <Input
                      id="licensePlate"
                      {...register("licensePlate", { required: t("licensePlateRequired") })}
                      placeholder={t("licensePlatePlaceholder")}
                      className={`h-12 text-base bg-white ${errors.licensePlate ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.licensePlate && (
                      <p className="text-sm text-red-500">{errors.licensePlate.message}</p>
                    )}
                  </div>

                  {numberOfCars >= 2 && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700" htmlFor="licensePlate2">{t("licensePlate")} 2</Label>
                      <Input
                        id="licensePlate2"
                        {...register("licensePlate2", { required: numberOfCars >= 2 ? t("licensePlateRequired") : false })}
                        placeholder={t("licensePlatePlaceholder")}
                        className={`h-12 text-base bg-white ${errors.licensePlate2 ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.licensePlate2 && (
                        <p className="text-sm text-red-500">{errors.licensePlate2.message}</p>
                      )}
                    </div>
                  )}

                  {numberOfCars >= 3 && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700" htmlFor="licensePlate3">{t("licensePlate")} 3</Label>
                      <Input
                        id="licensePlate3"
                        {...register("licensePlate3", { required: numberOfCars >= 3 ? t("licensePlateRequired") : false })}
                        placeholder={t("licensePlatePlaceholder")}
                        className={`h-12 text-base bg-white ${errors.licensePlate3 ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.licensePlate3 && (
                        <p className="text-sm text-red-500">{errors.licensePlate3.message}</p>
                      )}
                    </div>
                  )}

                  {numberOfCars >= 4 && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700" htmlFor="licensePlate4">{t("licensePlate")} 4</Label>
                      <Input
                        id="licensePlate4"
                        {...register("licensePlate4", { required: numberOfCars >= 4 ? t("licensePlateRequired") : false })}
                        placeholder={t("licensePlatePlaceholder")}
                        className={`h-12 text-base bg-white ${errors.licensePlate4 ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.licensePlate4 && (
                        <p className="text-sm text-red-500">{errors.licensePlate4.message}</p>
                      )}
                    </div>
                  )}

                  {numberOfCars >= 5 && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700" htmlFor="licensePlate5">{t("licensePlate")} 5</Label>
                      <Input
                        id="licensePlate5"
                        {...register("licensePlate5", { required: numberOfCars >= 5 ? t("licensePlateRequired") : false })}
                        placeholder={t("licensePlatePlaceholder")}
                        className={`h-12 text-base bg-white ${errors.licensePlate5 ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.licensePlate5 && (
                        <p className="text-sm text-red-500">{errors.licensePlate5.message}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Passengers Dropdown */}
                <div className="space-y-3">
                  <Label className="text-base font-medium text-gray-700" htmlFor="passengers">{t("passengers")}</Label>
                  <select
                    id="passengers"
                    {...register("passengers", { required: t("passengersRequired") })}
                    className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    defaultValue="1"
                  >
                    <option value="1">1 {t("passenger")}</option>
                    <option value="2">2 {t("passengersLabel")}</option>
                    <option value="3">3 {t("passengersLabel")}</option>
                    <option value="4">4 {t("passengersLabel")}</option>
                    <option value="5">5 {t("passengersLabel")}</option>
                    <option value="6">6 {t("passengersLabel")}</option>
                    <option value="7">7 {t("passengersLabel")}</option>
                    <option value="8">8 {t("passengersLabel")}</option>
                  </select>
                  {errors.passengers && (
                    <p className="text-sm text-red-500">{errors.passengers.message}</p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-300">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  {...register("agreeToTerms", { required: t("termsRequired") })}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="agreeToTerms" className="text-sm md:text-base text-gray-700 cursor-pointer">
                  {t("agreeToTerms")}{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#073590] hover:text-[#f1c933] font-medium underline transition-colors"
                  >
                    {t("termsAndConditionsLink")}
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500 -mt-2">{errors.agreeToTerms.message}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#f1c933] hover:bg-[#f5d54a] font-bold text-[#073590] text-lg h-14 rounded-xl shadow-md hover:shadow-lg transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    {t("proceedToPayment")}
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}