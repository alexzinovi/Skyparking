import React, { useState, useEffect, useMemo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { formatDateDisplay, formatDateTimeDisplay } from "../utils/dateFormat";
import {
  LogOut,
  Sun,
  Moon,
  Calendar,
  TrendingUp,
  TrendingDown,
  Euro,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  Car,
  User,
  Phone,
  AlertCircle,
  ArrowUpDown,
  Plus,
  Edit,
  Filter,
  FileText,
  Undo,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Key,
  X,
  Menu
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";
import type { User as UserType } from "./LoginScreen";
import { calculatePrice as calculateDynamicPrice } from "@/app/utils/pricing";
import { ReservationCard, type ReservationData } from "./ReservationCard";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";
import { CheckoutModal } from "./CheckoutModal";

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

// Shift configuration
const SHIFT_CONFIG = {
  day: { start: 8, end: 20, label: "Дневна Смяна" },
  night: { start: 20, end: 8, label: "Нощна Смяна" }
};

// Parking capacity configuration
const BASE_CAPACITY = 180;
const OVERFLOW_CAPACITY = 20;
const TOTAL_CAPACITY = BASE_CAPACITY + OVERFLOW_CAPACITY;

interface Booking {
  id: string;
  bookingCode?: string; // User-friendly booking code (e.g., SP-12345678)
  name: string;
  email: string;
  phone: string;
  licensePlate: string;
  licensePlate2?: string;
  licensePlate3?: string;
  licensePlate4?: string;
  licensePlate5?: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  passengers: number;
  numberOfCars?: number;
  totalPrice: number;
  carKeys?: boolean;
  carKeysNotes?: string; // Notes about the car keys
  keyNumber?: string; // Physical key number in the key box
  includeInCapacity?: boolean; // Whether to include in extra capacity calculations
  needsInvoice?: boolean;
  invoiceUrl?: string; // URL to the uploaded invoice PDF
  companyName?: string;
  companyOwner?: string;
  taxNumber?: string;
  isVAT?: boolean;
  vatNumber?: string;
  city?: string;
  address?: string;
  paymentStatus: string;
  paymentMethod?: string;
  status: 'new' | 'confirmed' | 'arrived' | 'checked-out' | 'no-show' | 'cancelled' | 'declined';
  createdAt: string;
  arrivedAt?: string;
  checkedOutAt?: string;
  paidAt?: string;
  finalPrice?: number;
  isLate?: boolean;
  lateSurcharge?: number;
  originalDepartureDate?: string;
  originalDepartureTime?: string;
  basePrice?: number; // Price before discount
  discountCode?: string; // Applied discount code
  discountApplied?: {
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    code?: string;
    description?: string;
  };
  editHistory?: Array<{
    timestamp: string;
    editor: string;
    changes: string;
  }>;
}

type TabType = "new" | "confirmed" | "arriving" | "leaving" | "exits" | "summary" | "revenue" | "all" | "calendar";
type ShiftType = "day" | "night";

interface OperatorDashboardProps {
  onLogout: () => void;
  currentUser: UserType;
  permissions: string[];
}

// Determine current shift based on current time
function getCurrentShift(): ShiftType {
  const now = new Date();
  const hour = now.getHours();
  return hour >= SHIFT_CONFIG.day.start && hour < SHIFT_CONFIG.day.end ? "day" : "night";
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get shift time range for a specific shift and date
function getShiftTimeRange(shift: ShiftType, baseDate?: Date) {
  const now = baseDate || new Date();
  
  if (shift === "day") {
    const start = new Date(now);
    start.setHours(SHIFT_CONFIG.day.start, 0, 0, 0);
    
    const end = new Date(now);
    end.setHours(SHIFT_CONFIG.day.end, 0, 0, 0);
    
    return { start, end, shift: "day" as ShiftType };
  } else {
    // Night shift spans two calendar days
    const start = new Date(now);
    
    // If current time is before 8am, night shift started yesterday
    if (now.getHours() < SHIFT_CONFIG.night.end) {
      start.setDate(start.getDate() - 1);
      start.setHours(SHIFT_CONFIG.night.start, 0, 0, 0);
    } else {
      // Otherwise it starts today at 8pm
      start.setHours(SHIFT_CONFIG.night.start, 0, 0, 0);
    }
    
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setHours(SHIFT_CONFIG.night.end, 0, 0, 0);
    
    return { start, end, shift: "night" as ShiftType };
  }
}

// Format shift display
function formatShiftDisplay(shiftRange: { start: Date; end: Date; shift: ShiftType }) {
  const startDay = String(shiftRange.start.getDate()).padStart(2, '0');
  const startMonth = String(shiftRange.start.getMonth() + 1).padStart(2, '0');
  const startYear = shiftRange.start.getFullYear();
  const startDate = `${startDay}/${startMonth}/${startYear}`;
  
  const endDay = String(shiftRange.end.getDate()).padStart(2, '0');
  const endMonth = String(shiftRange.end.getMonth() + 1).padStart(2, '0');
  const endYear = shiftRange.end.getFullYear();
  const endDate = `${endDay}/${endMonth}/${endYear}`;
  
  const startTime = `${shiftRange.start.getHours()}:00`;
  const endTime = `${shiftRange.end.getHours()}:00`;
  
  if (startDate === endDate) {
    return `${startDate} ${startTime} - ${endTime}`;
  } else {
    return `${startDate} ${startTime} - ${endDate} ${endTime}`;
  }
}

// Check if booking time falls within shift
function isInShift(dateStr: string, timeStr: string, shiftRange: { start: Date; end: Date }) {
  const datetime = new Date(`${dateStr}T${timeStr}`);
  // Use < instead of <= to avoid counting boundary times (08:00, 20:00) in both shifts
  // A booking at exactly 08:00 should be in the DAY shift, not the ending NIGHT shift
  // A booking at exactly 20:00 should be in the NIGHT shift, not the ending DAY shift
  return datetime >= shiftRange.start && datetime < shiftRange.end;
}

// Check if two date ranges overlap
function datesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  
  return s1 <= e2 && s2 <= e1;
}

// Calculate parking capacity for a specific date range
function calculateCapacityForDateRange(
  bookings: Booking[],
  arrivalDate: string,
  departureDate: string,
  excludeBookingId?: string
): { occupied: number; total: number; percentage: number; availableSpots: number[] } {
  // Find all bookings that overlap with this date range and are active (confirmed or arrived)
  const overlappingBookings = bookings.filter(
    (b) =>
      b.id !== excludeBookingId &&
      (b.status === "confirmed" || b.status === "arrived") &&
      datesOverlap(b.arrivalDate, b.departureDate, arrivalDate, departureDate)
  );

  // Count total cars (considering numberOfCars and includeInCapacity)
  const totalCars = overlappingBookings.reduce(
    (sum, b) => {
      // Only count if includeInCapacity is not explicitly false
      if (b.includeInCapacity === false) {
        return sum;
      }
      return sum + Number(b.numberOfCars || 1);
    },
    0
  );

  // Collect all occupied spots
  const occupiedSpots = new Set<number>();
  overlappingBookings.forEach((b) => {
    if (b.parkingSpots && b.parkingSpots.length > 0) {
      b.parkingSpots.forEach((spot) => occupiedSpots.add(spot));
    }
  });

  // Find available spots
  const availableSpots: number[] = [];
  for (let i = 1; i <= TOTAL_CAPACITY; i++) {
    if (!occupiedSpots.has(i)) {
      availableSpots.push(i);
    }
  }

  const percentage = totalCars > 0 ? Math.round((totalCars / BASE_CAPACITY) * 100) : 0;

  return {
    occupied: totalCars,
    total: BASE_CAPACITY,
    percentage,
    availableSpots,
  };
}

// Calculate parking capacity for a specific single date
function calculateCapacityForSingleDate(
  bookings: Booking[],
  targetDate: string,
  excludeBookingId?: string
): { occupied: number; total: number; percentage: number; leaving: number } {
  // Find all bookings that are present on this specific date (confirmed or arrived)
  // A booking is present if: arrivalDate <= targetDate AND departureDate >= targetDate
  const presentBookings = bookings.filter(
    (b) =>
      b.id !== excludeBookingId &&
      (b.status === "confirmed" || b.status === "arrived") &&
      b.arrivalDate <= targetDate &&
      b.departureDate >= targetDate
  );

  // Count total cars present on this date (excluding those not in capacity)
  const totalCars = presentBookings.reduce(
    (sum, b) => {
      // Only count if includeInCapacity is not explicitly false
      if (b.includeInCapacity === false) {
        return sum;
      }
      return sum + Number(b.numberOfCars || 1);
    },
    0
  );

  // Count cars leaving on this specific date (excluding those not in capacity)
  const leavingBookings = presentBookings.filter(b => b.departureDate === targetDate);
  const leavingCars = leavingBookings.reduce(
    (sum, b) => {
      // Only count if includeInCapacity is not explicitly false
      if (b.includeInCapacity === false) {
        return sum;
      }
      return sum + Number(b.numberOfCars || 1);
    },
    0
  );

  const percentage = totalCars > 0 ? Math.round((totalCars / BASE_CAPACITY) * 100) : 0;

  return {
    occupied: totalCars,
    total: BASE_CAPACITY,
    percentage,
    leaving: leavingCars,
  };
}

// Find available parking spots for a booking
function findAvailableSpots(
  bookings: Booking[],
  arrivalDate: string,
  departureDate: string,
  numberOfCars: number,
  carKeys: boolean,
  excludeBookingId?: string
): number[] | null {
  const capacity = calculateCapacityForDateRange(
    bookings,
    arrivalDate,
    departureDate,
    excludeBookingId
  );

  // Check if we have enough capacity
  const maxCapacity = carKeys ? TOTAL_CAPACITY : BASE_CAPACITY;
  if (capacity.occupied + numberOfCars > maxCapacity) {
    return null; // No space available
  }

  // Assign consecutive spots if possible
  const spots: number[] = [];
  const availableInRange = carKeys
    ? capacity.availableSpots
    : capacity.availableSpots.filter((s) => s <= BASE_CAPACITY);

  // Try to find consecutive spots first
  if (numberOfCars > 1) {
    for (let i = 0; i < availableInRange.length - numberOfCars + 1; i++) {
      let consecutive = true;
      for (let j = 0; j < numberOfCars - 1; j++) {
        if (availableInRange[i + j + 1] !== availableInRange[i + j] + 1) {
          consecutive = false;
          break;
        }
      }
      if (consecutive) {
        for (let j = 0; j < numberOfCars; j++) {
          spots.push(availableInRange[i + j]);
        }
        return spots;
      }
    }
  }

  // If consecutive not available or only 1 car, just pick first available spots
  for (let i = 0; i < numberOfCars && i < availableInRange.length; i++) {
    spots.push(availableInRange[i]);
  }

  return spots.length === numberOfCars ? spots : null;
}

// Generate time slots in half-hour increments (00:00 - 23:30)
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    slots.push(`${hourStr}:00`);
    slots.push(`${hourStr}:30`);
  }
  return slots;
}

// Format datetime-local value to display format
function formatDateTimeForDisplay(date: string, time: string): string {
  if (!date || !time) return "";
  
  const dateObj = new Date(date + 'T' + time);
  const months = ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек'];
  
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const hours = time.split(':')[0];
  const minutes = time.split(':')[1];
  
  return `${day} ${month} ${year} • ${hours}:${minutes}`;
}

// Convert datetime-local input to separate date and time
function parseDateTimeLocal(datetimeLocal: string): { date: string; time: string } {
  if (!datetimeLocal) return { date: "", time: "" };
  
  const [date, time] = datetimeLocal.split('T');
  return { date, time: time || "" };
}

// Combine date and time to datetime-local format
function combineDateTimeLocal(date: string, time: string): string {
  if (!date) return "";
  if (!time) return date + 'T00:00';
  return date + 'T' + time;
}

// Auto-format license plate
function formatLicensePlate(input: string): string {
  // Remove all spaces and convert to uppercase
  return input.replace(/\s+/g, '').toUpperCase();
}

// Calendar helper functions
function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  
  return { daysInMonth, startingDayOfWeek, year, month };
}

