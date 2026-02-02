import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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
  AlertTriangle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";

const projectId = "dbybybmjjeeocoecaewv";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieWJ5Ym1qamVlb2NvZWNhZXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODgxMzAsImV4cCI6MjA4MjA2NDEzMH0.fMZ3Yi5gZpE6kBBz-y1x0FKZcGczxSJZ9jL-Zeau340";

// Bulgarian translations
const bg = {
  // Header
  dashboardTitle: "SkyParking Админ Панел",
  logout: "Изход",
  
  // Actions
  search: "Търсене по име, имейл, рег. номер или телефон...",
  addManualBooking: "Добави Ръчна Резервация",
  
  // Tabs
  newReservations: "Нови",
  confirmedReservations: "Потвърдени",
  arrivedReservations: "Пристигнали",
  completedReservations: "Приключени",
  archiveReservations: "Архив",
  allReservations: "Всички",
  
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
  deleteConfirm: "Сигурни ли сте, че искате да изтриете тази резервация?",
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
  
  // Audit trail
  actionAccept: "Приета",
  actionCancel: "Отказана",
  actionMarkArrived: "Маркирана като пристигнала",
  actionMarkNoShow: "Маркирана като 'не се яви'",
  actionCheckout: "Приключена",
  system: "система",
  
  // Car Keys
  carKeys: "Ключове от кола",
  carKeysYes: "ДА - можем да преместим",
  carKeysNo: "НЕ - няма ключове",
  carKeysNotes: "Бележки за ключовете",
  carKeysNotesPlaceholder: "Напр.: Ключове оставени в офиса, паркирана в зона B...",
  
  // Capacity
  capacityWarning: "⚠️ Предупреждение за капацитет",
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
  capacityOverrideWarning: "ВНИМАНИЕ: Приемате резервация над лимита на капацитета!",
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
  status: 'new' | 'confirmed' | 'arrived' | 'checked-out' | 'no-show' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  needsInvoice?: boolean;
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
  arrivedAt?: string;
  checkedOutAt?: string;
  carKeys?: boolean;
  carKeysNotes?: string;
  capacityOverride?: boolean;
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

type TabType = "new" | "confirmed" | "arrived" | "completed" | "archive" | "all";

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<Booking>>({});
  const [activeTab, setActiveTab] = useState<TabType>("new");
  const [operatorName, setOperatorName] = useState<string>("");

  // Capacity warning modal state
  const [capacityWarning, setCapacityWarning] = useState<{
    show: boolean;
    booking: Booking | null;
    dailyBreakdown: CapacityDay[];
  }>({ show: false, booking: null, dailyBreakdown: [] });

  // Get operator name from localStorage or prompt
  useEffect(() => {
    const stored = localStorage.getItem("skyparking_operator");
    if (stored) {
      setOperatorName(stored);
    } else {
      const name = prompt(bg.operatorName) || "Неизвестен";
      setOperatorName(name);
      localStorage.setItem("skyparking_operator", name);
    }
  }, []);

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

  useEffect(() => {
    fetchBookings();
  }, []);

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
        break;
      case "arrived":
        filtered = bookings.filter(b => b.status === "arrived");
        break;
      case "completed":
        filtered = bookings.filter(b => b.status === "checked-out");
        break;
      case "archive":
        filtered = bookings.filter(b => b.status === "no-show" || b.status === "cancelled");
        break;
      case "all":
        filtered = bookings;
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm)
      );
    }

    setFilteredBookings(filtered);
  }, [searchTerm, bookings, activeTab]);

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
        body: JSON.stringify(formData),
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
      if (data.success) {
        toast.success(bg.bookingCancelled);
        fetchBookings();
      } else {
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

  // Checkout (arrived → checked-out)
  const checkout = async (booking: Booking) => {
    if (!confirm(bg.checkoutConfirm)) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-47a4914e/bookings/${booking.id}/checkout`,
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
        toast.success(bg.bookingCheckedOut);
        fetchBookings();
      } else {
        toast.error(data.message || bg.failedToSave);
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
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <History className="h-4 w-4" />
          {bg.statusHistory}
        </div>
        <div className="space-y-2">
          {history.map((change, index) => (
            <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <span className="font-medium">{new Date(change.timestamp).toLocaleString('bg-BG')}</span>
                <span>-</span>
                <span>{getActionName(change.action)}</span>
                <span className="text-gray-500">({change.operator || bg.system})</span>
              </div>
              {change.reason && (
                <div className="text-xs text-gray-500 mt-1">
                  {bg.reason}: {change.reason}
                </div>
              )}
            </div>
          ))}
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

  // Get tab counts
  const getTabCounts = () => {
    return {
      new: bookings.filter(b => b.status === "new").length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      arrived: bookings.filter(b => b.status === "arrived").length,
      completed: bookings.filter(b => b.status === "checked-out").length,
      archive: bookings.filter(b => b.status === "no-show" || b.status === "cancelled").length,
      all: bookings.length,
    };
  };

  const counts = getTabCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{bg.dashboardTitle}</h1>
              <p className="text-sm text-gray-500">Оператор: {operatorName}</p>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              {bg.logout}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "new"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.newReservations} ({counts.new})
            </button>
            <button
              onClick={() => setActiveTab("confirmed")}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "confirmed"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.confirmedReservations} ({counts.confirmed})
            </button>
            <button
              onClick={() => setActiveTab("arrived")}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "arrived"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.arrivedReservations} ({counts.arrived})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "completed"
                  ? "border-gray-500 text-gray-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.completedReservations} ({counts.completed})
            </button>
            <button
              onClick={() => setActiveTab("archive")}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "archive"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.archiveReservations} ({counts.archive})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {bg.allReservations} ({counts.all})
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={bg.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => { setIsAddingNew(true); setFormData({ paymentStatus: "manual", status: "confirmed" }); }}>
            <Plus className="mr-2 h-4 w-4" />
            {bg.addManualBooking}
          </Button>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="text-center py-12">{bg.loadingBookings}</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? bg.noResults : bg.noBookings}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="p-6">
                <div className="space-y-4">
                  {/* Top row - Status and Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                      {booking.carKeys && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                          <Key className="h-3 w-3 mr-1" />
                          {bg.carKeysYes}
                        </Badge>
                      )}
                      {booking.capacityOverride && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Capacity Override
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {/* Context-aware action buttons */}
                      {booking.status === "new" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => acceptBooking(booking)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {bg.accept}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelBooking(booking)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {bg.reject}
                          </Button>
                        </>
                      )}
                      
                      {booking.status === "confirmed" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => markArrived(booking)}
                          >
                            <LogIn className="h-4 w-4 mr-1" />
                            {bg.markArrived}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markNoShow(booking)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {bg.markNoShow}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelBooking(booking)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {bg.reject}
                          </Button>
                        </>
                      )}
                      
                      {booking.status === "arrived" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => checkout(booking)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {bg.checkout}
                        </Button>
                      )}
                      
                      {/* Edit and Delete always available */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingBooking(booking);
                          setFormData(booking);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteBooking(booking.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Booking details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <User className="h-4 w-4 mr-1" />
                        {bg.customer}
                      </div>
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-sm text-gray-600">{booking.email}</div>
                      <div className="text-sm text-gray-600">{booking.phone}</div>
                    </div>

                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {bg.dates}
                      </div>
                      <div className="text-sm">
                        <div><strong>{bg.arrival}:</strong> {booking.arrivalDate} {booking.arrivalTime}</div>
                        <div><strong>{bg.departure}:</strong> {booking.departureDate} {booking.departureTime}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Car className="h-4 w-4 mr-1" />
                        {booking.numberOfCars && booking.numberOfCars > 1 ? bg.vehicles : bg.vehicle}
                      </div>
                      <div className="font-medium">{booking.licensePlate}</div>
                      {booking.licensePlate2 && <div className="text-sm text-gray-600">{booking.licensePlate2}</div>}
                      {booking.licensePlate3 && <div className="text-sm text-gray-600">{booking.licensePlate3}</div>}
                      {booking.licensePlate4 && <div className="text-sm text-gray-600">{booking.licensePlate4}</div>}
                      {booking.licensePlate5 && <div className="text-sm text-gray-600">{booking.licensePlate5}</div>}
                      <div className="text-sm text-gray-600 mt-1">{booking.passengers} {bg.passengers}</div>
                    </div>

                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Euro className="h-4 w-4 mr-1" />
                        {bg.payment}
                      </div>
                      <div className="font-bold text-lg">€{booking.totalPrice}</div>
                      {booking.needsInvoice && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            <FileText className="h-3 w-3 mr-1" />
                            {bg.invoiceRequested}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoice details */}
                  {booking.needsInvoice && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <div className="flex items-center text-sm font-semibold text-blue-900 mb-2">
                        <FileText className="h-4 w-4 mr-1" />
                        {bg.invoiceDetails}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {booking.companyName && (
                          <div>
                            <span className="text-gray-600">{bg.company}:</span>
                            <div className="font-medium">{booking.companyName}</div>
                          </div>
                        )}
                        {booking.companyOwner && (
                          <div>
                            <span className="text-gray-600">{bg.owner}:</span>
                            <div className="font-medium">{booking.companyOwner}</div>
                          </div>
                        )}
                        {booking.taxNumber && (
                          <div>
                            <span className="text-gray-600">{bg.taxNumber}:</span>
                            <div className="font-medium">{booking.taxNumber}</div>
                          </div>
                        )}
                        {booking.isVAT && booking.vatNumber && (
                          <div>
                            <span className="text-gray-600">{bg.vatNumber}:</span>
                            <div className="font-medium text-green-700">{booking.vatNumber}</div>
                          </div>
                        )}
                        {booking.city && (
                          <div>
                            <span className="text-gray-600">{bg.city}:</span>
                            <div className="font-medium">{booking.city}</div>
                          </div>
                        )}
                        {booking.address && (
                          <div className="md:col-span-2">
                            <span className="text-gray-600">{bg.address}:</span>
                            <div className="font-medium">{booking.address}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cancellation/No-show reason */}
                  {booking.cancellationReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                      <span className="font-semibold text-red-900">{bg.reason}:</span>
                      <span className="text-red-700 ml-2">{booking.cancellationReason}</span>
                    </div>
                  )}
                  {booking.noShowReason && (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm">
                      <span className="font-semibold text-gray-900">{bg.reason}:</span>
                      <span className="text-gray-700 ml-2">{booking.noShowReason}</span>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-gray-400 pt-2 border-t">
                    <div>{bg.created}: {new Date(booking.createdAt).toLocaleString('bg-BG')}</div>
                    {booking.updatedAt && (
                      <div>{bg.updated}: {new Date(booking.updatedAt).toLocaleString('bg-BG')}</div>
                    )}
                  </div>

                  {/* Status history */}
                  {formatStatusHistory(booking.statusHistory)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={editingBooking !== null || isAddingNew} onOpenChange={(open) => {
        if (!open) {
          setEditingBooking(null);
          setIsAddingNew(false);
          setFormData({});
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBooking ? bg.editBooking : bg.addBooking}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{bg.fullName}</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">{bg.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">{bg.phone}</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="licensePlate">{bg.licensePlate}</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate || ""}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalDate">{bg.arrivalDate}</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate || ""}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="arrivalTime">{bg.arrivalTime}</Label>
                <Input
                  id="arrivalTime"
                  type="time"
                  value={formData.arrivalTime || ""}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departureDate">{bg.departureDate}</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formData.departureDate || ""}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="departureTime">{bg.departureTime}</Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={formData.departureTime || ""}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="passengers">{bg.passengersLabel}</Label>
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  value={formData.passengers || 1}
                  onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="totalPrice">{bg.totalPrice}</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  min="0"
                  value={formData.totalPrice || 0}
                  onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="paymentStatus">{bg.paymentStatus}</Label>
                <select
                  id="paymentStatus"
                  className="w-full h-10 px-3 border rounded-md"
                  value={formData.paymentStatus || "unpaid"}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                >
                  <option value="unpaid">{bg.unpaidPayOnArrival}</option>
                  <option value="paid">{bg.paid}</option>
                  <option value="pending">{bg.pending}</option>
                  <option value="manual">{bg.manual}</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="status">{bg.bookingStatus}</Label>
              <select
                id="status"
                className="w-full h-10 px-3 border rounded-md"
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
            <div className="border-t pt-4">
              <div className="mb-4">
                <Label className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {bg.carKeys}
                </Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.carKeys === true}
                      onChange={() => setFormData({ ...formData, carKeys: true })}
                      className="w-4 h-4"
                    />
                    <span>{bg.carKeysYes}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.carKeys === false || formData.carKeys === undefined}
                      onChange={() => setFormData({ ...formData, carKeys: false })}
                      className="w-4 h-4"
                    />
                    <span>{bg.carKeysNo}</span>
                  </label>
                </div>
              </div>

              {formData.carKeys && (
                <div>
                  <Label htmlFor="carKeysNotes">{bg.carKeysNotes}</Label>
                  <textarea
                    id="carKeysNotes"
                    value={formData.carKeysNotes || ""}
                    onChange={(e) => setFormData({ ...formData, carKeysNotes: e.target.value })}
                    placeholder={bg.carKeysNotesPlaceholder}
                    className="w-full h-20 px-3 py-2 border rounded-md resize-none"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(formData.carKeysNotes || "").length}/500
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Section */}
            <div className="border-t pt-4">
              <div className="mb-4">
                <Label>{bg.needsInvoice}</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.needsInvoice === true}
                      onChange={() => setFormData({ ...formData, needsInvoice: true })}
                      className="w-4 h-4"
                    />
                    <span>{bg.yes}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.needsInvoice === false || formData.needsInvoice === undefined}
                      onChange={() => setFormData({ ...formData, needsInvoice: false })}
                      className="w-4 h-4"
                    />
                    <span>{bg.no}</span>
                  </label>
                </div>
              </div>

              {formData.needsInvoice && (
                <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {bg.invoiceDetails}
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">{bg.companyName}</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName || ""}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyOwner">{bg.companyOwner}</Label>
                      <Input
                        id="companyOwner"
                        value={formData.companyOwner || ""}
                        onChange={(e) => setFormData({ ...formData, companyOwner: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taxNumber">{bg.taxNumber}</Label>
                      <Input
                        id="taxNumber"
                        value={formData.taxNumber || ""}
                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">{bg.city}</Label>
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">{bg.address}</Label>
                    <Input
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isVAT || false}
                        onChange={(e) => setFormData({ ...formData, isVAT: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{bg.vatRegistered}</span>
                    </label>

                    {formData.isVAT && (
                      <div>
                        <Label htmlFor="vatNumber">{bg.vatNumber}</Label>
                        <Input
                          id="vatNumber"
                          value={formData.vatNumber || ""}
                          onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                          placeholder="e.g., BG123456789"
                          className="bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingBooking(null);
              setIsAddingNew(false);
              setFormData({});
            }}>
              {bg.cancel}
            </Button>
            <Button onClick={saveBooking}>
              {editingBooking ? bg.update : bg.create}
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
                          <td className="p-3 font-medium">{day.date}</td>
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
                    Уверете се, че имате план за управление на излишните коли.
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
    </div>
  );
}