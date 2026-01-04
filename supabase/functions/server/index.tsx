import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Supabase client for service-level operations
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
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
    };
    
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

Deno.serve(app.fetch);