function calculateCapacityForDate(bookings: Booking[], dateStr: string) {
  // NEW LOGIC: Calculate projected occupancy independently for each day
  // This is a FORECASTING tool based on confirmed reservations
  
  // Get the date we're calculating for
  const targetDate = new Date(dateStr);
  const todayStr = getTodayDate();
  const isToday = dateStr === todayStr;
  
  // Step 1: Calculate arrivals for this specific date
  const arrivingBookings = bookings.filter(b => {
    if (b.status === 'cancelled' || b.status === 'no-show' || b.status === 'declined') return false;
    if (b.status !== 'confirmed' && b.status !== 'arrived') return false;
    return b.arrivalDate === dateStr;
  });
  const arrivingCount = arrivingBookings.reduce((sum, b) => {
    const numCars = Number(b.numberOfCars);
    return sum + ((numCars > 0) ? numCars : 1);
  }, 0);
  
  // Step 2: Calculate departures for this specific date
  const leavingBookings = bookings.filter(b => {
    if (b.status === 'cancelled' || b.status === 'no-show' || b.status === 'checked-out' || b.status === 'declined') return false;
    return b.departureDate === dateStr;
  });
  const leavingCount = leavingBookings.reduce((sum, b) => {
    const numCars = Number(b.numberOfCars);
    return sum + ((numCars > 0) ? numCars : 1);
  }, 0);
  
  // Step 3: Calculate projected occupancy (cars that should be parked on this date)
  // Based on confirmed reservations whose stay includes this date
  const overlappingBookings = bookings.filter(b => {
    // Only count confirmed and arrived reservations for projections
    if (b.status !== 'confirmed' && b.status !== 'arrived') return false;

    const bookingArrival = new Date(b.arrivalDate);

    // Late bookings have no confirmed departure — count them for all dates from arrival onwards
    if (b.isLate) {
      return bookingArrival <= targetDate;
    }

    const bookingDeparture = new Date(b.departureDate);
    return bookingArrival <= targetDate && targetDate <= bookingDeparture;
  });
  
  let nonKeysCount = 0;
  let keysCount = 0;
  
  overlappingBookings.forEach(b => {
    // Only count if includeInCapacity is not explicitly false
    if (b.includeInCapacity === false) {
      return;
    }
    
    const numCars = Number(b.numberOfCars);
    const carCount = (numCars > 0) ? numCars : 1;
    
    if (b.carKeys) {
      keysCount += carCount;
    } else {
      nonKeysCount += carCount;
    }
  });
  
  const totalCount = nonKeysCount + keysCount;
  const percentage = totalCount > 0 ? (totalCount / TOTAL_CAPACITY) * 100 : 0;
  
  return {
    nonKeysCount,
    keysCount,
    totalCount,
    leavingCount,
    arrivingCount,
    percentage,
    isLow: percentage < 50,
    isMedium: percentage >= 50 && percentage < 80,
    isHigh: percentage >= 80 && percentage < 100,
    isFull: percentage >= 100,
    isToday,
    overlappingBookings,
  };
}

