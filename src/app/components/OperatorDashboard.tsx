import { useState, useEffect, useMemo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
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
  FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";
import type { User as UserType } from "./LoginScreen";

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

// Shift configuration
const SHIFT_CONFIG = {
  day: { start: 8, end: 20, label: "Дневна Смяна" },
  night: { start: 20, end: 8, label: "Нощна Смяна" }
};

// Parking capacity configuration
const BASE_CAPACITY = 200;
const OVERFLOW_CAPACITY = 20;
const TOTAL_CAPACITY = BASE_CAPACITY + OVERFLOW_CAPACITY;

interface Booking {
  id: string;
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
  parkingSpots?: number[]; // Array of assigned spot numbers
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
  status: string;
  createdAt: string;
  arrivedAt?: string;
  checkedOutAt?: string;
  paidAt?: string;
  finalPrice?: number;
}

type TabType = "new" | "confirmed" | "arriving" | "leaving" | "summary" | "revenue";
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
  const startDate = shiftRange.start.toLocaleDateString('bg-BG');
  const endDate = shiftRange.end.toLocaleDateString('bg-BG');
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

export function OperatorDashboard({ onLogout, currentUser, permissions }: OperatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("arriving");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [action, setAction] = useState<"arrived" | "no-show" | "checkout" | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftType>(getCurrentShift());
  
  // Filters for confirmed tab
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

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
    passengers: 1,
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

  const shiftRange = useMemo(() => getShiftTimeRange(selectedShift), [selectedShift]);

  // Fetch bookings
  const fetchBookings = async (showLoadingSpinner = false) => {
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
        setBookings(data.bookings);
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
    fetchBookings(true); // Show loading spinner only on initial load
    const interval = setInterval(() => fetchBookings(false), 30000); // Background refresh without spinner
    return () => clearInterval(interval);
  }, []);

  // Filter bookings by status and shift
  const newBookings = bookings.filter(b => b.status === "new");
  
  const confirmedBookings = useMemo(() => {
    let filtered = bookings.filter(b => b.status === "confirmed");
    
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
  }, [bookings, filterStartDate, filterEndDate]);
  
  const arrivingToday = useMemo(() => {
    return bookings
      .filter(b => 
        b.status === "confirmed" && 
        isInShift(b.arrivalDate, b.arrivalTime, shiftRange)
      )
      .sort((a, b) => {
        const aTime = new Date(`${a.arrivalDate}T${a.arrivalTime}`).getTime();
        const bTime = new Date(`${b.arrivalDate}T${b.arrivalTime}`).getTime();
        return aTime - bTime; // Nearest first
      });
  }, [bookings, shiftRange]);

  const leavingToday = useMemo(() => {
    return bookings
      .filter(b => 
        b.status === "arrived" && 
        isInShift(b.departureDate, b.departureTime, shiftRange)
      )
      .sort((a, b) => {
        const aTime = new Date(`${a.departureDate}T${a.departureTime}`).getTime();
        const bTime = new Date(`${b.departureDate}T${b.departureTime}`).getTime();
        return aTime - bTime; // Nearest first
      });
  }, [bookings, shiftRange]);

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
    
    // If payment is pending, ask for payment method
    if (booking.paymentMethod === "pay-on-leave" || booking.paymentStatus === "pending") {
      setPaymentDialog(true);
      setPaymentMethod("");
    } else {
      // Already paid, checkout directly
      confirmCheckout(booking);
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
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
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

  // Toggle shift
  const toggleShift = () => {
    setSelectedShift(prev => prev === "day" ? "night" : "day");
  };

  // Calculate price
  const calculatePrice = (arrivalDate: string, departureDate: string) => {
    if (!arrivalDate || !departureDate) return 0;
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    const days = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
    const calculatedPrice = days * 5;
    return Math.max(calculatedPrice, 10);
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
      passengers: 1,
      numberOfCars: 1,
      carKeys: false,
      needsInvoice: false,
      notes: "",
      // Invoice fields
      companyName: "",
      vatNumber: "",
      companyAddress: "",
      companyCity: "",
      companyCountry: "",
    });
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

    const totalPrice = calculatePrice(bookingForm.arrivalDate, bookingForm.departureDate);

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
    const arrivingCount = arrivingToday.length;
    const leavingCount = leavingToday.length;
    
    // Count all bookings that have arrived (status: arrived or checked-out) during this shift
    const arrivedCount = bookings.filter(b => 
      (b.status === "arrived" || b.status === "checked-out") &&
      isInShift(b.arrivalDate, b.arrivalTime, shiftRange)
    ).length;
    
    // Count all bookings that have checked out during this shift
    const leftCount = bookings.filter(b => 
      b.status === "checked-out" && 
      b.checkedOutAt &&
      isInShift(b.departureDate, b.departureTime, shiftRange)
    ).length;

    return {
      expected: {
        arriving: arrivingCount,
        leaving: leavingCount
      },
      actual: {
        arrived: arrivedCount,
        left: leftCount
      }
    };
  }, [arrivingToday, leavingToday, bookings, shiftRange]);

  // Calculate revenue statistics
  const revenueStats = useMemo(() => {
    // Expected revenue from arriving today
    const expectedRevenue = arrivingToday.reduce((sum, b) => sum + b.totalPrice, 0);
    
    // Actual collected (paid bookings that arrived or checked out in this shift)
    const paidBookings = bookings.filter(b => 
      (b.status === "arrived" || b.status === "checked-out") &&
      b.paymentStatus === "paid" &&
      b.arrivedAt &&
      isInShift(b.arrivalDate, b.arrivalTime, shiftRange)
    );
    
    const actualRevenue = paidBookings.reduce((sum, b) => sum + (b.finalPrice || b.totalPrice), 0);
    
    // By payment method
    const cashRevenue = paidBookings
      .filter(b => b.paymentMethod === "cash")
      .reduce((sum, b) => sum + (b.finalPrice || b.totalPrice), 0);
    
    const cardRevenue = paidBookings
      .filter(b => b.paymentMethod === "card")
      .reduce((sum, b) => sum + (b.finalPrice || b.totalPrice), 0);

    return {
      expected: expectedRevenue,
      actual: actualRevenue,
      cash: cashRevenue,
      card: cardRevenue
    };
  }, [bookings, arrivingToday, shiftRange]);

  // Render booking card
  const renderBookingCard = (booking: Booking, showActions: string) => {
    const capacity = calculateCapacityForDateRange(
      bookings,
      booking.arrivalDate,
      booking.departureDate,
      booking.id
    );
    
    return (
    <Card key={booking.id} className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-semibold">{booking.name}</span>
            {booking.carKeys && (
              <Badge variant="secondary" className="text-xs">
                🔑 С ключове
              </Badge>
            )}
            {booking.parkingSpots && booking.parkingSpots.length > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50">
                🅿️ {booking.parkingSpots.join(", ")}
              </Badge>
            )}
            {booking.needsInvoice && (
              <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-300">
                <FileText className="w-3 h-3 inline mr-1" />
                Фактура
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>📞 {booking.phone}</div>
            <div>🚗 {booking.licensePlate}</div>
            <div>📅 {booking.arrivalDate} {booking.arrivalTime}</div>
            <div>📅 {booking.departureDate} {booking.departureTime}</div>
            <div>🚙 {booking.numberOfCars || 1} кола/коли</div>
            <div>👥 {booking.passengers} пътник(а)</div>
            <div>💶 €{booking.totalPrice}</div>
          </div>

          {/* Capacity info */}
          <div className="mt-2">
            <div className="text-xs text-gray-500">
              Капацитет за {booking.arrivalDate}: {capacity.occupied}/{capacity.total} ({capacity.percentage}%)
            </div>
          </div>

          {booking.paymentMethod && (
            <div className="mt-2">
              <Badge variant={booking.paymentStatus === "paid" ? "default" : "secondary"}>
                {booking.paymentMethod === "cash" && "💰 В брой"}
                {booking.paymentMethod === "card" && "💳 С карта"}
                {booking.paymentMethod === "pay-on-leave" && "⏰ При напускане"}
                {booking.paymentStatus === "paid" && " ✓"}
              </Badge>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {showActions === "arriving" && (
          <div className="flex flex-col gap-2">
            <Button 
              size="sm" 
              onClick={() => handleArrived(booking)}
              className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Пристигна
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleNoShow(booking)}
              className="whitespace-nowrap"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Не се яви
            </Button>
          </div>
        )}

        {showActions === "leaving" && (
          <Button 
            size="sm" 
            onClick={() => handleCheckout(booking)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Напусна
          </Button>
        )}
      </div>
    </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🅿️ SkyParking Оператор</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-gray-600">
                  {currentUser.fullName} ({currentUser.role})
                </span>
                <button
                  onClick={toggleShift}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  title="Кликнете за смяна на смяна"
                >
                  {selectedShift === "day" ? <Sun className="w-4 h-4 text-orange-600" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                  <div className="text-left">
                    <div className="text-xs font-semibold text-gray-700">
                      {SHIFT_CONFIG[selectedShift].label}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatShiftDisplay(shiftRange)}
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Изход
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "new", label: "Нови", count: newBookings.length },
              { id: "confirmed", label: "Потвърдени", count: confirmedBookings.length },
              { id: "arriving", label: "Пристигащи днес", count: arrivingToday.length },
              { id: "leaving", label: "Напускащи днес", count: leavingToday.length },
              { id: "summary", label: "Обобщение" },
              { id: "revenue", label: "Приходи" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* New Reservations */}
            {activeTab === "new" && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold mb-4">Нови Резервации</h2>
                {newBookings.length === 0 ? (
                  <Card className="p-8 text-center text-gray-500">
                    Няма нови резервации
                  </Card>
                ) : (
                  newBookings.map(booking => (
                    <Card key={booking.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">{booking.name}</span>
                            {booking.parkingSpots && booking.parkingSpots.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-blue-50">
                                🅿️ {booking.parkingSpots.join(", ")}
                              </Badge>
                            )}
                            {booking.needsInvoice && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-300">
                                <FileText className="w-3 h-3 inline mr-1" />
                                Фактура
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>📞 {booking.phone}</div>
                            <div>🚗 {booking.licensePlate}</div>
                            <div>📅 {booking.arrivalDate} {booking.arrivalTime}</div>
                            <div>📅 {booking.departureDate} {booking.departureTime}</div>
                            <div>🚙 {booking.numberOfCars || 1} кола/коли</div>
                            <div>👥 {booking.passengers} пътник(а)</div>
                            <div>💶 €{booking.totalPrice}</div>
                          </div>
                          {(() => {
                            const capacity = calculateCapacityForDateRange(
                              bookings,
                              booking.arrivalDate,
                              booking.departureDate,
                              booking.id
                            );
                            return (
                              <div className="mt-2 text-xs text-gray-500">
                                Капацитет за {booking.arrivalDate}: {capacity.occupied}/{capacity.total} ({capacity.percentage}%)
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
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Потвърдени Резервации</h2>
                  
                  <div className="flex items-center gap-2">
                    {/* Add Manual Reservation Button */}
                    <Button 
                      onClick={handleAddManualReservation}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добави Резервация
                    </Button>
                    
                    {/* Date filters */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">От:</Label>
                      <Input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="w-40"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">До:</Label>
                      <Input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="w-40"
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
                      >
                        Изчисти
                      </Button>
                    )}
                  </div>
                </div>
                
                {confirmedBookings.length === 0 ? (
                  <Card className="p-8 text-center text-gray-500">
                    Няма потвърдени резервации
                  </Card>
                ) : (
                  confirmedBookings.map(booking => (
                    <Card key={booking.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">{booking.name}</span>
                            {booking.carKeys && (
                              <Badge variant="secondary" className="text-xs">
                                🔑 С ключове
                              </Badge>
                            )}
                            {booking.parkingSpots && booking.parkingSpots.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-blue-50">
                                🅿️ {booking.parkingSpots.join(", ")}
                              </Badge>
                            )}
                            {booking.needsInvoice && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-300">
                                <FileText className="w-3 h-3 inline mr-1" />
                                Фактура
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>📞 {booking.phone}</div>
                            <div>🚗 {booking.licensePlate}</div>
                            <div>📅 {booking.arrivalDate} - {booking.departureDate}</div>
                            <div>🚙 {booking.numberOfCars || 1} кола/коли</div>
                            <div>👥 {booking.passengers} пътник(а)</div>
                            <div>💶 €{booking.totalPrice}</div>
                          </div>
                          {(() => {
                            const capacity = calculateCapacityForDateRange(
                              bookings,
                              booking.arrivalDate,
                              booking.departureDate,
                              booking.id
                            );
                            return (
                              <div className="mt-2 text-xs text-gray-500">
                                Капацитет за {booking.arrivalDate}: {capacity.occupied}/{capacity.total} ({capacity.percentage}%)
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className="bg-green-600">Потвърдено</Badge>
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

            {/* Arriving Today */}
            {activeTab === "arriving" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Пристигащи днес</h2>
                  <Badge variant="secondary">{arrivingToday.length} резервации</Badge>
                </div>
                {arrivingToday.length === 0 ? (
                  <Card className="p-8 text-center text-gray-500">
                    Няма пристигащи за тази смяна
                  </Card>
                ) : (
                  arrivingToday.map(booking => renderBookingCard(booking, "arriving"))
                )}
              </div>
            )}

            {/* Leaving Today */}
            {activeTab === "leaving" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Напускащи днес</h2>
                  <Badge variant="secondary">{leavingToday.length} резервации</Badge>
                </div>
                {leavingToday.length === 0 ? (
                  <Card className="p-8 text-center text-gray-500">
                    Няма напускащи за тази смяна
                  </Card>
                ) : (
                  leavingToday.map(booking => renderBookingCard(booking, "leaving"))
                )}
              </div>
            )}

            {/* Summary */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Обобщение за днес</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Arrivals */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Пристигания</h3>
                        <p className="text-sm text-gray-600">{SHIFT_CONFIG[selectedShift].label}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Очаквани:</span>
                        <span className="text-2xl font-bold">{summaryStats.expected.arriving}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Пристигнали досега:</span>
                        <span className="text-2xl font-bold text-green-600">{summaryStats.actual.arrived}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Departures */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <TrendingDown className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Напускания</h3>
                        <p className="text-sm text-gray-600">{SHIFT_CONFIG[selectedShift].label}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Очаквани:</span>
                        <span className="text-2xl font-bold">{summaryStats.expected.leaving}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Напуснали досега:</span>
                        <span className="text-2xl font-bold text-blue-600">{summaryStats.actual.left}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Revenue */}
            {activeTab === "revenue" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Дневни приходи</h2>
                
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Euro className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Общо</h3>
                      <p className="text-sm text-gray-600">{SHIFT_CONFIG[selectedShift].label}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Очаквани приходи:</span>
                      <span className="text-2xl font-bold">€{revenueStats.expected.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-600">Действителни приходи:</span>
                      <span className="text-2xl font-bold text-green-600">€{revenueStats.actual.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Cash */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Banknote className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-lg">В брой</h3>
                    </div>
                    <p className="text-3xl font-bold">€{revenueStats.cash.toFixed(2)}</p>
                  </Card>

                  {/* Card */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-lg">С карта</h3>
                    </div>
                    <p className="text-3xl font-bold">€{revenueStats.card.toFixed(2)}</p>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "arrived" ? "Клиентът платил ли е?" : "Метод на плащане"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <p className="text-sm text-gray-600">
              {selectedBooking?.name} - €{selectedBooking?.totalPrice}
            </p>
            
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                  paymentMethod === "cash"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Banknote className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">В брой</div>
                  <div className="text-sm text-gray-600">Клиентът плати в брой</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("card")}
                className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                  paymentMethod === "card"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">С карта</div>
                  <div className="text-sm text-gray-600">Клиентът плати с карта</div>
                </div>
              </button>

              {action === "arrived" && (
                <button
                  onClick={() => setPaymentMethod("pay-on-leave")}
                  className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                    paymentMethod === "pay-on-leave"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Clock className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">При напускане</div>
                    <div className="text-sm text-gray-600">Ще плати при напускане</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>
              Отказ
            </Button>
            <Button 
              onClick={action === "arrived" ? confirmArrival : () => confirmCheckout()}
              disabled={!paymentMethod}
            >
              Потвърди
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Form Dialog (Add/Edit) */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBooking ? "Редактиране на резервация" : "Нова ръчна резервация"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Име *</Label>
                <Input
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                  placeholder="Пълно име"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Имейл</Label>
                <Input
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Телефон *</Label>
                <Input
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                  placeholder="+359 888 123 456"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Регистрационен номер *</Label>
                <Input
                  value={bookingForm.licensePlate}
                  onChange={(e) => setBookingForm({...bookingForm, licensePlate: e.target.value.toUpperCase()})}
                  placeholder="CA 1234 AB"
                />
              </div>
            </div>

            {/* Arrival Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата на пристигане *</Label>
                <Input
                  type="date"
                  value={bookingForm.arrivalDate}
                  onChange={(e) => setBookingForm({...bookingForm, arrivalDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Час на пристигане *</Label>
                <Input
                  type="time"
                  value={bookingForm.arrivalTime}
                  onChange={(e) => setBookingForm({...bookingForm, arrivalTime: e.target.value})}
                />
              </div>
            </div>

            {/* Departure Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата на напускане *</Label>
                <Input
                  type="date"
                  value={bookingForm.departureDate}
                  onChange={(e) => setBookingForm({...bookingForm, departureDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Час на напускане *</Label>
                <Input
                  type="time"
                  value={bookingForm.departureTime}
                  onChange={(e) => setBookingForm({...bookingForm, departureTime: e.target.value})}
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Брой автомобили</Label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                <Label>Брой пътници</Label>
                <Input
                  type="number"
                  min="1"
                  value={bookingForm.passengers}
                  onChange={(e) => setBookingForm({...bookingForm, passengers: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>Цена</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                <Euro className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">
                  €{calculatePrice(bookingForm.arrivalDate, bookingForm.departureDate)}
                </span>
                <span className="text-sm text-gray-500">(€5/ден, мин. €10)</span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="carKeys"
                  checked={bookingForm.carKeys}
                  onCheckedChange={(checked) => setBookingForm({...bookingForm, carKeys: !!checked})}
                />
                <label
                  htmlFor="carKeys"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  🔑 Клиентът оставя ключовете (позволява препаркиране)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsInvoice"
                  checked={bookingForm.needsInvoice}
                  onCheckedChange={(checked) => setBookingForm({...bookingForm, needsInvoice: !!checked})}
                />
                <label
                  htmlFor="needsInvoice"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <FileText className="w-4 h-4 inline mr-1" />
                  Искане за фактура
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Бележки</Label>
              <Textarea
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                placeholder="Допълнителна информация..."
                rows={3}
              />
            </div>

            {/* Invoice Details - Show when needsInvoice is true */}
            {bookingForm.needsInvoice && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Данни за фактура</h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Име на фирма *</Label>
                    <Input
                      value={bookingForm.companyName}
                      onChange={(e) => setBookingForm({...bookingForm, companyName: e.target.value})}
                      placeholder="ООД / ЕООД / АД"
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>МОЛ (Управител) *</Label>
                    <Input
                      value={bookingForm.companyOwner}
                      onChange={(e) => setBookingForm({...bookingForm, companyOwner: e.target.value})}
                      placeholder="Име на управител"
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ЕИК / Булстат *</Label>
                    <Input
                      value={bookingForm.taxNumber}
                      onChange={(e) => setBookingForm({...bookingForm, taxNumber: e.target.value})}
                      placeholder="123456789"
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isVAT"
                        checked={bookingForm.isVAT}
                        onChange={(e) => setBookingForm({...bookingForm, isVAT: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="isVAT" className="cursor-pointer">Регистрирано по ДДС</Label>
                    </div>
                  </div>

                  {bookingForm.isVAT && (
                    <div className="space-y-2">
                      <Label>ДДС номер</Label>
                      <Input
                        value={bookingForm.vatNumber}
                        onChange={(e) => setBookingForm({...bookingForm, vatNumber: e.target.value})}
                        placeholder="BG123456789"
                        className="bg-white"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Град *</Label>
                    <Input
                      value={bookingForm.city}
                      onChange={(e) => setBookingForm({...bookingForm, city: e.target.value})}
                      placeholder="София"
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Адрес *</Label>
                    <Input
                      value={bookingForm.address}
                      onChange={(e) => setBookingForm({...bookingForm, address: e.target.value})}
                      placeholder="Улица, номер"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {bookingForm.carKeys && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ Тази резервация ще използва допълнителен капацитет за препаркиране
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingForm(false)}>
              Отказ
            </Button>
            <Button onClick={handleSaveBooking}>
              {editingBooking ? "Запази промени" : "Създай резервация"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}