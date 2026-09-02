import { useState, useEffect } from "react";
import { X, AlertCircle, Banknote, CreditCard } from "lucide-react";
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
    paymentMethod: string;
    adjustmentReason?: string;
    adjustmentNote?: string;
  }) => void;
  onCancel: () => void;
  calculateLateFee: (days: number, numberOfCars: number) => Promise<number>;
}

export function CheckoutModal({
  booking,
  onConfirm,
  onCancel,
  calculateLateFee,
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [autoCalculatedFee, setAutoCalculatedFee] = useState<number>(0);
  const [adjustedFee, setAdjustedFee] = useState<number | string>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");
  const [extraDays, setExtraDays] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  useEffect(() => {
    const calculate = async () => {
      setIsCalculating(true);

      const CUTOFF_MINUTES = 3 * 60;
      const now = new Date();

      const daysWithCutoff = (fromDate: string, to: Date): number => {
        const fromMidnight = new Date(fromDate);
        fromMidnight.setHours(0, 0, 0, 0);
        const toMidnight = new Date(to);
        toMidnight.setHours(0, 0, 0, 0);
        const mc = Math.floor((toMidnight.getTime() - fromMidnight.getTime()) / (1000 * 60 * 60 * 24));
        const toMin = to.getHours() * 60 + to.getMinutes();
        if (mc === 0) return 1;
        return Math.max(1, toMin > CUTOFF_MINUTES ? mc + 1 : mc);
      };

      const origDepDate = booking.originalDepartureDate || booking.departureDate;
      const origDepTime = booking.originalDepartureTime || booking.departureTime;
      const [origH, origM] = origDepTime.split(":").map(Number);
      const origDepDateTime = new Date(origDepDate);
      origDepDateTime.setHours(origH, origM, 0, 0);

      const originalDays = daysWithCutoff(booking.arrivalDate, origDepDateTime);
      const totalDays = daysWithCutoff(booking.arrivalDate, now);
      const extra = Math.max(0, totalDays - originalDays);
      setExtraDays(extra);

      if (extra > 0) {
        const extPrice = await calculateLateFee(totalDays, booking.numberOfCars);
        const fee = Math.max(0, extPrice - booking.totalPrice);
        setAutoCalculatedFee(fee);
        setAdjustedFee(fee);
      } else {
        setAutoCalculatedFee(0);
        setAdjustedFee(0);
      }

      setIsCalculating(false);
    };

    calculate();
  }, [booking, calculateLateFee]);

  const adjustedFeeNum = typeof adjustedFee === "string" ? parseFloat(adjustedFee) || 0 : adjustedFee;
  const isAdjusted = Math.abs(adjustedFeeNum - autoCalculatedFee) > 0.01;
  const totalDue = booking.totalPrice + adjustedFeeNum;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const origDepDate = booking.originalDepartureDate || booking.departureDate;
  const origDepTime = booking.originalDepartureTime || booking.departureTime;
  const todayStr = new Date().toISOString().split("T")[0];

  const handleNext = () => {
    const needsPayment = booking.paymentMethod === "pay-on-leave" && booking.paymentStatus !== "paid";
    if (adjustedFeeNum <= 0 && !needsPayment) {
      // No fee and already paid — confirm directly
      onConfirm({ lateFee: 0, paymentMethod: "" });
    } else {
      // Has a fee to collect OR needs to collect base payment — ask cash/card
      setStep(2);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      lateFee: adjustedFeeNum,
      paymentMethod,
      adjustmentReason: adjustmentReason || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="bg-[#073590] text-white px-5 py-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-lg font-bold">Напускане на паркинга</h2>
          <button onClick={onCancel} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="p-5 space-y-4">
            {/* Client info */}
            <div>
              <p className="text-xl font-bold text-gray-900">{booking.name}</p>
              <p className="text-sm text-gray-500">{booking.licensePlate}</p>
            </div>

            {/* Departure comparison */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Планирано заминаване</p>
                <p className="font-semibold text-gray-900">{formatDate(origDepDate)}</p>
                <p className="text-gray-600">{origDepTime}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Действително заминаване</p>
                <p className="font-semibold text-gray-900">{formatDate(todayStr)}</p>
                <p className="text-gray-600">днес</p>
              </div>
            </div>

            {/* Late fee */}
            {isCalculating ? (
              <div className="text-center py-3 text-gray-500 text-sm">Изчислява се...</div>
            ) : extraDays > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Закъснение:</span>
                  <span className="font-bold text-amber-900">{extraDays} {extraDays === 1 ? "ден" : "дни"}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Такса за закъснение (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={adjustedFee}
                    onChange={(e) => setAdjustedFee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#073590] text-lg font-bold text-center"
                  />
                  {isAdjusted && (
                    <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      Автоматична сума: €{autoCalculatedFee.toFixed(2)}
                    </p>
                  )}
                  {isAdjusted && (
                    <select
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#073590]"
                    >
                      <option value="">Причина за корекция...</option>
                      <option value="goodwill">Отстъпка от добра воля</option>
                      <option value="correction">Оператор корекция</option>
                      <option value="special-case">Специален случай</option>
                      <option value="waived">Анулирана такса</option>
                      <option value="custom">Друга причина</option>
                    </select>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                Без допълнителен престой
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-1 border-t">
              <span className="text-gray-700 font-medium">Общо за плащане:</span>
              <span className="text-2xl font-black text-[#073590]">€{totalDue.toFixed(2)}</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button onClick={onCancel} variant="outline" className="flex-1">
                Отказ
              </Button>
              <Button
                onClick={handleNext}
                disabled={isCalculating || (isAdjusted && !adjustmentReason) || adjustedFee === ""}
                className="flex-1 bg-[#073590] hover:bg-[#052560] text-white font-bold"
              >
                {(adjustedFeeNum > 0 || (booking.paymentMethod === "pay-on-leave" && booking.paymentStatus !== "paid")) ? "Напред →" : "Потвърди"}
              </Button>
            </div>
            {isAdjusted && !adjustmentReason && (
              <p className="text-xs text-red-600 text-center -mt-2">Изберете причина за корекцията</p>
            )}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Метод на плащане за</p>
              <p className="font-bold text-gray-900">{booking.name}</p>
              {booking.paymentMethod === "pay-on-leave" && (
                <p className="text-sm text-red-700 font-semibold mt-1">
                  💳 Плаща при тръгване — събери сумата сега
                </p>
              )}
              {extraDays > 0 && (
                <p className="text-sm text-amber-700 mt-1">
                  Включва доплащане €{adjustedFeeNum.toFixed(2)} за закъснение
                </p>
              )}
            </div>

            <div className="text-center py-1">
              <span className="text-3xl font-black text-[#073590]">€{totalDue.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold transition-all ${
                  paymentMethod === "cash"
                    ? "border-green-500 bg-green-50 text-green-800"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Banknote className="w-8 h-8" />
                Кеш
              </button>
              <button
                onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold transition-all ${
                  paymentMethod === "card"
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <CreditCard className="w-8 h-8" />
                Карта
              </button>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                ← Назад
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!paymentMethod}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                Потвърди
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
