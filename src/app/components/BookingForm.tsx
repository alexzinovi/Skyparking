import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { CalendarIcon, CreditCard, Loader2, ChevronDown, Clock, Car, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";
import { calculatePrice } from "../utils/pricing";
import { ErrorBoundary } from "./ErrorBoundary";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";
import { NumberPicker } from "./NumberPicker";
import { eurToBgn } from "../utils/currency";

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
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numberOfCars, setNumberOfCars] = useState(1);
  const [needsInvoice, setNeedsInvoice] = useState(false);
  const [isVAT, setIsVAT] = useState(false);
  const [autoVatNumber, setAutoVatNumber] = useState("");
  
  // Discount code states
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState("");
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [basePrice, setBasePrice] = useState<number | null>(null);
  
  // Date states - using Date objects for DatePicker
  const [arrivalDateObj, setArrivalDateObj] = useState<Date | undefined>();
  const [departureDateObj, setDepartureDateObj] = useState<Date | undefined>();
  
  // Anti-spam measures
  const [formLoadTime] = useState(Date.now());
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  
  const { register, handleSubmit, watch, formState: { errors }, setValue, trigger } = useForm<BookingFormData>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      passengers: 1, // Default to 1 passenger
      numberOfCars: 1,
    }
  });

  const arrivalDate = watch("arrivalDate");
  const arrivalTime = watch("arrivalTime");
  const departureDate = watch("departureDate");
  const departureTime = watch("departureTime");
  const taxNumber = watch("taxNumber");
  
  // Register date fields for validation
  useEffect(() => {
    register("arrivalDate", { required: t("arrivalDateRequired") });
    register("departureDate", { required: t("departureDateRequired") });
    register("arrivalTime", { required: t("arrivalTimeRequired") });
    register("departureTime", { required: t("departureTimeRequired") });
  }, [register, t]);

  // Handle autofill detection for key fields
  useEffect(() => {
    // Check for autofilled values after a short delay
    const checkAutofill = setTimeout(() => {
      const nameInput = document.getElementById('name') as HTMLInputElement;
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const phoneInput = document.getElementById('phone') as HTMLInputElement;
      
      if (nameInput?.value) {
        setValue('name', nameInput.value, { shouldValidate: true });
      }
      if (emailInput?.value) {
        setValue('email', emailInput.value, { shouldValidate: true });
      }
      if (phoneInput?.value) {
        setValue('phone', phoneInput.value, { shouldValidate: true });
      }
    }, 500);
    
    return () => clearTimeout(checkAutofill);
  }, [setValue]);

  // Auto-calculate price when dates change
  useEffect(() => {
    const price = calculatePrice(arrivalDate, arrivalTime, departureDate, departureTime, numberOfCars);
    setTotalPrice(price);
    setBasePrice(price); // Store base price for discount calculation
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

  // Validate discount code
  const validateDiscountCode = async () => {
    if (!discountCode) {
      setDiscountError(t("discountCodeRequired"));
      setAppliedDiscount(null);
      return;
    }

    setIsValidatingDiscount(true);
    setDiscountError("");

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/discount/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ code: discountCode }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Invalid discount code");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Invalid discount code");
      }

      // Apply discount
      setAppliedDiscount(result.discount);
      
      // Calculate discounted price based on type
      let discountedPrice = basePrice;
      if (basePrice && result.discount) {
        if (result.discount.discountType === 'percentage') {
          discountedPrice = basePrice * (1 - result.discount.discountValue / 100);
        } else if (result.discount.discountType === 'fixed') {
          discountedPrice = Math.max(0, basePrice - result.discount.discountValue);
        }
      }
      setTotalPrice(discountedPrice);
      
      toast.success(t("discountApplied") + " " + (result.discount.discountType === 'percentage' ? `${result.discount.discountValue}%` : `€${result.discount.discountValue}`));

    } catch (error: any) {
      console.error("Discount validation error:", error);
      setDiscountError(error.message || error.toString());
      setAppliedDiscount(null);
      setTotalPrice(basePrice); // Revert to base price if discount is invalid
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!totalPrice) {
      toast.error(t("checkDates"));
      return;
    }

    // Anti-spam check: Ensure the form is not submitted too quickly
    const currentTime = Date.now();
    const timeSinceLoad = currentTime - formLoadTime;
    const timeSinceLastSubmit = currentTime - lastSubmitTime;
    
    if (timeSinceLoad < 5000 || timeSinceLastSubmit < 5000) {
      toast.error(t("spamProtection"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Apply discount code usage if one was applied
      if (appliedDiscount && discountCode) {
        try {
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/discount/apply`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ code: discountCode }),
          });
        } catch (error) {
          console.error("Failed to track discount usage:", error);
          // Continue with booking even if discount tracking fails
        }
      }
      
      // Create reservation in database
      const bookingData = {
        ...data,
        totalPrice,
        basePrice, // Store base price before discount
        numberOfCars,
        needsInvoice,
        discountCode: appliedDiscount ? discountCode : null,
        discountApplied: appliedDiscount,
        language, // Add the current language to the booking
        paymentStatus: "unpaid",
        status: "new", // All new bookings start as "new"
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(bookingData),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to create reservation");
      }

      // Show success message with reservation details
      toast.success(t("bookingConfirmed") + " €" + totalPrice);
      
      // Navigate to the confirmation page
      navigate('/reservation-confirmed', { state: { booking: result.booking } });
      
    } catch (error: any) {
      console.error("Reservation error:", error);
      toast.error("Failed to create reservation: " + (error.message || error.toString()));
    } finally {
      setIsSubmitting(false);
      setLastSubmitTime(Date.now()); // Update last submit time
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
                <NumberPicker
                  id="numberOfCars"
                  value={numberOfCars}
                  onChange={(value) => setNumberOfCars(value)}
                  options={[
                    { value: 1, label: `1 ${t("car")}` },
                    { value: 2, label: `2 ${t("cars")}` },
                    { value: 3, label: `3 ${t("cars")}` },
                    { value: 4, label: `4 ${t("cars")}` },
                    { value: 5, label: `5 ${t("cars")}` },
                  ]}
                  icon={<Car className="h-4 w-4" />}
                />
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
                  <DatePicker
                    id="arrivalDate"
                    label={t("arrivalDate")}
                    value={arrivalDateObj}
                    onChange={(date) => {
                      setArrivalDateObj(date);
                      if (date) {
                        // Convert to YYYY-MM-DD format for form
                        const dateStr = date.toISOString().split('T')[0];
                        setValue('arrivalDate', dateStr, { shouldValidate: true });
                      } else {
                        setValue('arrivalDate', '', { shouldValidate: true });
                      }
                    }}
                    minDate={new Date()}
                    error={errors.arrivalDate?.message}
                  />

                  <TimePicker
                    id="arrivalTime"
                    label={t("arrivalTime")}
                    value={arrivalTime}
                    onChange={(time) => {
                      setValue('arrivalTime', time, { shouldValidate: true });
                    }}
                    error={errors.arrivalTime?.message}
                  />

                  <DatePicker
                    id="departureDate"
                    label={t("departureDate")}
                    value={departureDateObj}
                    onChange={(date) => {
                      setDepartureDateObj(date);
                      if (date) {
                        // Convert to YYYY-MM-DD format for form
                        const dateStr = date.toISOString().split('T')[0];
                        setValue('departureDate', dateStr, { shouldValidate: true });
                      } else {
                        setValue('departureDate', '', { shouldValidate: true });
                      }
                    }}
                    minDate={arrivalDateObj || new Date()}
                    error={errors.departureDate?.message}
                  />

                  <TimePicker
                    id="departureTime"
                    label={t("departureTime")}
                    value={departureTime}
                    onChange={(time) => {
                      setValue('departureTime', time, { shouldValidate: true });
                    }}
                    error={errors.departureTime?.message}
                  />
                </div>
              </div>

              {/* Price Display */}
              {totalPrice && arrivalDate && departureDate && arrivalTime && departureTime && (
                <div className="bg-white border-2 border-[#073590] rounded-xl p-6 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Left Side - Price */}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        {language === 'bg' ? 'Обща цена' : 'Total Price'}
                      </p>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-[#073590]">€{totalPrice}</span>
                          {numberOfCars > 1 && (
                            <span className="text-xl text-gray-500">(€{(totalPrice / numberOfCars).toFixed(2)} {t("perCar")})</span>
                          )}
                        </div>
                        <div className="text-2xl font-semibold text-gray-700">
                          {eurToBgn(totalPrice).toFixed(2)} лв
                          {numberOfCars > 1 && (
                            <span className="text-lg text-gray-500 ml-2">({eurToBgn(totalPrice / numberOfCars).toFixed(2)} лв {t("perCar")})</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        {language === 'bg' ? 'Крайна цена за престоя с включени трансфери' : 'Final price for the stay with transfers included'}
                      </p>
                    </div>
                    
                    {/* Divider */}
                    <div className="hidden md:block w-px h-24 bg-gray-300"></div>
                    
                    {/* Right Side - Duration */}
                    <div className="flex-1 md:text-right">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        {language === 'bg' ? 'Продължителност' : 'Duration'}
                      </p>
                      <p className="text-4xl font-bold text-gray-800">
                        {Math.ceil((new Date(`${departureDate}T${departureTime}`).getTime() - new Date(`${arrivalDate}T${arrivalTime}`).getTime()) / (1000 * 60 * 60 * 24))} {t("days")}
                      </p>
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
                    onChange={(e) => {
                      register("name").onChange(e);
                      setValue('name', e.target.value, { shouldValidate: true });
                    }}
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
                      onChange={(e) => {
                        register("email").onChange(e);
                        setValue('email', e.target.value, { shouldValidate: true });
                      }}
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
                      {...register("phone", { 
                        required: t("phoneRequired"),
                        pattern: {
                          value: /^[+\d]{1,15}$/,
                          message: t("phoneInvalid")
                        }
                      })}
                      placeholder={t("phonePlaceholder")}
                      className={`h-12 text-base bg-white ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                      autoComplete="tel"
                      onChange={(e) => {
                        register("phone").onChange(e);
                        setValue('phone', e.target.value, { shouldValidate: true });
                      }}
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
                <NumberPicker
                  id="passengers"
                  label={t("passengers")}
                  value={watch("passengers") || 1}
                  onChange={(value) => {
                    setValue('passengers', value, { shouldValidate: true });
                  }}
                  options={[
                    { value: 1, label: `1 ${t("passenger")}` },
                    { value: 2, label: `2 ${t("passengersLabel")}` },
                    { value: 3, label: `3 ${t("passengersLabel")}` },
                    { value: 4, label: `4 ${t("passengersLabel")}` },
                    { value: 5, label: `5 ${t("passengersLabel")}` },
                    { value: 6, label: `6 ${t("passengersLabel")}` },
                    { value: 7, label: `7 ${t("passengersLabel")}` },
                    { value: 8, label: `8 ${t("passengersLabel")}` },
                  ]}
                  placeholder={language === 'bg' ? 'Избери' : 'Select'}
                  icon={<Users className="h-4 w-4" />}
                  error={errors.passengers?.message}
                />
              </div>

              {/* Discount Code Section */}
              {totalPrice && arrivalDate && departureDate && arrivalTime && departureTime && (
                <div className="space-y-4 bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">{t("discountCode")}</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      id="discountCode"
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      placeholder={t("discountCodePlaceholder")}
                      className={`h-12 text-base bg-white ${discountError ? "border-red-500" : appliedDiscount ? "border-green-500" : "border-gray-300"}`}
                      disabled={!!appliedDiscount}
                    />
                    <Button
                      type="button"
                      className="bg-[#073590] hover:bg-[#052c70] font-bold text-white text-lg h-12 px-8 rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                      disabled={isValidatingDiscount || !!appliedDiscount}
                      onClick={validateDiscountCode}
                    >
                      {isValidatingDiscount ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t("validating")}
                        </>
                      ) : (
                        t("apply")
                      )}
                    </Button>
                  </div>
                  {discountError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{discountError}</p>
                    </div>
                  )}
                  {appliedDiscount && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-green-900">✓ {t("discountApplied")}</p>
                          <p className="text-xs text-green-700 mt-1">
                            {language === 'bg' ? 'Код' : 'Code'}: <span className="font-mono font-bold">{discountCode}</span>
                            {' • '}
                            {appliedDiscount.discountType === 'percentage' 
                              ? `${appliedDiscount.discountValue}% ${t("discount")}` 
                              : `€${appliedDiscount.discountValue} ${t("discount")}`}
                          </p>
                          {basePrice && totalPrice && basePrice !== totalPrice && (
                            <p className="text-xs text-green-700 mt-1">
                              {language === 'bg' ? 'Спестени' : 'Saved'}: <span className="font-bold">€{(basePrice - totalPrice).toFixed(2)} ({eurToBgn(basePrice - totalPrice).toFixed(2)} лв)</span>
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAppliedDiscount(null);
                            setDiscountCode("");
                            setTotalPrice(basePrice);
                            setDiscountError("");
                          }}
                          className="text-green-700 hover:text-green-900 hover:bg-green-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

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