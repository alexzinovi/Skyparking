import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as users from "./users.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendConfirmationEmail, sendAdminNotificationEmail } from "./email-service.tsx";

const app = new Hono();

// Supabase client for service-level operations
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Capacity configuration
const MAX_SPOTS = 180;
const KEYS_OVERFLOW_SPOTS = 20;
const MAX_TOTAL_SPOTS = MAX_SPOTS + KEYS_OVERFLOW_SPOTS; // 200

// Default pricing configuration
const DEFAULT_PRICING = {
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
    10: 46,
    11: 50,
    12: 54,
    13: 58,
    14: 62,
    15: 66,
    16: 70,
    17: 74,
    18: 78,
    19: 82,
    20: 86,
    21: 90,
    22: 94,
    23: 98,
    24: 102,
    25: 106,
    26: 110,
    27: 114,
    28: 118,
    29: 122,
    30: 126
  },
  longTermRate: 2.8      // Days 31+
};

// Get pricing configuration
async function getPricingConfig() {
  const config = await kv.get("pricing:config");
  return config || DEFAULT_PRICING;
}

// Calculate price based on number of days
async function calculatePrice(days: number): Promise<number> {
  const pricing = await getPricingConfig();
  
  // Days 1-30: Use specific daily prices
  if (days <= 30 && pricing.dailyPrices[days]) {
    return pricing.dailyPrices[days];
  }
  
  // Days 31+: Price at day 30 + longTermRate per additional day
  const day30Price = pricing.dailyPrices[30] || 0;
  const additionalDays = days - 30;
  return day30Price + (additionalDays * pricing.longTermRate);
}

// Status transition rules
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'new': ['confirmed', 'cancelled', 'declined'],
  'confirmed': ['arrived', 'no-show', 'cancelled', 'declined'],
  'arrived': ['checked-out'],
  'checked-out': [],
  'no-show': [],
  'cancelled': [],
  'declined': []
};

// Validate status transition
function isValidTransition(fromStatus: string, toStatus: string): boolean {
  const allowedStatuses = ALLOWED_TRANSITIONS[fromStatus];
  return allowedStatuses ? allowedStatuses.includes(toStatus) : false;
}

// Add status change to history
function addStatusChange(booking: any, toStatus: string, action: string, operator: string, reason?: string) {
  const statusHistory = booking.statusHistory || [];
  
  statusHistory.push({
    from: booking.status,
    to: toStatus,
    action,
    timestamp: new Date().toISOString(),
    operator,
    reason
  });
  
  return statusHistory;
}

// Check if two date ranges overlap
function datesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  
  return s1 <= e2 && s2 <= e1;
}

// Find available parking spots for a booking
async function findAvailableParkingSpots(
  arrivalDate: string,
  departureDate: string,
  numberOfCars: number,
  carKeys: boolean,
  excludeBookingId?: string
): Promise<number[] | null> {
  try {
    // Get all bookings
    const allBookings = await kv.getByPrefix("booking:");
    
    // Find overlapping bookings
    const overlappingBookings = allBookings.filter((b: any) => 
      b.id !== excludeBookingId &&
      (b.status === "confirmed" || b.status === "arrived") &&
      datesOverlap(b.arrivalDate, b.departureDate, arrivalDate, departureDate)
    );
    
    // Collect occupied spots
    const occupiedSpots = new Set<number>();
    overlappingBookings.forEach((b: any) => {
      if (b.parkingSpots && Array.isArray(b.parkingSpots)) {
        b.parkingSpots.forEach((spot: number) => occupiedSpots.add(spot));
      }
    });
    
    // Find available spots
    const maxCapacity = carKeys ? MAX_TOTAL_SPOTS : MAX_SPOTS;
    const availableSpots: number[] = [];
    
    for (let i = 1; i <= maxCapacity; i++) {
      if (!occupiedSpots.has(i)) {
        availableSpots.push(i);
      }
    }
    
    // Check if we have enough spots
    if (availableSpots.length < numberOfCars) {
      return null; // Not enough spots available
    }
    
    // Try to find consecutive spots for multiple cars
    const assignedSpots: number[] = [];
    
    if (numberOfCars > 1) {
      // Try to find consecutive spots
      for (let i = 0; i <= availableSpots.length - numberOfCars; i++) {
        let consecutive = true;
        for (let j = 0; j < numberOfCars - 1; j++) {
          if (availableSpots[i + j + 1] !== availableSpots[i + j] + 1) {
            consecutive = false;
            break;
          }
        }
        if (consecutive) {
          for (let j = 0; j < numberOfCars; j++) {
            assignedSpots.push(availableSpots[i + j]);
          }
          return assignedSpots;
        }
      }
    }
    
    // If consecutive not found or only 1 car, assign first available spots
    for (let i = 0; i < numberOfCars && i < availableSpots.length; i++) {
      assignedSpots.push(availableSpots[i]);
    }
    
    return assignedSpots;
  } catch (error) {
    console.log("Error finding parking spots:", error);
    return null;
  }
}

