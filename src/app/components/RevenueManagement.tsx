import { useState, useMemo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Euro,
  Banknote,
  CreditCard,
  TrendingUp,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  Filter,
  Search
} from "lucide-react";
import { formatDateDisplay } from "../utils/dateFormat";

interface Booking {
  id: string;
  bookingCode?: string;
  arrivalDate: string;
  departureDate: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  totalPrice: number;
  finalPrice?: number;
  lateFee?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  operatorName?: string;
  completedBy?: string;
  createdAt?: string;
  completedAt?: string;
}

interface User {
  username: string;
  role: string;
  fullName?: string;
}

interface RevenueManagementProps {
  bookings: Booking[];
  users: User[];
}

type PeriodType = "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth" | "last3Months" | "last6Months" | "thisYear" | "next30Days" | "next90Days" | "next6Months" | "next12Months" | "custom";

export function RevenueManagement({ bookings, users }: RevenueManagementProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedCollected, setExpandedCollected] = useState(false);
  const [expandedForecast, setExpandedForecast] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");

  // Calculate date range based on selected period
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let start = new Date(today);
    let end = new Date(today);
    
    switch (selectedPeriod) {
      case "today":
        break;
      case "yesterday":
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
      case "thisWeek":
        start.setDate(start.getDate() - start.getDay() + 1);
        end.setDate(start.getDate() + 6);
        break;
      case "lastWeek":
        start.setDate(start.getDate() - start.getDay() - 6);
        end.setDate(start.getDate() + 6);
        break;
      case "thisMonth":
        start.setDate(1);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        break;
      case "lastMonth":
        start = new Date(start.getFullYear(), start.getMonth() - 1, 1);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        break;
      case "last3Months":
        start = new Date(start.getFullYear(), start.getMonth() - 3, 1);
        break;
      case "last6Months":
        start = new Date(start.getFullYear(), start.getMonth() - 6, 1);
        break;
      case "thisYear":
        start = new Date(start.getFullYear(), 0, 1);
        break;
      case "next30Days":
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
        break;
      case "next90Days":
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 90);
        break;
      case "next6Months":
        end = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
        break;
      case "next12Months":
        end = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        break;
      case "custom":
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        }
        break;
    }
    
    return { start, end };
  }, [selectedPeriod, startDate, endDate]);

  // Determine period type
  const periodType = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateRange.end < today) {
      return "past";
    } else if (dateRange.start > today) {
      return "future";
    } else {
      return "mixed";
    }
  }, [dateRange]);

  // Filter and calculate revenue
  const revenueData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Collected Revenue (Past, Paid Only)
    const collectedBookings = bookings.filter(booking => {
      const arrivalDate = new Date(booking.arrivalDate);
      const isInRange = arrivalDate >= dateRange.start && arrivalDate <= dateRange.end;
      const isPast = arrivalDate < today;
      const isPaid = booking.paymentStatus === "paid";
      
      return isInRange && isPast && isPaid;
    });
    
    // Forecast Revenue (Future, Confirmed Only)
    const forecastBookings = bookings.filter(booking => {
      const arrivalDate = new Date(booking.arrivalDate);
      const isInRange = arrivalDate >= dateRange.start && arrivalDate <= dateRange.end;
      const isFuture = arrivalDate >= today;
      const isConfirmed = booking.status === "confirmed" || booking.status === "arrived";
      
      return isInRange && isFuture && isConfirmed;
    });
    
    // Calculate collected totals
    let collectedTotal = 0;
    let cashTotal = 0;
    let cardTotal = 0;
    
    collectedBookings.forEach(booking => {
      const amount = booking.finalPrice || booking.totalPrice;
      collectedTotal += amount;
      
      if (booking.paymentMethod === "cash") {
        cashTotal += amount;
      } else if (booking.paymentMethod === "card") {
        cardTotal += amount;
      }
    });
    
    // Calculate forecast totals
    let forecastTotal = 0;
    let forecastPrepaid = 0;
    let forecastUnpaid = 0;
    
    forecastBookings.forEach(booking => {
      const amount = booking.finalPrice || booking.totalPrice;
      forecastTotal += amount;
      
      if (booking.paymentStatus === "paid") {
        forecastPrepaid += amount;
      } else {
        forecastUnpaid += amount;
      }
    });
    
    return {
      collected: {
        total: collectedTotal,
        cash: cashTotal,
        card: cardTotal,
        count: collectedBookings.length,
        bookings: collectedBookings
      },
      forecast: {
        total: forecastTotal,
        prepaid: forecastPrepaid,
        unpaid: forecastUnpaid,
        count: forecastBookings.length,
        bookings: forecastBookings
      }
    };
  }, [bookings, dateRange]);

  // Apply filters to bookings
  const applyFilters = (bookingsList: Booking[]) => {
    return bookingsList.filter(booking => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          booking.name.toLowerCase().includes(query) ||
          booking.email.toLowerCase().includes(query) ||
          booking.bookingCode?.toLowerCase().includes(query) ||
          booking.id.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }
      
      // Payment status filter
      if (paymentStatusFilter !== "all" && booking.paymentStatus !== paymentStatusFilter) {
        return false;
      }
      
      // Payment method filter
      if (paymentMethodFilter !== "all" && booking.paymentMethod !== paymentMethodFilter) {
        return false;
      }
      
      return true;
    });
  };

  const filteredCollected = applyFilters(revenueData.collected.bookings);
  const filteredForecast = applyFilters(revenueData.forecast.bookings);

  // Export functions
  const exportCollectedCSV = () => {
    const headers = ["ID Резервация", "Име", "Email", "Телефон", "Пристигане", "Заминаване", "Сума", "Метод на плащане", "Платено на", "Оператор"];
    const rows = filteredCollected.map(b => [
      b.bookingCode || b.id,
      b.name,
      b.email,
      b.phone,
      formatDateDisplay(b.arrivalDate),
      formatDateDisplay(b.departureDate),
      `€${(b.finalPrice || b.totalPrice).toFixed(2)}`,
      b.paymentMethod === "cash" ? "В брой" : "С карта",
      b.completedAt || "-",
      b.completedBy || b.operatorName || "-"
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `събрани-приходи-${dateRange.start.toISOString().split('T')[0]}-${dateRange.end.toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportForecastCSV = () => {
    const headers = ["ID Резервация", "Име", "Email", "Телефон", "Пристигане", "Заминаване", "Очаквана сума", "Статус", "Статус на плащане"];
    const rows = filteredForecast.map(b => [
      b.bookingCode || b.id,
      b.name,
      b.email,
      b.phone,
      formatDateDisplay(b.arrivalDate),
      formatDateDisplay(b.departureDate),
      `€${(b.finalPrice || b.totalPrice).toFixed(2)}`,
      b.status === "confirmed" ? "Потвърдена" : b.status === "arrived" ? "Пристигнала" : b.status,
      b.paymentStatus === "paid" ? "Платено" : "Неплатено"
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `прогнозни-приходи-${dateRange.start.toISOString().split('T')[0]}-${dateRange.end.toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportAllCSV = () => {
    exportCollectedCSV();
    setTimeout(() => exportForecastCSV(), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Управление на приходи</h2>
        
        {/* Export Dropdown */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportCollectedCSV} variant="outline" className="text-sm">
            <Download className="h-4 w-4 mr-2" />
            Експорт събрани (.csv)
          </Button>
          <Button onClick={exportForecastCSV} variant="outline" className="text-sm">
            <Download className="h-4 w-4 mr-2" />
            Експорт прогнозни (.csv)
          </Button>
          <Button onClick={exportAllCSV} variant="default" className="text-sm bg-[#073590]">
            <Download className="h-4 w-4 mr-2" />
            Експорт всички (.csv)
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="p-6">
        <Label className="text-lg font-semibold mb-4 block">Избран период</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
          {/* Past periods */}
          <Button
            variant={selectedPeriod === "today" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("today")}
            className="text-sm"
          >
            Днес
          </Button>
          <Button
            variant={selectedPeriod === "yesterday" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("yesterday")}
            className="text-sm"
          >
            Вчера
          </Button>
          <Button
            variant={selectedPeriod === "thisWeek" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("thisWeek")}
            className="text-sm"
          >
            Тази седмица
          </Button>
          <Button
            variant={selectedPeriod === "lastWeek" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("lastWeek")}
            className="text-sm"
          >
            Миналата седмица
          </Button>
          <Button
            variant={selectedPeriod === "thisMonth" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("thisMonth")}
            className="text-sm"
          >
            Този месец
          </Button>
          <Button
            variant={selectedPeriod === "lastMonth" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("lastMonth")}
            className="text-sm"
          >
            Миналия месец
          </Button>
          <Button
            variant={selectedPeriod === "thisYear" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("thisYear")}
            className="text-sm"
          >
            Тази година
          </Button>
          
          {/* Future periods */}
          <Button
            variant={selectedPeriod === "next30Days" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("next30Days")}
            className="text-sm"
          >
            Следващите 30 дни
          </Button>
          <Button
            variant={selectedPeriod === "next90Days" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("next90Days")}
            className="text-sm"
          >
            Следващите 90 дни
          </Button>
          <Button
            variant={selectedPeriod === "next6Months" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("next6Months")}
            className="text-sm"
          >
            Следващите 6 месеца
          </Button>
          <Button
            variant={selectedPeriod === "next12Months" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("next12Months")}
            className="text-sm"
          >
            Следващата година
          </Button>
        </div>

        {/* Custom date range */}
        <div className="border-t pt-4 mt-4">
          <Button
            variant={selectedPeriod === "custom" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("custom")}
            className="mb-3"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Персонализиран период
          </Button>
          
          {selectedPeriod === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <Label>Начална дата</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Крайна дата</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Current date range display */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700 font-semibold">
            📅 Избран период: {formatDateDisplay(dateRange.start.toISOString().split('T')[0])} - {formatDateDisplay(dateRange.end.toISOString().split('T')[0])}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {periodType === "past" ? "📊 Минал период (само събрани приходи)" : 
             periodType === "future" ? "📈 Бъдещ период (само прогнозни приходи)" : 
             "🔄 Смесен период (и събрани, и прогнозни)"}
          </p>
        </div>
      </Card>

      {/* Summary Cards */}
      {periodType === "past" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Collected Revenue */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">Събрани приходи</span>
              <Euro className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-4xl font-black text-green-600">€{revenueData.collected.total.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">{revenueData.collected.count} платени резервации</p>
          </Card>

          {/* Cash */}
          <Card className="p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">В брой</span>
              <Banknote className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-4xl font-black text-blue-600">€{revenueData.collected.cash.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">
              {revenueData.collected.total > 0 
                ? `${((revenueData.collected.cash / revenueData.collected.total) * 100).toFixed(1)}% от събраните` 
                : "0%"}
            </p>
          </Card>

          {/* Card */}
          <Card className="p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">С карта</span>
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-4xl font-black text-purple-600">€{revenueData.collected.card.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">
              {revenueData.collected.total > 0 
                ? `${((revenueData.collected.card / revenueData.collected.total) * 100).toFixed(1)}% от събраните` 
                : "0%"}
            </p>
          </Card>
        </div>
      )}

      {periodType === "future" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Forecast Revenue */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">Прогнозни приходи</span>
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-4xl font-black text-orange-600">€{revenueData.forecast.total.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">{revenueData.forecast.count} потвърдени резервации</p>
          </Card>

          {/* Prepaid */}
          <Card className="p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">Предплатени</span>
              <Euro className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-4xl font-black text-green-600">€{revenueData.forecast.prepaid.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">Вече платено</p>
          </Card>

          {/* Unpaid */}
          <Card className="p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">Неплатени</span>
              <TrendingUp className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-4xl font-black text-gray-700">€{revenueData.forecast.unpaid.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">Предстои плащане</p>
          </Card>
        </div>
      )}

      {periodType === "mixed" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Collected Revenue */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">Събрани приходи</span>
              <Euro className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-4xl font-black text-green-600">€{revenueData.collected.total.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">{revenueData.collected.count} платени</p>
          </Card>

          {/* Cash */}
          <Card className="p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">В брой</span>
              <Banknote className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-600">€{revenueData.collected.cash.toFixed(2)}</p>
            <p className="text-xs text-gray-600 mt-2">
              {revenueData.collected.total > 0 
                ? `${((revenueData.collected.cash / revenueData.collected.total) * 100).toFixed(1)}%` 
                : "0%"}
            </p>
          </Card>

          {/* Card */}
          <Card className="p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">С карта</span>
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-3xl font-black text-purple-600">€{revenueData.collected.card.toFixed(2)}</p>
            <p className="text-xs text-gray-600 mt-2">
              {revenueData.collected.total > 0 
                ? `${((revenueData.collected.card / revenueData.collected.total) * 100).toFixed(1)}%` 
                : "0%"}
            </p>
          </Card>

          {/* Forecast Revenue */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">Прогнозни приходи</span>
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-3xl font-black text-orange-600">€{revenueData.forecast.total.toFixed(2)}</p>
            <p className="text-xs text-gray-600 mt-2">{revenueData.forecast.count} потвърдени</p>
          </Card>

          {/* Combined Total */}
          <Card className="p-6 border-2 border-[#f1c933] bg-gradient-to-br from-yellow-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">Комбинирано</span>
              <Euro className="h-6 w-6 text-[#073590]" />
            </div>
            <p className="text-3xl font-black text-[#073590]">€{(revenueData.collected.total + revenueData.forecast.total).toFixed(2)}</p>
            <p className="text-xs text-gray-600 mt-2">Събрани + Прогнозни</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <Label className="text-lg font-semibold">Филтри</Label>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <Label className="text-sm mb-2">Търсене</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Име, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <Label className="text-sm mb-2">Статус на резервация</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#073590]"
            >
              <option value="all">Всички статуси</option>
              <option value="confirmed">Потвърдена</option>
              <option value="arrived">Пристигнала</option>
              <option value="checked-out">Завършена</option>
              <option value="no-show">Не се е явил</option>
              <option value="cancelled">Анулирана</option>
            </select>
          </div>
          
          {/* Payment Status Filter */}
          <div>
            <Label className="text-sm mb-2">Статус на плащане</Label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#073590]"
            >
              <option value="all">Всички</option>
              <option value="paid">Платено</option>
              <option value="pending">Неплатено</option>
            </select>
          </div>
          
          {/* Payment Method Filter */}
          <div>
            <Label className="text-sm mb-2">Метод на плащане</Label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#073590]"
            >
              <option value="all">Всички</option>
              <option value="cash">В брой</option>
              <option value="card">С карта</option>
            </select>
          </div>
        </div>
        
        {/* Clear filters button */}
        {(searchQuery || statusFilter !== "all" || paymentStatusFilter !== "all" || paymentMethodFilter !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setPaymentStatusFilter("all");
              setPaymentMethodFilter("all");
            }}
            className="mt-4"
          >
            Изчисти всички филтри
          </Button>
        )}
      </Card>

      {/* Collected Revenue Details Table */}
      {(periodType === "past" || periodType === "mixed") && (
        <Card className="p-6">
          <button
            onClick={() => setExpandedCollected(!expandedCollected)}
            className="w-full flex items-center justify-between mb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
            <h3 className="text-xl font-bold text-green-700">✅ Детайли по събрани приходи</h3>
            {expandedCollected ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </button>
          
          {expandedCollected && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Общо събрани</p>
                  <p className="text-2xl font-bold text-green-700">€{revenueData.collected.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">В брой</p>
                  <p className="text-2xl font-bold text-blue-600">€{revenueData.collected.cash.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">С карта</p>
                  <p className="text-2xl font-bold text-purple-600">€{revenueData.collected.card.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Table */}
              {filteredCollected.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left p-3 font-semibold">ID</th>
                        <th className="text-left p-3 font-semibold">Клиент</th>
                        <th className="text-left p-3 font-semibold">Пристигане</th>
                        <th className="text-left p-3 font-semibold">Заминаване</th>
                        <th className="text-right p-3 font-semibold">Сума</th>
                        <th className="text-center p-3 font-semibold">Метод</th>
                        <th className="text-left p-3 font-semibold">Оператор</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCollected.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{booking.bookingCode || booking.id.slice(0, 8)}</td>
                          <td className="p-3">{booking.name}</td>
                          <td className="p-3">{formatDateDisplay(booking.arrivalDate)}</td>
                          <td className="p-3">{formatDateDisplay(booking.departureDate)}</td>
                          <td className="p-3 text-right font-bold text-green-700">€{(booking.finalPrice || booking.totalPrice).toFixed(2)}</td>
                          <td className="p-3 text-center">
                            {booking.paymentMethod === "cash" ? "💵 В брой" : "💳 С карта"}
                          </td>
                          <td className="p-3 text-sm text-gray-600">{booking.completedBy || booking.operatorName || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={4} className="p-3">Общо ({filteredCollected.length})</td>
                        <td className="p-3 text-right text-green-700">
                          €{filteredCollected.reduce((sum, b) => sum + (b.finalPrice || b.totalPrice), 0).toFixed(2)}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Няма събрани приходи за избрания период</p>
              )}
            </>
          )}
        </Card>
      )}

      {/* Forecast Revenue Details Table */}
      {(periodType === "future" || periodType === "mixed") && (
        <Card className="p-6">
          <button
            onClick={() => setExpandedForecast(!expandedForecast)}
            className="w-full flex items-center justify-between mb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
            <h3 className="text-xl font-bold text-orange-700">📈 Детайли по прогнозни приходи</h3>
            {expandedForecast ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </button>
          
          {expandedForecast && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Прогнозно общо</p>
                  <p className="text-2xl font-bold text-orange-700">€{revenueData.forecast.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Брой потвърдени резервации</p>
                  <p className="text-2xl font-bold text-orange-700">{revenueData.forecast.count}</p>
                </div>
              </div>
              
              {/* Table */}
              {filteredForecast.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left p-3 font-semibold">ID</th>
                        <th className="text-left p-3 font-semibold">Клиент</th>
                        <th className="text-left p-3 font-semibold">Пристигане</th>
                        <th className="text-left p-3 font-semibold">Заминаване</th>
                        <th className="text-right p-3 font-semibold">Очаквана сума</th>
                        <th className="text-center p-3 font-semibold">Статус</th>
                        <th className="text-center p-3 font-semibold">Плащане</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredForecast.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{booking.bookingCode || booking.id.slice(0, 8)}</td>
                          <td className="p-3">{booking.name}</td>
                          <td className="p-3">{formatDateDisplay(booking.arrivalDate)}</td>
                          <td className="p-3">{formatDateDisplay(booking.departureDate)}</td>
                          <td className="p-3 text-right font-bold text-orange-700">€{(booking.finalPrice || booking.totalPrice).toFixed(2)}</td>
                          <td className="p-3 text-center">
                            {booking.status === "confirmed" ? "✅ Потвърдена" : booking.status === "arrived" ? "🚗 Пристигнала" : booking.status}
                          </td>
                          <td className="p-3 text-center">
                            {booking.paymentStatus === "paid" ? "✅ Платено" : "⏳ Неплатено"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={4} className="p-3">Общо ({filteredForecast.length})</td>
                        <td className="p-3 text-right text-orange-700">
                          €{filteredForecast.reduce((sum, b) => sum + (b.finalPrice || b.totalPrice), 0).toFixed(2)}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Няма прогнозни приходи за избрания период</p>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
