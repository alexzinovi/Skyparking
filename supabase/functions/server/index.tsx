import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as users from "./users.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Supabase client for service-level operations
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Capacity configuration
const MAX_SPOTS = 200;
const KEYS_OVERFLOW_SPOTS = 20;
const MAX_TOTAL_SPOTS = MAX_SPOTS + KEYS_OVERFLOW_SPOTS; // 220

// Status transition rules
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'new': ['confirmed', 'cancelled'],
  'confirmed': ['arrived', 'no-show', 'cancelled'],
  'arrived': ['checked-out'],
  'checked-out': [],
  'no-show': [],
  'cancelled': []
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
    allowHeaders: ["Content-Type", "Authorization", "X-Session-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-47a4914e/health", (c) => {
  return c.json({ status: "ok" });
});

// Admin login endpoint
app.post("/make-server-47a4914e/admin/login", async (c) => {
  try {
    const { password } = await c.req.json();
    const adminPassword = await kv.get("admin:password") || "skyparking2024";
    
    if (password === adminPassword) {
      return c.json({ success: true, token: "admin-authenticated" });
    }
    
    return c.json({ success: false, message: "Invalid password" }, 401);
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
    const booking = await c.req.json();
    const bookingId = `booking:${Date.now()}:${Math.random().toString(36).substring(7)}`;
    
    const bookingData = {
      ...booking,
      id: bookingId,
      createdAt: new Date().toISOString(),
      paymentStatus: booking.paymentStatus || "pending",
      status: booking.status || "new", // Use provided status, default to "new"
      statusHistory: []
    };
    
    // If booking is created as "confirmed" (manual booking), assign parking spots immediately
    if (bookingData.status === "confirmed") {
      const numberOfCars = bookingData.numberOfCars || 1;
      const parkingSpots = await findAvailableParkingSpots(
        bookingData.arrivalDate,
        bookingData.departureDate,
        numberOfCars,
        bookingData.carKeys || false,
        bookingId
      );
      
      if (!parkingSpots) {
        return c.json({
          success: false,
          message: "No parking spots available for the requested period"
        }, 400);
      }
      
      bookingData.parkingSpots = parkingSpots;
    }
    
    await kv.set(bookingId, bookingData);
    
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
    
    // If confirmed booking and dates/numberOfCars changed, reassign parking spots
    if (updated.status === "confirmed" || updated.status === "arrived") {
      const datesChanged = 
        updates.arrivalDate !== undefined || 
        updates.departureDate !== undefined ||
        updates.numberOfCars !== undefined;
        
      if (datesChanged) {
        const numberOfCars = updated.numberOfCars || 1;
        const parkingSpots = await findAvailableParkingSpots(
          updated.arrivalDate,
          updated.departureDate,
          numberOfCars,
          updated.carKeys || false,
          id
        );
        
        if (!parkingSpots) {
          return c.json({
            success: false,
            message: "No parking spots available for the updated dates/car count"
          }, 400);
        }
        
        updated.parkingSpots = parkingSpots;
      }
    }
    
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
    
    // Assign parking spots
    const numberOfCars = booking.numberOfCars || 1;
    const parkingSpots = await findAvailableParkingSpots(
      booking.arrivalDate,
      booking.departureDate,
      numberOfCars,
      booking.carKeys || false,
      id
    );
    
    if (!parkingSpots) {
      return c.json({
        success: false,
        message: "No parking spots available for the requested period"
      }, 400);
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
      parkingSpots,
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

// Action: Cancel reservation
app.put("/make-server-47a4914e/bookings/:id/cancel", async (c) => {
  try {
    const id = c.req.param("id");
    const { operator, reason } = await c.req.json();
    
    const booking = await kv.get(id);
    if (!booking) {
      return c.json({ success: false, message: "Booking not found" }, 404);
    }
    
    if (!isValidTransition(booking.status, 'cancelled')) {
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
      statusHistory,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(id, updated);
    
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

// Action: Checkout (arrived → checked-out)
app.put("/make-server-47a4914e/bookings/:id/checkout", async (c) => {
  try {
    const id = c.req.param("id");
    const { operator, paymentMethod, finalPrice } = await c.req.json();
    
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
    
    const updated = {
      ...booking,
      status: 'checked-out',
      checkedOutAt: new Date().toISOString(),
      paymentMethod: shouldUpdatePayment ? paymentMethod : booking.paymentMethod,
      paymentStatus: shouldUpdatePayment ? 'paid' : booking.paymentStatus,
      paidAt: shouldUpdatePayment ? new Date().toISOString() : booking.paidAt,
      finalPrice: finalPrice || booking.totalPrice, // Allow price adjustment at checkout
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

// ============= USER MANAGEMENT ENDPOINTS =============

// Ensure admin user exists on startup
await users.ensureAdminUser();

// User login endpoint
app.post("/make-server-47a4914e/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    const user = await users.authenticateUser(username, password);
    if (!user) {
      return c.json({ success: false, message: "Невалидно потребителско име или парола" }, 401);
    }
    
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

Deno.serve(app.fetch);