// Get all calendar days between two dates (inclusive)
function getDatesInRange(startDate: string, startTime: string, endDate: string, endTime: string): string[] {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  
  const dates: string[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  
  while (current <= endDay) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Generate readable booking code (e.g., SP-12345678)
function generateBookingCode(): string {
  // Use timestamp (last 8 digits) for uniqueness
  const timestamp = Date.now().toString().slice(-8);
  return `SP-${timestamp}`;
}

// Check if two date ranges overlap on a specific day
function overlapsOnDay(
  day: string,
  range1Start: string, range1StartTime: string,
  range1End: string, range1EndTime: string
): boolean {
  const dayStart = new Date(`${day}T00:00:00`);
  const dayEnd = new Date(`${day}T23:59:59`);
  
  const rangeStart = new Date(`${range1Start}T${range1StartTime}`);
  const rangeEnd = new Date(`${range1End}T${range1EndTime}`);
  
  return rangeStart <= dayEnd && rangeEnd >= dayStart;
}

// Calculate capacity for a date range
async function calculateCapacity(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
  carKeys: boolean,
  excludeBookingId?: string
) {
  // Get all bookings
  const allBookings = await kv.getByPrefix("booking:");
  
  // Filter to only confirmed/arrived/checked-out bookings (these occupy spots)
  const occupyingStatuses = ['confirmed', 'arrived', 'checked-out'];
  const activeBookings = allBookings.filter((b: any) => 
    occupyingStatuses.includes(b.status) && b.id !== excludeBookingId
  );
  
  // Get all days in the candidate range
  const daysInRange = getDatesInRange(startDate, startTime, endDate, endTime);
  
  // Calculate occupancy for each day
  const dailyBreakdown = daysInRange.map(day => {
    let nonKeysCount = 0;
    let keysCount = 0;
    
    // Count overlapping bookings for this day
    activeBookings.forEach((booking: any) => {
      if (overlapsOnDay(
        day,
        booking.arrivalDate, booking.arrivalTime,
        booking.departureDate, booking.departureTime
      )) {
        const numberOfCars = booking.numberOfCars || 1;
        if (booking.carKeys) {
          keysCount += numberOfCars;
        } else {
          nonKeysCount += numberOfCars;
        }
      }
    });
    
    // Add the candidate booking to the counts
    const candidateCars = 1; // For now, we'll pass numberOfCars separately if needed
    if (carKeys) {
      keysCount += candidateCars;
    } else {
      nonKeysCount += candidateCars;
    }
    
    const totalCount = nonKeysCount + keysCount;
    const isOverNonKeysLimit = nonKeysCount > MAX_SPOTS;
    const isOverTotalLimit = totalCount > MAX_TOTAL_SPOTS;
    
    return {
      date: day,
      nonKeysCount,
      keysCount,
      totalCount,
      maxSpots: MAX_SPOTS,
      keysOverflowSpots: KEYS_OVERFLOW_SPOTS,
      maxTotal: MAX_TOTAL_SPOTS,
      isOverNonKeysLimit,
      isOverTotalLimit,
      wouldFit: !isOverNonKeysLimit && !isOverTotalLimit
    };
  });
  
  // Check if the entire interval would fit
  const wouldFitEntireInterval = dailyBreakdown.every(day => day.wouldFit);
  
  return {
    dailyBreakdown,
    wouldFit: wouldFitEntireInterval,
    violationDays: dailyBreakdown.filter(day => !day.wouldFit)
  };
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Session-Token", "x-session-token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Session-Token"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-47a4914e/health", (c) => {
  return c.json({ status: "ok" });
});

// Admin login endpoint with security
app.post("/make-server-47a4914e/admin/login", async (c) => {
  try {
    // Ensure admin user exists
    await users.ensureAdminUser();
    
    const { username, password } = await c.req.json();
    
    // Get client IP for rate limiting
    const clientIp = c.req.header('x-forwarded-for') || 
                     c.req.header('x-real-ip') || 
                     'unknown';
    
    const lockoutKey = `admin:lockout:${username}:${clientIp}`;
    const attemptsKey = `admin:attempts:${username}:${clientIp}`;
    
    // Check if account is locked
    const lockoutData = await kv.get(lockoutKey);
    if (lockoutData) {
      const lockoutUntil = new Date(lockoutData.value);
      const now = new Date();
      
      if (now < lockoutUntil) {
        const minutesLeft = Math.ceil((lockoutUntil.getTime() - now.getTime()) / 60000);
        return c.json({ 
          success: false, 
          message: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`,
          locked: true,
          lockoutUntil: lockoutUntil.toISOString()
        }, 429);
      } else {
        // Lockout expired, clear it
        await kv.del(lockoutKey);
        await kv.del(attemptsKey);
      }
    }
    
    // Authenticate using the user management system
    const user = await users.authenticateUser(username, password);
    console.log("Authentication result for user", username, ":", user ? "SUCCESS" : "FAILED");
    
    if (user) {
      // Successful login - clear any failed attempts
      await kv.del(attemptsKey);
      await kv.del(lockoutKey);
      
      // Create a proper session token
      const sessionToken = users.createSessionToken(user);
      console.log("Created session token for user:", user.id);
      
      return c.json({ success: true, token: sessionToken });
    }
    
    // Failed login - increment attempts
    const attemptsData = await kv.get(attemptsKey);
    const currentAttempts = attemptsData ? parseInt(attemptsData.value) : 0;
    const newAttempts = currentAttempts + 1;
    
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 15;
    
    if (newAttempts >= MAX_ATTEMPTS) {
      // Lock the account
      const lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
      await kv.set(lockoutKey, lockoutUntil.toISOString());
      await kv.del(attemptsKey);
      
      return c.json({ 
        success: false, 
        message: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
        locked: true,
        lockoutUntil: lockoutUntil.toISOString()
      }, 429);
    }
    
    // Store failed attempt with 1 hour expiry
    await kv.set(attemptsKey, newAttempts.toString());
    
    const remainingAttempts = MAX_ATTEMPTS - newAttempts;
    return c.json({ 
      success: false, 
      message: `Invalid credentials. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`,
      remainingAttempts
    }, 401);
  } catch (error) {
    console.log("Admin login error:", error);
    return c.json({ success: false, message: "Login error" }, 500);
  }
});

// Set admin password (first time setup)
app.post("/make-server-47a4914e/admin/setup-password", async (c) => {
  try {
    const { password } = await c.req.json();
    await kv.set("admin:password", password);
    return c.json({ success: true });
  } catch (error) {
    console.log("Setup password error:", error);
    return c.json({ success: false, message: "Setup error" }, 500);
  }
});

// Create a new booking
app.post("/make-server-47a4914e/bookings", async (c) => {
  try {
    // Rate limiting: Check IP address
    const clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const rateLimitKey = `ratelimit:booking:${clientIP}`;
    
    // Get the last submission timestamps for this IP
    const rateLimitData = await kv.get(rateLimitKey);
    const now = Date.now();
    
    if (rateLimitData) {
      const submissions = rateLimitData.submissions || [];
      // Filter submissions from the last hour
      const recentSubmissions = submissions.filter((timestamp: number) => now - timestamp < 3600000);
      
      // Allow max 3 submissions per hour per IP
      if (recentSubmissions.length >= 3) {
        console.log(`⚠️ Rate limit exceeded for IP: ${clientIP}`);
        return c.json({ 
          success: false, 
          message: "Too many reservation attempts. Please try again later." 
        }, 429);
      }
      
      // Update with new submission
      recentSubmissions.push(now);
      await kv.set(rateLimitKey, { submissions: recentSubmissions });
    } else {
      // First submission from this IP
      await kv.set(rateLimitKey, { submissions: [now] });
    }
    
    const booking = await c.req.json();
    console.log("Received booking data:", booking);
    console.log("needsInvoice value:", booking.needsInvoice);
    
    // Generate internal ID for database key
    const bookingId = `booking:${Date.now()}:${Math.random().toString(36).substring(7)}`;
    
    // Generate user-friendly booking code
    const bookingCode = generateBookingCode();
    
    const bookingData = {
      ...booking,
      id: bookingId,
      bookingCode, // Add the readable booking code
      createdAt: new Date().toISOString(),
      paymentStatus: booking.paymentStatus || "pending",
      status: booking.status || "new", // Use provided status, default to "new"
      statusHistory: []
    };
    
    console.log("Saving booking with needsInvoice:", bookingData.needsInvoice);
    console.log("Generated booking code:", bookingCode);
    
    await kv.set(bookingId, bookingData);
    
    // Send confirmation email to customer
    try {
      console.log(`📧 Sending customer confirmation email to ${bookingData.email}...`);
      const customerEmailResult = await sendConfirmationEmail({
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        licensePlate: bookingData.licensePlate,
        arrivalDate: bookingData.arrivalDate,
        arrivalTime: bookingData.arrivalTime,
        departureDate: bookingData.departureDate,
        departureTime: bookingData.departureTime,
        numberOfCars: bookingData.numberOfCars || 1,
        passengers: bookingData.passengers || 0,
        totalPrice: bookingData.totalPrice,
        bookingId: bookingData.bookingCode || bookingId,
        carKeys: bookingData.carKeys,
        needsInvoice: bookingData.needsInvoice,
        companyName: bookingData.companyName,
        language: bookingData.language || 'bg',
      });
      
      if (customerEmailResult.success) {
        console.log(`✅ Customer confirmation email sent successfully to ${bookingData.email}`);
      } else {
        console.error(`❌ Failed to send customer confirmation email: ${customerEmailResult.error}`);
      }
    } catch (emailError) {
      console.error(`❌ Error sending customer confirmation email:`, emailError);
    }
    
    // Send admin notification email (check settings first)
    try {
      // Check if email notifications are enabled
      const emailNotificationsEnabled = await kv.get("settings:emailNotificationsEnabled");
      const shouldSendEmail = emailNotificationsEnabled !== false; // Default to true if not set
      
      if (shouldSendEmail) {
        console.log(`📧 Sending admin notification email to reservations@skyparking.bg...`);
        const adminEmailResult = await sendAdminNotificationEmail({
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          licensePlate: bookingData.licensePlate,
          arrivalDate: bookingData.arrivalDate,
          arrivalTime: bookingData.arrivalTime,
          departureDate: bookingData.departureDate,
          departureTime: bookingData.departureTime,
          numberOfCars: bookingData.numberOfCars || 1,
          passengers: bookingData.passengers || 0,
          totalPrice: bookingData.totalPrice,
          bookingId: bookingData.bookingCode || bookingId,
          carKeys: bookingData.carKeys,
          needsInvoice: bookingData.needsInvoice,
          companyName: bookingData.companyName,
          language: bookingData.language || 'bg',
        });
        
        if (adminEmailResult.success) {
          console.log(`✅ Admin notification email sent successfully to reservations@skyparking.bg`);
        } else {
          console.error(`❌ Failed to send admin notification email: ${adminEmailResult.error}`);
        }
      } else {
        console.log(`⚠️ Admin notification email skipped - email notifications are disabled in settings`);
      }
    } catch (emailError) {
      console.error(`❌ Error sending admin notification email:`, emailError);
    }
    
    return c.json({ success: true, booking: bookingData });
  } catch (error) {
    console.log("Create booking error:", error);
    return c.json({ success: false, message: "Failed to create booking" }, 500);
  }
});

// Get all bookings
app.get("/make-server-47a4914e/bookings", async (c) => {
  try {
    const bookings = await kv.getByPrefix("booking:");
    
    // Sort by creation date (newest first)
    const sortedBookings = bookings.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return c.json({ success: true, bookings: sortedBookings });
  } catch (error) {
    console.log("Get bookings error:", error);
    return c.json({ success: false, message: "Failed to fetch bookings" }, 500);
  }
});

// Delete all bookings (for testing purposes) - MUST BE BEFORE /bookings/:id routes
app.delete("/make-server-47a4914e/bookings/delete-all", async (c) => {
  try {
    const { operator } = await c.req.json();
    
    // Get all bookings
    const allBookings = await kv.getByPrefix("booking:");
    
    if (!allBookings || allBookings.length === 0) {
      return c.json({ success: true, deletedCount: 0, message: "No bookings to delete" });
    }
    
    // Delete all bookings
    const bookingIds = allBookings.map(b => b.id);
    await kv.mdel(bookingIds);
    
    console.log(`All bookings deleted by ${operator}. Total deleted: ${bookingIds.length}`);
    
    return c.json({ 
      success: true, 
      deletedCount: bookingIds.length,
      message: `Successfully deleted ${bookingIds.length} bookings`
    });
  } catch (error) {
    console.log("Delete all bookings error:", error);
    return c.json({ success: false, message: "Failed to delete all bookings" }, 500);
  }
});

// Get single booking
app.get("/make-server-47a4914e/bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const booking = await kv.get(id);
    
    if (!booking) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    return c.json({ success: true, booking });
  } catch (error) {
    console.log("Get booking error:", error);
    return c.json({ success: false, message: "Failed to fetch booking" }, 500);
  }
});

// Update booking
app.put("/make-server-47a4914e/bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    
    return c.json({ success: true, booking: updated });
  } catch (error) {
    console.log("Update booking error:", error);
    return c.json({ success: false, message: "Failed to update booking" }, 500);
  }
});

// Delete booking
app.delete("/make-server-47a4914e/bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    await kv.del(id);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete booking error:", error);
    return c.json({ success: false, message: "Failed to delete booking" }, 500);
  }
});

// Initialize MyPOS payment
app.post("/make-server-47a4914e/payment/initiate", async (c) => {
  try {
    const { bookingId, amount, customerName, customerEmail } = await c.req.json();
    
    // MyPOS credentials (user will need to add these via environment variables)
    const myposSid = Deno.env.get('MYPOS_SID');
    const myposWallet = Deno.env.get('MYPOS_WALLET');
    const myposPrivateKey = Deno.env.get('MYPOS_PRIVATE_KEY');
    
    if (!myposSid || !myposWallet || !myposPrivateKey) {
      return c.json({ 
        success: false, 
        message: "MyPOS credentials not configured. Please add MYPOS_SID, MYPOS_WALLET, and MYPOS_PRIVATE_KEY to environment variables." 
      }, 500);
    }
    
    // Create payment request for MyPOS
    // This is a simplified version - actual MyPOS integration requires signature generation
    const paymentData = {
      sid: myposSid,
      wallet_number: myposWallet,
      amount: amount,
      currency: "EUR",
      order_id: bookingId,
      customer: customerName,
      customer_email: customerEmail,
      url_ok: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-47a4914e/payment/success`,
      url_cancel: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-47a4914e/payment/cancel`,
      url_notify: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-47a4914e/payment/webhook`,
    };
    
    // Return payment URL - in production, this should be signed and sent to MyPOS
    return c.json({ 
      success: true, 
      paymentUrl: "https://www.mypos.com/vmp/checkout", // MyPOS checkout URL
      paymentData 
    });
  } catch (error) {
    console.log("Payment initiation error:", error);
    return c.json({ success: false, message: "Failed to initiate payment" }, 500);
  }
});

// MyPOS webhook handler
app.post("/make-server-47a4914e/payment/webhook", async (c) => {
  try {
    const paymentData = await c.req.json();
    
    // Verify webhook signature (implement MyPOS signature verification)
    // For now, we'll just update the booking status
    
    const bookingId = paymentData.order_id;
    const booking = await kv.get(bookingId);
    
    if (booking) {
      const updated = {
        ...booking,
        paymentStatus: paymentData.status === "3" ? "paid" : "failed",
        paymentData: paymentData,
        paidAt: new Date().toISOString(),
      };
      
      await kv.set(bookingId, updated);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Payment webhook error:", error);
    return c.json({ success: false }, 500);
  }
});

// Capacity preview endpoint
app.get("/make-server-47a4914e/capacity/preview", async (c) => {
  try {
    const startDate = c.req.query("startDate");
    const startTime = c.req.query("startTime");
    const endDate = c.req.query("endDate");
    const endTime = c.req.query("endTime");
    const carKeys = c.req.query("carKeys") === "true";
    const excludeBookingId = c.req.query("excludeBookingId");
    
    if (!startDate || !startTime || !endDate || !endTime) {
      return c.json({ 
        success: false, 
        message: "Missing required parameters: startDate, startTime, endDate, endTime" 
      }, 400);
    }
    
    const capacity = await calculateCapacity(
      startDate,
      startTime,
      endDate,
      endTime,
      carKeys,
      excludeBookingId
    );
    
    return c.json({ 
      success: true, 
      capacity,
      config: {
        maxSpots: MAX_SPOTS,
        keysOverflowSpots: KEYS_OVERFLOW_SPOTS,
        maxTotal: MAX_TOTAL_SPOTS
      }
    });
  } catch (error) {
    console.log("Capacity preview error:", error);
    return c.json({ success: false, message: "Failed to calculate capacity" }, 500);
  }
});

// Action: Accept reservation with capacity check (new → confirmed)
app.put("/make-server-47a4914e/bookings/:id/accept", async (c) => {
  try {
    const id = c.req.param("id");
    const { operator, force } = await c.req.json();
    
    const booking = await kv.get(id);
    if (!booking) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    if (!isValidTransition(booking.status, 'confirmed')) {
      return c.json({ 
        success: false, 
        message: `Cannot accept booking with status "${booking.status}". Valid transitions: ${ALLOWED_TRANSITIONS[booking.status]?.join(', ') || 'none'}` 
      }, 400);
    }
    
    // Validate dates
    const arrivalDateTime = new Date(`${booking.arrivalDate}T${booking.arrivalTime}`);
    const departureDateTime = new Date(`${booking.departureDate}T${booking.departureTime}`);
    
    if (departureDateTime <= arrivalDateTime) {
      return c.json({ 
        success: false, 
        message: "Departure date/time must be after arrival date/time" 
      }, 400);
    }
    
    // Check capacity (unless force override is enabled)
    if (!force) {
      const capacity = await calculateCapacity(
        booking.arrivalDate,
        booking.arrivalTime,
        booking.departureDate,
        booking.departureTime,
        booking.carKeys || false,
        id // Exclude this booking from the count
      );
      
      if (!capacity.wouldFit) {
        // Build detailed error message
        const violationMessages = capacity.violationDays.map((day: any) => {
          if (day.isOverNonKeysLimit) {
            return `${day.date}: Over non-keys capacity (${day.nonKeysCount}/${day.maxSpots} spots)`;
          } else if (day.isOverTotalLimit) {
            return `${day.date}: Over total capacity including overflow (${day.totalCount}/${day.maxTotal} spots)`;
          }
          return `${day.date}: Over capacity`;
        }).join(", ");
        
        return c.json({ 
          success: false, 
          message: `Capacity exceeded on: ${violationMessages}`,
          capacityPreview: capacity,
          requiresOverride: true
        }, 400);
      }
    }
    
    // Log capacity override if forced
    const statusHistory = addStatusChange(
      booking, 
      'confirmed', 
      force ? 'accept-with-override' : 'accept', 
      operator || 'system',
      force ? 'Capacity override by admin' : undefined
    );
    
    const updated = {
      ...booking,
      status: 'confirmed',
      statusHistory,
      updatedAt: new Date().toISOString(),
      capacityOverride: force || undefined
    };
    
    await kv.set(id, updated);
    
    return c.json({ success: true, booking: updated });
  } catch (error) {
    console.log("Accept booking error:", error);
    return c.json({ success: false, message: "Failed to accept booking" }, 500);
  }
});

// Action: Decline reservation
app.put("/make-server-47a4914e/bookings/:id/decline", async (c) => {
  try {
    const id = c.req.param("id");
    const { operator, reason } = await c.req.json();
    
    const booking = await kv.get(id);
    if (!booking) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    if (!isValidTransition(booking.status, 'declined')) {
      return c.json({ 
        success: false, 
        message: `Cannot decline booking with status "${booking.status}". Valid transitions: ${ALLOWED_TRANSITIONS[booking.status]?.join(', ') || 'none'}` 
      }, 400);
    }
    
    const statusHistory = addStatusChange(booking, 'declined', 'decline', operator || 'system', reason);
    
    const updated = {
      ...booking,
      status: 'declined',
      declineReason: reason,
      declinedBy: operator || 'system',
      declinedAt: new Date().toISOString(),
      statusHistory,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    
    return c.json({ success: true, booking: updated });
  } catch (error) {
    console.log("Decline booking error:", error);
    return c.json({ success: false, message: "Failed to decline booking" }, 500);
  }
});

// Action: Cancel reservation
app.put("/make-server-47a4914e/bookings/:id/cancel", async (c) => {
  try {
    const id = c.req.param("id");
    const { operator, reason } = await c.req.json();
    
    console.log(`[CANCEL] Booking ID: ${id}, Operator: ${operator}, Reason: ${reason}`);
    
    const booking = await kv.get(id);
    if (!booking) {
      console.log(`[CANCEL] Booking not found: ${id}`);
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    console.log(`[CANCEL] Current booking status: ${booking.status}`);
    
    if (!isValidTransition(booking.status, 'cancelled')) {
      console.log(`[CANCEL] Invalid transition from ${booking.status} to cancelled`);
      return c.json({ 
        success: false, 
        message: `Cannot cancel booking with status "${booking.status}". Valid transitions: ${ALLOWED_TRANSITIONS[booking.status]?.join(', ') || 'none'}` 
      }, 400);
    }
    
    const statusHistory = addStatusChange(booking, 'cancelled', 'cancel', operator || 'system', reason);
    
    const updated = {
      ...booking,
      status: 'cancelled',
      cancellationReason: reason,
      cancelledBy: operator || 'system',
      cancelledAt: new Date().toISOString(),
      statusHistory,
      updatedAt: new Date().toISOString(),
    };
    
    console.log(`[CANCEL] Updating booking to cancelled. CancelledBy: ${updated.cancelledBy}`);
    
    await kv.set(id, updated);
    
    console.log(`[CANCEL] Successfully cancelled booking ${id}`);
    
    return c.json({ success: true, booking: updated });
  } catch (error) {
    console.log("Cancel booking error:", error);
    return c.json({ success: false, message: "Failed to cancel booking" }, 500);
  }
});

// Action: Mark arrived (confirmed → arrived)
app.put("/make-server-47a4914e/bookings/:id/mark-arrived", async (c) => {
  try {
    const id = c.req.param("id");
    const { operator, paymentMethod, paymentStatus } = await c.req.json();
    
    const booking = await kv.get(id);
    if (!booking) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    if (!isValidTransition(booking.status, 'arrived')) {
      return c.json({ 
        success: false, 
        message: `Cannot mark as arrived with status "${booking.status}". Valid transitions: ${ALLOWED_TRANSITIONS[booking.status]?.join(', ') || 'none'}` 
      }, 400);
    }
    
    const statusHistory = addStatusChange(booking, 'arrived', 'mark-arrived', operator || 'system');
    
    const updated = {
      ...booking,
      status: 'arrived',
      arrivedAt: new Date().toISOString(),
      paymentMethod: paymentMethod || booking.paymentMethod, // 'cash', 'card', 'pay-on-leave'
      paymentStatus: paymentStatus || booking.paymentStatus, // 'pending', 'paid'
      paidAt: (paymentStatus === 'paid' && !booking.paidAt) ? new Date().toISOString() : booking.paidAt,
      statusHistory,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    
    return c.json({ success: true, booking: updated });
  } catch (error) {
    console.log("Mark arrived error:", error);
    return c.json({ success: false, message: "Failed to mark as arrived" }, 500);
  }
});

// Action: Mark no-show (confirmed → no-show)
app.put("/make-server-47a4914e/bookings/:id/mark-no-show", async (c) => {
  try {
    const id = c.req.param("id");
    const { operator, reason } = await c.req.json();
    
    const booking = await kv.get(id);
    if (!booking) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    if (!isValidTransition(booking.status, 'no-show')) {
      return c.json({ 
        success: false, 
        message: `Cannot mark as no-show with status "${booking.status}". Valid transitions: ${ALLOWED_TRANSITIONS[booking.status]?.join(', ') || 'none'}` 
      }, 400);
    }
    
    const statusHistory = addStatusChange(booking, 'no-show', 'mark-no-show', operator || 'system', reason);
    
    const updated = {
      ...booking,
      status: 'no-show',
      noShowReason: reason,
      noShowBy: operator || 'system',
      noShowAt: new Date().toISOString(),
      statusHistory,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    
    return c.json({ success: true, booking: updated });
  } catch (error) {
    console.log("Mark no-show error:", error);
    return c.json({ success: false, message: "Failed to mark as no-show" }, 500);
  }
});

// Action: Mark as late (for customers who haven't left on time)
app.put("/make-server-47a4914e/bookings/:id/mark-late", async (c) => {
  try {
    const id = c.req.param("id");
    const { operator } = await c.req.json();
    
    const booking = await kv.get(id);
    if (!booking) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    // Can only mark as late if status is 'arrived'
    if (booking.status !== 'arrived') {
      return c.json({ 
        success: false, 
        message: `Cannot mark as late with status "${booking.status}". Must be "arrived"` 
      }, 400);
    }
    
    // Calculate late surcharge (5 EUR per day past original departure date)
    const now = new Date();
    const originalDeparture = new Date(booking.departureDate);
    
    // Set both to midnight for accurate day calculation
    now.setHours(0, 0, 0, 0);
    originalDeparture.setHours(0, 0, 0, 0);
    
    const daysLate = Math.floor((now.getTime() - originalDeparture.getTime()) / (1000 * 60 * 60 * 24));
    const lateSurcharge = daysLate > 0 ? daysLate * 5 : 0;
    
    const statusHistory = booking.statusHistory || [];
    statusHistory.push({
      from: booking.status,
      to: booking.status, // Status remains 'arrived'
      action: 'mark-late',
      timestamp: new Date().toISOString(),
      operator: operator || 'system',
      lateSurcharge,
    });
    
    const updated = {
      ...booking,
      isLate: true,
      lateSurcharge,
      originalDepartureDate: booking.originalDepartureDate || booking.departureDate,
      originalDepartureTime: booking.originalDepartureTime || booking.departureTime,
      statusHistory,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    
    return c.json({ success: true, booking: updated });
  } catch (error) {
    console.log("Mark late error:", error);
    return c.json({ success: false, message: "Failed to mark as late" }, 500);
  }
});

// Action: Checkout (arrived → checked-out)
app.put("/make-server-47a4914e/bookings/:id/checkout", async (c) => {
  try {
    const id = c.req.param("id");
    const { operator, paymentMethod, finalPrice, confirmedLateFee } = await c.req.json();
    
    const booking = await kv.get(id);
    if (!booking) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    if (!isValidTransition(booking.status, 'checked-out')) {
      return c.json({ 
        success: false, 
        message: `Cannot checkout with status "${booking.status}". Valid transitions: ${ALLOWED_TRANSITIONS[booking.status]?.join(', ') || 'none'}` 
      }, 400);
    }
    
    const statusHistory = addStatusChange(booking, 'checked-out', 'checkout', operator || 'system');
    
    // Handle payment on departure if applicable
    const shouldUpdatePayment = booking.paymentMethod === 'pay-on-leave' && paymentMethod;
    
    // Calculate final price including late surcharge if applicable
    let calculatedFinalPrice = finalPrice || booking.totalPrice;
    let finalLateSurcharge = booking.lateSurcharge || 0;
    
    // Use confirmed late fee if provided by operator
    if (booking.isLate && confirmedLateFee !== undefined) {
      finalLateSurcharge = confirmedLateFee;
      calculatedFinalPrice = booking.totalPrice + confirmedLateFee;
    } else if (booking.isLate && booking.lateSurcharge) {
      calculatedFinalPrice = booking.totalPrice + booking.lateSurcharge;
    }
    
    const updated = {
      ...booking,
      status: 'checked-out',
      checkedOutAt: new Date().toISOString(),
      paymentMethod: shouldUpdatePayment ? paymentMethod : booking.paymentMethod,
      paymentStatus: shouldUpdatePayment ? 'paid' : booking.paymentStatus,
      paidAt: shouldUpdatePayment ? new Date().toISOString() : booking.paidAt,
      finalPrice: calculatedFinalPrice, // Include late surcharge in final price
      lateSurcharge: finalLateSurcharge, // Store the confirmed late surcharge
      statusHistory,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    
    return c.json({ success: true, booking: updated });
  } catch (error) {
    console.log("Checkout error:", error);
    return c.json({ success: false, message: "Failed to checkout" }, 500);
  }
});

// Action: Undo previous action
app.put("/make-server-47a4914e/bookings/:id/undo", async (c) => {
  try {
    const id = c.req.param("id");
    const { operator, previousState, action } = await c.req.json();
    
    const booking = await kv.get(id);
    if (!booking) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    // Restore previous state
    const statusHistory = booking.statusHistory || [];
    statusHistory.push({
      from: booking.status,
      to: previousState.status || booking.status,
      action: `undo-${action}`,
      timestamp: new Date().toISOString(),
      operator,
      reason: `Undo: ${action}`
    });
    
    const updated = {
      ...booking,
      ...previousState,
      statusHistory,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    
    return c.json({ success: true, booking: updated });
  } catch (error) {
    console.log("Undo error:", error);
    return c.json({ success: false, message: "Failed to undo action" }, 500);
  }
});

// ============= PRICING MANAGEMENT ENDPOINTS =============

// Get pricing configuration
app.get("/make-server-47a4914e/pricing", async (c) => {
  try {
    const pricing = await getPricingConfig();
    return c.json({ success: true, pricing });
  } catch (error) {
    console.log("Get pricing error:", error);
    return c.json({ success: false, message: "Failed to fetch pricing" }, 500);
  }
});

// Update pricing configuration (admin only)
app.put("/make-server-47a4914e/pricing", async (c) => {
  try {
    const sessionToken = c.req.header("X-Session-Token");
    if (!sessionToken) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }
    
    const currentUser = await users.verifySessionToken(sessionToken);
    
    if (!currentUser || !users.hasPermission(currentUser, "manage_users")) {
      return c.json({ success: false, message: "Insufficient permissions" }, 403);
    }
    
    const newPricing = await c.req.json();
    
    // Validate pricing structure
    if (!newPricing.dailyPrices || typeof newPricing.dailyPrices !== 'object') {
      return c.json({ success: false, message: "Invalid pricing structure: dailyPrices required" }, 400);
    }
    
    if (typeof newPricing.longTermRate !== 'number') {
      return c.json({ success: false, message: "Invalid pricing structure: longTermRate must be a number" }, 400);
    }
    
    await kv.set("pricing:config", newPricing);
    
    console.log(`Pricing updated by ${currentUser.fullName}`);
    
    return c.json({ success: true, pricing: newPricing });
  } catch (error) {
    console.log("Update pricing error:", error);
    return c.json({ success: false, message: "Failed to update pricing" }, 500);
  }
});

// Calculate price for a given number of days (public endpoint)
app.get("/make-server-47a4914e/pricing/calculate", async (c) => {
  try {
    const days = parseInt(c.req.query("days") || "1");
    
    if (isNaN(days) || days < 1) {
      return c.json({ success: false, message: "Invalid days parameter" }, 400);
    }
    
    const price = await calculatePrice(days);
    
    return c.json({ success: true, days, price });
  } catch (error) {
    console.log("Calculate price error:", error);
    return c.json({ success: false, message: "Failed to calculate price" }, 500);
  }
});

// ============= DISCOUNT CODE MANAGEMENT ENDPOINTS =============

// Validate discount code (public endpoint)
app.post("/make-server-47a4914e/discount/validate", async (c) => {
  try {
    const { code } = await c.req.json();
    
    if (!code) {
      return c.json({ success: false, message: "Discount code required" }, 400);
    }
    
    // Get discount from KV store (case-insensitive)
    const normalizedCode = code.toUpperCase().trim();
    const discount = await kv.get(`discount:${normalizedCode}`);
    
    if (!discount) {
      return c.json({ success: false, message: "Invalid discount code" }, 404);
    }
    
    // Check if discount is active
    if (!discount.isActive) {
      return c.json({ success: false, message: "This discount code is no longer active" }, 400);
    }
    
    // Check expiry date
    if (discount.expiryDate) {
      const now = new Date();
      const expiry = new Date(discount.expiryDate);
      if (now > expiry) {
        return c.json({ success: false, message: "This discount code has expired" }, 400);
      }
    }
    
    // Check usage limit
    if (discount.maxUsages && discount.usageCount >= discount.maxUsages) {
      return c.json({ success: false, message: "This discount code has reached its usage limit" }, 400);
    }
    
    return c.json({ 
      success: true, 
      discount: {
        code: discount.code,
        discountType: discount.discountType,
        discountValue: discount.discountValue
      }
    });
  } catch (error) {
    console.log("Validate discount error:", error);
    return c.json({ success: false, message: "Failed to validate discount code" }, 500);
  }
});

// Apply discount code to booking (internal use when creating booking)
app.post("/make-server-47a4914e/discount/apply", async (c) => {
  try {
    const { code } = await c.req.json();
    
    if (!code) {
      return c.json({ success: false, message: "Discount code required" }, 400);
    }
    
    const normalizedCode = code.toUpperCase().trim();
    const discount = await kv.get(`discount:${normalizedCode}`);
    
    if (!discount || !discount.isActive) {
      return c.json({ success: false, message: "Invalid or inactive discount code" }, 400);
    }
    
    // Increment usage count
    const updated = {
      ...discount,
      usageCount: (discount.usageCount || 0) + 1,
      lastUsedAt: new Date().toISOString()
    };
    
    await kv.set(`discount:${normalizedCode}`, updated);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Apply discount error:", error);
    return c.json({ success: false, message: "Failed to apply discount code" }, 500);
  }
});

// Get all discount codes (admin only)
app.get("/make-server-47a4914e/discounts", async (c) => {
  try {
    const discounts = await kv.getByPrefix("discount:");
    
    // Sort by creation date (newest first)
    const sortedDiscounts = discounts.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return c.json({ success: true, discounts: sortedDiscounts });
  } catch (error) {
    console.log("Get discounts error:", error);
    return c.json({ success: false, message: "Failed to fetch discount codes" }, 500);
  }
});

// Create discount code (admin only)
app.post("/make-server-47a4914e/discounts", async (c) => {
  try {
    const discountData = await c.req.json();
    
    // Validate required fields
    if (!discountData.code) {
      return c.json({ success: false, message: "Discount code is required" }, 400);
    }
    
    if (!discountData.discountType || !['percentage', 'fixed'].includes(discountData.discountType)) {
      return c.json({ success: false, message: "Invalid discount type. Must be 'percentage' or 'fixed'" }, 400);
    }
    
    if (typeof discountData.discountValue !== 'number' || discountData.discountValue <= 0) {
      return c.json({ success: false, message: "Discount value must be a positive number" }, 400);
    }
    
    // Normalize code to uppercase
    const normalizedCode = discountData.code.toUpperCase().trim();
    
    // Check if code already exists
    const existing = await kv.get(`discount:${normalizedCode}`);
    if (existing) {
      return c.json({ success: false, message: "A discount code with this name already exists" }, 400);
    }
    
    const discount = {
      code: normalizedCode,
      discountType: discountData.discountType,
      discountValue: discountData.discountValue,
      isActive: discountData.isActive !== false, // Default to true
      usageCount: 0,
      maxUsages: discountData.maxUsages || null,
      expiryDate: discountData.expiryDate || null,
      createdAt: new Date().toISOString(),
      createdBy: discountData.createdBy || 'admin'
    };
    
    await kv.set(`discount:${normalizedCode}`, discount);
    
    console.log(`Discount code created: ${normalizedCode}`);
    
    return c.json({ success: true, discount });
  } catch (error) {
    console.log("Create discount error:", error);
    return c.json({ success: false, message: "Failed to create discount code" }, 500);
  }
});

// Update discount code (admin only)
app.put("/make-server-47a4914e/discounts/:code", async (c) => {
  try {
    const code = c.req.param("code").toUpperCase().trim();
    const updates = await c.req.json();
    
    const existing = await kv.get(`discount:${code}`);
    if (!existing) {
      return c.json({ success: false, message: "Discount code not found" }, 404);
    }
    
    // Don't allow changing the code itself or usage count directly
    const { code: _, usageCount: __, ...allowedUpdates } = updates;
    
    const updated = {
      ...existing,
      ...allowedUpdates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`discount:${code}`, updated);
    
    return c.json({ success: true, discount: updated });
  } catch (error) {
    console.log("Update discount error:", error);
    return c.json({ success: false, message: "Failed to update discount code" }, 500);
  }
});

// Delete discount code (admin only)
app.delete("/make-server-47a4914e/discounts/:code", async (c) => {
  try {
    const code = c.req.param("code").toUpperCase().trim();
    
    const existing = await kv.get(`discount:${code}`);
    if (!existing) {
      return c.json({ success: false, message: "Discount code not found" }, 404);
    }
    
    await kv.del(`discount:${code}`);
    
    console.log(`Discount code deleted: ${code}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete discount error:", error);
    return c.json({ success: false, message: "Failed to delete discount code" }, 500);
  }
});

// ============= USER MANAGEMENT ENDPOINTS =============

// Ensure admin user exists on startup
await users.ensureAdminUser();

// User login endpoint with security
app.post("/make-server-47a4914e/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // Get client IP for rate limiting
    const clientIp = c.req.header('x-forwarded-for') || 
                     c.req.header('x-real-ip') || 
                     'unknown';
    
    const lockoutKey = `user:lockout:${username}:${clientIp}`;
    const attemptsKey = `user:attempts:${username}:${clientIp}`;
    
    // Check if account is locked
    const lockoutData = await kv.get(lockoutKey);
    if (lockoutData) {
      const lockoutUntil = new Date(lockoutData.value);
      const now = new Date();
      
      if (now < lockoutUntil) {
        const minutesLeft = Math.ceil((lockoutUntil.getTime() - now.getTime()) / 60000);
        return c.json({ 
          success: false, 
          message: `Твърде много неуспешни опити. Опитайте отново след ${minutesLeft} минути.`,
          locked: true,
          lockoutUntil: lockoutUntil.toISOString()
        }, 429);
      } else {
        // Lockout expired, clear it
        await kv.del(lockoutKey);
        await kv.del(attemptsKey);
      }
    }
    
    const user = await users.authenticateUser(username, password);
    if (!user) {
      // Failed login - increment attempts
      const attemptsData = await kv.get(attemptsKey);
      const currentAttempts = attemptsData ? parseInt(attemptsData.value) : 0;
      const newAttempts = currentAttempts + 1;
      
      const MAX_ATTEMPTS = 5;
      const LOCKOUT_MINUTES = 15;
      
      if (newAttempts >= MAX_ATTEMPTS) {
        // Lock the account
        const lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
        await kv.set(lockoutKey, lockoutUntil.toISOString());
        await kv.del(attemptsKey);
        
        return c.json({ 
          success: false, 
          message: `Твърде много неуспешни опити. Акаунтът е блокиран за ${LOCKOUT_MINUTES} минути.`,
          locked: true,
          lockoutUntil: lockoutUntil.toISOString()
        }, 429);
      }
      
      // Store failed attempt
      await kv.set(attemptsKey, newAttempts.toString());
      
      const remainingAttempts = MAX_ATTEMPTS - newAttempts;
      return c.json({ 
        success: false, 
        message: `Невалидно потребителско име или парола. Остават ${remainingAttempts} опита.`,
        remainingAttempts
      }, 401);
    }
    
    // Successful login - clear any failed attempts
    await kv.del(attemptsKey);
    await kv.del(lockoutKey);
    
    const token = users.createSessionToken(user);
    
    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    
    return c.json({ 
      success: true, 
      user: userWithoutPassword,
      token,
      permissions: users.ROLES[user.role].permissions
    });
  } catch (error) {
    console.log("Login error:", error);
    return c.json({ success: false, message: "Грешка при вход" }, 500);
  }
});

// Verify session token
app.get("/make-server-47a4914e/auth/verify", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const sessionToken = c.req.header("X-Session-Token");
    const token = sessionToken || (authHeader ? authHeader.replace("Bearer ", "") : "");
    
    if (!token) {
      return c.json({ success: false, message: "No session token" }, 401);
    }
    
    const user = await users.verifySessionToken(token);
    
    if (!user) {
      return c.json({ success: false, message: "Invalid or expired token" }, 401);
    }
    
    const { passwordHash, ...userWithoutPassword } = user;
    
    return c.json({ 
      success: true, 
      user: userWithoutPassword,
      permissions: users.ROLES[user.role].permissions
    });
  } catch (error) {
    console.log("Verify token error:", error);
    return c.json({ success: false, message: "Token verification error" }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-47a4914e/users", async (c) => {
  try {
    const sessionToken = c.req.header("X-Session-Token");
    if (!sessionToken) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }
    
    const currentUser = await users.verifySessionToken(sessionToken);
    
    if (!currentUser || !users.hasPermission(currentUser, "manage_users")) {
      return c.json({ success: false, message: "Insufficient permissions" }, 403);
    }
    
    const allUsers = await users.getAllUsers();
    
    // Remove password hashes
    const safeUsers = allUsers.map(({ passwordHash, ...user }) => user);
    
    return c.json({ success: true, users: safeUsers });
  } catch (error) {
    console.log("Get users error:", error);
    return c.json({ success: false, message: "Failed to fetch users" }, 500);
  }
});

// Create user (admin only)
app.post("/make-server-47a4914e/users", async (c) => {
  try {
    const sessionToken = c.req.header("X-Session-Token");
    if (!sessionToken) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }
    
    const currentUser = await users.verifySessionToken(sessionToken);
    
    if (!currentUser || !users.hasPermission(currentUser, "manage_users")) {
      return c.json({ success: false, message: "Insufficient permissions" }, 403);
    }
    
    const userData = await c.req.json();
    const result = await users.createUser(userData, currentUser.fullName);
    
    if (!result.success) {
      return c.json(result, 400);
    }
    
    // Remove password hash
    const { passwordHash, ...safeUser } = result.user!;
    
    return c.json({ success: true, user: safeUser });
  } catch (error) {
    console.log("Create user error:", error);
    return c.json({ success: false, message: "Failed to create user" }, 500);
  }
});

// Update user (admin only)
app.put("/make-server-47a4914e/users/:id", async (c) => {
  try {
    const sessionToken = c.req.header("X-Session-Token");
    if (!sessionToken) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }
    
    const currentUser = await users.verifySessionToken(sessionToken);
    
    if (!currentUser || !users.hasPermission(currentUser, "manage_users")) {
      return c.json({ success: false, message: "Insufficient permissions" }, 403);
    }
    
    const userId = c.req.param("id");
    const updates = await c.req.json();
    
    const result = await users.updateUser(userId, updates);
    
    if (!result.success) {
      return c.json(result, 400);
    }
    
    // Remove password hash
    const { passwordHash, ...safeUser } = result.user!;
    
    return c.json({ success: true, user: safeUser });
  } catch (error) {
    console.log("Update user error:", error);
    return c.json({ success: false, message: "Failed to update user" }, 500);
  }
});

// Delete user (admin only)
app.delete("/make-server-47a4914e/users/:id", async (c) => {
  try {
    const sessionToken = c.req.header("X-Session-Token");
    if (!sessionToken) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }
    
    const currentUser = await users.verifySessionToken(sessionToken);
    
    if (!currentUser || !users.hasPermission(currentUser, "manage_users")) {
      return c.json({ success: false, message: "Insufficient permissions" }, 403);
    }
    
    const userId = c.req.param("id");
    const result = await users.deleteUser(userId);
    
    if (!result.success) {
      return c.json(result, 400);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete user error:", error);
    return c.json({ success: false, message: "Failed to delete user" }, 500);
  }
});

// Cleanup invalid users (admin only) - force delete without validation
app.post("/make-server-47a4914e/users/cleanup-invalid", async (c) => {
  try {
    const sessionToken = c.req.header("X-Session-Token");
    if (!sessionToken) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }
    
    const currentUser = await users.verifySessionToken(sessionToken);
    
    if (!currentUser || !users.hasPermission(currentUser, "manage_users")) {
      return c.json({ success: false, message: "Insufficient permissions" }, 403);
    }
    
    // Get all users
    const allUsers = await users.getAllUsers();
    
    // Find invalid users (no username or empty username)
    const invalidUsers = allUsers.filter(user => !user.username || user.username.trim() === '');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const user of invalidUsers) {
      try {
        // Force delete from KV store without validation
        await kv.del(`user:${user.id}`);
        // Try to delete username mapping if it exists
        if (user.username) {
          await kv.del(`username:${user.username}`);
        }
        successCount++;
      } catch (error) {
        console.log(`Failed to delete invalid user ${user.id}:`, error);
        failCount++;
      }
    }
    
    return c.json({ 
      success: true, 
      deleted: successCount, 
      failed: failCount,
      message: `Изтрити са ${successCount} невалидни потребители${failCount > 0 ? ` (${failCount} неуспешни)` : ''}`
    });
  } catch (error) {
    console.log("Cleanup invalid users error:", error);
    return c.json({ success: false, message: "Failed to cleanup invalid users" }, 500);
  }
});

// Background job: Update late surcharges for all late bookings
app.post("/make-server-47a4914e/update-late-surcharges", async (c) => {
  try {
    // Get all bookings
    const allBookings = await kv.getByPrefix("booking:");
    
    let updatedCount = 0;
    
    for (const booking of allBookings) {
      if (booking.isLate && booking.status === 'arrived') {
        // Recalculate late surcharge
        const now = new Date();
        const originalDeparture = new Date(booking.originalDepartureDate || booking.departureDate);
        
        // Set both to midnight for accurate day calculation
        now.setHours(0, 0, 0, 0);
        originalDeparture.setHours(0, 0, 0, 0);
        
        const daysLate = Math.floor((now.getTime() - originalDeparture.getTime()) / (1000 * 60 * 60 * 24));
        const newSurcharge = daysLate > 0 ? daysLate * 5 : 0;
        
        // Only update if surcharge changed
        if (newSurcharge !== booking.lateSurcharge) {
          const updated = {
            ...booking,
            lateSurcharge: newSurcharge,
            updatedAt: new Date().toISOString(),
          };
          
          await kv.set(booking.id, updated);
          updatedCount++;
        }
      }
    }
    
    return c.json({ 
      success: true, 
      message: `Updated ${updatedCount} late bookings`,
      updatedCount 
    });
  } catch (error) {
    console.log("Update late surcharges error:", error);
    return c.json({ success: false, message: "Failed to update late surcharges" }, 500);
  }
});

// ===================================
// SETTINGS ENDPOINTS
// ===================================

// Get settings
app.get("/make-server-47a4914e/settings", async (c) => {
  try {
    // Verify admin token
    const sessionToken = c.req.header("X-Session-Token");
    if (!sessionToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const currentUser = await users.verifySessionToken(sessionToken);
    
    if (!currentUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get settings from KV store
    const emailNotificationsEnabled = await kv.get("settings:emailNotificationsEnabled");
    
    return c.json({
      emailNotificationsEnabled: emailNotificationsEnabled !== null ? emailNotificationsEnabled : true
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return c.json({ success: false, message: "Failed to get settings" }, 500);
  }
});

// Update settings
app.put("/make-server-47a4914e/settings", async (c) => {
  try {
    console.log("📝 Settings update request received");
    console.log("Headers:", Object.fromEntries(c.req.raw.headers));
    
    // Verify admin token
    const sessionToken = c.req.header("X-Session-Token");
    console.log("Session token present:", !!sessionToken);
    
    if (!sessionToken) {
      console.log("❌ No session token provided");
      return c.json({ error: "Missing authorization header" }, 401);
    }
    
    const currentUser = await users.verifySessionToken(sessionToken);
    console.log("User verification result:", currentUser ? "Valid user" : "Invalid token");
    
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "manager")) {
      console.log("❌ Unauthorized user or insufficient permissions");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { emailNotificationsEnabled } = body;
    console.log("Settings to save:", { emailNotificationsEnabled });

    // Save settings to KV store
    if (typeof emailNotificationsEnabled === "boolean") {
      await kv.set("settings:emailNotificationsEnabled", emailNotificationsEnabled);
      console.log("✅ Settings saved successfully");
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Update settings error:", error);
    return c.json({ success: false, message: "Failed to update settings" }, 500);
  }
});

Deno.serve(app.fetch);