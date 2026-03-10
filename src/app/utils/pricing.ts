export interface PricingConfig {
  dailyPrices: Record<number, number>;
  longTermRate?: number;
}

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

// Default fallback pricing (only used if server is unreachable)
// IMPORTANT: This should match the current pricing in the database
const DEFAULT_PRICING: PricingConfig = {
  dailyPrices: {
    1: 10,
    2: 18,
    3: 21,
    4: 24,
    5: 27,
    6: 30,
    7: 33,
    8: 37,
    9: 40,
    10: 43,
    11: 46,
    12: 49,
    13: 52,
    14: 55,
    15: 58,
    16: 61,
    17: 64,
    18: 67,
    19: 70,
    20: 73,
    21: 76,
    22: 79,
    23: 82,
    24: 85,
    25: 88,
    26: 91,
    27: 94,
    28: 97,
    29: 100,
    30: 103
  },
  longTermRate: 2.8
};

// Cache for pricing config
let cachedPricing: PricingConfig | null = null;
let pricingFetchPromise: Promise<PricingConfig> | null = null;
let isPricingInitialized = false;

const PRICING_CACHE_KEY = 'skyparking_pricing_cache';
const PRICING_CACHE_TIMESTAMP_KEY = 'skyparking_pricing_cache_timestamp';
const PRICING_CACHE_VERSION_KEY = 'skyparking_pricing_cache_version';
const CURRENT_CACHE_VERSION = '2'; // Increment this to force cache clear
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes - only for "fresh" cache checks
const PERMANENT_FALLBACK_KEY = 'skyparking_pricing_permanent_fallback'; // Never expires, always available

// Load pricing from localStorage cache
function loadPricingFromCache(): PricingConfig | null {
  try {
    // Check version first
    const version = localStorage.getItem(PRICING_CACHE_VERSION_KEY);
    if (version !== CURRENT_CACHE_VERSION) {
      console.log(`🔄 Cache version mismatch (${version} vs ${CURRENT_CACHE_VERSION}), clearing old cache`);
      localStorage.removeItem(PRICING_CACHE_KEY);
      localStorage.removeItem(PRICING_CACHE_TIMESTAMP_KEY);
      localStorage.removeItem(PERMANENT_FALLBACK_KEY);
      localStorage.setItem(PRICING_CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
      return null;
    }
    
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

// Load permanent fallback pricing (never expires, survives cache clears)
function loadPermanentFallback(): PricingConfig | null {
  try {
    const fallback = localStorage.getItem(PERMANENT_FALLBACK_KEY);
    if (fallback) {
      console.log("🔒 Loading pricing from permanent fallback");
      return JSON.parse(fallback);
    }
  } catch (error) {
    console.warn("Failed to load permanent fallback:", error);
  }
  return null;
}

// Save pricing to localStorage cache
function savePricingToCache(pricing: PricingConfig): void {
  try {
    localStorage.setItem(PRICING_CACHE_KEY, JSON.stringify(pricing));
    localStorage.setItem(PRICING_CACHE_TIMESTAMP_KEY, Date.now().toString());
    // Also save as permanent fallback (overwrites old fallback with latest pricing)
    localStorage.setItem(PERMANENT_FALLBACK_KEY, JSON.stringify(pricing));
    console.log("💾 Saved pricing to cache and permanent fallback");
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
        savePricingToCache(data.pricing); // Save to localStorage (including permanent fallback)
        return data.pricing;
      }
    }
    
    console.log("📦 Server pricing unavailable, using fallbacks");
    
    // Fallback priority:
    // 1. Fresh cache (< 5 min old)
    const cachedData = loadPricingFromCache();
    if (cachedData) {
      cachedPricing = cachedData;
      isPricingInitialized = true;
      return cachedData;
    }
    
    // 2. Permanent fallback (any pricing ever fetched, even if old)
    const permanentFallback = loadPermanentFallback();
    if (permanentFallback) {
      console.log("🔒 Using permanent fallback (last known good pricing)");
      cachedPricing = permanentFallback;
      isPricingInitialized = true;
      return permanentFallback;
    }
    
    // 3. DEFAULT_PRICING (hardcoded, only if customer has NEVER fetched pricing before)
    console.log("⚙️ Using DEFAULT_PRICING (first-time user with no connection)");
    cachedPricing = DEFAULT_PRICING;
    isPricingInitialized = true;
    return DEFAULT_PRICING;
  } catch (error) {
    // Don't log timeout as error - it's expected sometimes
    if (error instanceof Error && error.name === 'AbortError') {
      console.log("⏱️ Server timeout, using fallbacks");
    } else {
      console.log("📡 Network issue, using fallbacks");
    }
    
    // Same fallback priority on errors
    // 1. Fresh cache
    const cachedData = loadPricingFromCache();
    if (cachedData) {
      cachedPricing = cachedData;
      isPricingInitialized = true;
      return cachedData;
    }
    
    // 2. Permanent fallback (last known good pricing)
    const permanentFallback = loadPermanentFallback();
    if (permanentFallback) {
      console.log("🔒 Using permanent fallback (last known good pricing)");
      cachedPricing = permanentFallback;
      isPricingInitialized = true;
      return permanentFallback;
    }
    
    // 3. DEFAULT_PRICING (last resort)
    console.log("⚙️ Using DEFAULT_PRICING (no cached pricing available)");
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

  // Calculate midnights crossed (difference in calendar days)
  const arrivalDateOnly = new Date(arrivalDate);
  const departureDateOnly = new Date(departureDate);
  const midnightsCrossed = Math.floor((departureDateOnly.getTime() - arrivalDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  // Extract hours and minutes for time comparison
  const arrivalHour = arrivalDateTime.getHours();
  const arrivalMinute = arrivalDateTime.getMinutes();
  const departureHour = departureDateTime.getHours();
  const departureMinute = departureDateTime.getMinutes();
  
  // Convert to minutes for easier comparison
  const arrivalTimeInMinutes = arrivalHour * 60 + arrivalMinute;
  const departureTimeInMinutes = departureHour * 60 + departureMinute;

  // If departure time is after arrival time, add 1 day
  let diffDays = midnightsCrossed;
  if (departureTimeInMinutes > arrivalTimeInMinutes) {
    diffDays += 1;
  }

  console.log(`🧮 Calculating price: ${arrivalDate} ${arrivalTime} → ${departureDate} ${departureTime}`);
  console.log(`   Midnights crossed: ${midnightsCrossed}, Departure time ${departureTimeInMinutes > arrivalTimeInMinutes ? '>' : '≤'} arrival time → ${diffDays} days for ${numberOfCars} car(s)`);
  
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