const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

export interface PricingConfig {
  dailyPrices: Record<number, number>;
  midRangeRate: number;
  midRangeMaxDay: number;
  longTermRate: number;
}

let cachedPricing: PricingConfig | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 60000; // 1 minute

// Fetch pricing configuration from backend
export async function fetchPricingConfig(): Promise<PricingConfig> {
  const now = Date.now();
  
  // Return cached pricing if still valid
  if (cachedPricing && (now - lastFetch) < CACHE_DURATION) {
    return cachedPricing;
  }

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/pricing`,
      {
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
        },
      }
    );

    const data = await response.json();
    if (data.success) {
      cachedPricing = data.pricing;
      lastFetch = now;
      return data.pricing;
    }
  } catch (error) {
    console.error("Failed to fetch pricing config:", error);
  }

  // Return default pricing if fetch fails
  return {
    dailyPrices: {
      1: 15,
      2: 20,
      3: 25,
      4: 28,
      5: 30,
      6: 35,
      7: 38,
      8: 40,
      9: 42,
      10: 46
    },
    midRangeRate: 5,
    midRangeMaxDay: 30,
    longTermRate: 2.8
  };
}

// Calculate price for a given number of days
export async function calculatePriceForDays(days: number): Promise<number> {
  const pricing = await fetchPricingConfig();
  
  // Days 1-10: Use specific daily prices
  if (days <= 10 && pricing.dailyPrices[days]) {
    return pricing.dailyPrices[days];
  }
  
  // Days 11-30: Base price from day 10 + midRangeRate per additional day
  if (days <= pricing.midRangeMaxDay) {
    const basePrice = pricing.dailyPrices[10];
    const additionalDays = days - 10;
    return basePrice + (additionalDays * pricing.midRangeRate);
  }
  
  // Days 31+: Price at day 30 + longTermRate per additional day
  const day30Price = pricing.dailyPrices[10] + ((pricing.midRangeMaxDay - 10) * pricing.midRangeRate);
  const additionalDays = days - pricing.midRangeMaxDay;
  return day30Price + (additionalDays * pricing.longTermRate);
}

// Calculate price for a date range
export async function calculatePrice(
  arrivalDate: string,
  arrivalTime: string,
  departureDate: string,
  departureTime: string,
  numberOfCars: number = 1
): Promise<number | null> {
  if (!arrivalDate || !departureDate || !arrivalTime || !departureTime) return null;

  const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);
  const departureDateTime = new Date(`${departureDate}T${departureTime}`);

  if (departureDateTime <= arrivalDateTime) return null;

  const diffTime = Math.abs(departureDateTime.getTime() - arrivalDateTime.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const pricePerCar = await calculatePriceForDays(diffDays);
  return pricePerCar * numberOfCars;
}

// Invalidate cache (call this after updating pricing)
export function invalidatePricingCache() {
  cachedPricing = null;
  lastFetch = 0;
}
