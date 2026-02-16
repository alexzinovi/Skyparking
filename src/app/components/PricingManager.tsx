import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { DollarSign, Save, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { invalidatePricingCache } from "@/app/utils/pricing";

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

interface PricingConfig {
  dailyPrices: Record<number, number>;
  midRangeRate: number;
  midRangeMaxDay: number;
  longTermRate: number;
}

interface PricingManagerProps {
  sessionToken: string;
}

export function PricingManager({ sessionToken }: PricingManagerProps) {
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalPricing, setOriginalPricing] = useState<PricingConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch current pricing
  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching pricing from backend...");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/pricing`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      console.log("Pricing response status:", response.status);
      const data = await response.json();
      console.log("Pricing data:", data);
      
      if (data.success) {
        setPricing(data.pricing);
        setOriginalPricing(JSON.parse(JSON.stringify(data.pricing))); // Deep clone
      } else {
        setError("Failed to load pricing: " + (data.message || "Unknown error"));
        toast.error("Failed to load pricing");
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
      setError("Failed to load pricing: " + String(error));
      toast.error("Failed to load pricing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pricing) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/pricing`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Session-Token": sessionToken,
          },
          body: JSON.stringify(pricing),
        }
      );

      const data = await response.json();
      if (data.success) {
        setOriginalPricing(JSON.parse(JSON.stringify(pricing))); // Update original
        invalidatePricingCache(); // Clear cache so frontend gets new prices
        toast.success("Pricing updated successfully");
      } else {
        toast.error(data.message || "Failed to update pricing");
      }
    } catch (error) {
      console.error("Error updating pricing:", error);
      toast.error("Failed to update pricing");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalPricing) {
      setPricing(JSON.parse(JSON.stringify(originalPricing))); // Deep clone
      toast.info("Changes reset");
    }
  };

  const updateDailyPrice = (day: number, value: string) => {
    if (!pricing) return;
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setPricing({
        ...pricing,
        dailyPrices: {
          ...pricing.dailyPrices,
          [day]: numValue,
        },
      });
    }
  };

  const updateRate = (field: 'midRangeRate' | 'longTermRate' | 'midRangeMaxDay', value: string) => {
    if (!pricing) return;
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setPricing({
        ...pricing,
        [field]: numValue,
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading pricing configuration...</span>
        </div>
      </Card>
    );
  }

  if (error || !pricing) {
    return (
      <Card className="p-8">
        <div className="text-center py-8">
          <p className="text-red-600 font-semibold mb-2">Failed to load pricing configuration</p>
          {error && <p className="text-sm text-gray-600 mb-4">{error}</p>}
          <Button onClick={fetchPricing} className="mt-4">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const hasChanges = JSON.stringify(pricing) !== JSON.stringify(originalPricing);

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <DollarSign className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
          <h2 className="text-2xl sm:text-3xl font-bold">Pricing Management</h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {hasChanges && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
              className="text-base sm:text-lg py-5 sm:py-6 px-4 sm:px-6 flex-1 sm:flex-none"
            >
              <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Reset
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-green-600 hover:bg-green-700 text-base sm:text-lg py-5 sm:py-6 px-4 sm:px-6 flex-1 sm:flex-none"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 animate-spin" />
            ) : (
              <Save className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Daily Prices (Days 1-10) */}
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold mb-4">Daily Prices (Days 1-10)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => (
              <div key={day} className="space-y-2">
                <Label htmlFor={`day-${day}`} className="text-base sm:text-lg">Day {day}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base sm:text-lg">€</span>
                  <Input
                    id={`day-${day}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.dailyPrices[day] || 0}
                    onChange={(e) => updateDailyPrice(day, e.target.value)}
                    className="pl-8 sm:pl-9 text-base sm:text-lg py-5 sm:py-6"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mid-Range Pricing (Days 11-30) */}
        <div className="border-t pt-6">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4">Mid-Range Pricing (Days 11-30)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="midRangeRate" className="text-base sm:text-lg">Price per additional day</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base sm:text-lg">€</span>
                <Input
                  id="midRangeRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.midRangeRate}
                  onChange={(e) => updateRate('midRangeRate', e.target.value)}
                  className="pl-8 sm:pl-9 text-base sm:text-lg py-5 sm:py-6"
                />
              </div>
              <p className="text-base sm:text-lg text-gray-600">
                Days 11-{pricing.midRangeMaxDay}: Base price from Day 10 + €{pricing.midRangeRate}/day
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="midRangeMaxDay" className="text-base sm:text-lg">Last day of mid-range pricing</Label>
              <Input
                id="midRangeMaxDay"
                type="number"
                min="11"
                step="1"
                value={pricing.midRangeMaxDay}
                onChange={(e) => updateRate('midRangeMaxDay', e.target.value)}
                className="text-base sm:text-lg py-5 sm:py-6"
              />
              <p className="text-base sm:text-lg text-gray-600">
                Typically 30 days
              </p>
            </div>
          </div>
        </div>

        {/* Long-Term Pricing (31+ days) */}
        <div className="border-t pt-6">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4">Long-Term Pricing (Day {pricing.midRangeMaxDay + 1}+)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="longTermRate" className="text-base sm:text-lg">Price per additional day</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base sm:text-lg">€</span>
                <Input
                  id="longTermRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.longTermRate}
                  onChange={(e) => updateRate('longTermRate', e.target.value)}
                  className="pl-8 sm:pl-9 text-base sm:text-lg py-5 sm:py-6"
                />
              </div>
              <p className="text-base sm:text-lg text-gray-600">
                Day {pricing.midRangeMaxDay + 1}+: Price at Day {pricing.midRangeMaxDay} + €{pricing.longTermRate}/day
              </p>
            </div>
          </div>
        </div>

        {/* Price Examples */}
        <div className="border-t pt-6">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4">Price Examples</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 7, 15, 30, 45, 60].map((days) => {
              let price = 0;
              if (days <= 10) {
                price = pricing.dailyPrices[days] || 0;
              } else if (days <= pricing.midRangeMaxDay) {
                price = (pricing.dailyPrices[10] || 0) + ((days - 10) * pricing.midRangeRate);
              } else {
                const day30Price = (pricing.dailyPrices[10] || 0) + ((pricing.midRangeMaxDay - 10) * pricing.midRangeRate);
                price = day30Price + ((days - pricing.midRangeMaxDay) * pricing.longTermRate);
              }

              return (
                <div key={days} className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
                  <p className="text-base sm:text-lg text-gray-600">{days} {days === 1 ? 'day' : 'days'}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">€{price.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
            <p className="text-yellow-800 font-medium text-base sm:text-lg">⚠️ Unsaved Changes</p>
            <p className="text-base sm:text-lg text-yellow-700 mt-1">
              Remember to save your changes. The new pricing will apply to all future bookings.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}