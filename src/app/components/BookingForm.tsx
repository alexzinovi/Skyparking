import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { CalendarIcon, CreditCard, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";

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
  companyName?: string;
  companyOwner?: string;
  taxNumber?: string;
  isVAT?: boolean;
  vatNumber?: string;
  city?: string;
  address?: string;
}

export function BookingForm() {
  const { t } = useLanguage();
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

  const calculatePrice = (arrival: string, arrivalT: string, departure: string, departureT: string) => {
    if (!arrival || !departure || !arrivalT || !departureT) return null;

    const arrivalDateTime = new Date(`${arrival}T${arrivalT}`);
    const departureDateTime = new Date(`${departure}T${departureT}`);

    if (departureDateTime <= arrivalDateTime) return null;

    const diffTime = Math.abs(departureDateTime.getTime() - arrivalDateTime.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const pricePerDay = 5; // €5 per day per car
    const minimumCharge = 10; // €10 minimum per car
    const calculatedPrice = diffDays * pricePerDay;

    const pricePerCar = Math.max(calculatedPrice, minimumCharge);
    const totalPrice = pricePerCar * numberOfCars; // Multiply by number of cars

    return totalPrice;
  };

  // Auto-calculate price when dates change
  useEffect(() => {
    const price = calculatePrice(arrivalDate, arrivalTime, departureDate, departureTime);
    setTotalPrice(price);
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
    const price = calculatePrice(data.arrivalDate, data.arrivalTime, data.departureDate, data.departureTime);
    
    if (!price) {
      toast.error(t("checkDates"));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create reservation in database
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          ...data,
          numberOfCars: numberOfCars, // Pass number of cars to backend
          totalPrice: price,
          paymentStatus: "unpaid", // Customer will pay on arrival
          vatNumber: isVAT ? autoVatNumber : undefined, // Use auto-generated VAT number if VAT is checked
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to create reservation");
      }

      // Show success message with reservation details
      toast.success(t("bookingConfirmed") + " €" + price);
      toast.info("Reservation ID: " + result.booking.id.substring(8, 16).toUpperCase());
      
      // Optionally reset the form or show confirmation
      console.log("Reservation created:", result.booking);
      
    } catch (error: any) {
      console.error("Reservation error:", error);
      toast.error("Failed to create reservation: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPrice = calculatePrice(arrivalDate, arrivalTime, departureDate, departureTime);

  return (
    <section id="booking" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="mb-4">{t("bookYourParking")}</h2>
            <p className="text-gray-600">
              {t("fillDetails")}
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Number of Cars Selection */}
              <div className="space-y-2">
                <Label htmlFor="numberOfCars">{t("numberOfCars")}</Label>
                <select
                  id="numberOfCars"
                  className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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

              {/* Date and Time Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrivalDate">
                    <CalendarIcon className="inline h-4 w-4 mr-2" />
                    {t("arrivalDate")}
                  </Label>
                  <Input
                    id="arrivalDate"
                    type="date"
                    {...register("arrivalDate", { required: t("arrivalDateRequired") })}
                    className={errors.arrivalDate ? "border-red-500" : ""}
                  />
                  {errors.arrivalDate && (
                    <p className="text-sm text-red-500">{errors.arrivalDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">{t("arrivalTime")}</Label>
                  <select
                    id="arrivalTime"
                    {...register("arrivalTime", { required: t("arrivalTimeRequired") })}
                    className={`w-full h-10 px-3 border rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.arrivalTime ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">{t("selectTime")}</option>
                    <option value="00:00">00:00</option>
                    <option value="01:00">01:00</option>
                    <option value="02:00">02:00</option>
                    <option value="03:00">03:00</option>
                    <option value="04:00">04:00</option>
                    <option value="05:00">05:00</option>
                    <option value="06:00">06:00</option>
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                    <option value="22:00">22:00</option>
                    <option value="23:00">23:00</option>
                  </select>
                  {errors.arrivalTime && (
                    <p className="text-sm text-red-500">{errors.arrivalTime.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureDate">
                    <CalendarIcon className="inline h-4 w-4 mr-2" />
                    {t("departureDate")}
                  </Label>
                  <Input
                    id="departureDate"
                    type="date"
                    {...register("departureDate", { required: t("departureDateRequired") })}
                    className={errors.departureDate ? "border-red-500" : ""}
                  />
                  {errors.departureDate && (
                    <p className="text-sm text-red-500">{errors.departureDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureTime">{t("departureTime")}</Label>
                  <select
                    id="departureTime"
                    {...register("departureTime", { required: t("departureTimeRequired") })}
                    className={`w-full h-10 px-3 border rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.departureTime ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">{t("selectTime")}</option>
                    <option value="00:00">00:00</option>
                    <option value="01:00">01:00</option>
                    <option value="02:00">02:00</option>
                    <option value="03:00">03:00</option>
                    <option value="04:00">04:00</option>
                    <option value="05:00">05:00</option>
                    <option value="06:00">06:00</option>
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                    <option value="22:00">22:00</option>
                    <option value="23:00">23:00</option>
                  </select>
                  {errors.departureTime && (
                    <p className="text-sm text-red-500">{errors.departureTime.message}</p>
                  )}
                </div>
              </div>

              {/* Price Display */}
              {currentPrice && arrivalDate && departureDate && arrivalTime && departureTime && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 my-6">
                  <p className="text-gray-700 text-center mb-2">{t("estimatedTotal")}</p>
                  <p className="text-4xl font-bold text-blue-600 text-center">€{currentPrice}</p>
                  <div className="text-sm text-gray-600 mt-3 space-y-1 text-center">
                    <p>{Math.ceil((new Date(`${departureDate}T${departureTime}`).getTime() - new Date(`${arrivalDate}T${arrivalTime}`).getTime()) / (1000 * 60 * 60 * 24))} {t("days")}</p>
                    {numberOfCars > 1 && (
                      <p className="text-blue-700 font-medium">
                        €{currentPrice / numberOfCars} × {numberOfCars} {numberOfCars === 1 ? t("car") : t("cars")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t("personalInfo")}</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">{t("fullName")}</Label>
                  <Input
                    id="name"
                    {...register("name", { required: t("nameRequired") })}
                    placeholder={t("namePlaceholder")}
                    className={errors.name ? "border-red-500" : ""}
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
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
                      className={errors.email ? "border-red-500" : ""}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone", { required: t("phoneRequired") })}
                      placeholder={t("phonePlaceholder")}
                      className={errors.phone ? "border-red-500" : ""}
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Invoice Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <Label>{t("needInvoice")}</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="yes"
                          checked={needsInvoice === true}
                          onChange={() => setNeedsInvoice(true)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span>{t("yes")}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="no"
                          checked={needsInvoice === false}
                          onChange={() => setNeedsInvoice(false)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span>{t("no")}</span>
                      </label>
                    </div>
                  </div>

                  {/* Conditional Invoice Fields */}
                  {needsInvoice && (
                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900">{t("invoiceDetails")}</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companyName">{t("companyName")}</Label>
                        <Input
                          id="companyName"
                          {...register("companyName", { required: needsInvoice ? t("companyNameRequired") : false })}
                          placeholder={t("companyNamePlaceholder")}
                          className={errors.companyName ? "border-red-500 bg-white" : "bg-white"}
                        />
                        {errors.companyName && (
                          <p className="text-sm text-red-500">{errors.companyName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyOwner">{t("companyOwner")}</Label>
                        <Input
                          id="companyOwner"
                          {...register("companyOwner", { required: needsInvoice ? t("companyOwnerRequired") : false })}
                          placeholder={t("companyOwnerPlaceholder")}
                          className={errors.companyOwner ? "border-red-500 bg-white" : "bg-white"}
                        />
                        {errors.companyOwner && (
                          <p className="text-sm text-red-500">{errors.companyOwner.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxNumber">{t("taxNumber")}</Label>
                        <Input
                          id="taxNumber"
                          {...register("taxNumber", { required: needsInvoice ? t("taxNumberRequired") : false })}
                          placeholder={t("taxNumberPlaceholder")}
                          className={errors.taxNumber ? "border-red-500 bg-white" : "bg-white"}
                        />
                        {errors.taxNumber && (
                          <p className="text-sm text-red-500">{errors.taxNumber.message}</p>
                        )}
                      </div>

                      {/* Auto-generated VAT Number Display - appears when VAT is checked */}
                      {isVAT && (
                        <div className={`space-y-2 p-3 rounded-md border ${autoVatNumber ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                          {autoVatNumber ? (
                            <>
                              <Label htmlFor="autoVatNumber">{t("vatNumber")}</Label>
                              <Input
                                id="autoVatNumber"
                                value={autoVatNumber}
                                readOnly
                                className="bg-white font-semibold text-green-700"
                              />
                              <p className="text-xs text-green-600">{t("autoGeneratedVAT")}</p>
                            </>
                          ) : (
                            <p className="text-sm text-yellow-700 flex items-center gap-2">
                              <span>⚠️</span>
                              <span>{t("enterTaxNumberFirst")}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* VAT Checkbox */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isVAT}
                            onChange={(e) => setIsVAT(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="font-medium">{t("isVAT")}</span>
                        </label>
                      </div>

                      {/* City Dropdown with Search */}
                      <div className="space-y-2">
                        <Label htmlFor="city">{t("city")}</Label>
                        <select
                          id="city"
                          {...register("city", { required: needsInvoice ? t("cityRequired") : false })}
                          className={`w-full h-10 px-3 border rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.city ? "border-red-500" : "border-gray-300"}`}
                        >
                          <option value="">{t("selectCity")}</option>
                          <option value="Sofia">София / Sofia</option>
                          <option value="Plovdiv">Пловдив / Plovdiv</option>
                          <option value="Varna">Варна / Varna</option>
                          <option value="Burgas">Бургас / Burgas</option>
                          <option value="Ruse">Русе / Ruse</option>
                          <option value="Stara Zagora">Стара Загора / Stara Zagora</option>
                          <option value="Pleven">Плевен / Pleven</option>
                          <option value="Sliven">Сливен / Sliven</option>
                          <option value="Dobrich">Добрич / Dobrich</option>
                          <option value="Shumen">Шумен / Shumen</option>
                          <option value="Pernik">Перник / Pernik</option>
                          <option value="Haskovo">Хасково / Haskovo</option>
                          <option value="Yambol">Ямбол / Yambol</option>
                          <option value="Pazardzhik">Пазарджик / Pazardzhik</option>
                          <option value="Blagoevgrad">Благоевград / Blagoevgrad</option>
                          <option value="Veliko Tarnovo">Велико Търново / Veliko Tarnovo</option>
                          <option value="Vratsa">Враца / Vratsa</option>
                          <option value="Gabrovo">Габрово / Gabrovo</option>
                          <option value="Vidin">Видин / Vidin</option>
                          <option value="Kardzhali">Кърджали / Kardzhali</option>
                        </select>
                        {errors.city && (
                          <p className="text-sm text-red-500">{errors.city.message}</p>
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <Label htmlFor="address">{t("address")}</Label>
                        <Input
                          id="address"
                          {...register("address", { required: needsInvoice ? t("addressRequired") : false })}
                          placeholder={t("addressPlaceholder")}
                          className={errors.address ? "border-red-500 bg-white" : "bg-white"}
                        />
                        {errors.address && (
                          <p className="text-sm text-red-500">{errors.address.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* License Plates Section */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-lg font-semibold">{t("vehicleInformation")}</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">{t("licensePlate")} 1</Label>
                    <Input
                      id="licensePlate"
                      {...register("licensePlate", { required: t("licensePlateRequired") })}
                      placeholder={t("licensePlatePlaceholder")}
                      className={errors.licensePlate ? "border-red-500" : ""}
                    />
                    {errors.licensePlate && (
                      <p className="text-sm text-red-500">{errors.licensePlate.message}</p>
                    )}
                  </div>

                  {numberOfCars >= 2 && (
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate2">{t("licensePlate")} 2</Label>
                      <Input
                        id="licensePlate2"
                        {...register("licensePlate2", { required: numberOfCars >= 2 ? t("licensePlateRequired") : false })}
                        placeholder={t("licensePlatePlaceholder")}
                        className={errors.licensePlate2 ? "border-red-500" : ""}
                      />
                      {errors.licensePlate2 && (
                        <p className="text-sm text-red-500">{errors.licensePlate2.message}</p>
                      )}
                    </div>
                  )}

                  {numberOfCars >= 3 && (
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate3">{t("licensePlate")} 3</Label>
                      <Input
                        id="licensePlate3"
                        {...register("licensePlate3", { required: numberOfCars >= 3 ? t("licensePlateRequired") : false })}
                        placeholder={t("licensePlatePlaceholder")}
                        className={errors.licensePlate3 ? "border-red-500" : ""}
                      />
                      {errors.licensePlate3 && (
                        <p className="text-sm text-red-500">{errors.licensePlate3.message}</p>
                      )}
                    </div>
                  )}

                  {numberOfCars >= 4 && (
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate4">{t("licensePlate")} 4</Label>
                      <Input
                        id="licensePlate4"
                        {...register("licensePlate4", { required: numberOfCars >= 4 ? t("licensePlateRequired") : false })}
                        placeholder={t("licensePlatePlaceholder")}
                        className={errors.licensePlate4 ? "border-red-500" : ""}
                      />
                      {errors.licensePlate4 && (
                        <p className="text-sm text-red-500">{errors.licensePlate4.message}</p>
                      )}
                    </div>
                  )}

                  {numberOfCars >= 5 && (
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate5">{t("licensePlate")} 5</Label>
                      <Input
                        id="licensePlate5"
                        {...register("licensePlate5", { required: numberOfCars >= 5 ? t("licensePlateRequired") : false })}
                        placeholder={t("licensePlatePlaceholder")}
                        className={errors.licensePlate5 ? "border-red-500" : ""}
                      />
                      {errors.licensePlate5 && (
                        <p className="text-sm text-red-500">{errors.licensePlate5.message}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Passengers Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="passengers">{t("passengers")}</Label>
                  <select
                    id="passengers"
                    {...register("passengers", { required: t("passengersRequired") })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full bg-[#ffd700] text-[#1a1a2e] hover:bg-[#ffed4e] font-bold">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                {t("proceedToPayment")}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}