export function OperatorDashboard({ onLogout, currentUser, permissions }: OperatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("arriving");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [action, setAction] = useState<"arrived" | "no-show" | "checkout" | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftType>(getCurrentShift());
  
  // Late fee confirmation (legacy)
  const [lateFeeDialog, setLateFeeDialog] = useState(false);
  const [confirmedLateFee, setConfirmedLateFee] = useState<number>(0);
  
  // New checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutBooking, setCheckoutBooking] = useState<Booking | null>(null);
  
  // Revenue breakdown expansion
  const [revenueExpanded, setRevenueExpanded] = useState(false);
  
  // Auto-refresh state
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  
  // Status filter for "all" tab
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Additional filters for "all" tab
  const [keysFilter, setKeysFilter] = useState<string>("all"); // "all", "with-keys", "without-keys"
  const [invoiceFilter, setInvoiceFilter] = useState<string>("all"); // "all", "with-invoice", "without-invoice"
  const [arrivalDateFilter, setArrivalDateFilter] = useState<string>(""); // Date string for filtering by arrival date
  const [departureDateFilter, setDepartureDateFilter] = useState<string>(""); // Date string for filtering by departure date
  
  // Filters for confirmed tab
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  
  // Filter for exits tab
  const [exitDate, setExitDate] = useState(getTodayDate());

  // Debug list filters (calendar)
  const [debugStatusFilter, setDebugStatusFilter] = useState<'all' | 'arrived' | 'confirmed'>('all');
  const [debugArrivalFilter, setDebugArrivalFilter] = useState<'all' | 'past' | 'today' | 'future'>('all');
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Undo system
  interface UndoAction {
    bookingId: string;
    action: string;
    previousState: Partial<Booking>;
    timestamp: string;
    description: string;
  }
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    licensePlate: "",
    arrivalDate: "",
    arrivalTime: "",
    departureDate: "",
    departureTime: "",
    passengers: 0,
    numberOfCars: 1,
    carKeys: false,
    keyNumber: "",
    includeInCapacity: true,
    needsInvoice: false,
    notes: "",
    // Invoice fields
    companyName: "",
    companyOwner: "",
    taxNumber: "",
    isVAT: false,
    vatNumber: "",
    city: "",
    address: "",
    invoiceUrl: "",
  });
  const [manualPrice, setManualPrice] = useState<string>("");
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  // Shift preview state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewShiftOffset, setPreviewShiftOffset] = useState(0); // -1 for previous, 1 for next, etc.
  const [showAutoResetMessage, setShowAutoResetMessage] = useState(false);

  // Auto-reset timer for preview mode (60 seconds)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPreviewMode) {
      timer = setTimeout(() => {
        setIsPreviewMode(false);
        setPreviewShiftOffset(0);
        setShowAutoResetMessage(true);
        // Hide message after 2 seconds
        setTimeout(() => setShowAutoResetMessage(false), 2000);
      }, 60000); // 60 seconds
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPreviewMode, previewShiftOffset]);

  // Calculate shift range based on preview mode
  const shiftRange = useMemo(() => {
    if (isPreviewMode && previewShiftOffset !== 0) {
      // Calculate preview shift
      const baseDate = new Date();
      
      // Each shift is 12 hours, so offset by 12 hours * offset
      baseDate.setHours(baseDate.getHours() + (previewShiftOffset * 12));
      
      const hour = baseDate.getHours();
      const shift = hour >= SHIFT_CONFIG.day.start && hour < SHIFT_CONFIG.day.end ? "day" : "night";
      
      return getShiftTimeRange(shift, baseDate);
    }
    return getShiftTimeRange(selectedShift);
  }, [selectedShift, isPreviewMode, previewShiftOffset]);

  // Navigate to previous shift
  const goToPreviousShift = () => {
    setIsPreviewMode(true);
    setPreviewShiftOffset(prev => prev - 1);
  };

  // Navigate to next shift
  const goToNextShift = () => {
    setIsPreviewMode(true);
    setPreviewShiftOffset(prev => prev + 1);
  };

  // Return to active shift
  const returnToActiveShift = () => {
    setIsPreviewMode(false);
    setPreviewShiftOffset(0);
  };

  // Fetch bookings
  const fetchBookings = async (showLoadingSpinner = false, silent = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log("Fetched bookings:", data.bookings);
        console.log("Sample booking with invoice data:", data.bookings.find((b: Booking) => b.needsInvoice));
        
        // Debug discount information
        const bookingsWithDiscounts = data.bookings.filter((b: Booking) => b.discountCode || b.discountApplied);
        console.log("📊 Bookings with discounts:", bookingsWithDiscounts.map((b: Booking) => ({
          id: b.id,
          name: b.name,
          discountCode: b.discountCode,
          discountApplied: b.discountApplied,
          basePrice: b.basePrice,
          totalPrice: b.totalPrice
        })));
        
        // Recalculate late surcharges for late bookings
        const bookingsWithUpdatedSurcharges = data.bookings.map((b: Booking) => {
          if (b.isLate && b.originalDepartureDate) {
            const updatedSurcharge = calculateLateSurcharge(b.originalDepartureDate);
            return { ...b, lateSurcharge: updatedSurcharge };
          }
          return b;
        });
        
        // Check if data has changed (only for background refreshes)
        if (!showLoadingSpinner && !silent && bookings.length > 0) {
          const hasChanged = JSON.stringify(bookings) !== JSON.stringify(bookingsWithUpdatedSurcharges);
          if (hasChanged) {
            toast.success("✅ Данните са актуализирани", { duration: 2000 });
          }
        }
        
        setBookings(bookingsWithUpdatedSurcharges);
        setLastRefresh(new Date());
      } else {
        if (showLoadingSpinner) {
          toast.error("Грешка при зареждане на резервации");
        }
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
      if (showLoadingSpinner) {
        toast.error("Грешка при зареждане на резервации");
      }
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBookings(true, true); // Show loading spinner only on initial load, silent mode
    const interval = setInterval(() => fetchBookings(false, false), 10000); // Auto-refresh every 10 seconds with notifications
    return () => clearInterval(interval);
  }, []);

  // Auto-update shift when time changes (check every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentShift = getCurrentShift();
      if (currentShift !== selectedShift) {
        setSelectedShift(currentShift);
        console.log(`Shift changed to: ${currentShift}`);
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [selectedShift]);

  // Auto-calculate price when dates/times/cars change
  useEffect(() => {
    const updatePrice = async () => {
      if (bookingForm.arrivalDate && bookingForm.arrivalTime && 
          bookingForm.departureDate && bookingForm.departureTime) {
        const price = await calculatePrice(
          bookingForm.arrivalDate,
          bookingForm.arrivalTime,
          bookingForm.departureDate,
          bookingForm.departureTime,
          bookingForm.numberOfCars
        );
        setCalculatedPrice(price);
        // Always update the price field when dates change
        setManualPrice(price.toString());
      }
    };
    updatePrice();
  }, [bookingForm.arrivalDate, bookingForm.arrivalTime, bookingForm.departureDate, bookingForm.departureTime, bookingForm.numberOfCars]);

  // Add action to undo stack
  const addToUndoStack = (booking: Booking, action: string, description: string) => {
    const undoAction: UndoAction = {
      bookingId: booking.id,
      action,
      previousState: {
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        arrivedAt: booking.arrivedAt,
        checkedOutAt: booking.checkedOutAt,
        paidAt: booking.paidAt,
        finalPrice: booking.finalPrice,
        carKeys: booking.carKeys,
        needsInvoice: booking.needsInvoice,
        isLate: booking.isLate,
        lateSurcharge: booking.lateSurcharge,
        originalDepartureDate: booking.originalDepartureDate,
        originalDepartureTime: booking.originalDepartureTime,
      },
      timestamp: new Date().toISOString(),
      description,
    };
    setUndoStack(prev => [...prev.slice(-9), undoAction]); // Keep last 10 actions
  };

  // Undo last action
  const handleUndo = async () => {
    if (undoStack.length === 0) {
      toast.error("Няма действия за отмяна");
      return;
    }

    const lastAction = undoStack[undoStack.length - 1];
    
    if (!confirm(`Отмяна на: ${lastAction.description}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${lastAction.bookingId}/undo`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
          body: JSON.stringify({
            operator: currentUser.fullName,
            previousState: lastAction.previousState,
            action: lastAction.action,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Действието е отменено");
        setUndoStack(prev => prev.slice(0, -1)); // Remove from stack
        fetchBookings(false);
      } else {
        toast.error(data.message || "Грешка при отмяна");
      }
    } catch (error) {
      console.error("Undo error:", error);
      toast.error("Грешка при отмяна");
    }
  };

  // Filter bookings by status and shift
  
  // Search filter function
  const filterBySearch = (booking: Booking) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    return (
      booking.name?.toLowerCase().includes(query) ||
      booking.phone?.toLowerCase().includes(query) ||
      booking.licensePlate?.toLowerCase().includes(query) ||
      booking.email?.toLowerCase().includes(query) ||
      booking.id?.toLowerCase().includes(query) ||
      booking.bookingCode?.toLowerCase().includes(query)
    );
  };
  
  const newBookings = bookings.filter(b => b.status === "new" && filterBySearch(b));
  
  const confirmedBookings = useMemo(() => {
    let filtered = bookings.filter(b => b.status === "confirmed" && filterBySearch(b));
    
    // Apply date filters
    if (filterStartDate) {
      filtered = filtered.filter(b => b.arrivalDate >= filterStartDate);
    }
    if (filterEndDate) {
      filtered = filtered.filter(b => b.arrivalDate <= filterEndDate);
    }
    
    return filtered.sort((a, b) => {
      const aTime = new Date(`${a.arrivalDate}T${a.arrivalTime}`).getTime();
      const bTime = new Date(`${b.arrivalDate}T${b.arrivalTime}`).getTime();
      return aTime - bTime;
    });
  }, [bookings, filterStartDate, filterEndDate, searchQuery]);
  
  const arrivingToday = useMemo(() => {
    return bookings
      .filter(b => 
        b.status === "confirmed" && 
        isInShift(b.arrivalDate, b.arrivalTime, shiftRange) &&
        filterBySearch(b)
      )
      .sort((a, b) => {
        const aTime = new Date(`${a.arrivalDate}T${a.arrivalTime}`).getTime();
        const bTime = new Date(`${b.arrivalDate}T${b.arrivalTime}`).getTime();
        return aTime - bTime; // Nearest first
      });
  }, [bookings, shiftRange, searchQuery]);

  const leavingToday = useMemo(() => {
    return bookings
      .filter(b => 
        b.status === "arrived" && 
        (isInShift(b.departureDate, b.departureTime, shiftRange) || b.isLate) &&
        filterBySearch(b)
      )
      .sort((a, b) => {
        // Late bookings should appear first
        if (a.isLate && !b.isLate) return -1;
        if (!a.isLate && b.isLate) return 1;
        
        const aTime = new Date(`${a.departureDate}T${a.departureTime}`).getTime();
        const bTime = new Date(`${b.departureDate}T${b.departureTime}`).getTime();
        return aTime - bTime; // Nearest first
      });
  }, [bookings, shiftRange, searchQuery]);
  
  // Exits tab - customers scheduled to exit on a specific date who haven't checked out yet
  // Shows ALL bookings with this departure date (assuming they will arrive), excluding only cancelled/no-show/checked-out
  const exitingCustomers = useMemo(() => {
    return bookings
      .filter(b => 
        b.status !== "cancelled" && 
        b.status !== "no-show" && 
        b.status !== "checked-out" &&
        b.departureDate === exitDate &&
        filterBySearch(b)
      )
      .sort((a, b) => {
        // Late bookings should appear first
        if (a.isLate && !b.isLate) return -1;
        if (!a.isLate && b.isLate) return 1;
        
        // Then by status priority: arrived/late > confirmed
        const statusPriority = (booking: Booking) => {
          if (booking.status === "arrived" || booking.status === "late") return 0;
          if (booking.status === "confirmed") return 1;
          return 2;
        };
        const aPriority = statusPriority(a);
        const bPriority = statusPriority(b);
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        // Then sort by departure time
        const aTime = new Date(`${a.departureDate}T${a.departureTime}`).getTime();
        const bTime = new Date(`${b.departureDate}T${b.departureTime}`).getTime();
        return aTime - bTime; // Earliest first
      });
  }, [bookings, exitDate, searchQuery]);
  
  // Calculate counts for each status
  const statusCounts = useMemo(() => {
    return {
      all: bookings.filter(b => filterBySearch(b)).length,
      new: bookings.filter(b => b.status === "new" && filterBySearch(b)).length,
      confirmed: bookings.filter(b => b.status === "confirmed" && filterBySearch(b)).length,
      inParking: bookings.filter(b => b.status === "arrived" && filterBySearch(b)).length,
      checkedOut: bookings.filter(b => b.status === "checked-out" && filterBySearch(b)).length,
      cancelled: bookings.filter(b => b.status === "cancelled" && filterBySearch(b)).length,
      noShow: bookings.filter(b => b.status === "no-show" && filterBySearch(b)).length,
      late: bookings.filter(b => b.isLate && filterBySearch(b)).length,
    };
  }, [bookings, searchQuery]);
  
  // All bookings with status filter
  const allBookings = useMemo(() => {
    let filtered = bookings.filter(b => filterBySearch(b));
    
    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "in-parking") {
        filtered = filtered.filter(b => b.status === "arrived");
      } else if (statusFilter === "late") {
        filtered = filtered.filter(b => b.isLate);
      } else {
        filtered = filtered.filter(b => b.status === statusFilter);
      }
    }
    
    // Apply car keys filter
    if (keysFilter === "with-keys") {
      filtered = filtered.filter(b => b.carKeys === true);
    } else if (keysFilter === "without-keys") {
      filtered = filtered.filter(b => !b.carKeys);
    }
    
    // Apply invoice filter
    if (invoiceFilter === "with-invoice") {
      filtered = filtered.filter(b => b.needsInvoice === true);
    } else if (invoiceFilter === "without-invoice") {
      filtered = filtered.filter(b => !b.needsInvoice);
    }
    
    // Apply arrival date filter
    if (arrivalDateFilter) {
      filtered = filtered.filter(b => b.arrivalDate === arrivalDateFilter);
    }
    
    // Apply departure date filter
    if (departureDateFilter) {
      filtered = filtered.filter(b => b.departureDate === departureDateFilter);
    }
    
    return filtered.sort((a, b) => {
      // Sort by arrival date/time, newest first
      const aTime = new Date(`${a.arrivalDate}T${a.arrivalTime}`).getTime();
      const bTime = new Date(`${b.arrivalDate}T${b.arrivalTime}`).getTime();
      return bTime - aTime; // Newest first
    });
  }, [bookings, searchQuery, statusFilter, keysFilter, invoiceFilter, arrivalDateFilter, departureDateFilter]);

  // Render action buttons for operator
  const renderOperatorActions = (booking: Booking) => {
    return (
      <Button
        size="sm"
        onClick={() => {
          handleEditReservation(booking);
          setShowBookingForm(true);
        }}
        className="h-7 text-xs px-2"
        variant="outline"
      >
        <Edit className="w-3 h-3 mr-1" />
        Редактирай
      </Button>
    );
  };

  // Helper function to get status badge for a booking
  const getStatusBadge = (booking: Booking) => {
    const badges = [];
    
    // Status badge
    switch (booking.status) {
      case "new":
        badges.push(<Badge key="status" className="bg-yellow-500 text-base py-1 px-3">🆕 Нова</Badge>);
        break;
      case "confirmed":
        badges.push(<Badge key="status" className="bg-green-600 text-base py-1 px-3">✅ Потвърдена</Badge>);
        break;
      case "arrived":
        badges.push(<Badge key="status" className="bg-blue-600 text-base py-1 px-3">🚗 В паркинга</Badge>);
        break;
      case "checked-out":
        badges.push(<Badge key="status" className="bg-gray-600 text-base py-1 px-3">✔️ Напуснал</Badge>);
        break;
      case "cancelled":
        badges.push(<Badge key="status" variant="destructive" className="text-base py-1 px-3">❌ Отказана</Badge>);
        break;
      case "declined":
        badges.push(<Badge key="status" variant="destructive" className="text-base py-1 px-3">🚫 Отхвърлена</Badge>);
        break;
      case "no-show":
        badges.push(<Badge key="status" variant="secondary" className="text-base py-1 px-3">⭕ Не се яви</Badge>);
        break;
    }
    
    // Late badge
    if (booking.isLate) {
      badges.push(<Badge key="late" className="bg-orange-600 text-base py-1 px-3">⏰ Закъсняла</Badge>);
    }
    
    // Car keys badge
    if (booking.carKeys) {
      badges.push(
        <Badge 
          key="keys" 
          variant="secondary" 
          className={`${booking.includeInCapacity === false ? 'bg-orange-100 text-orange-800' : ''} text-base py-1 px-3`}
        >
          🔑 С ключове{booking.keyNumber && ` - ${booking.keyNumber}`}{booking.includeInCapacity === false && ' 🚫'}
        </Badge>
      );
    }
    
    // Invoice badge
    if (booking.needsInvoice) {
      if (booking.invoiceUrl) {
        badges.push(
          <a key="invoice" href={booking.invoiceUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <Badge variant="outline" className="text-base py-1 px-3 bg-yellow-50 border-yellow-300 cursor-pointer hover:bg-yellow-100 transition-colors">
              <FileText className="w-4 h-4 inline mr-1" />Фактура
            </Badge>
          </a>
        );
      } else {
        badges.push(<Badge key="invoice" variant="outline" className="text-base py-1 px-3 bg-yellow-50 border-yellow-300"><FileText className="w-4 h-4 inline mr-1" />Фактура</Badge>);
      }
    }
    
    return badges;
  };

  // Accept new reservation
  const handleAcceptReservation = async (booking: Booking) => {
    if (!confirm(`Потвърждавате ли резервацията на ${booking.name}?`)) return;

    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${booking.id}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
          body: JSON.stringify({
            operator: currentUser.fullName,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        addToUndoStack(booking, "accept", `Потвърждаване на ${booking.name}`);
        toast.success("Резервацията е потвърдена");
        fetchBookings(false);
      } else {
        toast.error(data.message || "Грешка");
      }
    } catch (error) {
      console.error("Accept error:", error);
      toast.error("Грешка при потвърждаване");
    }
  };

  // Decline reservation
  const handleDeclineReservation = async (booking: Booking) => {
    const reason = prompt(`Причина за отказ на резервацията на ${booking.name}:`);
    if (!reason) return;

    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${booking.id}/decline`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
          body: JSON.stringify({
            operator: currentUser.fullName,
            reason: reason,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        addToUndoStack(booking, "decline", `Отказ на ${booking.name}`);
        toast.success("Резервацията е отказана");
        fetchBookings(false);
      } else {
        toast.error(data.message || "Грешка");
      }
    } catch (error) {
      console.error("Decline error:", error);
      toast.error("Грешка при отказване");
    }
  };

  // Mark as arrived
  const handleArrived = (booking: Booking) => {
    setSelectedBooking(booking);
    setAction("arrived");
    setPaymentDialog(true);
    setPaymentMethod("");
  };

  // Mark as no-show
  const handleNoShow = async (booking: Booking) => {
    if (!confirm(`Сигурни ли сте, че искате да ма��кирате ${booking.name} като неявил се?`)) return;

    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${booking.id}/mark-no-show`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
          body: JSON.stringify({
            operator: currentUser.fullName,
            reason: "Marked by operator"
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        addToUndoStack(booking, "no-show", `Неявил се: ${booking.name}`);
        toast.success("Маркирано като неявил се");
        fetchBookings(false);
      } else {
        toast.error(data.message || "Грешка");
      }
    } catch (error) {
      console.error("No-show error:", error);
      toast.error("Грешка");
    }
  };

  // Confirm arrival with payment
  const confirmArrival = async () => {
    if (!selectedBooking) return;
    if (!paymentMethod) {
      toast.error("Моля изберете метод на плащане");
      return;
    }

    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${selectedBooking.id}/mark-arrived`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
          body: JSON.stringify({
            operator: currentUser.fullName,
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === "pay-on-leave" ? "pending" : "paid"
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        addToUndoStack(selectedBooking, "check-in", `Регистрация: ${selectedBooking.name}`);
        toast.success("Маркирано като пристигнал");
        setPaymentDialog(false);
        setSelectedBooking(null);
        fetchBookings(false);
      } else {
        toast.error(data.message || "Грешка");
      }
    } catch (error) {
      console.error("Arrival error:", error);
      toast.error("Грешка");
    }
  };

  // Calculate late fee using standard pricing
  const calculateLateFeeWithStandardPricing = async (extraDays: number, numberOfCars: number): Promise<number> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/pricing/calculate?days=${extraDays}`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.price) {
          return data.price * numberOfCars;
        }
      }
      
      // Fallback: use calculateDynamicPrice if available
      const pricePerCar = await calculateDynamicPrice("2024-01-01", "00:00", "2024-01-01", "23:59", 1);
      return (pricePerCar || 0) * numberOfCars;
    } catch (error) {
      console.error("Error calculating late fee:", error);
      return 0;
    }
  };

  // Handle checkout
  const handleCheckout = (booking: Booking) => {
    setCheckoutBooking(booking);
    setCheckoutModalOpen(true);
  };
  
  // Confirm late fee and proceed to checkout
  const confirmLateFeeAndCheckout = () => {
    setLateFeeDialog(false);
    if (!selectedBooking) return;
    
    // After confirming late fee, check if payment is needed
    if (selectedBooking.paymentMethod === "pay-on-leave" || selectedBooking.paymentStatus === "pending") {
      setPaymentDialog(true);
      setPaymentMethod("");
    } else {
      // Already paid, checkout directly
      confirmCheckout(selectedBooking);
    }
  };

  // Handle checkout confirmation from modal
  const handleCheckoutConfirm = async (data: {
    lateFee: number;
    adjustmentReason?: string;
    adjustmentNote?: string;
  }) => {
    if (!checkoutBooking) return;
    
    setCheckoutModalOpen(false);
    
    // If payment is pending, ask for payment method
    if (checkoutBooking.paymentMethod === "pay-on-leave" || checkoutBooking.paymentStatus === "pending") {
      setSelectedBooking(checkoutBooking);
      setConfirmedLateFee(data.lateFee);
      setAction("checkout");
      setPaymentDialog(true);
      setPaymentMethod("");
      // Store adjustment details temporarily
      (checkoutBooking as any)._adjustmentReason = data.adjustmentReason;
      (checkoutBooking as any)._adjustmentNote = data.adjustmentNote;
    } else {
      // Already paid, checkout directly
      await confirmCheckout(checkoutBooking, data.lateFee, data.adjustmentReason, data.adjustmentNote);
    }
  };

  // Confirm checkout
  const confirmCheckout = async (
    booking?: Booking, 
    lateFee?: number,
    adjustmentReason?: string,
    adjustmentNote?: string
  ) => {
    const targetBooking = booking || selectedBooking;
    if (!targetBooking) return;

    // If payment was pending and no method selected
    if ((targetBooking.paymentMethod === "pay-on-leave" || targetBooking.paymentStatus === "pending") && !paymentMethod && !booking) {
      toast.error("Моля изберете метод на плащане");
      return;
    }
    
    // Get adjustment details from temporary storage if available
    const finalAdjustmentReason = adjustmentReason || (targetBooking as any)._adjustmentReason;
    const finalAdjustmentNote = adjustmentNote || (targetBooking as any)._adjustmentNote;
    const finalLateFee = lateFee !== undefined ? lateFee : confirmedLateFee;

    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${targetBooking.id}/checkout`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
          body: JSON.stringify({
            operator: currentUser.fullName,
            paymentMethod: paymentMethod || targetBooking.paymentMethod,
            confirmedLateFee: targetBooking.isLate ? finalLateFee : undefined,
            adjustmentReason: finalAdjustmentReason,
            adjustmentNote: finalAdjustmentNote,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        addToUndoStack(targetBooking, "check-out", `Напускане: ${targetBooking.name}`);
        toast.success("Напуснал паркинга");
        setPaymentDialog(false);
        setSelectedBooking(null);
        setCheckoutBooking(null);
        fetchBookings(false);
      } else {
        toast.error(data.message || "Грешка");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Грешка");
    }
  };

  // Calculate late surcharge (5 EUR per day past original departure date)
  const calculateLateSurcharge = (originalDepartureDate: string) => {
    const now = new Date();
    const departure = new Date(originalDepartureDate);
    
    // Set both to midnight for accurate day calculation
    now.setHours(0, 0, 0, 0);
    departure.setHours(0, 0, 0, 0);
    
    const daysLate = Math.floor((now.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24));
    return daysLate > 0 ? daysLate * 5 : 0;
  };

  // Mark as late
  const handleMarkLate = async (booking: Booking) => {
    if (!confirm(`Сигурни ли сте, че искате да маркирате ${booking.name} като закъсняващ?`)) return;

    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${booking.id}/mark-late`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
          body: JSON.stringify({
            operator: currentUser.fullName,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        addToUndoStack(booking, "mark-late", `Закъсняв��: ${booking.name}`);
        toast.success("Маркирано като закъсняващ");
        fetchBookings(false);
      } else {
        toast.error(data.message || "Грешка");
      }
    } catch (error) {
      console.error("Mark late error:", error);
      toast.error("Грешка");
    }
  };

  // Toggle shift
  const toggleShift = () => {
    setSelectedShift(prev => prev === "day" ? "night" : "day");
  };

  // Calculate price using dynamic pricing
  const calculatePrice = async (
    arrivalDate: string, 
    arrivalTime: string,
    departureDate: string,
    departureTime: string,
    numberOfCars: number = 1
  ): Promise<number> => {
    if (!arrivalDate || !departureDate || !arrivalTime || !departureTime) return 0;
    
    try {
      const price = await calculateDynamicPrice(
        arrivalDate,
        arrivalTime,
        departureDate,
        departureTime,
        numberOfCars
      );
      return price || 0;
    } catch (error) {
      console.error("Error calculating price:", error);
      return 0;
    }
  };

  // Open add manual reservation form
  const handleAddManualReservation = () => {
    setEditingBooking(null);
    setBookingForm({
      name: "",
      email: "",
      phone: "",
      licensePlate: "",
      arrivalDate: "",
      arrivalTime: "",
      departureDate: "",
      departureTime: "",
      passengers: 2, // Default value
      numberOfCars: 1,
      carKeys: false,
      keyNumber: "",
      includeInCapacity: true,
      needsInvoice: false,
      notes: "",
      // Invoice fields
      companyName: "",
      companyOwner: "",
      taxNumber: "",
      isVAT: false,
      vatNumber: "",
      city: "",
      address: "",
      invoiceUrl: "",
    });
    setManualPrice("");
    setCalculatedPrice(0);
    setShowBookingForm(true);
  };

  // Open edit reservation form
  const handleEditReservation = (booking: Booking) => {
    setEditingBooking(booking);
    setBookingForm({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      licensePlate: booking.licensePlate,
      arrivalDate: booking.arrivalDate,
      arrivalTime: booking.arrivalTime,
      departureDate: booking.departureDate,
      departureTime: booking.departureTime,
      passengers: booking.passengers,
      numberOfCars: booking.numberOfCars || 1,
      carKeys: booking.carKeys || false,
      keyNumber: booking.keyNumber || "",
      includeInCapacity: booking.includeInCapacity !== false,
      needsInvoice: booking.needsInvoice || false,
      notes: "",
      // Invoice fields
      companyName: booking.companyName || "",
      companyOwner: booking.companyOwner || "",
      taxNumber: booking.taxNumber || "",
      isVAT: booking.isVAT || false,
      vatNumber: booking.vatNumber || "",
      city: booking.city || "",
      address: booking.address || "",
      invoiceUrl: booking.invoiceUrl || "",
    });
    setManualPrice(booking.totalPrice?.toString() || "");
    setCalculatedPrice(0);
    setShowBookingForm(true);
  };

  // Save booking (create or update)
  const handleSaveBooking = async () => {
    // Validation
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.licensePlate || 
        !bookingForm.arrivalDate || !bookingForm.arrivalTime || 
        !bookingForm.departureDate || !bookingForm.departureTime) {
      toast.error("Моля попълнете всички задължителни полета");
      return;
    }

    if (!manualPrice || parseFloat(manualPrice) <= 0) {
      toast.error("Моля в��ведете валидна цена");
      return;
    }

    const totalPrice = parseFloat(manualPrice);

    try {
      const token = localStorage.getItem("skyparking-token");
      
      if (editingBooking) {
        // Update existing booking
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${editingBooking.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${publicAnonKey}`,
              "X-Session-Token": token || "",
            },
            body: JSON.stringify({
              ...bookingForm,
              totalPrice,
              updatedBy: currentUser.fullName,
              editor: currentUser.fullName, // Track who edited the booking
            }),
          }
        );

        const data = await response.json();
        if (data.success) {
          toast.success("Резервацията е обновена");
          setShowBookingForm(false);
          fetchBookings(false);
        } else {
          toast.error(data.message || "Грешка");
        }
      } else {
        // Create new booking
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${publicAnonKey}`,
              "X-Session-Token": token || "",
            },
            body: JSON.stringify({
              ...bookingForm,
              totalPrice,
              status: "confirmed", // Manual reservations are auto-confirmed
              source: "manual",
              createdBy: currentUser.fullName,
            }),
          }
        );

        const data = await response.json();
        if (data.success) {
          toast.success("Резервацията е създадена");
          setShowBookingForm(false);
          fetchBookings(false);
        } else {
          toast.error(data.message || "Грешка");
        }
      }
    } catch (error) {
      console.error("Save booking error:", error);
      toast.error("Грешка при запазване");
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    // Expected arrivals: ALL bookings (confirmed, arrived, checked-out) scheduled to arrive in this shift
    // This is the total number of arrivals scheduled for this shift (total workload)
    const expectedArrivingCount = bookings.filter(b => 
      (b.status === "confirmed" || b.status === "arrived" || b.status === "checked-out") &&
      isInShift(b.arrivalDate, b.arrivalTime, shiftRange)
    ).length;
    
    // Expected departures: ALL bookings (confirmed, arrived, checked-out) scheduled to depart in this shift
    // This is the total number of departures scheduled for this shift (total workload)
    const expectedLeavingCount = bookings.filter(b => 
      (b.status === "confirmed" || b.status === "arrived" || b.status === "checked-out") &&
      isInShift(b.departureDate, b.departureTime, shiftRange)
    ).length;
    
    // Actual arrivals: bookings that have actually arrived (status changed to arrived or checked-out)
    // and their arrival was during this shift
    const actualArrivedCount = bookings.filter(b => 
      (b.status === "arrived" || b.status === "checked-out") &&
      b.arrivedAt &&
      isInShift(b.arrivalDate, b.arrivalTime, shiftRange)
    ).length;
    
    // Actual departures: bookings that have actually checked out during this shift
    const actualLeftCount = bookings.filter(b => 
      b.status === "checked-out" && 
      b.checkedOutAt &&
      isInShift(b.departureDate, b.departureTime, shiftRange)
    ).length;

    return {
      expected: {
        arriving: expectedArrivingCount,
        leaving: expectedLeavingCount
      },
      actual: {
        arrived: actualArrivedCount,
        left: actualLeftCount
      }
    };
  }, [bookings, shiftRange]);

  // Helper: Get occupancy color based on Calendar logic
  // Green: < 50%, Blue: 50-79%, Yellow: 80-99%, Red: >= 100%
  const getOccupancyColor = (percentage: number): { text: string; bar: string } => {
    if (percentage >= 100) return { text: 'text-red-600', bar: 'bg-red-500' };
    if (percentage >= 80) return { text: 'text-yellow-600', bar: 'bg-yellow-500' };
    if (percentage >= 50) return { text: 'text-blue-600', bar: 'bg-blue-500' };
    return { text: 'text-green-600', bar: 'bg-green-500' };
  };

  // Calculate current occupancy for the displayed shift date
  const currentOccupancy = useMemo(() => {
    // For current shift, use today's actual date
    // For preview mode, use the date from the shift range
    let dateString: string;
    
    if (isPreviewMode && previewShiftOffset !== 0) {
      // In preview mode, extract the date from the shift start
      const targetDate = new Date(shiftRange.start);
      dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    } else {
      // For current shift (active mode), always use today's date
      dateString = getTodayDate();
    }
    
    // Count all cars that have status 'arrived' (physically in parking lot)
    // Status 'arrived' means they've checked in and are currently in the parking
    const arrivedBookings = bookings.filter(b => b.status === 'arrived');
    
    // Debug: Log all arrived bookings with their car counts
    console.log('🚗 ARRIVED BOOKINGS DEBUG:');
    arrivedBookings.forEach(b => {
      const numCars = Number(b.numberOfCars);
      const carCount = (numCars > 0) ? numCars : 1;
      console.log(`  - ${b.name} (${b.bookingCode || b.id}): numberOfCars = ${b.numberOfCars} (Number=${numCars}) → counted as ${carCount} cars`);
    });
    
    const carsInParking = arrivedBookings.reduce((sum, b) => {
      // Use Number() for conversion, but handle 0, null, undefined, "" as 1
      const numCars = Number(b.numberOfCars);
      const carCount = (numCars > 0) ? numCars : 1;
      return sum + carCount;
    }, 0);
    
    console.log(`📊 TOTAL CARS IN PARKING: ${carsInParking} (from ${arrivedBookings.length} reservations)`);
    
    // Calculate percentage based on actual cars in parking (not confirmed reservations)
    const percentage = carsInParking > 0 ? Math.round((carsInParking / BASE_CAPACITY) * 100) : 0;
    const availableSpots = BASE_CAPACITY - carsInParking;
    
    return {
      carsInParking,
      percentage,
      availableSpots,
      total: BASE_CAPACITY
    };
  }, [bookings, shiftRange, isPreviewMode, previewShiftOffset]);

  // Calculate peak occupancy for the current shift (for preview mode)
  // Calculate peak arrivals and peak departures for preview mode
  const peakAnalytics = useMemo(() => {
    if (!isPreviewMode) return null;

    // Get all hours in the shift
    const startTime = new Date(shiftRange.start);
    const endTime = new Date(shiftRange.end);
    const hours = [];
    
    for (let time = new Date(startTime); time < endTime; time.setHours(time.getHours() + 1)) {
      hours.push(new Date(time));
    }

    // Track arrivals and departures by hour
    const arrivalsByHour: { [hour: string]: number } = {};
    const departuresByHour: { [hour: string]: number } = {};

    hours.forEach((hourStart) => {
      const hourStr = String(hourStart.getHours()).padStart(2, '0');
      
      // Count arrivals in this hour
      const arrivalsInHour = bookings.filter(b => {
        if (b.status === 'cancelled' || b.status === 'no-show' || b.status === 'declined') return false;
        const arrivalDateTime = new Date(`${b.arrivalDate}T${b.arrivalTime}`);
        const arrivalHour = arrivalDateTime.getHours();
        return arrivalHour === parseInt(hourStr) && arrivalDateTime >= startTime && arrivalDateTime < endTime;
      }).reduce((sum, b) => sum + Number(b.numberOfCars || 1), 0);

      // Count departures in this hour
      const departuresInHour = bookings.filter(b => {
        if (b.status === 'cancelled' || b.status === 'no-show' || b.status === 'declined') return false;
        const departureDateTime = new Date(`${b.departureDate}T${b.departureTime}`);
        const departureHour = departureDateTime.getHours();
        return departureHour === parseInt(hourStr) && departureDateTime >= startTime && departureDateTime < endTime;
      }).reduce((sum, b) => sum + Number(b.numberOfCars || 1), 0);

      arrivalsByHour[hourStr] = arrivalsInHour;
      departuresByHour[hourStr] = departuresInHour;
    });

    // Find peak arrival hour
    let peakArrivalHour = '00';
    let peakArrivalCount = 0;
    Object.entries(arrivalsByHour).forEach(([hour, count]) => {
      if (count > peakArrivalCount) {
        peakArrivalCount = count;
        peakArrivalHour = hour;
      }
    });

    // Find peak departure hour
    let peakDepartureHour = '00';
    let peakDepartureCount = 0;
    Object.entries(departuresByHour).forEach(([hour, count]) => {
      if (count > peakDepartureCount) {
        peakDepartureCount = count;
        peakDepartureHour = hour;
      }
    });

    // Format time ranges
    const peakArrivalNextHour = String((parseInt(peakArrivalHour) + 1) % 24).padStart(2, '0');
    const peakArrivalRange = `${peakArrivalHour}:00 – ${peakArrivalNextHour}:00`;

    const peakDepartureNextHour = String((parseInt(peakDepartureHour) + 1) % 24).padStart(2, '0');
    const peakDepartureRange = `${peakDepartureHour}:00 – ${peakDepartureNextHour}:00`;

    return {
      peakArrivals: {
        timeRange: peakArrivalRange,
        count: peakArrivalCount
      },
      peakDepartures: {
        timeRange: peakDepartureRange,
        count: peakDepartureCount
      }
    };
  }, [bookings, shiftRange, isPreviewMode]);

  // Calculate revenue statistics
  const revenueStats = useMemo(() => {
    // Helper function to check if a payment (paidAt) falls within the shift
    const isPaidInShift = (paidAt: string | undefined): boolean => {
      if (!paidAt) return false;
      const paidDate = new Date(paidAt);
      const paidDateOnly = paidDate.toISOString().split('T')[0];
      const paidTime = paidDate.toTimeString().slice(0, 5); // HH:MM format
      return isInShift(paidDateOnly, paidTime, shiftRange);
    };
    
    // Expected revenue: ALL bookings (confirmed, arrived, checked-out) that arrive during this shift
    // We count revenue when customers arrive, not when they leave
    const expectedBookings = bookings.filter(b => 
      (b.status === "confirmed" || b.status === "arrived" || b.status === "checked-out") &&
      isInShift(b.arrivalDate, b.arrivalTime, shiftRange)
    );
    const expectedRevenue = expectedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    // Actual collected: paid bookings where payment was MADE during this shift (by paidAt timestamp)
    // This ensures payments collected during a shift show up in that shift's revenue
    const paidBookings = bookings.filter(b => 
      b.paymentStatus === "paid" &&
      b.paidAt && // Must have a paidAt timestamp
      isPaidInShift(b.paidAt)
    );
    
    // Pending payment: customers with pay-on-leave that arrived during this shift
    const pendingPaymentBookings = bookings.filter(b => 
      b.paymentMethod === "pay-on-leave" &&
      b.paymentStatus === "pending" &&
      b.status === "arrived" &&
      isInShift(b.arrivalDate, b.arrivalTime, shiftRange)
    );
    const pendingRevenue = pendingPaymentBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const pendingCount = pendingPaymentBookings.length;
    
    // Calculate base revenue (excluding late fees)
    const baseRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    // Calculate late fees separately
    const lateFees = paidBookings
      .filter(b => b.isLate && b.lateSurcharge)
      .reduce((sum, b) => sum + (b.lateSurcharge || 0), 0);
    
    const actualRevenue = paidBookings.reduce((sum, b) => sum + (b.finalPrice || b.totalPrice), 0);
    
    // By payment method
    const cashRevenue = paidBookings
      .filter(b => b.paymentMethod === "cash")
      .reduce((sum, b) => sum + (b.finalPrice || b.totalPrice), 0);
    
    const cardRevenue = paidBookings
      .filter(b => b.paymentMethod === "card")
      .reduce((sum, b) => sum + (b.finalPrice || b.totalPrice), 0);
    
    // Breakdown by booking (for expandable view)
    const breakdown = paidBookings.map(b => ({
      id: b.id,
      name: b.name,
      basePrice: b.totalPrice,
      lateFee: b.isLate ? (b.lateSurcharge || 0) : 0,
      total: b.finalPrice || b.totalPrice,
      isLate: b.isLate || false
    }));

    // Calculate lost revenue (no-shows + cancelled)
    const lostBookings = bookings.filter(b =>
      (b.status === "no-show" || b.status === "cancelled" || b.status === "declined") &&
      isInShift(b.arrivalDate, b.arrivalTime, shiftRange)
    );
    const lostRevenue = lostBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      expected: expectedRevenue,
      actual: actualRevenue,
      collected: actualRevenue, // Same as actual, for clarity in UI
      base: baseRevenue,
      lateFees: lateFees,
      cash: cashRevenue,
      card: cardRevenue,
      pending: pendingRevenue,
      pendingCount: pendingCount,
      lost: lostRevenue,
      breakdown: breakdown,
      
      // Detailed breakdowns for new UI
      collectedBookings: paidBookings.map(b => ({
        id: b.id,
        name: b.name,
        amount: b.finalPrice || b.totalPrice,
        paymentMethod: b.paymentMethod,
        isLate: b.isLate || false,
        lateFee: b.isLate ? (b.lateSurcharge || 0) : 0
      })),
      
      pendingBookings: pendingPaymentBookings.map(b => ({
        id: b.id,
        name: b.name,
        amount: b.totalPrice,
        status: b.status
      })),
      
      lostBookings: lostBookings.map(b => ({
        id: b.id,
        name: b.name,
        amount: b.totalPrice,
        reason: b.status === "no-show" ? "Не се е явил" : "Отказана"
      }))
    };
  }, [bookings, shiftRange]);

  // Check if the current shift is within the allowed date range for revenue viewing
  // Operators can only view revenue for shifts from yesterday, today, or tomorrow
  const isShiftInAllowedRange = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(0, 0, 0, 0);
    
    // Check if shift start is within the allowed range
    return shiftRange.start >= yesterday && shiftRange.start < dayAfterTomorrow;
  }, [shiftRange]);

  // Render action buttons based on tab type
  const renderTabActions = (booking: Booking, showActions: string) => {
    if (showActions === "new") {
      return (
        <div className="flex flex-col gap-3 w-full">
          <Button 
            onClick={() => handleAcceptReservation(booking)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-14 w-full"
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            ✔ Приеми
          </Button>
          <Button 
            variant="destructive"
            onClick={() => handleDeclineReservation(booking)}
            className="font-bold text-lg h-14 w-full"
          >
            <XCircle className="w-6 h-6 mr-2" />
            ✖ Откажи
          </Button>
        </div>
      );
    }
    
    if (showActions === "arriving") {
      return (
        <div className="flex flex-col gap-3 w-full">
          <Button 
            onClick={() => handleArrived(booking)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-14 w-full"
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            ✔ Пристигна
          </Button>
          <Button 
            variant="destructive"
            onClick={() => handleNoShow(booking)}
            className="font-bold text-lg h-14 w-full"
          >
            <XCircle className="w-6 h-6 mr-2" />
            ✖ Не се яви
          </Button>
        </div>
      );
    }

    if (showActions === "leaving") {
      if (booking.isLate) {
        return (
          <Button 
            onClick={() => handleCheckout(booking)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-14 w-full"
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            Напусна (доплащане €{booking.lateSurcharge || 0})
          </Button>
        );
      }
      return (
        <div className="flex flex-col gap-3 w-full">
          <Button 
            onClick={() => handleCheckout(booking)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-14 w-full"
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            Напусна
          </Button>
          <Button 
            variant="destructive"
            onClick={() => handleMarkLate(booking)}
            className="bg-red-600 hover:bg-red-700 font-bold text-lg h-14 w-full"
          >
            <AlertCircle className="w-6 h-6 mr-2" />
            Закъснява
          </Button>
        </div>
      );
    }
    
    if (showActions === "exits") {
      if (booking.status === "new" || booking.status === "pending") {
        return (
          <Badge variant="outline" className="text-base py-2 px-4 bg-yellow-100 border-yellow-400 border-2 font-bold">
            ⏳ Очаква потвърждение
          </Badge>
        );
      }
      if (booking.status === "confirmed") {
        return (
          <Button 
            onClick={() => handleArrived(booking)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-14 w-full"
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            ✔ Пристигна
          </Button>
        );
      }
      if ((booking.status === "arrived" || booking.status === "late") && booking.isLate) {
        return (
          <Button 
            onClick={() => handleCheckout(booking)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-14 w-full"
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            Напусна (доплащане €{booking.lateSurcharge || 0})
          </Button>
        );
      }
      if ((booking.status === "arrived" || booking.status === "late") && !booking.isLate) {
        return (
          <div className="flex flex-col gap-3 w-full">
            <Button 
              onClick={() => handleCheckout(booking)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-14 w-full"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Напусна
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleMarkLate(booking)}
              className="bg-red-600 hover:bg-red-700 font-bold text-lg h-14 w-full"
            >
              <AlertCircle className="w-6 h-6 mr-2" />
              Закъснява
            </Button>
          </div>
        );
      }
    }

    return null;
  };

  // Render booking card
  const renderBookingCard = (booking: Booking, showActions: string) => {
    // Calculate capacity for the arrival date specifically
    const capacityOnArrival = calculateCapacityForSingleDate(
      bookings,
      booking.arrivalDate,
      booking.id
    );
    
    return (
      <ReservationCard
        key={booking.id}
        reservation={booking as ReservationData}
        showActions={true}
        actions={renderTabActions(booking, showActions)}
        showCapacityInfo={true}
        capacityInfo={capacityOnArrival}
        showTimestamps={false}
        showEditHistory={false}
      />
    );
  };

  // State for menu drawer
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hamburger Menu Drawer */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Меню</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* User Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Потребител</div>
                <div className="font-semibold text-gray-900">{currentUser.fullName}</div>
                <div className="text-sm text-gray-600">{currentUser.role}</div>
              </div>

              {/* Undo Button */}
              <Button 
                onClick={() => {
                  handleUndo();
                  setMenuOpen(false);
                }} 
                variant="outline"
                disabled={undoStack.length === 0}
                className={`w-full mb-3 justify-start text-base h-12 ${undoStack.length > 0 ? 'bg-yellow-50 border-yellow-300' : ''}`}
              >
                <Undo className="w-5 h-5 mr-2" />
                Отмяна
                {undoStack.length > 0 && (
                  <span className="ml-auto px-2 py-1 bg-yellow-200 text-yellow-800 text-sm rounded-full font-semibold">
                    {undoStack.length}
                  </span>
                )}
              </Button>

              {/* Logout Button */}
              <Button 
                onClick={onLogout} 
                variant="outline" 
                className="w-full justify-start text-base h-12 border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Изход
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Auto-reset notification */}
      {showAutoResetMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg text-sm z-50 animate-fade-in">
          Върнато към активната смяна
        </div>
      )}

      {/* Shift Status Bar - Clean Operations Control UI v3 */}
      <div className="bg-white border-b py-2">
        <div className="px-3">
          {/* Compact Shift Header with controls */}
          <div className="flex items-center justify-between mb-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
            {/* Left: Hamburger Menu */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Меню"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Center: Shift Info */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              {!isPreviewMode && <span className="text-green-500 text-base">●</span>}
              {isPreviewMode && <span className="text-base">👁</span>}
              <div className="text-center">
                <div className="font-bold text-gray-900 uppercase text-sm leading-tight">
                  {isPreviewMode ? 'ПРЕГЛЕД' : SHIFT_CONFIG[shiftRange.shift].label}
                </div>
                <div className="text-xs text-gray-600">
                  {formatShiftDisplay(shiftRange).replace(/\/\d{4}/g, '')}
                </div>
              </div>
            </div>

            {/* Right: Refresh Button */}
            <button
              onClick={async () => {
                setIsManualRefreshing(true);
                await fetchBookings(false, true);
                setIsManualRefreshing(false);
                toast.success("🔄 Опреснено");
              }}
              disabled={isManualRefreshing}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center disabled:opacity-50"
              title="Опресни"
            >
              <RefreshCw className={`w-6 h-6 text-gray-700 ${isManualRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Shift Navigation */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={goToPreviousShift}
              className="flex items-center justify-center gap-1 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded transition-colors font-semibold min-h-[48px]"
              title="Предишна смяна"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Предишна</span>
            </button>
            <button
              onClick={returnToActiveShift}
              className={`text-sm px-4 py-2 rounded transition-colors font-black min-h-[48px] ${
                !isPreviewMode
                  ? 'bg-blue-50 text-blue-700 border-2 border-blue-400'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-2 border-gray-200'
              }`}
              title="Днешна смяна"
            >
              ДНЕС
            </button>
            <button
              onClick={goToNextShift}
              className="flex items-center justify-center gap-1 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded transition-colors font-semibold min-h-[48px]"
              title="Следваща смяна"
            >
              <span className="hidden sm:inline">Следваща</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Main KPI Blocks - Mobile-First 2-Column Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Block 1 - ARRIVALS */}
            <div className="bg-white rounded-lg border-2 border-gray-200 px-3 py-3">
              <div className="text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">
                ПРИСТИГАНИЯ
              </div>
              <div className="text-3xl font-black text-gray-900 leading-none">
                {summaryStats.actual.arrived}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                от {summaryStats.expected.arriving}
              </div>
            </div>

            {/* Block 2 - DEPARTURES */}
            <div className="bg-white rounded-lg border-2 border-gray-200 px-3 py-3">
              <div className="text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">
                НАПУСКАНИЯ
              </div>
              <div className="text-3xl font-black text-gray-900 leading-none">
                {summaryStats.actual.left}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                от {summaryStats.expected.leaving}
              </div>
            </div>

            {/* Block 3 - CARS IN PARKING */}
            <div className="bg-white rounded-lg border-2 border-gray-200 px-3 py-3 relative overflow-hidden">
              {/* Colored indicator bar on left */}
              {(() => {
                const colors = getOccupancyColor(currentOccupancy.percentage);
                return <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colors.bar}`}></div>;
              })()}
              <div className="pl-2">
                <div className="text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">
                  В ПАРКИНГА
                </div>
                <div className="text-3xl font-black text-gray-900 leading-none mb-1">
                  {currentOccupancy.carsInParking}
                </div>
                {(() => {
                  const colors = getOccupancyColor(currentOccupancy.percentage);
                  return (
                    <div className={`text-sm font-bold ${colors.text}`}>
                      {currentOccupancy.percentage}%
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Block 4 - FREE SPACES */}
            <div className="bg-white rounded-lg border-2 border-gray-200 px-3 py-3">
              <div className="text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">
                СВОБОДНИ
              </div>
              <div className="text-3xl font-black text-green-600 leading-none">
                {currentOccupancy.availableSpots}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                места
              </div>
            </div>
          </div>

          {/* Preview Mode: Peak Information (Separated) */}
          {isPreviewMode && peakAnalytics && (
            <div className="grid grid-cols-2 gap-2">
              {/* Peak Arrivals */}
              <div className="bg-white rounded-lg border-2 border-gray-200 px-3 py-3">
                <div className="text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">
                  ПИК ПРИСТИГАНИЯ
                </div>
                <div className="text-base font-bold text-gray-900 leading-tight">
                  {peakAnalytics.peakArrivals.timeRange}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {peakAnalytics.peakArrivals.count} коли
                </div>
              </div>

              {/* Peak Departures */}
              <div className="bg-white rounded-lg border-2 border-gray-200 px-3 py-3">
                <div className="text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">
                  ПИК НАПУСКАНИЯ
                </div>
                <div className="text-base font-bold text-gray-900 leading-tight">
                  {peakAnalytics.peakDepartures.timeRange}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {peakAnalytics.peakDepartures.count} коли
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="px-3 py-2">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Търсене по име, телефон, рег. номер..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 text-lg px-5 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl font-bold"
                title="Изчисти"
              >
                ×
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              Резултати: <span className="font-semibold">
                {newBookings.length + confirmedBookings.length + arrivingToday.length + leavingToday.length + exitingCustomers.length + allBookings.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="px-3">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "new", label: "Нови", count: newBookings.length },
              { id: "confirmed", label: "Предстоящи резервации", count: confirmedBookings.length },
              { id: "arriving", label: "Пристигащи днес", count: arrivingToday.length },
              { id: "leaving", label: "Напускащи днес", count: leavingToday.length },
              { id: "all", label: "Всички", count: allBookings.length },
              { id: "revenue", label: "Приходи" },
              { id: "calendar", label: "Календар" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 font-medium text-base whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-3 py-1 rounded-full text-base ${
                    activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* New Reservations */}
            {activeTab === "new" && (
              <div className="space-y-5">
                <h2 className="text-3xl font-semibold mb-6">Нови Резервации</h2>
                {newBookings.length === 0 ? (
                  <Card className="p-16 text-center text-gray-500 text-xl">
                    {searchQuery ? `Няма резултати за "${searchQuery}"` : "Няма нови резервации"}
                  </Card>
                ) : (
                  newBookings.map(booking => renderBookingCard(booking, "new"))
                )}
              </div>
            )}

            {/* Confirmed Reservations */}
            {activeTab === "confirmed" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-3xl font-semibold">Предстоящи Резервации</h2>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Date filters */}
                    <div className="flex items-center gap-2">
                      <Label className="text-lg">От:</Label>
                      <Input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="w-48 h-14 text-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-lg">До:</Label>
                      <Input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="w-48 h-14 text-lg"
                      />
                    </div>
                    {(filterStartDate || filterEndDate) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFilterStartDate("");
                          setFilterEndDate("");
                        }}
                        className="text-lg h-14 px-6"
                      >
                        Изчисти
                      </Button>
                    )}
                  </div>
                </div>
                
                {confirmedBookings.length === 0 ? (
                  <Card className="p-16 text-center text-gray-500 text-xl">
                    {searchQuery ? `Няма резултати за "${searchQuery}"` : "Няма предстоящи резервации"}
                  </Card>
                ) : (
                  confirmedBookings.map(booking => renderBookingCard(booking, "confirmed"))
                )}
              </div>
            )}

            {/* Arriving Today */}
            {activeTab === "arriving" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-semibold">Пристигащи днес</h2>
                  <Badge variant="secondary" className="text-lg py-2 px-4">{arrivingToday.length} резервации</Badge>
                </div>
                {arrivingToday.length === 0 ? (
                  <Card className="p-16 text-center text-gray-500 text-xl">
                    {searchQuery ? `Няма резултати за "${searchQuery}"` : "Няма пристигащи за тази смяна"}
                  </Card>
                ) : (
                  arrivingToday.map(booking => renderBookingCard(booking, "arriving"))
                )}
              </div>
            )}

            {/* Leaving Today */}
            {activeTab === "leaving" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-semibold">Напускащи днес</h2>
                  <Badge variant="secondary" className="text-lg py-2 px-4">{leavingToday.length} резе��вации</Badge>
                </div>
                {leavingToday.length === 0 ? (
                  <Card className="p-16 text-center text-gray-500 text-xl">
                    {searchQuery ? `Няма ре��ултати за "${searchQuery}"` : "Няма напускащи за тази смяна"}
                  </Card>
                ) : (
                  leavingToday.map(booking => renderBookingCard(booking, "leaving"))
                )}
              </div>
            )}

            {/* Exits - Scheduled departures */}
            {activeTab === "exits" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-semibold">Изходи</h2>
                    <p className="text-lg text-gray-600 mt-1">Клиенти с планирано напускане</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-lg font-medium text-gray-700">Дата на изход:</label>
                    <input
                      type="date"
                      value={exitDate}
                      onChange={(e) => setExitDate(e.target.value)}
                      className="px-4 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <Badge variant="secondary" className="text-lg py-2 px-4">{exitingCustomers.length} клиенти</Badge>
                  </div>
                </div>
                {exitingCustomers.length === 0 ? (
                  <Card className="p-16 text-center text-gray-500 text-xl">
                    {searchQuery ? `Няма резултати за "${searchQuery}"` : `Няма клиенти за напускане на ${exitDate}`}
                  </Card>
                ) : (
                  exitingCustomers.map(booking => renderBookingCard(booking, "exits"))
                )}
              </div>
            )}

            {/* Summary */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold mb-6">Обобщение за днес</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Arrivals */}
                  <Card className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-green-100 rounded-lg">
                        <TrendingUp className="w-10 h-10 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-2xl">Пристигания</h3>
                        <p className="text-lg text-gray-600">{SHIFT_CONFIG[selectedShift].label}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-lg">Очаквани:</span>
                        <span className="text-4xl font-bold">{summaryStats.expected.arriving}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-lg">Пристигнали досега:</span>
                        <span className="text-4xl font-bold text-green-600">{summaryStats.actual.arrived}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Departures */}
                  <Card className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-blue-100 rounded-lg">
                        <TrendingDown className="w-10 h-10 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-2xl">Напускания</h3>
                        <p className="text-lg text-gray-600">{SHIFT_CONFIG[selectedShift].label}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-lg">Очаквани:</span>
                        <span className="text-4xl font-bold">{summaryStats.expected.leaving}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-lg">Напуснали досега:</span>
                        <span className="text-4xl font-bold text-blue-600">{summaryStats.actual.left}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Revenue */}
            {activeTab === "revenue" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Дневни приходи</h2>
                  {/* Shift indicator (read-only) */}
                  <div className="px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedShift === "day" ? "🌞" : "🌙"}</span>
                      <div>
                        <div className="font-bold text-base">{SHIFT_CONFIG[selectedShift].label}</div>
                        <div className="text-xs text-gray-600">{formatShiftDisplay(shiftRange)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Check if shift is within allowed range */}
                {!isShiftInAllowedRange ? (
                  <Card className="p-8 sm:p-12">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <AlertCircle className="w-16 h-16 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-700">Приходите не са налични</h3>
                      <p className="text-lg text-gray-600 max-w-md">
                        Може да преглеждате приходи само за вчера, днес и утре.
                      </p>
                      <Button 
                        onClick={returnToActiveShift}
                        className="mt-4 bg-[#073590] hover:bg-[#052560]"
                      >
                        Върнете се към текущата смяна
                      </Button>
                    </div>
                  </Card>
                ) : (
                <>
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-[#073590] rounded-lg">
                      <Euro className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl sm:text-2xl">Общо приходи</h3>
                    </div>
                  </div>
                  
                  {/* Top Summary - 3 Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {/* Expected Revenue */}
                    <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                      <div className="text-sm font-semibold text-blue-700 mb-1">💼 Очаквани</div>
                      <div className="text-3xl font-black text-blue-900">€{revenueStats.expected.toFixed(2)}</div>
                      <div className="text-xs text-blue-600 mt-1">Потвърдени + Пристигнали</div>
                    </div>
                    
                    {/* Collected Revenue */}
                    <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg">
                      <div className="text-sm font-semibold text-green-700 mb-1">✅ Събрани</div>
                      <div className="text-3xl font-black text-green-900">€{revenueStats.collected.toFixed(2)}</div>
                      <div className="text-xs text-green-600 mt-1">Реално платени</div>
                    </div>
                    
                    {/* Pending Payments */}
                    <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                      <div className="text-sm font-semibold text-orange-700 mb-1">⏳ Неплатени</div>
                      <div className="text-3xl font-black text-orange-900">€{revenueStats.pending.toFixed(2)}</div>
                      <div className="text-xs text-orange-600 mt-1">{revenueStats.pendingCount} резервации</div>
                    </div>
                  </div>
                  
                  {/* Lost Revenue Section (only show if there's lost revenue) */}
                  {revenueStats.lost > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-red-800">❌ Отпаднали приходи</span>
                        </div>
                        <span className="text-2xl font-black text-red-600">€{revenueStats.lost.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-red-700 mt-1">No-show / Отказани резервации</div>
                    </div>
                  )}
                    
                  {/* Expandable Detailed Breakdown */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setRevenueExpanded(!revenueExpanded)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg font-bold text-gray-800">📊 Детайлна разбивка</span>
                      {revenueExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </button>
                    
                    {revenueExpanded && (
                      <div className="p-4 border-t-2 border-gray-200 space-y-6 bg-gray-50">
                        {/* Collected Revenue List */}
                        <div>
                          <h4 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                            <span className="text-2xl">🟢</span> Събрани приходи ({revenueStats.collectedBookings.length})
                          </h4>
                          {revenueStats.collectedBookings.length > 0 ? (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                              {revenueStats.collectedBookings.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-200">
                                  <div>
                                    <div className="font-semibold text-base">{item.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {item.paymentMethod === "cash" ? "💵 В брой" : "💳 С карта"}
                                      {item.isLate && item.lateFee > 0 && (
                                        <span className="ml-2 text-red-600">+ €{item.lateFee.toFixed(2)} закъснение</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-xl font-bold text-green-700">€{item.amount.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 italic text-center py-4">Все още няма събрани приходи</div>
                          )}
                        </div>
                        
                        {/* Pending Payments List */}
                        {revenueStats.pendingBookings.length > 0 && (
                          <div>
                            <h4 className="text-lg font-bold text-orange-700 mb-3 flex items-center gap-2">
                              <span className="text-2xl">🟡</span> Очаквани (неплатени) ({revenueStats.pendingBookings.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {revenueStats.pendingBookings.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-orange-200">
                                  <div>
                                    <div className="font-semibold text-base">{item.name}</div>
                                    <div className="text-sm text-orange-700">В паркинга (неплатено)</div>
                                  </div>
                                  <div className="text-xl font-bold text-orange-700">€{item.amount.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Lost Revenue List */}
                        {revenueStats.lostBookings.length > 0 && (
                          <div>
                            <h4 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                              <span className="text-2xl">🔴</span> No-show / Отпаднали ({revenueStats.lostBookings.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {revenueStats.lostBookings.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-red-200">
                                  <div>
                                    <div className="font-semibold text-base">{item.name}</div>
                                    <div className="text-sm text-red-700">❌ {item.reason}</div>
                                  </div>
                                  <div className="text-xl font-bold text-red-700">€{item.amount.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Summary row */}
                        <div className="pt-4 border-t-2 border-gray-300">
                          <div className="flex justify-between items-center text-lg">
                            <span className="text-gray-700">Базови приходи:</span>
                            <span className="font-semibold">€{revenueStats.base.toFixed(2)}</span>
                          </div>
                          {revenueStats.lateFees > 0 && (
                            <div className="flex justify-between items-center text-lg mt-2">
                              <span className="text-gray-700">Такси за закъснение:</span>
                              <span className="font-semibold text-red-600">€{revenueStats.lateFees.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cash */}
                  <Card className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <Banknote className="w-10 h-10 text-green-600" />
                      <h3 className="font-semibold text-2xl">В брой</h3>
                    </div>
                    <p className="text-5xl font-bold">€{revenueStats.cash.toFixed(2)}</p>
                  </Card>

                  {/* Card */}
                  <Card className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <CreditCard className="w-10 h-10 text-blue-600" />
                      <h3 className="font-semibold text-2xl">С карта</h3>
                    </div>
                    <p className="text-5xl font-bold">€{revenueStats.card.toFixed(2)}</p>
                  </Card>
                </div>
                </>
                )}
              </div>
            )}

            {/* All Bookings */}
            {activeTab === "all" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold mb-4">Всички резервации</h2>
                
                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Filter className="w-4 h-4 inline mr-1" />
                      Статус
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-2 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="all">Всички статуси ({statusCounts.all})</option>
                      <option value="new">🆕 Нови ({statusCounts.new})</option>
                      <option value="confirmed">✅ Предстоящи ({statusCounts.confirmed})</option>
                      <option value="in-parking">🚗 В паркинга ({statusCounts.inParking})</option>
                      <option value="checked-out">✔️ Напуснали ({statusCounts.checkedOut})</option>
                      <option value="cancelled">❌ Отказани ({statusCounts.cancelled})</option>
                      <option value="no-show">⭕ Не се явиха ({statusCounts.noShow})</option>
                      <option value="late">⏰ Закъснели ({statusCounts.late})</option>
                    </select>
                  </div>
                  
                  {/* Car Keys Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Key className="w-4 h-4 inline mr-1" />
                      Ключове
                    </label>
                    <select
                      value={keysFilter}
                      onChange={(e) => setKeysFilter(e.target.value)}
                      className="w-full px-4 py-2 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="all">Всички</option>
                      <option value="with-keys">🔑 С ключове</option>
                      <option value="without-keys">Без ключове</option>
                    </select>
                  </div>
                  
                  {/* Invoice Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Фактура
                    </label>
                    <select
                      value={invoiceFilter}
                      onChange={(e) => setInvoiceFilter(e.target.value)}
                      className="w-full px-4 py-2 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="all">Всички</option>
                      <option value="with-invoice">📄 С фактура</option>
                      <option value="without-invoice">Без фактура</option>
                    </select>
                  </div>
                  
                  {/* Arrival Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Дата на пристигане
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={arrivalDateFilter}
                        onChange={(e) => setArrivalDateFilter(e.target.value)}
                        className="flex-1 px-4 py-2 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                      />
                      {arrivalDateFilter && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setArrivalDateFilter("")}
                          className="px-3"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Departure Date Filter - NEW */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Дата на заминаване
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={departureDateFilter}
                        onChange={(e) => setDepartureDateFilter(e.target.value)}
                        className="flex-1 px-4 py-2 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                      />
                      {departureDateFilter && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDepartureDateFilter("")}
                          className="px-3"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Results count and clear filters */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-medium text-gray-700">
                    Показани: <span className="font-bold text-blue-600">{allBookings.length}</span> резервации
                  </div>
                  {(statusFilter !== "all" || keysFilter !== "all" || invoiceFilter !== "all" || arrivalDateFilter || departureDateFilter) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStatusFilter("all");
                        setKeysFilter("all");
                        setInvoiceFilter("all");
                        setArrivalDateFilter("");
                        setDepartureDateFilter("");
                      }}
                      className="text-base"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Изчисти всички филтри
                    </Button>
                  )}
                </div>
                
                {allBookings.length === 0 ? (
                  <Card className="p-16 text-center text-gray-500 text-xl">
                    {searchQuery ? `Няма резултати за "${searchQuery}"` : 
                     (statusFilter !== "all" || keysFilter !== "all" || invoiceFilter !== "all" || arrivalDateFilter) ? 
                     "Няма резервации, които отговарят на избраните филтри" : 
                     "Няма резервации"}
                  </Card>
                ) : (
                  allBookings.map(booking => (
                    <ReservationCard
                      key={booking.id}
                      reservation={booking as ReservationData}
                      showActions={true}
                      actions={renderOperatorActions(booking)}
                      showTimestamps={false}
                      showEditHistory={false}
                    />
                  ))
                )}
              </div>
            )}

            {/* Calendar */}
            {activeTab === "calendar" && (
              <div className="space-y-4">
                <Card className="p-3">
                  {/* Calendar Title and Helper Text */}
                  <div className="mb-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#073590]">Очаквана заетост</h2>
                    <p className="text-xs sm:text-sm text-gray-600 italic">Базирано на потвърдени резервации</p>
                  </div>
                  
                  {/* Month Navigation - Single Row, Mobile-Optimized */}
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <Button
                      onClick={() => {
                        const newMonth = new Date(currentMonth);
                        newMonth.setMonth(newMonth.getMonth() - 1);
                        setCurrentMonth(newMonth);
                      }}
                      className="text-base min-h-[48px] px-3"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="hidden sm:inline ml-1">Предишен</span>
                    </Button>
                    
                    <h2 className="text-lg sm:text-xl font-bold text-center flex-1">
                      {currentMonth.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}
                    </h2>
                    
                    <Button
                      onClick={() => {
                        const newMonth = new Date(currentMonth);
                        newMonth.setMonth(newMonth.getMonth() + 1);
                        setCurrentMonth(newMonth);
                      }}
                      className="text-base min-h-[48px] px-3"
                    >
                      <span className="hidden sm:inline mr-1">Следващ</span>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Calendar Grid - Full Width Mobile */}
                  <div className="mb-4">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      <div className="text-center font-bold text-xs p-1">Пн</div>
                      <div className="text-center font-bold text-xs p-1">Вт</div>
                      <div className="text-center font-bold text-xs p-1">Ср</div>
                      <div className="text-center font-bold text-xs p-1">Чт</div>
                      <div className="text-center font-bold text-xs p-1">Пт</div>
                      <div className="text-center font-bold text-xs p-1">Сб</div>
                      <div className="text-center font-bold text-xs p-1">Нд</div>
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                        const days = [];
                        
                        // Adjust for Monday start
                        const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
                        
                        // Empty cells before month starts
                        for (let i = 0; i < adjustedStart; i++) {
                          days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
                        }
                        
                        // Days of the month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const capacity = calculateCapacityForDate(bookings, dateStr);
                          const isSelected = selectedDate === dateStr;
                          const isToday = dateStr === getTodayDate();
                          
                          let bgColor = 'bg-white';
                          if (capacity.isFull) bgColor = 'bg-red-100 border-red-400';
                          else if (capacity.isHigh) bgColor = 'bg-yellow-100 border-yellow-400';
                          else if (capacity.isMedium) bgColor = 'bg-blue-100 border-blue-400';
                          else if (capacity.totalCount > 0) bgColor = 'bg-green-100 border-green-400';
                          
                          days.push(
                            <button
                              key={day}
                              onClick={() => setSelectedDate(dateStr)}
                              className={`aspect-square border-2 rounded text-center hover:shadow-md transition-all flex flex-col items-center justify-center p-1 ${bgColor} ${
                                isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                              } ${isToday ? 'ring-4 ring-[#f1c933] font-black border-[#073590] border-4' : ''}`}
                            >
                              <div className={`${isToday ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} font-bold leading-none`}>{day}</div>
                              <div className={`${isToday ? 'text-xs sm:text-sm font-bold' : 'text-[10px] sm:text-xs'} mt-0.5 font-semibold`}>
                                {capacity.totalCount > 0 ? capacity.totalCount : '-'}
                              </div>
                              {(capacity.arrivingCount > 0 || capacity.leavingCount > 0) && (
                                <div className={`${isToday ? 'text-[9px]' : 'text-[8px]'} text-gray-600 mt-0.5 leading-none`}>
                                  +{capacity.arrivingCount}/-{capacity.leavingCount}
                                </div>
                              )}
                            </button>
                          );
                        }
                        
                        return days;
                      })()}
                    </div>
                  </div>

                  {/* Legend - Compact */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs mb-4 p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-white border-2 rounded flex-shrink-0"></div>
                      <span>Свободно</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded flex-shrink-0"></div>
                      <span>&lt;50%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded flex-shrink-0"></div>
                      <span>50-79%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded flex-shrink-0"></div>
                      <span>80-99%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded flex-shrink-0"></div>
                      <span>≥100%</span>
                    </div>
                  </div>

                  {/* Selected Date Details */}
                  {selectedDate && (() => {
                    const capacity = calculateCapacityForDate(bookings, selectedDate);
                    const availableSpots = TOTAL_CAPACITY - capacity.totalCount;
                    
                    // Calculate REAL parking status (only for today)
                    const realParked = bookings.filter(b => b.status === 'arrived').reduce((sum, b) => {
                      const numCars = Number(b.numberOfCars);
                      return sum + ((numCars > 0) ? numCars : 1);
                    }, 0);
                    const realAvailable = TOTAL_CAPACITY - realParked;
                    
                    return (
                      <Card className="p-3 bg-gradient-to-br from-blue-50 to-purple-50">
                        <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Детайли за {formatDateDisplay(selectedDate)}
                        </h3>
                        
                        {/* Show BOTH real and projected for today */}
                        {capacity.isToday && (
                          <>
                            {/* Section 1: Real-time Status (Live) */}
                            <div className="mb-3 p-3 bg-white rounded-lg border-2 border-[#073590]">
                              <h4 className="text-sm sm:text-base font-bold text-[#073590] mb-2 flex items-center gap-1">
                                <Car className="h-4 w-4" />
                                📍 Реално (Live)
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-center p-2 bg-blue-50 rounded">
                                  <div className="text-xs text-gray-600 font-semibold mb-1">В ПАРКИНГА</div>
                                  <div className="text-3xl font-black text-[#073590]">{realParked}</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded">
                                  <div className="text-xs text-gray-600 font-semibold mb-1">СВОБОДНИ</div>
                                  <div className="text-3xl font-black text-green-600">{realAvailable}</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Section 2: Forecast for Today */}
                            <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-300">
                              <h4 className="text-sm sm:text-base font-bold text-purple-700 mb-2 flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                📊 Прогноза днес
                              </h4>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-2 bg-white rounded shadow-sm">
                                  <div className="text-[10px] text-gray-600 font-semibold mb-1">Очаквани</div>
                                  <div className="text-2xl font-bold text-purple-700">{capacity.totalCount}</div>
                                </div>
                                <div className="text-center p-2 bg-white rounded shadow-sm">
                                  <div className="text-[10px] text-gray-600 font-semibold mb-1">⬇️ Приходи</div>
                                  <div className="text-2xl font-bold text-green-600">{capacity.arrivingCount}</div>
                                </div>
                                <div className="text-center p-2 bg-white rounded shadow-sm">
                                  <div className="text-[10px] text-gray-600 font-semibold mb-1">⬆️ Напускат</div>
                                  <div className="text-2xl font-bold text-orange-600">{capacity.leavingCount}</div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* For future/past dates - only show projected */}
                        {!capacity.isToday && (
                          <>
                            <div className="mb-3 p-2 bg-purple-50 rounded border border-purple-200">
                              <p className="text-xs sm:text-sm text-purple-800 font-semibold">
                                📊 Прогноза (потвърдени резервации)
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="bg-white p-3 rounded-lg shadow border-2 border-blue-200">
                                <div className="text-gray-600 text-xs font-semibold mb-1">��ЕЗ КЛЮЧОВЕ</div>
                                <div className="text-2xl font-black text-blue-600">{capacity.nonKeysCount}</div>
                                <div className="text-xs text-gray-500">/ {BASE_CAPACITY}</div>
                              </div>
                              
                              <div className="bg-white p-3 rounded-lg shadow border-2 border-purple-200">
                                <div className="text-gray-600 text-xs font-semibold mb-1">С КЛЮЧОВЕ</div>
                                <div className="text-2xl font-black text-purple-600">{capacity.keysCount}</div>
                                <div className="text-xs text-gray-500">/ {OVERFLOW_CAPACITY}</div>
                              </div>
                              
                              <div className="bg-white p-3 rounded-lg shadow border-2 border-gray-300">
                                <div className="text-gray-600 text-xs font-semibold mb-1">ОБЩО КОЛИ</div>
                                <div className="text-2xl font-black text-gray-800">{capacity.totalCount}</div>
                                <div className="text-xs text-gray-500">/ {TOTAL_CAPACITY}</div>
                              </div>
                              
                              <div className={`bg-white p-3 rounded-lg shadow border-2 ${availableSpots <= 0 ? 'border-red-400' : availableSpots < 40 ? 'border-yellow-400' : 'border-green-400'}`}>
                                <div className="text-gray-600 text-xs font-semibold mb-1">СВОБОДНИ</div>
                                <div className={`text-2xl font-black ${availableSpots <= 0 ? 'text-red-600' : availableSpots < 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {availableSpots}
                                </div>
                                <div className="text-xs text-gray-500">места</div>
                              </div>
                            </div>
                            
                            {/* Arrivals and Departures */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white p-3 rounded-lg shadow border-2 border-green-200">
                                <div className="text-gray-600 text-xs font-semibold mb-1">⬇️ ПРИСТИГАНИЯ</div>
                                <div className="text-2xl font-black text-green-600">{capacity.arrivingCount}</div>
                                <div className="text-xs text-gray-500">коли</div>
                              </div>

                              <div className="bg-white p-3 rounded-lg shadow border-2 border-orange-200">
                                <div className="text-gray-600 text-xs font-semibold mb-1">⬆️ НАПУСКАНИЯ</div>
                                <div className="text-2xl font-black text-orange-600">{capacity.leavingCount}</div>
                                <div className="text-xs text-gray-500">коли</div>
                              </div>
                            </div>

                            {/* Debug: bookings counted for this date */}
                            <details className="mt-3" open>
                              <summary className="text-xs text-gray-500 cursor-pointer select-none">🔍 Резервации включени в броенето ({capacity.overlappingBookings.length})</summary>
                              <div className="mt-2 flex gap-2 flex-wrap">
                                <select
                                  value={debugStatusFilter}
                                  onChange={e => setDebugStatusFilter(e.target.value as typeof debugStatusFilter)}
                                  className="text-xs border rounded px-2 py-1 bg-white"
                                >
                                  <option value="all">Всички статуси</option>
                                  <option value="arrived">Arrived</option>
                                  <option value="confirmed">Confirmed</option>
                                </select>
                                <select
                                  value={debugArrivalFilter}
                                  onChange={e => setDebugArrivalFilter(e.target.value as typeof debugArrivalFilter)}
                                  className="text-xs border rounded px-2 py-1 bg-white"
                                >
                                  <option value="all">Всички дати</option>
                                  <option value="past">Пристигане преди днес</option>
                                  <option value="today">Пристигане днес</option>
                                  <option value="future">Пристигане след днес</option>
                                </select>
                              </div>
                              <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                                {capacity.overlappingBookings.filter(b => {
                                  const today = getTodayDate();
                                  if (debugStatusFilter !== 'all' && b.status !== debugStatusFilter) return false;
                                  if (debugArrivalFilter === 'past' && b.arrivalDate >= today) return false;
                                  if (debugArrivalFilter === 'today' && b.arrivalDate !== today) return false;
                                  if (debugArrivalFilter === 'future' && b.arrivalDate <= today) return false;
                                  return true;
                                }).map(b => {
                                  const excluded = b.includeInCapacity === false;
                                  return (
                                    <div key={b.id} className={`text-xs rounded p-2 border flex justify-between items-center gap-2 ${excluded ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-white border-gray-200'}`}>
                                      <span className="font-semibold truncate">{b.name}</span>
                                      <span className="text-gray-500 shrink-0">{b.licensePlate}</span>
                                      <span className="text-gray-400 shrink-0">{b.arrivalDate} → {b.departureDate}</span>
                                      <span className="shrink-0">{b.numberOfCars ?? 1} кола</span>
                                      <span className={`shrink-0 text-[10px] px-1 rounded ${b.status === 'arrived' ? 'bg-green-100 text-green-700' : b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                                      {excluded && <span className="text-gray-400 shrink-0">🚫</span>}
                                      {b.isLate && <span className="text-orange-500 shrink-0">⏰</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          </>
                        )}
                      </Card>
                    );
                  })()}
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* Late Fee Confirmation Dialog */}
      <Dialog open={lateFeeDialog} onOpenChange={setLateFeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl">
              ⚠️ Потвърдете такса за закъснение
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {selectedBooking && (
              <>
                <div className="p-5 bg-red-50 rounded-lg border-2 border-red-200">
                  <p className="text-xl font-semibold mb-2">{selectedBooking.name}</p>
                  <p className="text-gray-700 text-lg">
                    Оригинална дата на напускане: {selectedBooking.originalDepartureDate} {selectedBooking.originalDepartureTime}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-700">Базова цена:</span>
                    <span className="font-semibold">€{selectedBooking.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Label htmlFor="lateFee" className="text-lg text-gray-700">Такса за закъснение:</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">€</span>
                      <Input
                        id="lateFee"
                        type="number"
                        step="0.01"
                        value={confirmedLateFee}
                        onChange={(e) => setConfirmedLateFee(parseFloat(e.target.value) || 0)}
                        className="w-28 text-xl font-semibold text-right"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span>Обща сума:</span>
                      <span className="text-green-600">€{(selectedBooking.totalPrice + confirmedLateFee).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-base text-gray-700">
                    💡 Можете да коригирате таксата за закъснение преди потвърждаване.
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setLateFeeDialog(false);
                setSelectedBooking(null);
              }} 
              className="text-lg h-14 px-6"
            >
              Отказ
            </Button>
            <Button 
              onClick={confirmLateFeeAndCheckout}
              className="text-lg h-14 px-6 bg-green-600 hover:bg-green-700"
            >
              Потвърди и продължи
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl">
              {action === "arrived" ? "Клиентът платил ли е?" : "Метод на плащане"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-6">
            <div className="text-xl text-gray-700">
              <p className="font-medium mb-2">{selectedBooking?.name}</p>
              {selectedBooking?.isLate && confirmedLateFee > 0 ? (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Базова цена:</span>
                    <span>€{selectedBooking?.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Такса закъснение:</span>
                    <span>€{confirmedLateFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-2xl pt-2 border-t">
                    <span>Обща сума:</span>
                    <span>€{(selectedBooking?.totalPrice + confirmedLateFee).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p>€{selectedBooking?.totalPrice}</p>
              )}
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`w-full p-6 border-2 rounded-lg flex items-center gap-4 transition-all ${
                  paymentMethod === "cash"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Banknote className="w-10 h-10" />
                <div className="text-left">
                  <div className="font-semibold text-xl">В брой</div>
                  <div className="text-lg text-gray-600">Клиентът плати в брой</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("card")}
                className={`w-full p-6 border-2 rounded-lg flex items-center gap-4 transition-all ${
                  paymentMethod === "card"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CreditCard className="w-10 h-10" />
                <div className="text-left">
                  <div className="font-semibold text-xl">С карта</div>
                  <div className="text-lg text-gray-600">Клиентът плати с карта</div>
                </div>
              </button>

              {action === "arrived" && (
                <button
                  onClick={() => setPaymentMethod("pay-on-leave")}
                  className={`w-full p-6 border-2 rounded-lg flex items-center gap-4 transition-all ${
                    paymentMethod === "pay-on-leave"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Clock className="w-10 h-10" />
                  <div className="text-left">
                    <div className="font-semibold text-xl">При напускане</div>
                    <div className="text-lg text-gray-600">Ще плати при напускане</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)} className="text-lg h-14 px-6">
              Отказ
            </Button>
            <Button 
              onClick={action === "arrived" ? confirmArrival : () => confirmCheckout()}
              disabled={!paymentMethod}
              className="text-lg h-14 px-6"
            >
              Потвърди
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Form Dialog (Add/Edit) - OPTIMIZED FOR MOBILE */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto pb-24">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingBooking ? "Редактиране на резервация" : "Нова ръчна резервация"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* === ESSENTIAL FIELDS (PRIORITY) === */}
            
            {/* Name - Full Width */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Име *</Label>
              <Input
                id="booking-name"
                value={bookingForm.name}
                onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                placeholder="Пълно име"
                className="h-14 text-base"
                autoComplete="name"
                enterKeyHint="next"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('booking-phone')?.focus();
                  }
                }}
              />
            </div>

            {/* Phone - Full Width */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Телефон *</Label>
              <Input
                id="booking-phone"
                type="tel"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                placeholder="+359 886 616 991"
                className="h-14 text-base"
                autoComplete="tel"
                enterKeyHint="next"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('booking-license-0')?.focus();
                  }
                }}
              />
            </div>

            {/* License Plate(s) - Full Width */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Регистрационен номер *</Label>
              {Array.from({ length: bookingForm.numberOfCars || 1 }).map((_, index) => {
                const licensePlates = bookingForm.licensePlate.split(',').map(lp => lp.trim());
                return (
                  <Input
                    key={index}
                    id={`booking-license-${index}`}
                    value={licensePlates[index] || ''}
                    onChange={(e) => {
                      const newPlates = [...licensePlates];
                      newPlates[index] = formatLicensePlate(e.target.value);
                      while (newPlates.length < (bookingForm.numberOfCars || 1)) {
                        newPlates.push('');
                      }
                      setBookingForm({...bookingForm, licensePlate: newPlates.join(',')});
                    }}
                    placeholder={`CA1234AB${(bookingForm.numberOfCars || 1) > 1 ? ` (Кола ${index + 1})` : ''}`}
                    className="h-14 text-base mb-2 uppercase"
                    autoComplete="off"
                    enterKeyHint={index === (bookingForm.numberOfCars || 1) - 1 ? "next" : "done"}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (index === (bookingForm.numberOfCars || 1) - 1) {
                          document.getElementById('booking-arrival')?.focus();
                        } else {
                          document.getElementById(`booking-license-${index + 1}`)?.focus();
                        }
                      }
                    }}
                  />
                );
              })}
            </div>

            {/* Arrival - Separate Date and Time */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Дата на пристигане *</Label>
              <DatePicker
                id="booking-arrival-date"
                value={bookingForm.arrivalDate ? new Date(bookingForm.arrivalDate + 'T00:00:00') : undefined}
                onChange={(date) => {
                  // Format date as YYYY-MM-DD in local timezone
                  const dateStr = date 
                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    : '';
                  setBookingForm({...bookingForm, arrivalDate: dateStr});
                }}
                minDate={new Date()}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Час на пристигане *</Label>
              <TimePicker
                id="booking-arrival-time"
                value={bookingForm.arrivalTime}
                onChange={(time) => setBookingForm({...bookingForm, arrivalTime: time})}
              />
            </div>

            {/* Departure - Separate Date and Time */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Дата на напускане *</Label>
              <DatePicker
                id="booking-departure-date"
                value={bookingForm.departureDate ? new Date(bookingForm.departureDate + 'T00:00:00') : undefined}
                onChange={(date) => {
                  // Format date as YYYY-MM-DD in local timezone
                  const dateStr = date 
                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    : '';
                  setBookingForm({...bookingForm, departureDate: dateStr});
                }}
                minDate={bookingForm.arrivalDate ? new Date(bookingForm.arrivalDate + 'T00:00:00') : new Date()}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Час на напускане *</Label>
              <TimePicker
                id="booking-departure-time"
                value={bookingForm.departureTime}
                onChange={(time) => setBookingForm({...bookingForm, departureTime: time})}
              />
            </div>

            {/* Price - Auto-filled, Editable */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Цена *</Label>
              <div className="flex items-center gap-2">
                <Euro className="w-6 h-6 text-gray-500 flex-shrink-0" />
                <Input
                  id="booking-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="Автоматично изчислена"
                  className="h-14 text-base"
                  enterKeyHint="done"
                />
              </div>
              {calculatedPrice > 0 && (
                <p className="text-sm text-green-600">
                  ✓ Автоматично изчислена: €{calculatedPrice.toFixed(2)}
                </p>
              )}
            </div>

            {/* === SECONDARY FIELDS === */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Допълнителна информация</h3>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Имейл</Label>
              <Input
                type="email"
                value={bookingForm.email}
                onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                placeholder="email@example.com"
                className="h-14 text-base"
                autoComplete="email"
              />
            </div>

            {/* Number of Cars and Passengers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Брой автомобили</Label>
                <select
                  className="w-full h-14 px-3 text-base border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={bookingForm.numberOfCars}
                  onChange={(e) => setBookingForm({...bookingForm, numberOfCars: parseInt(e.target.value)})}
                >
                  <option value="1">1 кола</option>
                  <option value="2">2 коли</option>
                  <option value="3">3 коли</option>
                  <option value="4">4 коли</option>
                  <option value="5">5 коли</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Брой пътници</Label>
                <Input
                  type="number"
                  min="0"
                  value={bookingForm.passengers || ""}
                  onChange={(e) => setBookingForm({...bookingForm, passengers: parseInt(e.target.value) || 0})}
                  placeholder="2"
                  className="h-14 text-base"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-5">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="carKeys"
                    checked={bookingForm.carKeys}
                    onCheckedChange={(checked) => setBookingForm({...bookingForm, carKeys: !!checked})}
                    className="w-6 h-6"
                  />
                  <label
                    htmlFor="carKeys"
                    className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    🔑 Клиентът оставя ключовете (позволява препаркиране)
                  </label>
                </div>

                {bookingForm.carKeys && (
                  <div className="ml-8 space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Номер на ключ</Label>
                      <Input
                        value={bookingForm.keyNumber || ""}
                        onChange={(e) => setBookingForm({...bookingForm, keyNumber: e.target.value})}
                        placeholder="напр., Ключ #12"
                        className="h-14 text-base"
                        maxLength={20}
                      />
                      <p className="text-sm text-gray-600">Физически номер на ключа в кутията</p>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                      <Checkbox
                        id="includeInCapacity"
                        checked={bookingForm.includeInCapacity !== false}
                        onCheckedChange={(checked) => setBookingForm({...bookingForm, includeInCapacity: !!checked})}
                        className="w-5 h-5 mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="includeInCapacity"
                          className="text-base font-medium leading-none cursor-pointer"
                        >
                          Включи в допълнителен капацитет
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Ако не е отметнато, това запазване няма да заема място в капацитета (за коли паркирани извън паркинга)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="needsInvoice"
                  checked={bookingForm.needsInvoice}
                  onCheckedChange={(checked) => setBookingForm({...bookingForm, needsInvoice: !!checked})}
                  className="w-6 h-6"
                />
                <label
                  htmlFor="needsInvoice"
                  className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <FileText className="w-5 h-5 inline mr-1" />
                  Искане за фактура
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Бележки</Label>
              <Textarea
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                placeholder="Допълнителна информация..."
                rows={3}
                className="text-base px-4 py-3 min-h-[80px]"
              />
            </div>
            </div>
            {/* End secondary fields container */}

            {/* Invoice Details - Show when needsInvoice is true */}
            {bookingForm.needsInvoice && (
              <div className="space-y-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Данни за фактура</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Име на фирм�� *</Label>
                    <Input
                      value={bookingForm.companyName}
                      onChange={(e) => setBookingForm({...bookingForm, companyName: e.target.value})}
                      placeholder="ООД / ЕООД / АД"
                      className="bg-white h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">ЕИ�� / Булстат *</Label>
                    <Input
                      value={bookingForm.taxNumber}
                      onChange={(e) => setBookingForm({...bookingForm, taxNumber: e.target.value})}
                      placeholder="123456789"
                      className="bg-white h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">URL на фактура</Label>
                    <Input
                      value={bookingForm.invoiceUrl || ''}
                      onChange={(e) => setBookingForm({...bookingForm, invoiceUrl: e.target.value})}
                      placeholder="https://example.com/invoice.pdf"
                      className="bg-white h-12 text-base"
                    />
                    <p className="text-sm text-blue-700">Въведете URL адрес към качената фактура (PDF, Google Drive, Dropbox, и т.н.)</p>
                  </div>
                </div>
              </div>
            )}

            {bookingForm.carKeys && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-base text-blue-800">
                  ℹ️ Тази резервация ще използва допълнителен капацитет за препаркиране
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-gray-200 pt-6 mt-6 gap-3 flex-col sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => setShowBookingForm(false)}
              className="h-14 px-8 text-base font-semibold w-full sm:w-auto order-2 sm:order-1"
            >
              Отказ
            </Button>
            <Button 
              onClick={handleSaveBooking}
              className="h-14 px-8 text-base font-semibold bg-[#073590] hover:bg-[#052558] w-full sm:w-auto order-1 sm:order-2"
            >
              {editingBooking ? "Запази промени" : "Създай резервация"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      {checkoutModalOpen && checkoutBooking && (
        <CheckoutModal
          booking={checkoutBooking}
          onConfirm={handleCheckoutConfirm}
          onCancel={() => {
            setCheckoutModalOpen(false);
            setCheckoutBooking(null);
          }}
          calculateLateFee={calculateLateFeeWithStandardPricing}
        />
      )}

      {/* Floating Action Button (FAB) - Create Reservation */}
      <button
        onClick={handleAddManualReservation}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#073590] hover:bg-[#052558] active:bg-[#041a3d] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 px-4 sm:px-6 py-3 sm:py-4 min-h-[56px] touch-manipulation"
        aria-label="Добави резервация"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-base whitespace-nowrap">Добави резервация</span>
      </button>
    </div>
  );
}