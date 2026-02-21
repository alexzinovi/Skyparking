export interface PricingConfig {
  dailyPrices: Record<number, number>;
  longTermRate?: number;
}

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

// Default fallback pricing (only used if server is unreachable)
const DEFAULT_PRICING: PricingConfig = {
  dailyPrices: {
    1: 15,
    2: 20,
    3: 19,
    4: 28,
    5: 30,
    6: 25,
    7: 38,
    8: 40,
    9: 42,
    10: 46
  },
  longTermRate: 2.8
};

// Cache for pricing config
let cachedPricing: PricingConfig | null = null;
let pricingFetchPromise: Promise<PricingConfig> | null = null;

// Fetch pricing from server
async function fetchPricingConfig(): Promise<PricingConfig> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/pricing`,
      {
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.pricing) {
        console.log("✅ Fetched pricing from server:", data.pricing);
        cachedPricing = data.pricing;
        return data.pricing;
      }
    }
    
    console.warn("Failed to fetch pricing, using defaults");
    return DEFAULT_PRICING;
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return DEFAULT_PRICING;
  }
}

// Get pricing config with caching
async function getPricingConfig(): Promise<PricingConfig> {
  // Return cached if available
  if (cachedPricing) {
    return cachedPricing;
  }
  
  // Return existing promise if fetch is in progress
  if (pricingFetchPromise) {
    return pricingFetchPromise;
  }
  
  // Start new fetch
  pricingFetchPromise = fetchPricingConfig();
  const pricing = await pricingFetchPromise;
  pricingFetchPromise = null;
  
  return pricing;
}

// Force refresh pricing from server (call this when pricing is updated in admin panel)
export async function refreshPricingConfig(): Promise<void> {
  cachedPricing = null;
  pricingFetchPromise = null;
  await getPricingConfig();
}

// Calculate price for a given number of days - async to fetch pricing
export async function calculatePriceForDays(days: number): Promise<number> {
  const pricing = await getPricingConfig();
  
  // Days 1-30: Use specific daily prices
  if (days <= 30 && pricing.dailyPrices[days]) {
    return pricing.dailyPrices[days];
  }
  
  // Days 31+: Price at day 30 + longTermRate per additional day
  const day30Price = pricing.dailyPrices[30] || 0;
  const additionalDays = days - 30;
  const longTermRate = pricing.longTermRate || 2.8;
  return day30Price + (additionalDays * longTermRate);
}

// Calculate price for a date range - async, fetches from server
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

  console.log(`🧮 Calculating price: ${diffDays} days for ${numberOfCars} car(s)`);
  const pricePerCar = await calculatePriceForDays(diffDays);
  console.log(`💰 Price per car: €${pricePerCar}, Total: €${pricePerCar * numberOfCars}`);
  
  return pricePerCar * numberOfCars;
}
