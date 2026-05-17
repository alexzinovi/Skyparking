import React, { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { formatDateDisplay, formatDateTimeDisplay } from "../utils/dateFormat";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  LogOut, 
  Calendar,
  Car,
  User,
  Euro,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Check,
  X,
  MapPin,
  LogIn,
  History,
  Key,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  Percent,
  Settings,
  Download,
  Menu,
  RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";
import type { User as UserType } from "./LoginScreen";
import { PricingManager } from "./PricingManager";
import { DiscountManager } from "./DiscountManager";
import { SettingsManager } from "./SettingsManager";
import { RevenueManagement } from "./RevenueManagement";
import { ReservationPerformance } from "./ReservationPerformance";
import { calculatePrice } from "@/app/utils/pricing";
import { ReservationCard, type ReservationData } from "./ReservationCard";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";
import { CheckoutModal } from "./CheckoutModal";

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

// Bulgarian translations
const bg = {
  // Header
  dashboardTitle: "SkyParking Админ Панел",
  logout: "Изход",
  
  // Actions
  search: "Търсене по име, имейл, рег. номер, телефон или код (SP-XXXXXXXX)...",
  addManualBooking: "Добави Ръчна Резервация",
  
  // Tabs
  newReservations: "Нови",
  confirmedReservations: "Предстоящи резервации",
  arrivedReservations: "Пристигнали",
  completedReservations: "Приключени",
  cancelledReservations: "Отказани",
  noShowReservations: "Не се явиха",
  archiveReservations: "Архив",
  allReservations: "Всички",
  usersTab: "Потребители",
  pricingTab: "Ценообразуване",
  discountsTab: "Промо кодове",
  settingsTab: "Настройки",
  calendarTab: "Календар",
  revenueTab: "Приходи",
  
  // Booking details
  customer: "Клиент",
  dates: "Дати",
  arrival: "Пристигане",
  departure: "Заминаване",
  vehicle: "Превозно средство",
  vehicles: "Превозни средства",
  passengers: "пътник(а)",
  payment: "Плащане",
  invoiceRequested: "Заявена фактура",
  invoiceDetails: "Детайли за фактура",
  company: "Фирма",
  owner: "Собственик",
  taxNumber: "ЕИК",
  vatNumber: "ДДС номер",
  city: "Град",
  address: "Адрес",
  created: "Създадена",
  updated: "Обновена",
  statusHistory: "История на статусите",
  editHistory: "История на промените",
  editedBy: "Редактирана от",
  changes: "Промени",
  cancelledBy: "Отказана от",
  noShowBy: "Маркирана като не се яви от",
  at: "на",
  
  // Status names
  statusNew: "Нова",
  statusConfirmed: "Потвърдена",
  statusArrived: "Пристигнал",
  statusCheckedOut: "Приключена",
  statusNoShow: "Не се яви",
  statusCancelled: "Отказана",
  
  // Actions
  accept: "Приеми",
  reject: "Откажи",
  markArrived: "Пристигна",
  markNoShow: "Не се яви",
  checkout: "Приключи",
  edit: "Редактирай",
  delete: "Изтрий",
  
  // Payment status
  paid: "Платена",
  unpaid: "Неплатена",
  manual: "Ръчна",
  failed: "Неуспешна",
  pending: "Чакаща",
  
  // Dialog
  editBooking: "Редактирай резервация",
  addBooking: "Добави ръчна резервация",
  fullName: "Имена",
  email: "Имейл",
  phone: "Телефон",
  licensePlate: "Рег. номер",
  arrivalDate: "Дата на пристигане",
  arrivalTime: "Час на пристигане",
  departureDate: "Дата на заминаване",
  departureTime: "Час на заминаване",
  passengersLabel: "Пътници",
  totalPrice: "Обща цена (€)",
  paymentStatus: "Статус на плащане",
  bookingStatus: "Статус на резервация",
  unpaidPayOnArrival: "Неплатена (Плащане на място)",
  needsInvoice: "Нужна фактура?",
  yes: "Да",
  no: "Не",
  companyName: "Име на фирма",
  companyOwner: "Собственик на фирма",
  vatRegistered: "Регистрирана по ДДС",
  cancel: "Отказ",
  update: "Обнови",
  create: "Създай",
  reason: "Причина",
  enterReason: "Въведете причина...",
  
  // Messages
  loadingBookings: "Зареждане на резервации...",
  noBookings: "Няма резервации все още",
  noResults: "Няма резервации съвпадащи с търсенето",
  deleteConfirm: "Сигурни ли с��е, че искате да изтриете тази резервация?",
  bookingDeleted: "Резервацията е изтрита успешно",
  bookingUpdated: "Резервацията е обновена",
  bookingCreated: "Резервацията е създадена",
  bookingAccepted: "Резервацията е приета",
  bookingCancelled: "Резервацията е отказана",
  bookingMarkedArrived: "Клиентът е маркиран като пристигнал",
  bookingMarkedNoShow: "Резервацията е маркирана като 'не се яви'",
  bookingCheckedOut: "Резервацията е приключена",
  failedToFetch: "Неуспешно зареждане на резервациите",
  failedToDelete: "Неуспешно изтриване на резервацията",
  failedToSave: "Неуспешно запазване на резервацията",
  acceptConfirm: "Сигурни ли сте, че искате да приемете тази резервация?",
  cancelConfirm: "Сигурни ли сте, че искате да откажете тази резервация?",
  arrivedConfirm: "Сигурни ли сте, че клиентът е пристигнал?",
  noShowConfirm: "Сигурни ли сте, че клиентът не се е явил?",
  checkoutConfirm: "Сигурни ли сте, че искате да приключите тази резервация?",
  operatorName: "Въведете вашето име:",
  
  // Export
  exportCSV: "Експорт CSV",
  exportJSON: "Експорт JSON",
  exportingData: "Експортиране...",
  dataExported: "Данните са експортирани успешно",
  
  // Audit trail
  actionAccept: "Приета",
  actionCancel: "Отказана",
  actionMarkArrived: "Маркирана като пристигнала",
  actionMarkNoShow: "Маркирана като 'не се яви'",
  actionCheckout: "Приключена",
  system: "система",
  
  // Car Keys
  carKeys: "Ключове от кола",
  carKeysYes: "ДА - ����ожем да преместим",
  carKeysNo: "НЕ - няма ключове",
  carKeysNotes: "Бележки за ключовет��",
  carKeysNotesPlaceholder: "Напр.: Ключове оставени в офиса, паркирана в зона B...",
  keyNumber: "Номер на ключ",
  keyNumberPlaceholder: "напр., Ключ #12",
  keyNumberHint: "Физически номер на ключа в кутията",
  includeInCapacity: "Включи в допълнителен капацитет (преливащи места)",
  includeInCapacityHint: "Ако не е отметнато, това запазване няма да заема място в капацитета (за коли пар��ирани извън паркинга)",
  
  // Capacity
  capacityWarning: "⚠️ Предупреждение за ка�����ацитет",
  capacityExceeded: "Капацитетът е надвишен",
  capacityDetails: "Детайли за капацитета",
  date: "Дата",
  regularCars: "Обикновени коли",
  withKeys: "С ключове",
  total: "Общо",
  available: "Налични",
  overCapacity: "Надвишен",
  forceAccept: "Приеми въпреки това (Админ)",
  capacityOk: "✓ Капацитетът е достатъчен",
  maxCapacity: "Макс. капацитет",
  keysOverflow: "Допълнителен капацитет (с ключове)",
  closeDialog: "Затвори",
  capacityOverrideWarning: "ВНИМАНИЕ: Приемате рез��рвация над лимита на капацитета!",
  
  // User Management
  addUser: "Добави потребител",
  editUser: "Редактирай потребител",
  deleteUser: "Изтрий потребител",
  username: "Потребителско име",
  password: "Парола",
  role: "Роля",
  active: "Активен",
  inactive: "Неактивен",
  lastLogin: "Последен вход",
  createdBy: "Създаден от",
  roleAdmin: "Администратор",
  roleManager: "Мениджър",
  roleOperator: "Оператор",
  deleteUserConfirm: "Сигурни ли сте, че искате да изтриете този потребител?",
  userDeleted: "Потребителят е изтрит успешно",
  userCreated: "Потребителят е създаден успешно",
  userUpdated: "Потребителят е обновен успешно",
  resetPassword: "Нова парола (оставете празно за запазване на старата)",
  
  // Calendar
  previousMonth: "Предишен месец",
  nextMonth: "Следващ месец",
  monday: "Пон",
  tuesday: "Вто",
  wednesday: "Сря",
  thursday: "Чет",
  friday: "Пет",
  saturday: "Съб",
  sunday: "Нед",
  capacityForDate: "Капацитет за",
  carsWithKeys: "Коли с ключове",
  carsWithoutKeys: "Коли без ключове",
  totalCars: "Общо коли",
  availableSpots: "Свободни места",
  leavingToday: "Напускащи днес",
  capacityStatus: "Статус на капацитета",
  lowOccupancy: "Нисък",
  mediumOccupancy: "Среден",
  highOccupancy: "Висок",
  fullOccupancy: "Пълен",
  
  // Revenue
  revenueManagement: "Управление на приходи",
  revenueOverview: "Обща информация за приходи",
  pastRevenue: "Реализирани приходи",
  futureRevenue: "Прогнозни приходи",
  totalRevenue: "Обща сума",
  cashRevenue: "В брой",
  cardRevenue: "С карта",
  projectedRevenue: "Прогноза",
  selectPeriod: "Изберете период",
  customRange: "Персонализиран период",
  today: "Днес",
  yesterday: "Вчера",
  thisWeek: "Тази седмица",
  lastWeek: "Миналата седмица",
  thisMonth: "Този месец",
  lastMonth: "Миналия месец",
  last3Months: "Последните 3 месеца",
  last6Months: "Последните 6 месеца",
  thisYear: "Тази година",
  next30Days: "Следващите 30 дни",
  next90Days: "Следващите 90 дни",
  next6Months: "Следващите 6 месеца",
  next12Months: "Следващата година",
  startDate: "Начална дата",
  endDate: "Крайна дата",
  applyFilter: "Приложи",
  resetFilter: "Нулирай",
  revenueByDay: "Приходи по дни",
  revenueByOperator: "Приходи по оператори",
  revenueByPayment: "Приходи по метод на плащане",
  day: "Ден",
  operator: "Оператор",
  paymentMethod: "Метод на плащане",
  reservations: "Резервации",
  amount: "Сума",
  basePrice: "Базова цена",
  lateFees: "Такси за закъснение",
  discounts: "Отстъпки",
  averagePrice: "Средна цена",
  breakdown: "Разбивка",
  detailedBreakdown: "Детайлна разбивка",
  noData: "Няма данни за избрания период",
  pendingPayment: "Очаква плащане",
  exportData: "Експортирай данни",
};

interface StatusChange {
  from: string;
  to: string;
  action: string;
  timestamp: string;
  operator: string;
  reason?: string;
}

interface Booking {
  id: string;
  bookingCode?: string; // User-friendly booking code (e.g., SP-12345678)
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  name: string;
  email: string;
  phone: string;
  numberOfCars?: number;
  licensePlate: string;
  licensePlate2?: string;
  licensePlate3?: string;
  licensePlate4?: string;
  licensePlate5?: string;
  passengers: number;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod?: string;
  paidAt?: string;
  finalPrice?: number;
  status: 'new' | 'confirmed' | 'arrived' | 'checked-out' | 'no-show' | 'cancelled' | 'declined';
  createdAt: string;
  updatedAt?: string;
  needsInvoice?: boolean;
  invoiceUrl?: string; // URL to the uploaded invoice PDF
  companyName?: string;
  companyOwner?: string;
  taxNumber?: string;
  isVAT?: boolean;
  vatNumber?: string;
  city?: string;
  address?: string;
  statusHistory?: StatusChange[];
  cancellationReason?: string;
  noShowReason?: string;
  cancelledBy?: string; // Operator who cancelled
  cancelledAt?: string; // Timestamp of cancellation
  noShowBy?: string; // Operator who marked as no-show
  noShowAt?: string; // Timestamp of no-show
  arrivedAt?: string;
  checkedOutAt?: string;
  carKeys?: boolean;
  carKeysNotes?: string;
  keyNumber?: string; // Physical key number in the key box
  includeInCapacity?: boolean; // Whether to include in extra capacity calculations
  capacityOverride?: boolean;
  declineReason?: string;
  declinedBy?: string; // Operator who declined
  declinedAt?: string; // Timestamp of decline
  discountCode?: string;
  basePrice?: number; // Price before discount
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
  createdBy?: string; // Employee name or "Клиент (онлайн)" for who created the booking
  acceptedBy?: string; // Employee name for who confirmed/accepted the booking
  vehicleSize?: 'standard' | 'oversized';
}

interface CapacityDay {
  date: string;
  nonKeysCount: number;
  keysCount: number;
  totalCount: number;
  maxSpots: number;
  keysOverflowSpots: number;
  maxTotal: number;
  isOverNonKeysLimit: boolean;
  isOverTotalLimit: boolean;
  wouldFit: boolean;
}

type TabType = "new" | "confirmed" | "arrived" | "completed" | "cancelled" | "no-show" | "archive" | "all" | "users" | "pricing" | "discounts" | "settings" | "calendar" | "revenue" | "reservations";

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: UserType;
  permissions: string[];
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

export function AdminDashboard({ onLogout, currentUser, permissions }: AdminDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departureDateFilter, setDepartureDateFilter] = useState(""); // Filter by departure date
  const [isLoading, setIsLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<Booking>>({});
  const [activeTab, setActiveTab] = useState<TabType>("new");
  const operatorName = currentUser.fullName; // Use logged-in user's name

  // Capacity warning modal state
  const [capacityWarning, setCapacityWarning] = useState<{
    show: boolean;
    booking: Booking | null;
    dailyBreakdown: CapacityDay[];
  }>({ show: false, booking: null, dailyBreakdown: [] });

  // Live capacity data
  const [capacityData, setCapacityData] = useState<CapacityDay[]>([]);
  const [capacityLoading, setCapacityLoading] = useState(false);

  // User management state
  const [users, setUsers] = useState<UserType[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const cleanupAttempted = useRef(false); // Track if cleanup has been attempted
  
  // Checkout modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutBooking, setCheckoutBooking] = useState<Booking | null>(null);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<UserType & { password?: string }>>({});

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(bg.failedToFetch);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
      toast.error(bg.failedToFetch);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch live capacity for next 14 days
  const fetchCapacity = async () => {
    try {
      setCapacityLoading(true);
      
      // Calculate capacity for the next 14 days based on confirmed/arrived bookings
      const today = new Date();
      const dailyData: CapacityDay[] = [];
      
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Find all confirmed or arrived bookings that overlap with this date
        const overlappingBookings = bookings.filter(b => {
          if (b.status !== 'confirmed' && b.status !== 'arrived') return false;
          
          const bookingArrival = new Date(b.arrivalDate);
          const bookingDeparture = new Date(b.departureDate);
          const currentDate = new Date(dateStr);
          
          // Include departure date - a booking occupies space from arrival through departure (inclusive)
          // This matches the calendar logic where cars scheduled to leave still count as occupying space
          return bookingArrival <= currentDate && currentDate <= bookingDeparture;
        });
        
        // Count non-keys and keys bookings
        let nonKeysCount = 0;
        let keysCount = 0;
        
        overlappingBookings.forEach(b => {
          const carCount = Number(b.numberOfCars || 1);
          if (b.carKeys) {
            keysCount += carCount;
          } else {
            nonKeysCount += carCount;
          }
        });
        
        const totalCount = nonKeysCount + keysCount;
        
        dailyData.push({
          date: dateStr,
          nonKeysCount,
          keysCount,
          totalCount,
          maxSpots: 180,
          keysOverflowSpots: 20,
          maxTotal: 200,
          isOverNonKeysLimit: nonKeysCount > 180,
          isOverTotalLimit: totalCount > 200,
          wouldFit: true
        });
      }
      
      setCapacityData(dailyData);
    } catch (error) {
      console.error("Fetch capacity error:", error);
    } finally {
      setCapacityLoading(false);
    }
  };

  // Fetch users (admin only)
  const fetchUsers = async () => {
    if (!permissions.includes("manage_users")) return;
    
    try {
      setUsersLoading(true);
      const token = localStorage.getItem("skyparking-token");
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/users`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        
        // Note: Automatic cleanup disabled to prevent reload loops
        // Invalid users (if any) will be displayed but won't affect functionality
      } else {
        toast.error("Грешка при зареждане на потребителите");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error("Грешка при зареждане на потребителите");
    } finally {
      setUsersLoading(false);
    }
  };

  // Delete all bookings (for testing)
  const handleDeleteAllBookings = async () => {
    const confirmed = confirm(
      "⚠️ ВНИМАНИЕ: Това ще изтрие ВСИЧКИ резервации!\n\nТова действие е необратимо!\n\nСигурни ли сте, че искате да продължите?"
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = prompt(
      "За да потвърдите, въведете 'DELETE ALL' (с главни букви):"
    );
    
    if (doubleConfirm !== "DELETE ALL") {
      toast.error("Изтриването е отказано - неправилно потвърждение");
      return;
    }

    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/delete-all`,
        {
          method: "DELETE",
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
        toast.success(`Успешно изтрити ${data.deletedCount} резервации`);
        fetchBookings();
      } else {
        toast.error(data.message || "Грешка при изтриване");
      }
    } catch (error) {
      console.error("Delete all bookings error:", error);
      toast.error("Грешка при изтриване на резервациите");
    }
  };

  useEffect(() => {
    fetchBookings();
    if (permissions.includes("manage_users")) {
      fetchUsers();
    }
  }, []);

  // Recalculate capacity whenever bookings change
  useEffect(() => {
    if (bookings.length >= 0) {
      fetchCapacity();
    }
  }, [bookings]);

  // Auto-calculate price when dates change in manual booking form
  useEffect(() => {
    async function updatePrice() {
      if (formData.arrivalDate && formData.arrivalTime && formData.departureDate && formData.departureTime) {
        const numberOfCars = formData.numberOfCars || 1;
        const price = await calculatePrice(
          formData.arrivalDate,
          formData.arrivalTime,
          formData.departureDate,
          formData.departureTime,
          numberOfCars,
          formData.vehicleSize
        );
        if (price !== null && price !== formData.totalPrice) {
          setFormData(prev => ({ ...prev, totalPrice: price }));
        }
      }
    }
    updatePrice();
  }, [formData.arrivalDate, formData.arrivalTime, formData.departureDate, formData.departureTime, formData.numberOfCars, formData.vehicleSize]);

  // Filter bookings by tab and search
  useEffect(() => {
    let filtered = bookings;

    // Filter by tab
    switch (activeTab) {
      case "new":
        filtered = bookings.filter(b => b.status === "new");
        break;
      case "confirmed":
        filtered = bookings.filter(b => b.status === "confirmed");
        // Sort by arrival date ascending (closest to current date first)
        filtered = filtered.sort((a, b) => {
          const aTime = new Date(`${a.arrivalDate}T${a.arrivalTime}`).getTime();
          const bTime = new Date(`${b.arrivalDate}T${b.arrivalTime}`).getTime();
          return aTime - bTime;
        });
        break;
      case "arrived":
        filtered = bookings.filter(b => b.status === "arrived");
        break;
      case "completed":
        filtered = bookings.filter(b => b.status === "checked-out");
        break;
      case "cancelled":
        filtered = bookings.filter(b => b.status === "cancelled" || b.status === "declined");
        break;
      case "no-show":
        filtered = bookings.filter(b => b.status === "no-show");
        break;
      case "archive":
        filtered = bookings.filter(b => b.status === "no-show" || b.status === "cancelled" || b.status === "declined");
        break;
      case "all":
        filtered = bookings;
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone?.includes(searchTerm) ||
        booking.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by departure date
    if (departureDateFilter) {
      filtered = filtered.filter(booking => booking.departureDate === departureDateFilter);
    }

    setFilteredBookings(filtered);
  }, [searchTerm, bookings, activeTab, departureDateFilter]);

  // ============= USER MANAGEMENT FUNCTIONS =============

  // Create or update user
  const saveUser = async () => {
    const token = localStorage.getItem("skyparking-token");
    
    try {
      const url = editingUser
        ? `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/users/${editingUser.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/users`;

      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
          "X-Session-Token": token || "",
        },
        body: JSON.stringify(userFormData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingUser ? bg.userUpdated : bg.userCreated);
        setEditingUser(null);
        setIsAddingUser(false);
        setUserFormData({});
        fetchUsers();
      } else {
        toast.error(data.message || "Грешка при запазване на потребител");
      }
    } catch (error) {
      console.error("Save user error:", error);
      toast.error("Грешка при запазване на потребител");
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    // Validate userId before attempting delete
    if (!userId || userId === 'undefined' || userId.trim() === '') {
      console.error("❌ Attempted to delete user with invalid ID:", userId);
      toast.error("Невалиден потребител - не може да се изтрие");
      return;
    }
    
    if (!confirm(bg.deleteUserConfirm)) return;

    const token = localStorage.getItem("skyparking-token");

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(bg.userDeleted);
        fetchUsers();
      } else {
        toast.error(data.message || "Грешка при изтриване на потребител");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error("Грешка при изтриване на потребител");
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500 hover:bg-red-600"><Shield className="h-3 w-3 mr-1" />{bg.roleAdmin}</Badge>;
      case "manager":
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Users className="h-3 w-3 mr-1" />{bg.roleManager}</Badge>;
      case "operator":
        return <Badge className="bg-gray-500 hover:bg-gray-600"><User className="h-3 w-3 mr-1" />{bg.roleOperator}</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Clean up invalid users
  const cleanupInvalidUsers = async () => {
    try {
      // First, run diagnostic to see what we're dealing with
      const token = localStorage.getItem("skyparking-token");
      const diagnosticResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/users/diagnostic`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
        }
      );

      const diagnosticData = await diagnosticResponse.json();
      if (diagnosticData.success) {
        console.log("=== USER DIAGNOSTIC ===");
        console.log(`Total users: ${diagnosticData.totalUsers}`);
        console.log(`Invalid users found: ${diagnosticData.invalidUsers}`);
        console.log("All users:", diagnosticData.users);
        console.log("Users marked for deletion:", diagnosticData.users.filter((u: any) => u.shouldDelete));
        
        if (diagnosticData.invalidUsers === 0) {
          toast.info("Няма невалидни потребители за изтриване");
          return;
        }
        
        if (!confirm(`Намерени са ${diagnosticData.invalidUsers} невалидни потребители. Виж конзолата за детайли. Изтрий ли ги?`)) {
          return;
        }
      }
    } catch (error) {
      console.error("Diagnostic error:", error);
    }

    // Proceed with cleanup
    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/users/cleanup-invalid`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
        }
      );

      const data = await response.json();
      console.log("=== CLEANUP RESPONSE ===", data);
      
      if (data.success) {
        console.log(`✅ Deleted: ${data.deleted}, Failed: ${data.failed}`);
        if (data.deletedUsers) {
          console.log("Deleted users:", data.deletedUsers);
        }
        if (data.failedUsers) {
          console.log("Failed users:", data.failedUsers);
        }
        toast.success(data.message || `Изтрити са ${data.deleted} невалидни потребители`);
        fetchUsers();
      } else {
        toast.error(data.message || "Грешка при изчистване на невалидни потребители");
      }
    } catch (error) {
      console.error("Cleanup error:", error);
      toast.error("Грешка при изчистване на невалидни потребители");
    }
  };

  // EMERGENCY: Force delete ALL null users immediately
  const emergencyCleanup = async () => {
    if (!confirm("🚨 EMERGENCY CLEANUP 🚨\n\nТова ще изтрие ВСИЧКИ невалидни потребители директно от базата данни.\n\nПродължи?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("skyparking-token");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/users/emergency-cleanup`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
        }
      );

      const data = await response.json();
      console.log("=== EMERGENCY CLEANUP RESPONSE ===", data);
      
      if (data.success) {
        console.log(`✅ Deleted: ${data.deleted} invalid users`);
        console.log(`✅ Deleted: ${data.orphanedMappings} orphaned mappings`);
        console.log(`✅ Valid users remaining: ${data.validUsersRemaining}`);
        toast.success(`🎉 ${data.message}`);
        fetchUsers();
      } else {
        toast.error(data.message || "Emergency cleanup failed");
      }
    } catch (error) {
      console.error("Emergency cleanup error:", error);
      toast.error("Emergency cleanup failed");
    }
  };

  // ============= END USER MANAGEMENT FUNCTIONS =============

  // Delete booking
  const deleteBooking = async (id: string) => {
    if (!confirm(bg.deleteConfirm)) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(bg.bookingDeleted);
        fetchBookings();
      } else {
        toast.error(bg.failedToDelete);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(bg.failedToDelete);
    }
  };

  // Save booking (create or update)
  const saveBooking = async () => {
    try {
      const url = editingBooking
        ? `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${editingBooking.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings`;

      const method = editingBooking ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          ...formData,
          editor: editingBooking ? operatorName : undefined, // Track who edited
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingBooking ? bg.bookingUpdated : bg.bookingCreated);
        setEditingBooking(null);
        setIsAddingNew(false);
        setFormData({});
        fetchBookings();
      } else {
        toast.error(data.message || bg.failedToSave);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(bg.failedToSave);
    }
  };

  // Accept booking (new → confirmed)
  const acceptBooking = async (booking: Booking, forceOverride: boolean = false) => {
    if (!forceOverride && !confirm(bg.acceptConfirm)) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${booking.id}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ operator: operatorName, force: forceOverride }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success(bg.bookingAccepted);
        setCapacityWarning({ show: false, booking: null, dailyBreakdown: [] });
        fetchBookings();
      } else if (data.requiresOverride && data.capacityPreview) {
        // Show capacity warning modal
        setCapacityWarning({
          show: true,
          booking: booking,
          dailyBreakdown: data.capacityPreview.dailyBreakdown || []
        });
      } else {
        toast.error(data.message || bg.failedToSave);
      }
    } catch (error) {
      console.error("Accept error:", error);
      toast.error(bg.failedToSave);
    }
  };

  // Cancel booking
  const cancelBooking = async (booking: Booking) => {
    const reason = prompt(bg.enterReason);
    if (!reason) return;

    try {
      console.log(`[CANCEL] Cancelling booking ${booking.id} with operator: ${operatorName}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${booking.id}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ operator: operatorName, reason }),
        }
      );

      const data = await response.json();
      console.log(`[CANCEL] Response:`, data);
      
      if (data.success) {
        console.log(`[CANCEL] Success! Booking status: ${data.booking?.status}, cancelledBy: ${data.booking?.cancelledBy}`);
        toast.success(bg.bookingCancelled);
        fetchBookings();
      } else {
        console.error(`[CANCEL] Failed:`, data.message);
        toast.error(data.message || bg.failedToSave);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error(bg.failedToSave);
    }
  };

  // Mark arrived (confirmed → arrived)
  const markArrived = async (booking: Booking) => {
    if (!confirm(bg.arrivedConfirm)) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${booking.id}/mark-arrived`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ operator: operatorName }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(bg.bookingMarkedArrived);
        fetchBookings();
      } else {
        toast.error(data.message || bg.failedToSave);
      }
    } catch (error) {
      console.error("Mark arrived error:", error);
      toast.error(bg.failedToSave);
    }
  };

  // Mark no-show (confirmed → no-show)
  const markNoShow = async (booking: Booking) => {
    const reason = prompt(bg.enterReason);
    if (!reason) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${booking.id}/mark-no-show`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ operator: operatorName, reason }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(bg.bookingMarkedNoShow);
        fetchBookings();
      } else {
        toast.error(data.message || bg.failedToSave);
      }
    } catch (error) {
      console.error("Mark no-show error:", error);
      toast.error(bg.failedToSave);
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
      
      // Fallback: use calculatePrice if available
      const pricePerCar = await calculatePrice("2024-01-01", "00:00", "2024-01-01", "23:59", 1);
      return (pricePerCar || 0) * numberOfCars;
    } catch (error) {
      console.error("Error calculating late fee:", error);
      return 0;
    }
  };

  // Checkout (arrived → checked-out) - Open modal
  const checkout = (booking: Booking) => {
    setCheckoutBooking(booking);
    setCheckoutModalOpen(true);
  };

  // Handle checkout confirmation from modal
  const handleCheckoutConfirm = async (data: {
    lateFee: number;
    adjustmentReason?: string;
    adjustmentNote?: string;
  }) => {
    if (!checkoutBooking) return;
    
    setCheckoutModalOpen(false);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${checkoutBooking.id}/checkout`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            operator: operatorName,
            confirmedLateFee: checkoutBooking.isLate ? data.lateFee : undefined,
            adjustmentReason: data.adjustmentReason,
            adjustmentNote: data.adjustmentNote,
          }),
        }
      );

      const responseData = await response.json();
      if (responseData.success) {
        toast.success(bg.bookingCheckedOut);
        setCheckoutBooking(null);
        fetchBookings();
      } else {
        toast.error(responseData.message || bg.failedToSave);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(bg.failedToSave);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" />{bg.statusNew}</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />{bg.statusConfirmed}</Badge>;
      case "arrived":
        return <Badge className="bg-blue-500 hover:bg-blue-600"><MapPin className="h-3 w-3 mr-1" />{bg.statusArrived}</Badge>;
      case "checked-out":
        return <Badge className="bg-gray-500 hover:bg-gray-600"><CheckCircle className="h-3 w-3 mr-1" />{bg.statusCheckedOut}</Badge>;
      case "no-show":
        return <Badge className="bg-gray-700 hover:bg-gray-800"><XCircle className="h-3 w-3 mr-1" />{bg.statusNoShow}</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" />{bg.statusCancelled}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{bg.paid}</Badge>;
      case "unpaid":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />{bg.unpaid}</Badge>;
      case "pending":
        return <Badge className="bg-orange-500"><Clock className="h-3 w-3 mr-1" />{bg.pending}</Badge>;
      case "failed":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />{bg.failed}</Badge>;
      case "manual":
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />{bg.manual}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format status history for display
  const formatStatusHistory = (history: StatusChange[] | undefined) => {
    if (!history || history.length === 0) return null;

    return (
      <div className="mt-6 border-t pt-6">
        <div className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-4">
          <History className="h-5 w-5" />
          {bg.statusHistory}
        </div>
        <div className="space-y-3">
          {history.map((change, index) => (
            <div key={index} className="text-base text-gray-600 bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatDateTimeDisplay(change.timestamp)}</span>
                <span>-</span>
                <span>{getActionName(change.action)}</span>
                <span className="text-gray-500">({change.operator || bg.system})</span>
              </div>
              {change.reason && (
                <div className="text-sm text-gray-600 mt-2">
                  {bg.reason}: {change.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render action buttons for a booking
  const renderBookingActions = (booking: Booking) => {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Context-aware action buttons */}
        {booking.status === "new" && (
          <>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-14 w-full"
              onClick={() => acceptBooking(booking)}
            >
              <CheckCircle className="h-6 w-6 mr-2" />
              ✔ {bg.accept}
            </Button>
            <Button
              variant="destructive"
              className="font-bold text-lg h-14 w-full"
              onClick={() => cancelBooking(booking)}
            >
              <XCircle className="h-6 w-6 mr-2" />
              ✖ {bg.reject}
            </Button>
          </>
        )}
        
        {booking.status === "confirmed" && (
          <>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-14 w-full"
              onClick={() => markArrived(booking)}
            >
              <LogIn className="h-6 w-6 mr-2" />
              {bg.markArrived}
            </Button>
            <Button
              variant="outline"
              className="font-bold text-lg h-14 w-full border-2"
              onClick={() => markNoShow(booking)}
            >
              <XCircle className="h-6 w-6 mr-2" />
              {bg.markNoShow}
            </Button>
            <Button
              variant="destructive"
              className="font-bold text-lg h-14 w-full"
              onClick={() => cancelBooking(booking)}
            >
              <X className="h-6 w-6 mr-2" />
              {bg.reject}
            </Button>
          </>
        )}
        
        {booking.status === "arrived" && (
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-14 w-full"
            onClick={() => checkout(booking)}
          >
            <CheckCircle className="h-6 w-6 mr-2" />
            {bg.checkout}
          </Button>
        )}
        
        {/* Edit and Delete based on permissions */}
        <div className="flex gap-3">
          {permissions.includes("edit_bookings") && (
            <Button
              variant="outline"
              className="font-bold text-base h-12 flex-1 border-2"
              onClick={() => {
                setEditingBooking(booking);
                setFormData(booking);
              }}
            >
              <Edit className="h-5 w-5 mr-2" />
              Редактирай
            </Button>
          )}
          {permissions.includes("delete_bookings") && (
            <Button
              variant="destructive"
              className="font-bold text-base h-12 flex-1"
              onClick={() => deleteBooking(booking.id)}
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Изтрий
            </Button>
          )}
        </div>
      </div>
    );
  };

  const getActionName = (action: string) => {
    switch (action) {
      case "accept": return bg.actionAccept;
      case "cancel": return bg.actionCancel;
      case "mark-arrived": return bg.actionMarkArrived;
      case "mark-no-show": return bg.actionMarkNoShow;
      case "checkout": return bg.actionCheckout;
      default: return action;
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };
  
  const calculateCapacityForDate = (dateStr: string) => {
    // NEW LOGIC: Calculate projected occupancy independently for each day
    // This is a FORECASTING tool based on confirmed reservations
    
    // Get the date we're calculating for
    const targetDate = new Date(dateStr);
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
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
      const bookingDeparture = new Date(b.departureDate);
      
      // Booking occupies space from arrival through departure (inclusive)
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
    const percentage = totalCount > 0 ? (totalCount / 200) * 100 : 0;
    
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
      isToday, // Flag to show this is today's date
    };
  };

  // Get tab counts
  const getTabCounts = () => {
    return {
      new: bookings.filter(b => b.status === "new").length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      arrived: bookings.filter(b => b.status === "arrived").length,
      completed: bookings.filter(b => b.status === "checked-out").length,
      cancelled: bookings.filter(b => b.status === "cancelled" || b.status === "declined").length,
      noShow: bookings.filter(b => b.status === "no-show").length,
      archive: bookings.filter(b => b.status === "no-show" || b.status === "cancelled" || b.status === "declined").length,
      all: bookings.length,
    };
  };

  const counts = getTabCounts();

  // Export functions
  const exportToCSV = () => {
    try {
      // CSV header
      const headers = [
        "Booking Code",
        "Status",
        "Name",
        "Email",
        "Phone",
        "Arrival Date",
        "Arrival Time",
        "Departure Date",
        "Departure Time",
        "License Plate(s)",
        "Passengers",
        "Number of Cars",
        "Car Keys",
        "Key Number",
        "Include in Capacity",
        "Total Price (EUR)",
        "Payment Status",
        "Payment Method",
        "Invoice Requested",
        "Company Name",
        "Tax Number",
        "Created At",
        "Discount Code",
        "Cancelled By",
        "Cancelled At",
        "Declined By",
        "Declined At",
        "No-Show By",
        "No-Show At",
      ];

      // CSV rows
      const rows = bookings.map(booking => [
        booking.bookingCode || booking.id,
        booking.status,
        booking.name,
        booking.email,
        booking.phone,
        booking.arrivalDate,
        booking.arrivalTime,
        booking.departureDate,
        booking.departureTime,
        [booking.licensePlate, booking.licensePlate2, booking.licensePlate3, booking.licensePlate4, booking.licensePlate5].filter(Boolean).join("; "),
        booking.passengers || "0",
        booking.numberOfCars || "1",
        booking.carKeys ? "Yes" : "No",
        booking.keyNumber || "",
        booking.includeInCapacity !== false ? "Yes" : "No",
        booking.totalPrice,
        booking.paymentStatus,
        booking.paymentMethod || "",
        booking.needsInvoice ? "Yes" : "No",
        booking.companyName || "",
        booking.taxNumber || "",
        booking.createdAt,
        booking.discountCode || "",
        booking.cancelledBy || "",
        booking.cancelledAt || "",
        booking.declinedBy || "",
        booking.declinedAt || "",
        booking.noShowBy || "",
        booking.noShowAt || "",
      ]);

      // Create CSV content with semicolon delimiter (for European Excel)
      const csvContent = [
        headers.join(";"),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
      ].join("\n");

      // Add UTF-8 BOM for proper Cyrillic character display in Excel
      const BOM = "\uFEFF";
      const csvWithBOM = BOM + csvContent;

      // Download CSV
      const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `skyparking-reservations-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(bg.dataExported);
    } catch (error) {
      console.error("Export CSV error:", error);
      toast.error("Failed to export CSV");
    }
  };

  const exportToJSON = () => {
    try {
      // Create JSON with all booking data
      const exportData = {
        exportDate: new Date().toISOString(),
        totalBookings: bookings.length,
        bookings: bookings.map(booking => ({
          ...booking,
          // Ensure all fields are included
        }))
      };

      // Download JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `skyparking-reservations-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(bg.dataExported);
    } catch (error) {
      console.error("Export JSON error:", error);
      toast.error("Failed to export JSON");
    }
  };

  // State for menu drawer
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
                <div className="flex items-center gap-2 mt-2">
                  {getRoleBadge(currentUser.role)}
                </div>
              </div>

              {/* Logout Button */}
              <Button 
                onClick={onLogout} 
                variant="outline" 
                className="w-full justify-start text-base h-12 border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-2" />
                {bg.logout}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Compact Header with Menu and Refresh */}
      <div className="bg-white border-b">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            {/* Left: Hamburger Menu */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Меню"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Center: Title */}
            <h1 className="text-lg font-bold text-gray-900">Admin</h1>

            {/* Right: Refresh Button */}
            <button
              onClick={async () => {
                setIsManualRefreshing(true);
                await fetchBookings();
                setIsManualRefreshing(false);
                toast.success("🔄 Опреснено");
              }}
              disabled={isManualRefreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center disabled:opacity-50"
              title="Опресни"
            >
              <RefreshCw className={`w-6 h-6 text-gray-700 ${isManualRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="🔍 Търсене..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-12 text-base border-2 border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sticky Tabs */}
      <div className="sticky top-[73px] z-30 bg-white border-b shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-0 min-w-max px-2">
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                activeTab === "new"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.newReservations} ({counts.new})
            </button>
            <button
              onClick={() => setActiveTab("confirmed")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                activeTab === "confirmed"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.confirmedReservations} ({counts.confirmed})
            </button>
            <button
              onClick={() => setActiveTab("arrived")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                activeTab === "arrived"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.arrivedReservations} ({counts.arrived})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                activeTab === "completed"
                  ? "border-gray-500 text-gray-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.completedReservations} ({counts.completed})
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                activeTab === "cancelled"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.cancelledReservations} ({counts.cancelled})
            </button>
            <button
              onClick={() => setActiveTab("no-show")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                activeTab === "no-show"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.noShowReservations} ({counts.noShow})
            </button>
            <button
              onClick={() => setActiveTab("archive")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                activeTab === "archive"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.archiveReservations} ({counts.archive})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.allReservations} ({counts.all})
            </button>
            {permissions.includes("manage_users") && (
              <>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                    activeTab === "users"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Users className="inline h-5 w-5 sm:h-6 sm:w-6 mr-1" />
                  {bg.usersTab} ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab("pricing")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                    activeTab === "pricing"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Euro className="inline h-5 w-5 sm:h-6 sm:w-6 mr-1" />
                  {bg.pricingTab}
                </button>
                <button
                  onClick={() => setActiveTab("discounts")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                    activeTab === "discounts"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Percent className="inline h-5 w-5 sm:h-6 sm:w-6 mr-1" />
                  {bg.discountsTab}
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                    activeTab === "settings"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Settings className="inline h-5 w-5 sm:h-6 sm:w-6 mr-1" />
                  {bg.settingsTab}
                </button>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                    activeTab === "calendar"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Calendar className="inline h-5 w-5 sm:h-6 sm:w-6 mr-1" />
                  {bg.calendarTab}
                </button>
                <button
                  onClick={() => setActiveTab("revenue")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                    activeTab === "revenue"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Euro className="inline h-5 w-5 sm:h-6 sm:w-6 mr-1" />
                  {bg.revenueTab}
                </button>
                <button
                  onClick={() => setActiveTab("reservations")}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg whitespace-nowrap border-b-2 transition-colors min-h-[48px] flex items-center ${
                    activeTab === "reservations"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FileText className="inline h-5 w-5 sm:h-6 sm:w-6 mr-1" />
                  Резервации
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 py-4">
        {/* Content - Bookings, Users, Pricing, Discounts, or Settings */}
        {activeTab === "settings" ? (
          /* ========== SETTINGS TAB ========== */
          <SettingsManager />
        ) : activeTab === "discounts" ? (
          /* ========== DISCOUNTS TAB ========== */
          <DiscountManager />
        ) : activeTab === "pricing" ? (
          /* ========== PRICING TAB ========== */
          <PricingManager sessionToken={localStorage.getItem("skyparking-token") || ""} />
        ) : activeTab === "calendar" ? (
          /* ========== CALENDAR TAB ========== */
          <>
            {/* Live Capacity Dashboard - Next 14 Days */}
            <Card className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Капацитет на паркинга - Следващи 14 дни
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchCapacity}
                  disabled={capacityLoading}
                >
                  {capacityLoading ? "Зареждане..." : "Обнови"}
                </Button>
              </div>

              {capacityLoading ? (
                <div className="text-center py-4 text-gray-500">Зареждане на капацитет...</div>
              ) : capacityData.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Няма данни за кап��цитет</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-base sm:text-lg">
                    <thead className="bg-white/50">
                      <tr>
                        <th className="text-left p-3 sm:p-4 font-semibold border-b-2 text-base sm:text-lg">{bg.date}</th>
                        <th className="text-center p-3 sm:p-4 font-semibold border-b-2 text-base sm:text-lg">{bg.regularCars}</th>
                        <th className="text-center p-3 sm:p-4 font-semibold border-b-2 text-base sm:text-lg">{bg.withKeys}</th>
                        <th className="text-center p-3 sm:p-4 font-semibold border-b-2 text-base sm:text-lg">{bg.total}</th>
                        <th className="text-center p-3 sm:p-4 font-semibold border-b-2 text-base sm:text-lg">Макс.</th>
                        <th className="text-left p-3 sm:p-4 font-semibold border-b-2 text-base sm:text-lg">Заетост</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capacityData.map((day, idx) => {
                        const regularPercent = (day.nonKeysCount / day.maxSpots) * 100;
                        const totalPercent = (day.totalCount / day.maxTotal) * 100;
                        const isHigh = totalPercent >= 80;
                        const isFull = totalPercent >= 100;
                        const isOverRegular = day.isOverNonKeysLimit;

                        return (
                          <tr key={idx} className={`border-b ${isFull ? 'bg-red-100' : isHigh ? 'bg-yellow-50' : 'bg-white'}`}>
                            <td className="p-3 sm:p-4 font-medium text-base sm:text-lg">
                              {formatDateDisplay(day.date)}
                            </td>
                            <td className="text-center p-3 sm:p-4 text-base sm:text-lg">
                              <span className={isOverRegular ? 'text-red-600 font-bold' : ''}>
                                {day.nonKeysCount}/{day.maxSpots}
                                {isOverRegular && ' ⚠'}
                              </span>
                            </td>
                            <td className="text-center p-3 sm:p-4 text-purple-700 font-medium text-base sm:text-lg">
                              {day.keysCount}
                            </td>
                            <td className="text-center p-3 sm:p-4 font-bold text-base sm:text-lg">
                              {day.totalCount}/{day.maxTotal}
                            </td>
                            <td className="text-center p-3 sm:p-4 text-gray-600 text-base sm:text-lg">
                              {day.maxTotal}
                            </td>
                            <td className="p-3 sm:p-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                  <div 
                                    className={`h-full transition-all ${
                                      isFull ? 'bg-red-500' : 
                                      isHigh ? 'bg-yellow-500' : 
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(totalPercent, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-semibold w-12 text-right ${
                                  isFull ? 'text-red-600' : 
                                  isHigh ? 'text-yellow-700' : 
                                  'text-green-600'
                                }`}>
                                  {totalPercent.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 pt-4 border-t flex items-center gap-6 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>&lt; 80% - Свободно</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>80-99% - Почти пълно</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>≥100% - Пълно</span>
                </div>
                <div className="ml-auto text-purple-700 font-medium">
                  <Key className="h-3 w-3 inline mr-1" />
                  Лилаво = Коли с ключове (могат да се преместават)
                </div>
              </div>
            </Card>

            {/* Monthly Calendar View */}
            <Card className="p-6">
            {/* Calendar Title and Helper Text */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#073590] mb-2">Очаквана заетост</h2>
              <p className="text-sm text-gray-600 italic">Базирано на потвърдени резервации</p>
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setCurrentMonth(newMonth);
                }}
              >
                <ChevronLeft className="h-5 w-5" />
                {bg.previousMonth}
              </Button>
              
              <h3 className="text-xl font-bold">
                {currentMonth.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}
              </h3>
              
              <Button
                variant="outline"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCurrentMonth(newMonth);
                }}
              >
                {bg.nextMonth}
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                <div className="text-center font-semibold p-2">{bg.monday}</div>
                <div className="text-center font-semibold p-2">{bg.tuesday}</div>
                <div className="text-center font-semibold p-2">{bg.wednesday}</div>
                <div className="text-center font-semibold p-2">{bg.thursday}</div>
                <div className="text-center font-semibold p-2">{bg.friday}</div>
                <div className="text-center font-semibold p-2">{bg.saturday}</div>
                <div className="text-center font-semibold p-2">{bg.sunday}</div>
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                  const days = [];
                  
                  // Adjust for Monday start (0 = Monday in our case, but JS Date has 0 = Sunday)
                  const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
                  
                  // Empty cells before month starts
                  for (let i = 0; i < adjustedStart; i++) {
                    days.push(<div key={`empty-${i}`} className="p-2"></div>);
                  }
                  
                  // Days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const capacity = calculateCapacityForDate(dateStr);
                    const isSelected = selectedDate === dateStr;
                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    const isToday = dateStr === todayStr;
                    
                    let bgColor = 'bg-white';
                    if (capacity.isFull) bgColor = 'bg-red-100 border-red-300';
                    else if (capacity.isHigh) bgColor = 'bg-yellow-100 border-yellow-300';
                    else if (capacity.isMedium) bgColor = 'bg-blue-100 border-blue-300';
                    else if (capacity.totalCount > 0) bgColor = 'bg-green-100 border-green-300';
                    
                    days.push(
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-3 border-2 rounded-lg hover:shadow-md transition-all ${bgColor} ${
                          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                        } ${isToday ? 'ring-4 ring-[#f1c933] font-black border-[#073590] border-4' : ''}`}
                      >
                        <div className={`${isToday ? 'text-xl' : 'text-lg'} font-medium mb-1`}>{day}</div>
                        <div className={`${isToday ? 'text-base font-bold' : 'text-sm'} font-semibold`}>
                          {capacity.totalCount > 0 ? capacity.totalCount : '-'}
                        </div>
                        {(capacity.arrivingCount > 0 || capacity.leavingCount > 0) && (
                          <div className={`${isToday ? 'text-xs' : 'text-[10px]'} text-gray-600 mt-1`}>
                            +{capacity.arrivingCount} / -{capacity.leavingCount}
                          </div>
                        )}
                      </button>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white border-2 rounded"></div>
                <span>Свободно</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
                <span>&lt;50%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded"></div>
                <span>50-79%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                <span>80-99%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
                <span>≥100%</span>
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (() => {
              const capacity = calculateCapacityForDate(selectedDate);
              const availableSpots = 200 - capacity.totalCount;
              
              // Calculate REAL parking status (only for today)
              const realParked = bookings.filter(b => b.status === 'arrived').reduce((sum, b) => {
                const numCars = Number(b.numberOfCars);
                return sum + ((numCars > 0) ? numCars : 1);
              }, 0);
              const realAvailable = 200 - realParked;
              
              return (
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    Детайли за {formatDateDisplay(selectedDate)}
                  </h3>
                  
                  {/* Show BOTH real and projected for today */}
                  {capacity.isToday && (
                    <>
                      {/* Section 1: Real-time Status (Live) */}
                      <div className="mb-6 p-4 bg-white rounded-lg border-2 border-[#073590]">
                        <h4 className="text-lg font-bold text-[#073590] mb-3 flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          📍 Реално състояние (Live)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="text-sm text-gray-600 font-semibold mb-1">В ПАРКИНГА</div>
                            <div className="text-4xl font-black text-[#073590]">{realParked}</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded">
                            <div className="text-sm text-gray-600 font-semibold mb-1">СВОБОДНИ</div>
                            <div className="text-4xl font-black text-green-600">{realAvailable}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Section 2: Forecast for Today */}
                      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-300">
                        <h4 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          📊 Прогноза за днес
                        </h4>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="text-center p-3 bg-white rounded shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Очаквани коли</div>
                            <div className="text-3xl font-bold text-purple-700">{capacity.totalCount}</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">⬇️ Пристигания</div>
                            <div className="text-3xl font-bold text-green-600">{capacity.arrivingCount}</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded shadow">
                            <div className="text-xs text-gray-600 font-semibold mb-1">⬆️ Напускания</div>
                            <div className="text-3xl font-bold text-orange-600">{capacity.leavingCount}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* For future/past dates - only show projected */}
                  {!capacity.isToday && (
                    <>
                      <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
                        <p className="text-sm text-purple-800 font-semibold">
                          📊 Прогнозна заетост (базирано на потвърдени резервации)
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg shadow border-2 border-blue-200">
                          <div className="text-gray-600 text-sm font-semibold mb-1">{bg.carsWithoutKeys}</div>
                          <div className="text-3xl font-bold text-blue-600">{capacity.nonKeysCount}/180</div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow border-2 border-purple-200">
                          <div className="text-gray-600 text-sm font-semibold mb-1">{bg.carsWithKeys}</div>
                          <div className="text-3xl font-bold text-purple-600">{capacity.keysCount}/20</div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow border-2 border-gray-300">
                          <div className="text-gray-600 text-sm font-semibold mb-1">{bg.totalCars}</div>
                          <div className="text-3xl font-bold text-gray-800">{capacity.totalCount}/200</div>
                        </div>
                        
                        <div className={`bg-white p-4 rounded-lg shadow border-2 ${availableSpots <= 0 ? 'border-red-400' : availableSpots < 40 ? 'border-yellow-400' : 'border-green-400'}`}>
                          <div className="text-gray-600 text-sm font-semibold mb-1">{bg.availableSpots}</div>
                          <div className={`text-3xl font-bold ${availableSpots <= 0 ? 'text-red-600' : availableSpots < 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {availableSpots}
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrivals and Departures */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow border-2 border-green-200">
                          <div className="text-gray-600 text-sm font-semibold mb-1">⬇️ Пристигания</div>
                          <div className="text-3xl font-bold text-green-600">{capacity.arrivingCount}</div>
                          <div className="text-xs text-gray-500">коли</div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow border-2 border-orange-200">
                          <div className="text-gray-600 text-sm font-semibold mb-1">⬆️ Напускания</div>
                          <div className="text-3xl font-bold text-orange-600">{capacity.leavingCount}</div>
                          <div className="text-xs text-gray-500">коли</div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Status Indicator */}
                  <div className="mt-6 p-4 rounded-lg text-center text-lg font-semibold" style={{
                    backgroundColor: capacity.isFull ? '#fee' : capacity.isHigh ? '#ffc' : capacity.isMedium ? '#def' : '#efe'
                  }}>
                    {bg.capacityStatus}: {
                      capacity.isFull ? bg.fullOccupancy :
                      capacity.isHigh ? bg.highOccupancy :
                      capacity.isMedium ? bg.mediumOccupancy :
                      bg.lowOccupancy
                    }
                  </div>
                </Card>
              );
            })()}
          </Card>
          </>
        ) : activeTab === "users" ? (
          /* ========== USERS TAB ========== */
          <>
            {/* Users Actions Bar */}
            <div className="mb-6 flex justify-between items-center gap-3 flex-wrap">
              <div className="flex gap-3">
                <Button 
                  onClick={cleanupInvalidUsers} 
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Диагностика и изчистване
                </Button>
                <Button 
                  onClick={emergencyCleanup} 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  🚨 EMERGENCY CLEANUP
                </Button>
              </div>
              <Button onClick={() => { setIsAddingUser(true); setUserFormData({ role: "operator", isActive: true }); }}>
                <Plus className="mr-2 h-4 w-4" />
                {bg.addUser}
              </Button>
            </div>

            {/* Users List */}
            {usersLoading ? (
              <div className="text-center py-12">Зареждане на потребители...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Няма потребители</div>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <Card key={user.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{user.fullName}</h3>
                          {getRoleBadge(user.role)}
                          {!user.isActive && <Badge variant="outline" className="bg-gray-100">Неактивен</Badge>}
                          {user.id === currentUser.id && <Badge variant="outline" className="bg-green-100 text-green-700">Вие</Badge>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div><strong>{bg.username}:</strong> {user.username}</div>
                          <div><strong>{bg.email}:</strong> {user.email}</div>
                          {user.lastLogin && <div><strong>{bg.lastLogin}:</strong> {formatDateTimeDisplay(user.lastLogin)}</div>}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {bg.created}: {formatDateTimeDisplay(user.createdAt)}
                          {user.createdBy && ` • ${bg.createdBy}: ${user.createdBy}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {user.id && user.username && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setUserFormData({ ...user, password: undefined });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {user.id && user.id !== currentUser.id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            disabled={!user.username || user.username.trim() === ''}
                            title={!user.username ? "Невалиден потребител - изтрийте чрез 'Диагно��тика и изчистване'" : ""}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : activeTab === "revenue" ? (
          /* ========== REVENUE TAB ========== */
          <RevenueManagement bookings={bookings} users={users} />
        ) : activeTab === "reservations" ? (
          /* ========== RESERVATIONS TAB ========== */
          <ReservationPerformance bookings={bookings} users={users} />
        ) : (
          /* ========== BOOKINGS TABS ========== */
          <>
            {/* Actions Bar */}
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 sm:h-6 sm:w-6" />
                  <Input
                    placeholder={bg.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 sm:pl-12 text-base sm:text-lg py-5 sm:py-6"
                  />
                </div>
                
                {/* Departure Date Filter - Only show in "All" tab */}
                {activeTab === "all" && (
                  <div className="flex items-center gap-2 sm:min-w-[300px]">
                    <Label className="text-sm font-semibold whitespace-nowrap">Дата на заминаване:</Label>
                    <Input
                      type="date"
                      value={departureDateFilter}
                      onChange={(e) => setDepartureDateFilter(e.target.value)}
                      className="text-base py-5 sm:py-6"
                    />
                    {departureDateFilter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDepartureDateFilter("")}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {/* Export Buttons - Admin Only */}
                {permissions.includes("manage_users") && (
                  <>
                    <Button 
                      onClick={exportToCSV}
                      variant="outline"
                      className="text-base sm:text-lg py-5 sm:py-6 px-4 sm:px-6 border-2 border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <Download className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                      {bg.exportCSV}
                    </Button>
                    <Button 
                      onClick={exportToJSON}
                      variant="outline"
                      className="text-base sm:text-lg py-5 sm:py-6 px-4 sm:px-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Download className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                      {bg.exportJSON}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Bookings List */}
        {isLoading ? (
          <div className="text-center py-16 text-lg text-gray-600">{bg.loadingBookings}</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 text-lg text-gray-500">
            {searchTerm ? bg.noResults : bg.noBookings}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <ReservationCard
                key={booking.id}
                reservation={booking as ReservationData}
                showActions={true}
                actions={renderBookingActions(booking)}
                showTimestamps={true}
                showEditHistory={true}
              />
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* Edit/Add Booking Dialog */}
      <Dialog open={editingBooking !== null || isAddingNew} onOpenChange={(open) => {
        if (!open) {
          setEditingBooking(null);
          setIsAddingNew(false);
          setFormData({});
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto pb-24">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingBooking ? bg.editBooking : bg.addBooking}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* === ESSENTIAL FIELDS (PRIORITY) === */}
            
            {/* Name - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">{bg.fullName} *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Пълно име"
                className="h-14 text-base"
                autoComplete="name"
                enterKeyHint="next"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('phone')?.focus();
                  }
                }}
              />
            </div>

            {/* Phone - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-semibold">{bg.phone} *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+359 886 616 991"
                className="h-14 text-base"
                autoComplete="tel"
                enterKeyHint="next"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('licensePlate')?.focus();
                  }
                }}
              />
            </div>

            {/* License Plate - Full Width with Auto-Format */}
            <div className="space-y-2">
              <Label htmlFor="licensePlate" className="text-base font-semibold">{bg.licensePlate} *</Label>
              <Input
                id="licensePlate"
                value={formData.licensePlate || ""}
                onChange={(e) => setFormData({ ...formData, licensePlate: formatLicensePlate(e.target.value) })}
                placeholder="CA1234AB"
                className="h-14 text-base uppercase"
                autoComplete="off"
                enterKeyHint="next"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('arrivalDateTime')?.focus();
                  }
                }}
              />
            </div>

            {/* Arrival - Separate Date and Time */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Дата на пристигане *</Label>
              <DatePicker
                id="arrivalDate"
                value={formData.arrivalDate ? new Date(formData.arrivalDate + 'T00:00:00') : undefined}
                onChange={(date) => {
                  // Format date as YYYY-MM-DD in local timezone
                  const dateStr = date 
                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    : '';
                  setFormData({ ...formData, arrivalDate: dateStr });
                }}
                minDate={new Date()}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Час на пристигане *</Label>
              <TimePicker
                id="arrivalTime"
                value={formData.arrivalTime || ''}
                onChange={(time) => setFormData({ ...formData, arrivalTime: time })}
              />
            </div>

            {/* Departure - Separate Date and Time */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Дата на напускане *</Label>
              <DatePicker
                id="departureDate"
                value={formData.departureDate ? new Date(formData.departureDate + 'T00:00:00') : undefined}
                onChange={(date) => {
                  // Format date as YYYY-MM-DD in local timezone
                  const dateStr = date 
                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    : '';
                  setFormData({ ...formData, departureDate: dateStr });
                }}
                minDate={formData.arrivalDate ? new Date(formData.arrivalDate + 'T00:00:00') : new Date()}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Час на напускане *</Label>
              <TimePicker
                id="departureTime"
                value={formData.departureTime || ''}
                onChange={(time) => setFormData({ ...formData, departureTime: time })}
              />
            </div>

            {/* Price - Auto-filled, Editable */}
            <div className="space-y-2">
              <Label htmlFor="totalPrice" className="text-base font-semibold">
                Цена *
                <span className="ml-2 text-xs text-green-600">(Auto-calculated)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-gray-500">€</span>
                <Input
                  id="totalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalPrice || 0}
                  onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) })}
                  className="pl-12 bg-green-50 h-14 text-base"
                  enterKeyHint="done"
                />
              </div>
            </div>

            {/* === SECONDARY FIELDS === */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Допълнителна информация</h3>

            {/* Email */}
            <div className="space-y-2 mb-5">
              <Label htmlFor="email" className="text-base font-semibold">{bg.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="h-14 text-base"
                autoComplete="email"
              />
            </div>

            {/* Number of Cars and Passengers */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="space-y-2">
                <Label htmlFor="numberOfCars" className="text-base font-semibold">{bg.numberOfCars || "Брой автомобили"}</Label>
                <Input
                  id="numberOfCars"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.numberOfCars || 1}
                  onChange={(e) => setFormData({ ...formData, numberOfCars: parseInt(e.target.value) })}
                  className="h-14 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passengers" className="text-base font-semibold">{bg.passengersLabel}</Label>
                <Input
                  id="passengers"
                  type="number"
                  min="0"
                  value={formData.passengers || ""}
                  onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) || 0 })}
                  placeholder="2"
                  className="h-14 text-base"
                />
              </div>
            </div>

            {/* Vehicle Size */}
            <div className="mb-5 space-y-3">
              <Label className="text-base font-semibold">🚐 Размер на превозното средство</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, vehicleSize: 'standard' })}
                  className={`flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left ${
                    (!formData.vehicleSize || formData.vehicleSize === 'standard')
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="font-semibold text-sm text-gray-900">Стандартен</span>
                  <span className="text-xs text-gray-500 mt-0.5">Обикновен автомобил, SUV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, vehicleSize: 'oversized' })}
                  className={`flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left ${
                    formData.vehicleSize === 'oversized'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="font-semibold text-sm text-gray-900">Извънгабаритен *</span>
                  <span className="text-xs text-gray-500 mt-0.5">Кемпер, микробус, голям ван</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">* Извънгабаритни са МПС с дължина над 5.3 м. Добавка +50%.</p>
            </div>

            {/* Payment Status and Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="space-y-2">
                <Label htmlFor="paymentStatus" className="text-base font-semibold">{bg.paymentStatus}</Label>
                <select
                  id="paymentStatus"
                  className="w-full h-14 px-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.paymentStatus || "unpaid"}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                >
                  <option value="unpaid">{bg.unpaidPayOnArrival}</option>
                  <option value="paid">{bg.paid}</option>
                  <option value="pending">{bg.pending}</option>
                  <option value="manual">{bg.manual}</option>
                </select>
              </div>
              
              {/* Payment Method - Admin Only */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-base font-semibold">
                  {bg.paymentMethod}
                  <span className="ml-2 text-xs text-orange-600 font-normal">(само админ)</span>
                </Label>
                <select
                  id="paymentMethod"
                  className="w-full h-14 px-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.paymentMethod || ""}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value || undefined })}
                >
                  <option value="">Не е избрано</option>
                  <option value="cash">💰 В брой</option>
                  <option value="card">💳 С карта</option>
                  <option value="pay-on-leave">⏰ При напускане</option>
                </select>
              </div>
            </div>

            {/* Booking Status */}
            <div className="space-y-2 mb-5">
              <Label htmlFor="status" className="text-base font-semibold">{bg.bookingStatus}</Label>
              <select
                id="status"
                className="w-full h-14 px-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status || "new"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="new">{bg.statusNew}</option>
                <option value="confirmed">{bg.statusConfirmed}</option>
                <option value="arrived">{bg.statusArrived}</option>
                <option value="checked-out">{bg.statusCheckedOut}</option>
                <option value="no-show">{bg.statusNoShow}</option>
                <option value="cancelled">{bg.statusCancelled}</option>
              </select>
            </div>

            {/* Car Keys Section */}
            <div className="border-t pt-6 mt-2">
              <div className="mb-4">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Key className="h-5 w-5" />
                  {bg.carKeys}
                </Label>
                <div className="flex gap-6 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.carKeys === true}
                      onChange={() => setFormData({ ...formData, carKeys: true })}
                      className="w-5 h-5"
                    />
                    <span className="text-base">{bg.carKeysYes}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.carKeys === false || formData.carKeys === undefined}
                      onChange={() => setFormData({ ...formData, carKeys: false })}
                      className="w-5 h-5"
                    />
                    <span className="text-base">{bg.carKeysNo}</span>
                  </label>
                </div>
              </div>

              {formData.carKeys && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyNumber" className="text-base font-semibold">
                      {bg.keyNumber || "Key Number"}
                    </Label>
                    <Input
                      id="keyNumber"
                      type="text"
                      value={formData.keyNumber || ""}
                      onChange={(e) => setFormData({ ...formData, keyNumber: e.target.value })}
                      placeholder={bg.keyNumberPlaceholder || "e.g., Key #12"}
                      className="h-14 text-base"
                      maxLength={20}
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {bg.keyNumberHint || "Физически номер на ключа в кутията"}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="includeInCapacity"
                        checked={formData.includeInCapacity !== false}
                        onChange={(e) => setFormData({ ...formData, includeInCapacity: e.target.checked })}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <Label htmlFor="includeInCapacity" className="text-base font-medium cursor-pointer">
                          {bg.includeInCapacity || "Include in extra capacity (overflow spots)"}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {bg.includeInCapacityHint || "Ако не е отметнато, това запазване няма да заема място в капацитета (за коли паркирани извън паркинга)"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="carKeysNotes" className="text-base font-semibold">{bg.carKeysNotes}</Label>
                    <textarea
                      id="carKeysNotes"
                      value={formData.carKeysNotes || ""}
                      onChange={(e) => setFormData({ ...formData, carKeysNotes: e.target.value })}
                      placeholder={bg.carKeysNotesPlaceholder}
                      className="w-full h-24 px-4 py-3 text-base border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={500}
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {(formData.carKeysNotes || "").length}/500
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Section */}
            <div className="border-t pt-6 mt-2">
              <div className="mb-4">
                <Label className="text-base font-semibold">{bg.needsInvoice}</Label>
                <div className="flex gap-6 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.needsInvoice === true}
                      onChange={() => setFormData({ ...formData, needsInvoice: true })}
                      className="w-5 h-5"
                    />
                    <span className="text-base">{bg.yes}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.needsInvoice === false || formData.needsInvoice === undefined}
                      onChange={() => setFormData({ ...formData, needsInvoice: false })}
                      className="w-5 h-5"
                    />
                    <span className="text-base">{bg.no}</span>
                  </label>
                </div>
              </div>

              {formData.needsInvoice && (
                <div className="space-y-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {bg.invoiceDetails}
                  </h4>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName" className="text-base font-semibold">{bg.companyName}</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName || ""}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="bg-white h-14 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyOwner" className="text-base font-semibold">{bg.companyOwner}</Label>
                      <Input
                        id="companyOwner"
                        value={formData.companyOwner || ""}
                        onChange={(e) => setFormData({ ...formData, companyOwner: e.target.value })}
                        className="bg-white h-14 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="taxNumber" className="text-base font-semibold">{bg.taxNumber}</Label>
                      <Input
                        id="taxNumber"
                        value={formData.taxNumber || ""}
                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                        className="bg-white h-14 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-base font-semibold">{bg.city}</Label>
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-white h-14 text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-base font-semibold">{bg.address}</Label>
                    <Input
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-white h-14 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isVAT || false}
                        onChange={(e) => setFormData({ ...formData, isVAT: e.target.checked })}
                        className="w-6 h-6"
                      />
                      <span className="font-medium text-base">{bg.vatRegistered}</span>
                    </label>

                    {formData.isVAT && (
                      <div>
                        <Label htmlFor="vatNumber" className="text-base font-semibold">{bg.vatNumber}</Label>
                        <Input
                          id="vatNumber"
                          value={formData.vatNumber || ""}
                          onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                          placeholder="e.g., BG123456789"
                          className="bg-white h-14 text-base"
                        />
                      </div>
                    )}
                  </div>

                  {/* Invoice URL field - REMOVED per user request */}
                  {/* Invoices should be managed through external system */}
                </div>
              )}
            </div>
            </div>
            {/* End secondary fields container */}
          </div>

          <DialogFooter className="border-t border-gray-200 pt-6 mt-6 gap-3 flex-col sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingBooking(null);
                setIsAddingNew(false);
                setFormData({});
              }}
              className="h-14 px-8 text-base font-semibold w-full sm:w-auto order-2 sm:order-1"
            >
              {bg.cancel}
            </Button>
            <Button 
              onClick={saveBooking}
              className="h-14 px-8 text-base font-semibold bg-[#073590] hover:bg-[#052558] w-full sm:w-auto order-1 sm:order-2"
            >
              {editingBooking ? bg.update : bg.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Add User Dialog */}
      <Dialog open={editingUser !== null || isAddingUser} onOpenChange={(open) => {
        if (!open) {
          setEditingUser(null);
          setIsAddingUser(false);
          setUserFormData({});
        }
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? bg.editUser : bg.addUser}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">{bg.fullName}</Label>
                <Input
                  id="fullName"
                  value={userFormData.fullName || ""}
                  onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="username">{bg.username}</Label>
                <Input
                  id="username"
                  value={userFormData.username || ""}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  disabled={!!editingUser} // Can't change username
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">{bg.email}</Label>
              <Input
                id="email"
                type="email"
                value={userFormData.email || ""}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="password">{editingUser ? bg.resetPassword : bg.password}</Label>
              <Input
                id="password"
                type="password"
                value={userFormData.password || ""}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                placeholder={editingUser ? "Оставете празно за запазване на старата парола" : ""}
              />
            </div>

            <div>
              <Label htmlFor="role">{bg.role}</Label>
              <select
                id="role"
                className="w-full h-10 px-3 border rounded-md"
                value={userFormData.role || "operator"}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
              >
                <option value="operator">{bg.roleOperator}</option>
                <option value="manager">{bg.roleManager}</option>
                <option value="admin">{bg.roleAdmin}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={userFormData.isActive !== false}
                onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">{bg.active}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingUser(null);
              setIsAddingUser(false);
              setUserFormData({});
            }}>
              {bg.cancel}
            </Button>
            <Button onClick={saveUser}>
              {editingUser ? bg.update : bg.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Capacity Warning Modal */}
      <Dialog open={capacityWarning.show} onOpenChange={(open) => !open && setCapacityWarning({ show: false, booking: null, dailyBreakdown: [] })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              {bg.capacityWarning}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="font-semibold text-orange-900">{bg.capacityExceeded}</p>
              <p className="text-sm text-orange-700 mt-1">
                Следните дни надвишават капацитета на паркинга. Моля, прегледайте подробностите по-долу.
              </p>
            </div>
            
            {capacityWarning.dailyBreakdown.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3 font-semibold">{bg.date}</th>
                        <th className="text-center p-3 font-semibold">{bg.regularCars}</th>
                        <th className="text-center p-3 font-semibold">{bg.withKeys}</th>
                        <th className="text-center p-3 font-semibold">{bg.total}</th>
                        <th className="text-center p-3 font-semibold">{bg.maxCapacity}</th>
                        <th className="text-center p-3 font-semibold">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capacityWarning.dailyBreakdown.map((day, idx) => (
                        <tr key={idx} className={day.wouldFit ? "bg-white" : "bg-red-50"}>
                          <td className="p-3 font-medium">{formatDateDisplay(day.date)}</td>
                          <td className="text-center p-3">
                            {day.nonKeysCount}
                            {day.isOverNonKeysLimit && <span className="text-red-600 ml-1">⚠</span>}
                          </td>
                          <td className="text-center p-3 text-purple-700">{day.keysCount}</td>
                          <td className="text-center p-3 font-bold">{day.totalCount}</td>
                          <td className="text-center p-3 text-gray-600">
                            {day.maxSpots} + {day.keysOverflowSpots} = {day.maxTotal}
                          </td>
                          <td className="text-center p-3">
                            {day.wouldFit ? (
                              <span className="text-green-600 font-semibold">✓ OK</span>
                            ) : (
                              <span className="text-red-600 font-semibold">⚠ {bg.overCapacity}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-700">Легенда:</p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>• <strong>{bg.regularCars}:</strong> Коли без ключове (макс. {capacityWarning.dailyBreakdown[0]?.maxSpots || 200})</li>
                    <li>• <strong className="text-purple-700">{bg.withKeys}:</strong> Коли с ключове (до +{capacityWarning.dailyBreakdown[0]?.keysOverflowSpots || 20} допълнително)</li>
                    <li>• <strong>{bg.total}:</strong> Общ брой коли</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="font-semibold text-yellow-900 mb-2">{bg.capacityOverrideWarning}</p>
                  <p className="text-xs text-yellow-700">
                    Ако приемете тази резервация, ще надвишите лимита на капацитета. 
                    Уверете се, че имате ��лан за управление на излишните коли.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCapacityWarning({ show: false, booking: null, dailyBreakdown: [] })}
            >
              <X className="h-4 w-4 mr-2" />
              {bg.closeDialog}
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => {
                if (capacityWarning.booking) {
                  acceptBooking(capacityWarning.booking, true);
                }
              }}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {bg.forceAccept}
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
      {!["users", "settings", "pricing", "discounts", "calendar", "revenue"].includes(activeTab) && (
        <button
          onClick={() => { setIsAddingNew(true); setFormData({ paymentStatus: "manual", status: "confirmed", passengers: 2, numberOfCars: 1 }); }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#073590] hover:bg-[#052558] active:bg-[#041a3d] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 px-4 sm:px-6 py-3 sm:py-4 min-h-[56px] touch-manipulation"
          aria-label="Добави резервация"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-base whitespace-nowrap">Добави резервация</span>
        </button>
      )}
    </div>
  );
}