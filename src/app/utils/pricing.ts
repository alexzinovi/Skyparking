export interface PricingConfig {
  dailyPrices: Record<number, number>;
  midRangeRate: number;
  midRangeMaxDay: number;
  longTermRate: number;
}

// Default pricing configuration - no server call needed
const DEFAULT_PRICING: PricingConfig = {
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

// Calculate price for a given number of days - synchronous, no API call
export function calculatePriceForDays(days: number): number {
  const pricing = DEFAULT_PRICING;
  
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

// Calculate price for a date range - synchronous, instant
export function calculatePrice(
  arrivalDate: string,
  arrivalTime: string,
  departureDate: string,
  departureTime: string,
  numberOfCars: number = 1
): number | null {
  if (!arrivalDate || !departureDate || !arrivalTime || !departureTime) return null;

  const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);
  const departureDateTime = new Date(`${departureDate}T${departureTime}`);

  if (departureDateTime <= arrivalDateTime) return null;

  const diffTime = Math.abs(departureDateTime.getTime() - arrivalDateTime.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const pricePerCar = calculatePriceForDays(diffDays);
  return pricePerCar * numberOfCars;
}