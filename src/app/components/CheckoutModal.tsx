import { useState, useEffect } from "react";
import { X, Calendar, Clock, Car, User, Euro, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface CheckoutModalProps {
  booking: {
    id: string;
    name: string;
    licensePlate: string;
    arrivalDate: string;
    arrivalTime: string;
    departureDate: string;
    departureTime: string;
    totalPrice: number;
    numberOfCars: number;
    isLate?: boolean;
    lateSurcharge?: number;
    originalDepartureDate?: string;
    originalDepartureTime?: string;
  };
  onConfirm: (data: {
    lateFee: number;
    adjustmentReason?: string;
    adjustmentNote?: string;
  }) => void;
  onCancel: () => void;
  calculateLateFee: (extraDays: number, numberOfCars: number) => Promise<number>;
}

export function CheckoutModal({
  booking,
  onConfirm,
  onCancel,
  calculateLateFee,
}: CheckoutModalProps) {
  const [autoCalculatedFee, setAutoCalculatedFee] = useState<number>(0);
  const [adjustedFee, setAdjustedFee] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");
  const [adjustmentNote, setAdjustmentNote] = useState<string>("");
  const [extraDays, setExtraDays] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    const calculateExtraStay = async () => {
      setIsCalculating(true);
      
      // Calculate extra days
      const now = new Date();
      const originalDeparture = new Date(
        booking.originalDepartureDate || booking.departureDate
      );
      
      now.setHours(0, 0, 0, 0);
      originalDeparture.setHours(0, 0, 0, 0);
      
      const daysLate = Math.floor(
        (now.getTime() - originalDeparture.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      setExtraDays(Math.max(0, daysLate));
      
      if (daysLate > 0) {
        // Calculate the TOTAL duration including late days
        const arrival = new Date(booking.arrivalDate);
        arrival.setHours(0, 0, 0, 0);
        
        const totalDays = Math.floor(
          (now.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Calculate what the price SHOULD be for the total duration
        const totalPrice = await calculateLateFee(totalDays, booking.numberOfCars);
        
        // The late surcharge is the difference between total price and original price
        const lateSurcharge = totalPrice - booking.totalPrice;
        
        setAutoCalculatedFee(Math.max(0, lateSurcharge));
        setAdjustedFee(Math.max(0, lateSurcharge));
      } else {
        setAutoCalculatedFee(0);
        setAdjustedFee(0);
      }
      
      setIsCalculating(false);
    };
    
    calculateExtraStay();
  }, [booking, calculateLateFee]);

  const handleConfirm = () => {
    onConfirm({
      lateFee: adjustedFee,
      adjustmentReason: adjustmentReason || undefined,
      adjustmentNote: adjustmentNote || undefined,
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const isAdjusted = Math.abs(adjustedFee - autoCalculatedFee) > 0.01;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#073590] text-white p-6 flex items-center justify-between sticky top-0">
          <h2 className="text-2xl font-bold">Напускане на паркинга</h2>
          <button
            onClick={onCancel}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section 1: Reservation Info */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#073590]" />
              Информация за резервацията
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Клиент:</span>
                <p className="font-medium text-gray-900">{booking.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Рег. номер:</span>
                <p className="font-medium text-gray-900">{booking.licensePlate}</p>
              </div>
              <div>
                <span className="text-gray-600">Планирано заминаване:</span>
                <p className="font-medium text-gray-900">
                  {formatDate(booking.originalDepartureDate || booking.departureDate)} в{" "}
                  {booking.originalDepartureTime || booking.departureTime}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Действително заминаване:</span>
                <p className="font-medium text-gray-900">
                  {formatDate(new Date().toISOString().split("T")[0])} (днес)
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Additional Stay Calculation */}
          {extraDays > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
              <h3 className="font-semibold text-lg text-amber-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Допълнителен престой
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Допълнителни дни:</span>
                  <span className="font-bold text-lg text-amber-900">
                    {extraDays} {extraDays === 1 ? "ден" : "дни"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Автоматично изчислена такса:</span>
                  <span className="font-bold text-lg text-amber-900">
                    {isCalculating ? "Изчислява се..." : `€${autoCalculatedFee.toFixed(2)}`}
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-2 bg-amber-100 p-2 rounded">
                  💡 Таксата е изчислена с използване на стандартния ценоразпис за {extraDays}{" "}
                  {extraDays === 1 ? "ден" : "дни"} престой за {booking.numberOfCars}{" "}
                  {booking.numberOfCars === 1 ? "автомобил" : "автомобила"}.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h3 className="font-semibold text-lg text-green-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Без допълнителен престой
              </h3>
              <p className="text-green-800">
                Клиентът напуска в рамките на първоначалната резервация.
              </p>
            </div>
          )}

          {/* Section 3: Operator Adjustment */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h3 className="font-semibold text-lg text-blue-900 mb-4 flex items-center gap-2">
              <Euro className="w-5 h-5 text-blue-600" />
              Корекция от оператор
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Крайна такса за допълнителен престой (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={adjustedFee}
                  onChange={(e) => setAdjustedFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#073590] focus:border-transparent text-lg font-medium"
                  disabled={isCalculating}
                />
                {isAdjusted && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Коригирана от автоматичната сума (€{autoCalculatedFee.toFixed(2)})
                  </p>
                )}
              </div>

              {isAdjusted && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Причина за корекция
                    </label>
                    <select
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#073590] focus:border-transparent"
                    >
                      <option value="">Изберете причина...</option>
                      <option value="goodwill">Отстъпка от добра воля</option>
                      <option value="correction">Оператор корекция</option>
                      <option value="special-case">Специален случай</option>
                      <option value="waived">Анулирана такса</option>
                      <option value="custom">Друга причина</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Бележка (опционално)
                    </label>
                    <textarea
                      value={adjustmentNote}
                      onChange={(e) => setAdjustmentNote(e.target.value)}
                      placeholder="Добавете допълнителна информация за корекцията..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#073590] focus:border-transparent resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 4: Final Summary */}
          <div className="bg-gray-100 rounded-lg p-5 border-2 border-gray-300">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Обобщение</h3>
            <div className="space-y-2 text-base">
              <div className="flex justify-between">
                <span className="text-gray-700">Първоначална цена:</span>
                <span className="font-medium">€{booking.totalPrice.toFixed(2)}</span>
              </div>
              {extraDays > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Допълнителен престой:</span>
                  <span className="font-medium text-amber-700">
                    €{adjustedFee.toFixed(2)}
                    {isAdjusted && <span className="text-xs ml-1">(коригирано)</span>}
                  </span>
                </div>
              )}
              <div className="border-t-2 border-gray-400 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-bold text-lg">Обща сума:</span>
                  <span className="font-bold text-2xl text-[#073590]">
                    €{(booking.totalPrice + adjustedFee).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 h-12 text-base font-medium"
            >
              Отказ
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isCalculating || (isAdjusted && !adjustmentReason)}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white text-base font-bold"
            >
              {isCalculating ? "Изчислява се..." : "Потвърди напускане"}
            </Button>
          </div>
          
          {isAdjusted && !adjustmentReason && (
            <p className="text-xs text-red-600 text-center mt-2">
              Моля, изберете причина за корекцията
            </p>
          )}
        </div>
      </div>
    </div>
  );
}