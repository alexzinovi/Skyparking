import { useState, useEffect, useMemo } from "react";
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
  RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";
import type { User as UserType } from "./LoginScreen";
import { calculatePrice as calculateDynamicPrice } from "@/app/utils/pricing";

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
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  passengers: number;
  numberOfCars?: number;
  totalPrice: number;
  carKeys?: boolean;
  needsInvoice?: boolean;
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
}

type TabType = "new" | "confirmed" | "arriving" | "leaving" | "exits" | "summary" | "revenue" | "archive";
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
  return datetime >= shiftRange.start && datetime <= shiftRange.end;
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

  // Count total cars (considering numberOfCars)
  const totalCars = overlappingBookings.reduce(
    (sum, b) => sum + (b.numberOfCars || 1),
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

  // Count total cars present on this date
  const totalCars = presentBookings.reduce(
    (sum, b) => sum + (b.numberOfCars || 1),
    0
  );

  // Count cars leaving on this specific date
  const leavingBookings = presentBookings.filter(b => b.departureDate === targetDate);
  const leavingCars = leavingBookings.reduce(
    (sum, b) => sum + (b.numberOfCars || 1),
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

export function OperatorDashboard({ onLogout, currentUser, permissions }: OperatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("arriving");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [action, setAction] = useState<"arrived" | "no-show" | "checkout" | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftType>(getCurrentShift());
  
  // Late fee confirmation
  const [lateFeeDialog, setLateFeeDialog] = useState(false);
  const [confirmedLateFee, setConfirmedLateFee] = useState<number>(0);
  
  // Revenue breakdown expansion
  const [revenueExpanded, setRevenueExpanded] = useState(false);
  
  // Auto-refresh state
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filters for confirmed tab
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  
  // Filter for exits tab
  const [exitDate, setExitDate] = useState(getTodayDate());

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
  });
  const [manualPrice, setManualPrice] = useState<string>("");
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  const shiftRange = useMemo(() => getShiftTimeRange(selectedShift), [selectedShift]);

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
      booking.name.toLowerCase().includes(query) ||
      booking.phone.toLowerCase().includes(query) ||
      booking.licensePlate.toLowerCase().includes(query) ||
      booking.email?.toLowerCase().includes(query) ||
      booking.id.toLowerCase().includes(query) ||
      booking.bookingCode?.toLowerCase().includes(query) // Add bookingCode search
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
  
  // Archive bookings (checked-out, cancelled, no-show)
  const archivedBookings = useMemo(() => {
    return bookings
      .filter(b => 
        (b.status === "checked-out" || b.status === "cancelled" || b.status === "no-show") &&
        filterBySearch(b)
      )
      .sort((a, b) => {
        // Sort by departure date/time, newest first
        const aTime = new Date(`${a.departureDate}T${a.departureTime}`).getTime();
        const bTime = new Date(`${b.departureDate}T${b.departureTime}`).getTime();
        return bTime - aTime; // Newest first
      });
  }, [bookings, searchQuery]);

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
    if (!confirm(`Сигурни ли сте, че искате да маркирате ${booking.name} като неявил се?`)) return;

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

  // Handle checkout
  const handleCheckout = (booking: Booking) => {
    setSelectedBooking(booking);
    setAction("checkout");
    
    // If customer is late, show late fee confirmation first
    if (booking.isLate && booking.lateSurcharge && booking.lateSurcharge > 0) {
      setConfirmedLateFee(booking.lateSurcharge);
      setLateFeeDialog(true);
      return;
    }
    
    // If payment is pending, ask for payment method
    if (booking.paymentMethod === "pay-on-leave" || booking.paymentStatus === "pending") {
      setPaymentDialog(true);
      setPaymentMethod("");
    } else {
      // Already paid, checkout directly
      confirmCheckout(booking);
    }
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

  // Confirm checkout
  const confirmCheckout = async (booking?: Booking) => {
    const targetBooking = booking || selectedBooking;
    if (!targetBooking) return;

    // If payment was pending and no method selected
    if ((targetBooking.paymentMethod === "pay-on-leave" || targetBooking.paymentStatus === "pending") && !paymentMethod && !booking) {
      toast.error("Моля изберете метод на плащане");
      return;
    }

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
            confirmedLateFee: targetBooking.isLate ? confirmedLateFee : undefined,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        addToUndoStack(targetBooking, "check-out", `Напускане: ${targetBooking.name}`);
        toast.success("Напуснал паркинга");
        setPaymentDialog(false);
        setSelectedBooking(null);
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
        addToUndoStack(booking, "mark-late", `Закъснява: ${booking.name}`);
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
      passengers: 0,
      numberOfCars: 1,
      carKeys: false,
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
      toast.error("Моля въведете валидна цена");
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

  // Calculate revenue statistics
  const revenueStats = useMemo(() => {
    // Expected revenue: ALL bookings (confirmed, arrived, checked-out) that arrive during this shift
    // We count revenue when customers arrive, not when they leave
    const expectedBookings = bookings.filter(b => 
      (b.status === "confirmed" || b.status === "arrived" || b.status === "checked-out") &&
      isInShift(b.arrivalDate, b.arrivalTime, shiftRange)
    );
    const expectedRevenue = expectedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    // Actual collected: paid bookings that arrived or checked out in this shift
    // The idea is that payment happens when they arrive or when they leave
    const paidBookings = bookings.filter(b => 
      b.paymentStatus === "paid" &&
      (
        // Paid on arrival (during this shift)
        (b.arrivedAt && isInShift(b.arrivalDate, b.arrivalTime, shiftRange)) ||
        // Paid on departure (during this shift)
        (b.checkedOutAt && isInShift(b.departureDate, b.departureTime, shiftRange))
      )
    );
    
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

    return {
      expected: expectedRevenue,
      actual: actualRevenue,
      base: baseRevenue,
      lateFees: lateFees,
      cash: cashRevenue,
      card: cardRevenue,
      breakdown: breakdown
    };
  }, [bookings, shiftRange]);

  // Render booking card
  const renderBookingCard = (booking: Booking, showActions: string) => {
    // Calculate capacity for the arrival date specifically
    const capacityOnArrival = calculateCapacityForSingleDate(
      bookings,
      booking.arrivalDate,
      booking.id
    );
    
    return (
    <Card key={booking.id} className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 w-full">
          {/* Booking Code at the top */}
          {booking.bookingCode && (
            <div className="mb-3 inline-block bg-[#f1c933] text-[#073590] font-bold text-lg px-4 py-2 rounded-lg">
              📋 {booking.bookingCode}
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <User className="w-6 h-6 text-gray-500" />
            <span className="font-bold text-2xl">{booking.name}</span>
            {booking.carKeys && (
              <Badge variant="secondary" className="text-base py-1 px-3">
                🔑 С ключове
              </Badge>
            )}
            {booking.needsInvoice && (
              <Badge variant="outline" className="text-base py-1 px-3 bg-yellow-50 border-yellow-300">
                <FileText className="w-5 h-5 inline mr-1" />
                Факту��а
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg text-gray-700 font-medium">
            <div>📞 {booking.phone}</div>
            <div>🚗 {booking.licensePlate}</div>
            <div>📅 {formatDateDisplay(booking.arrivalDate)} {booking.arrivalTime}</div>
            <div>📅 {formatDateDisplay(booking.departureDate)} {booking.departureTime}</div>
            <div>🚙 {booking.numberOfCars || 1} кола/коли</div>
            <div>👥 {booking.passengers} пътник(а)</div>
            <div className="font-bold text-xl">💶 €{booking.totalPrice}</div>
          </div>

          {/* Capacity info */}
          <div className="mt-4">
            <div className="text-base text-gray-600 font-medium">
              Капацитет за {formatDateDisplay(booking.arrivalDate)}: {capacityOnArrival.occupied}/{capacityOnArrival.total} ({capacityOnArrival.percentage}%)
              {capacityOnArrival.leaving > 0 && (
                <span className="text-green-600 ml-2">
                  (-{capacityOnArrival.leaving} напускат)
                </span>
              )}
            </div>
          </div>

          {booking.paymentMethod && (
            <div className="mt-3">
              <Badge variant={booking.paymentStatus === "paid" ? "default" : "secondary"} className="text-base py-1 px-3">
                {booking.paymentMethod === "cash" && "💰 В брой"}
                {booking.paymentMethod === "card" && "💳 С карта"}
                {booking.paymentMethod === "pay-on-leave" && "⏰ При напускане"}
                {booking.paymentStatus === "paid" && " ✓"}
              </Badge>
            </div>
          )}

          {/* Late warning */}
          {booking.isLate && (
            <div className="mt-4 p-5 bg-red-100 border-2 border-red-500 rounded-lg">
              <div className="text-red-900 font-bold text-2xl uppercase mb-3">
                ⚠️ ТОЗИ КЛИЕНТ ЗАКЪСНЯВА
              </div>
              <div className="text-red-800 text-xl font-bold">
                Доплащане: €{booking.lateSurcharge || 0}
              </div>
              <div className="text-red-700 text-base mt-2">
                Оригинална дата на напускане: {booking.originalDepartureDate} {booking.originalDepartureTime}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {showActions === "arriving" && (
          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              onClick={() => handleArrived(booking)}
              className="bg-green-600 hover:bg-green-700 whitespace-nowrap text-lg px-5 py-3"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Пристигна
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleNoShow(booking)}
              className="whitespace-nowrap text-lg px-5 py-3"
            >
              <XCircle className="w-6 h-6 mr-2" />
              Не се яви
            </Button>
          </div>
        )}

        {showActions === "leaving" && !booking.isLate && (
          <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto">
            <Button 
              size="sm" 
              onClick={() => handleCheckout(booking)}
              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap text-lg px-5 py-3"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Напусна
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleMarkLate(booking)}
              className="bg-red-600 hover:bg-red-700 whitespace-nowrap text-lg px-5 py-3"
            >
              <AlertCircle className="w-6 h-6 mr-2" />
              Закъснява
            </Button>
          </div>
        )}
        
        {showActions === "leaving" && booking.isLate && (
          <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto">
            <Button 
              size="sm" 
              onClick={() => handleCheckout(booking)}
              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap text-lg px-5 py-3"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Напусна (с доплащане)
            </Button>
          </div>
        )}
        
        {showActions === "exits" && (booking.status === "new" || booking.status === "pending") && (
          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            <Badge variant="outline" className="text-base py-2 px-4 bg-yellow-50 border-yellow-400">
              Очаква потвърждение
            </Badge>
          </div>
        )}
        
        {showActions === "exits" && booking.status === "confirmed" && (
          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              onClick={() => handleArrived(booking)}
              className="bg-green-600 hover:bg-green-700 whitespace-nowrap text-lg px-5 py-3"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Пристигна
            </Button>
          </div>
        )}
        
        {showActions === "exits" && (booking.status === "arrived" || booking.status === "late") && !booking.isLate && (
          <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto">
            <Button 
              size="sm" 
              onClick={() => handleCheckout(booking)}
              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap text-lg px-5 py-3"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Напусна
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleMarkLate(booking)}
              className="bg-red-600 hover:bg-red-700 whitespace-nowrap text-lg px-5 py-3"
            >
              <AlertCircle className="w-6 h-6 mr-2" />
              Закъснява
            </Button>
          </div>
        )}
        
        {showActions === "exits" && booking.isLate && (
          <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto">
            <Button 
              size="sm" 
              onClick={() => handleCheckout(booking)}
              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap text-lg px-5 py-3"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Напусна (с доплащане)
            </Button>
          </div>
        )}
      </div>
    </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">🅿️ SkyParking Оператор</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-2">
                <span className="text-lg text-gray-600 font-medium">
                  {currentUser.fullName} ({currentUser.role})
                </span>
                <button
                  onClick={toggleShift}
                  className="flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  title="Кликнете за смяна на смяна"
                >
                  {selectedShift === "day" ? <Sun className="w-6 h-6 text-orange-600" /> : <Moon className="w-6 h-6 text-indigo-600" />}
                  <div className="text-left">
                    <div className="text-base font-semibold text-gray-700">
                      {SHIFT_CONFIG[selectedShift].label}
                    </div>
                    <div className="text-base text-gray-600">
                      {formatShiftDisplay(shiftRange)}
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                onClick={async () => {
                  setIsManualRefreshing(true);
                  await fetchBookings(false, true);
                  setIsManualRefreshing(false);
                  toast.success("🔄 Данните са опреснени");
                }} 
                variant="outline"
                disabled={isManualRefreshing}
                className="text-lg h-14 px-6"
                title="Опресни данните ръчно"
              >
                <RefreshCw className={`w-6 h-6 mr-2 ${isManualRefreshing ? 'animate-spin' : ''}`} />
                Опресни
              </Button>
              <Button 
                onClick={handleUndo} 
                variant="outline"
                disabled={undoStack.length === 0}
                className={`relative text-lg h-14 px-6 ${undoStack.length > 0 ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100' : ''}`}
                title={undoStack.length > 0 ? `Отмяна: ${undoStack[undoStack.length - 1]?.description}` : 'Няма действия за отмяна'}
              >
                <Undo className="w-6 h-6 mr-2" />
                Отмяна
                {undoStack.length > 0 && (
                  <span className="ml-1 px-2 py-1 bg-yellow-200 text-yellow-800 text-base rounded-full font-semibold">
                    {undoStack.length}
                  </span>
                )}
              </Button>
              <Button onClick={onLogout} variant="outline" className="text-lg h-14 px-6">
                <LogOut className="w-6 h-6 mr-2" />
                Изход
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Търсене по име, телефон, рег. номер или код (SP-XXXXXXXX)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 text-xl px-6 pl-14 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                title="Изчисти търсенето"
              >
                ×
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-3 text-base text-gray-600">
              Намерени резултати: <span className="font-semibold">
                {newBookings.length + confirmedBookings.length + arrivingToday.length + leavingToday.length + exitingCustomers.length + archivedBookings.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "new", label: "Нови", count: newBookings.length },
              { id: "confirmed", label: "Потвърдени", count: confirmedBookings.length },
              { id: "arriving", label: "Пристигащи днес", count: arrivingToday.length },
              { id: "leaving", label: "Напускащи днес", count: leavingToday.length },
              { id: "exits", label: "Изходи", count: exitingCustomers.length },
              { id: "archive", label: "Архив", count: archivedBookings.length },
              { id: "summary", label: "Обобщение" },
              { id: "revenue", label: "Приходи" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-4 font-medium text-lg whitespace-nowrap border-b-2 transition-colors ${
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
                  newBookings.map(booking => (
                    <Card key={booking.id} className="p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 w-full">
                          {/* Booking Code at the top */}
                          {booking.bookingCode && (
                            <div className="mb-3 inline-block bg-[#f1c933] text-[#073590] font-bold text-lg px-4 py-2 rounded-lg">
                              📋 {booking.bookingCode}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <User className="w-6 h-6 text-gray-500" />
                            <span className="font-bold text-2xl">{booking.name}</span>
                            {booking.needsInvoice && (
                              <Badge variant="outline" className="text-base py-1 px-3 bg-yellow-50 border-yellow-300">
                                <FileText className="w-5 h-5 inline mr-1" />
                                Фактура
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-lg text-gray-700 font-medium">
                            <div>📞 {booking.phone}</div>
                            <div>🚗 {booking.licensePlate}</div>
                            <div>📅 {formatDateDisplay(booking.arrivalDate)} {booking.arrivalTime}</div>
                            <div>📅 {formatDateDisplay(booking.departureDate)} {booking.departureTime}</div>
                            <div>🚙 {booking.numberOfCars || 1} кола/коли</div>
                            <div>👥 {booking.passengers} пътник(а)</div>
                            <div className="font-bold text-xl">💶 €{booking.totalPrice}</div>
                          </div>
                          {(() => {
                            const capacityOnArrival = calculateCapacityForSingleDate(
                              bookings,
                              booking.arrivalDate,
                              booking.id
                            );
                            return (
                              <div className="mt-3 text-base text-gray-600 font-medium">
                                Капацитет за {formatDateDisplay(booking.arrivalDate)}: {capacityOnArrival.occupied}/{capacityOnArrival.total} ({capacityOnArrival.percentage}%)
                                {capacityOnArrival.leaving > 0 && (
                                  <span className="text-green-600 ml-2">
                                    (-{capacityOnArrival.leaving} напускат)
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptReservation(booking)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Потвърди
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeclineReservation(booking)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Откажи
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditReservation(booking)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Редактирай
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Confirmed Reservations */}
            {activeTab === "confirmed" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-3xl font-semibold">Потвърдени Резервации</h2>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Add Manual Reservation Button */}
                    <Button 
                      onClick={handleAddManualReservation}
                      className="bg-blue-600 hover:bg-blue-700 text-lg h-14 px-6"
                    >
                      <Plus className="w-6 h-6 mr-2" />
                      Добави Резервация
                    </Button>
                    
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
                    {searchQuery ? `Няма резултати за "${searchQuery}"` : "Няма потвърдени резервации"}
                  </Card>
                ) : (
                  confirmedBookings.map(booking => (
                    <Card key={booking.id} className="p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                        <div className="flex-1 w-full">
                          {/* Booking Code at the top */}
                          {booking.bookingCode && (
                            <div className="mb-3 inline-block bg-[#f1c933] text-[#073590] font-bold text-lg px-4 py-2 rounded-lg">
                              📋 {booking.bookingCode}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <User className="w-6 h-6 text-gray-500" />
                            <span className="font-bold text-2xl">{booking.name}</span>
                            {booking.carKeys && (
                              <Badge variant="secondary" className="text-base py-1 px-3">
                                🔑 С ключове
                              </Badge>
                            )}
                            {booking.needsInvoice && (
                              <Badge variant="outline" className="text-base py-1 px-3 bg-yellow-50 border-yellow-300">
                                <FileText className="w-5 h-5 inline mr-1" />
                                Фактура
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-lg text-gray-700 font-medium">
                            <div>📞 {booking.phone}</div>
                            <div>🚗 {booking.licensePlate}</div>
                            <div>📅 {formatDateDisplay(booking.arrivalDate)} - {formatDateDisplay(booking.departureDate)}</div>
                            <div>🚙 {booking.numberOfCars || 1} кола/коли</div>
                            <div>👥 {booking.passengers} пътник(а)</div>
                            <div className="font-bold text-xl">💶 €{booking.totalPrice}</div>
                          </div>
                          {(() => {
                            const capacityOnArrival = calculateCapacityForSingleDate(
                              bookings,
                              booking.arrivalDate,
                              booking.id
                            );
                            return (
                              <div className="mt-3 text-base text-gray-600 font-medium">
                                Капацитет за {formatDateDisplay(booking.arrivalDate)}: {capacityOnArrival.occupied}/{capacityOnArrival.total} ({capacityOnArrival.percentage}%)
                                {capacityOnArrival.leaving > 0 && (
                                  <span className="text-green-600 ml-2">
                                    (-{capacityOnArrival.leaving} напускат)
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex flex-col gap-3">
                          <Badge className="bg-green-600 text-base py-2 px-4">Потвърдено</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditReservation(booking)}
                            className="text-base py-2 px-4 h-auto"
                          >
                            <Edit className="w-5 h-5 mr-2" />
                            Редактирай
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
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
                  <Badge variant="secondary" className="text-lg py-2 px-4">{leavingToday.length} резервации</Badge>
                </div>
                {leavingToday.length === 0 ? (
                  <Card className="p-16 text-center text-gray-500 text-xl">
                    {searchQuery ? `Няма резултати за "${searchQuery}"` : "Няма напускащи за тази смяна"}
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
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold mb-6">Дневни приходи</h2>
                
                <Card className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-green-100 rounded-lg">
                      <Euro className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-2xl">Общо</h3>
                      <p className="text-lg text-gray-600">{SHIFT_CONFIG[selectedShift].label}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gray-50 rounded-lg gap-2">
                      <span className="text-gray-600 text-lg">Очаквани приходи:</span>
                      <span className="text-4xl font-bold">€{revenueStats.expected.toFixed(2)}</span>
                    </div>
                    <div className="bg-green-50 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => setRevenueExpanded(!revenueExpanded)}
                        className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 gap-2 hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-lg">Действителни приходи:</span>
                          {revenueExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                        <span className="text-4xl font-bold text-green-600">€{revenueStats.actual.toFixed(2)}</span>
                      </button>
                      
                      {revenueExpanded && (
                        <div className="px-5 pb-5 space-y-3 border-t border-green-200 pt-4">
                          <div className="flex justify-between items-center text-lg">
                            <span className="text-gray-700">Базови приходи:</span>
                            <span className="font-semibold">€{revenueStats.base.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-lg">
                            <span className="text-gray-700">Такси за закъснение:</span>
                            <span className="font-semibold text-red-600">€{revenueStats.lateFees.toFixed(2)}</span>
                          </div>
                          
                          {revenueStats.breakdown.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-green-200">
                              <h4 className="font-semibold text-lg mb-3">Разбивка по резервации:</h4>
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {revenueStats.breakdown.map(item => (
                                  <div key={item.id} className="flex justify-between items-start text-base bg-white p-3 rounded">
                                    <div className="flex-1">
                                      <div className="font-medium">{item.name}</div>
                                      <div className="text-sm text-gray-600">
                                        Цена: €{item.basePrice.toFixed(2)}
                                        {item.isLate && item.lateFee > 0 && (
                                          <span className="text-red-600 ml-2">+ €{item.lateFee.toFixed(2)} закъснение</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="font-bold ml-4">€{item.total.toFixed(2)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
              </div>
            )}

            {/* Archive */}
            {activeTab === "archive" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold mb-6">Архив</h2>
                
                {archivedBookings.length === 0 ? (
                  <Card className="p-16 text-center text-gray-500 text-xl">
                    {searchQuery ? `Няма резултати за "${searchQuery}"` : "Няма резервации в архива"}
                  </Card>
                ) : (
                  archivedBookings.map(booking => (
                    <Card key={booking.id} className="p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                        <div className="flex-1 w-full">
                          {/* Booking Code at the top */}
                          {booking.bookingCode && (
                            <div className="mb-3 inline-block bg-[#f1c933] text-[#073590] font-bold text-lg px-4 py-2 rounded-lg">
                              📋 {booking.bookingCode}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <User className="w-6 h-6 text-gray-500" />
                            <span className="font-bold text-2xl">{booking.name}</span>
                            {booking.status === "checked-out" && (
                              <Badge className="bg-gray-600 text-base py-2 px-4">Напуснал</Badge>
                            )}
                            {booking.status === "cancelled" && (
                              <Badge variant="destructive" className="text-base py-2 px-4">Отказан</Badge>
                            )}
                            {booking.status === "no-show" && (
                              <Badge variant="secondary" className="text-base py-2 px-4">Не се яви</Badge>
                            )}
                            {booking.carKeys && (
                              <Badge variant="secondary" className="text-base py-1 px-3">
                                🔑 С ключове
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-lg text-gray-700 font-medium">
                            <div>📞 {booking.phone}</div>
                            <div>🚗 {booking.licensePlate}</div>
                            <div>📅 {formatDateDisplay(booking.arrivalDate)} - {formatDateDisplay(booking.departureDate)}</div>
                            <div>🚙 {booking.numberOfCars || 1} кола/коли</div>
                            <div>👥 {booking.passengers} пътник(а)</div>
                            <div className="font-bold text-xl">💶 €{booking.finalPrice || booking.totalPrice}</div>
                          </div>
                          {booking.paymentMethod && (
                            <div className="mt-3">
                              <Badge variant={booking.paymentStatus === "paid" ? "default" : "secondary"} className="text-base py-1 px-3">
                                {booking.paymentMethod === "cash" && "💰 В брой"}
                                {booking.paymentMethod === "card" && "💳 С карта"}
                                {booking.paymentStatus === "paid" && " ✓"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
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

      {/* Booking Form Dialog (Add/Edit) */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingBooking ? "Редактиране на резервация" : "Нова ръчна резервация"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Име *</Label>
                <Input
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                  placeholder="Пълно име"
                  className="h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Имейл</Label>
                <Input
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                  placeholder="email@example.com"
                  className="h-12 text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Телефон *</Label>
                <Input
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                  placeholder="+359 886 616 991"
                  className="h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Регистрационен номер *</Label>
                {Array.from({ length: bookingForm.numberOfCars || 1 }).map((_, index) => {
                  const licensePlates = bookingForm.licensePlate.split(',').map(lp => lp.trim());
                  return (
                    <Input
                      key={index}
                      value={licensePlates[index] || ''}
                      onChange={(e) => {
                        const newPlates = [...licensePlates];
                        newPlates[index] = e.target.value.toUpperCase();
                        // Pad array with empty strings if needed
                        while (newPlates.length < (bookingForm.numberOfCars || 1)) {
                          newPlates.push('');
                        }
                        setBookingForm({...bookingForm, licensePlate: newPlates.join(',')});
                      }}
                      placeholder={`CA 1234 AB${(bookingForm.numberOfCars || 1) > 1 ? ` (Кола ${index + 1})` : ''}`}
                      className="h-12 text-base mb-2"
                    />
                  );
                })}
              </div>
            </div>

            {/* Arrival Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Дата на пристигане *</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingForm.arrivalDate}
                  onChange={(e) => setBookingForm({...bookingForm, arrivalDate: e.target.value})}
                  className="h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Час на пристигане *</Label>
                <select
                  value={bookingForm.arrivalTime}
                  onChange={(e) => setBookingForm({...bookingForm, arrivalTime: e.target.value})}
                  className="w-full h-12 px-3 text-base border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Изберете час</option>
                  {generateTimeSlots().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Departure Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Дата на напускане *</Label>
                <Input
                  type="date"
                  min={bookingForm.arrivalDate || new Date().toISOString().split('T')[0]}
                  value={bookingForm.departureDate}
                  onChange={(e) => setBookingForm({...bookingForm, departureDate: e.target.value})}
                  className="h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Час на напускане *</Label>
                <select
                  value={bookingForm.departureTime}
                  onChange={(e) => setBookingForm({...bookingForm, departureTime: e.target.value})}
                  className="w-full h-12 px-3 text-base border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Изберете час</option>
                  {generateTimeSlots().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Брой автомобили</Label>
                <select
                  className="w-full h-12 px-3 text-base border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  placeholder="Въведете брой пътници"
                  className="h-12 text-base"
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Цена (може да се редактира) *</Label>
              <div className="flex items-center gap-2">
                <Euro className="w-6 h-6 text-gray-500" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="Въведете цена"
                  className="h-12 text-base"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="carKeys"
                  checked={bookingForm.carKeys}
                  onCheckedChange={(checked) => setBookingForm({...bookingForm, carKeys: !!checked})}
                  className="w-5 h-5"
                />
                <label
                  htmlFor="carKeys"
                  className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  🔑 Клиентът оставя ключовете (позволява препаркиране)
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="needsInvoice"
                  checked={bookingForm.needsInvoice}
                  onCheckedChange={(checked) => setBookingForm({...bookingForm, needsInvoice: !!checked})}
                  className="w-5 h-5"
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
                className="text-base px-4 py-3"
              />
            </div>

            {/* Invoice Details - Show when needsInvoice is true */}
            {bookingForm.needsInvoice && (
              <div className="space-y-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Данни за фактура</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Име на фирма *</Label>
                    <Input
                      value={bookingForm.companyName}
                      onChange={(e) => setBookingForm({...bookingForm, companyName: e.target.value})}
                      placeholder="ООД / ЕООД / АД"
                      className="bg-white h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">ЕИК / Булстат *</Label>
                    <Input
                      value={bookingForm.taxNumber}
                      onChange={(e) => setBookingForm({...bookingForm, taxNumber: e.target.value})}
                      placeholder="123456789"
                      className="bg-white h-12 text-base"
                    />
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

          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowBookingForm(false)}
              className="h-12 px-6 text-base"
            >
              Отказ
            </Button>
            <Button 
              onClick={handleSaveBooking}
              className="h-12 px-6 text-base"
            >
              {editingBooking ? "Запази промени" : "Създай резервация"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}