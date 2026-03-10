export interface PricingConfig {
  dailyPrices: Record<number, number>;
  longTermRate?: number;
}

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

// Default fallback pricing (only used if server is unreachable)
const DEFAULT_PRICING: PricingConfig = {
  dailyPrices: {
    1: 10,
    2: 15,
    3: 19,
    4: 21,
    5: 23,
    6: 25,
    7: 28,
    8: 30,
    9: 32,
    10: 34,
    11: 36,
    12: 38,
    13: 40,
    14: 43,
    15: 46,
    16: 49,
    17: 52,
    18: 55,
    19: 57,
    20: 59,
    21: 61,
    22: 63,
    23: 65,
    24: 67,
    25: 69,
    26: 71,
    27: 73,
    28: 75,
    29: 77,
    30: 79
  },
  longTermRate: 2.8
};

// Cache for pricing config
let cachedPricing: PricingConfig | null = null;
let pricingFetchPromise: Promise<PricingConfig> | null = null;
let isPricingInitialized = false;

const PRICING_CACHE_KEY = 'skyparking_pricing_cache';
const PRICING_CACHE_TIMESTAMP_KEY = 'skyparking_pricing_cache_timestamp';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Load pricing from localStorage cache
function loadPricingFromCache(): PricingConfig | null {
  try {
    const cached = localStorage.getItem(PRICING_CACHE_KEY);
    const timestamp = localStorage.getItem(PRICING_CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_EXPIRY_MS) {
        console.log("📦 Loading pricing from localStorage cache");
        return JSON.parse(cached);
      }
    }
  } catch (error) {
    console.warn("Failed to load pricing from cache:", error);
  }
  return null;
}

// Save pricing to localStorage cache
function savePricingToCache(pricing: PricingConfig): void {
  try {
    localStorage.setItem(PRICING_CACHE_KEY, JSON.stringify(pricing));
    localStorage.setItem(PRICING_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn("Failed to save pricing to cache:", error);
  }
}

// Fetch pricing from server with timeout
async function fetchPricingConfig(): Promise<PricingConfig> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced to 5 second timeout
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/pricing`,
      {
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.pricing) {
        console.log("✅ Fetched pricing from server");
        cachedPricing = data.pricing;
        isPricingInitialized = true;
        savePricingToCache(data.pricing); // Save to localStorage
        return data.pricing;
      }
    }
    
    console.log("📦 Server pricing unavailable, using cache");
    
    // Try localStorage cache
    const cachedData = loadPricingFromCache();
    if (cachedData) {
      cachedPricing = cachedData;
      isPricingInitialized = true;
      return cachedData;
    }
    
    // Fall back to defaults
    console.log("⚙️ Using default pricing");
    cachedPricing = DEFAULT_PRICING;
    isPricingInitialized = true;
    return DEFAULT_PRICING;
  } catch (error) {
    // Don't log timeout as error - it's expected sometimes
    if (error instanceof Error && error.name === 'AbortError') {
      console.log("📦 Using cached pricing");
    } else {
      console.log("📦 Network issue, using cached pricing");
    }
    
    // Try localStorage cache on error
    const cachedData = loadPricingFromCache();
    if (cachedData) {
      cachedPricing = cachedData;
      isPricingInitialized = true;
      return cachedData;
    }
    
    // Final fallback to defaults
    console.log("⚙️ Using default pricing");
    cachedPricing = DEFAULT_PRICING;
    isPricingInitialized = true;
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
  isPricingInitialized = false;
  
  // Clear localStorage cache
  try {
    localStorage.removeItem(PRICING_CACHE_KEY);
    localStorage.removeItem(PRICING_CACHE_TIMESTAMP_KEY);
    console.log("🔄 Cleared pricing cache, fetching fresh data...");
  } catch (error) {
    console.warn("Failed to clear cache:", error);
  }
  
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

// Preload pricing config (call this on app initialization)
export function preloadPricing(): void {
  if (!isPricingInitialized && !pricingFetchPromise) {
    console.log("🚀 Preloading pricing configuration...");
    
    // Try loading from localStorage first for instant availability
    const cachedData = loadPricingFromCache();
    if (cachedData) {
      cachedPricing = cachedData;
      isPricingInitialized = true;
      console.log("⚡ Pricing instantly available from cache");
      
      // Still fetch from server in background to update cache
      fetchPricingConfig().catch(err => {
        console.warn("Background pricing fetch failed:", err);
      });
    } else {
      // No cache, fetch from server
      getPricingConfig().then(() => {
        console.log("✅ Pricing preloaded and ready");
      }).catch(err => {
        console.error("Pricing preload failed:", err);
      });
    }
  }
}