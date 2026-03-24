import { useState, useMemo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  User,
  TrendingUp,
  FileText,
  CheckCircle
} from "lucide-react";
import { formatDateDisplay } from "../utils/dateFormat";

interface Booking {
  id: string;
  bookingCode?: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  totalPrice: number;
  finalPrice?: number;
  paymentStatus?: string;
  createdAt: string;
  createdBy?: string; // Employee name or "Клиент (онлайн)"
  acceptedBy?: string; // Employee who confirmed
  statusHistory?: Array<{
    from: string;
    to: string;
    operator: string;
    timestamp: string;
  }>;
}

interface User {
  username: string;
  role: string;
  fullName?: string;
}

interface ReservationPerformanceProps {
  bookings: Booking[];
  users: User[];
}

type PeriodType = "today" | "thisWeek" | "thisMonth" | "lastMonth" | "last3Months" | "custom";

export function ReservationPerformance({ bookings, users }: ReservationPerformanceProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedDaily, setExpandedDaily] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");

  // Calculate date range based on selected period
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let start = new Date(today);
    let end = new Date(today);
    
    switch (selectedPeriod) {
      case "today":
        break;
      case "thisWeek":
        start.setDate(start.getDate() - start.getDay() + 1); // Monday
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
      case "custom":
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        }
        break;
    }
    
    return { start, end };
  }, [selectedPeriod, startDate, endDate]);

  // Helper function to get who accepted a booking
  const getAcceptedBy = (booking: Booking): string => {
    if (booking.acceptedBy) return booking.acceptedBy;
    
    // Try to find from statusHistory
    if (booking.statusHistory) {
      const confirmEvent = booking.statusHistory.find(
        h => h.to === "confirmed" || (h.from === "new" && h.to === "confirmed")
      );
      if (confirmEvent?.operator) return confirmEvent.operator;
    }
    
    return "-";
  };

  // Helper function to get who created a booking
  const getCreatedBy = (booking: Booking): string => {
    if (booking.createdBy) return booking.createdBy;
    
    // If no createdBy field, check if there's an operator in statusHistory for creation
    if (booking.statusHistory && booking.statusHistory.length > 0) {
      const firstEvent = booking.statusHistory[0];
      if (firstEvent.operator) return firstEvent.operator;
    }
    
    // Default to online customer
    return "Клиент (онлайн)";
  };

  // Filter bookings by date range
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const createdDate = new Date(booking.createdAt);
      return createdDate >= dateRange.start && createdDate <= dateRange.end;
    });
  }, [bookings, dateRange]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBookings = bookings.filter(b => {
      const createdDate = new Date(b.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    });
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekBookings = bookings.filter(b => {
      const createdDate = new Date(b.createdAt);
      return createdDate >= weekStart && createdDate <= weekEnd;
    });
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const monthBookings = bookings.filter(b => {
      const createdDate = new Date(b.createdAt);
      return createdDate >= monthStart && createdDate <= monthEnd;
    });
    
    const averageValue = filteredBookings.length > 0
      ? filteredBookings.reduce((sum, b) => sum + (b.finalPrice || b.totalPrice), 0) / filteredBookings.length
      : 0;
    
    return {
      today: todayBookings.length,
      thisWeek: weekBookings.length,
      thisMonth: monthBookings.length,
      averageValue
    };
  }, [bookings, filteredBookings]);

  // Employee performance data
  const employeePerformance = useMemo(() => {
    const performanceMap = new Map<string, {
      name: string;
      created: number;
      accepted: number;
      revenue: number;
    }>();
    
    filteredBookings.forEach(booking => {
      const createdBy = getCreatedBy(booking);
      const acceptedBy = getAcceptedBy(booking);
      const revenue = booking.finalPrice || booking.totalPrice;
      
      // Track creator
      if (!performanceMap.has(createdBy)) {
        performanceMap.set(createdBy, { name: createdBy, created: 0, accepted: 0, revenue: 0 });
      }
      const creatorStats = performanceMap.get(createdBy)!;
      creatorStats.created++;
      creatorStats.revenue += revenue;
      
      // Track acceptor (if different and exists)
      if (acceptedBy !== "-" && acceptedBy !== createdBy) {
        if (!performanceMap.has(acceptedBy)) {
          performanceMap.set(acceptedBy, { name: acceptedBy, created: 0, accepted: 0, revenue: 0 });
        }
        const acceptorStats = performanceMap.get(acceptedBy)!;
        acceptorStats.accepted++;
      } else if (acceptedBy === createdBy) {
        creatorStats.accepted++;
      }
    });
    
    return Array.from(performanceMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredBookings]);

  // Daily tracking data
  const dailyData = useMemo(() => {
    const dailyMap = new Map<string, {
      date: string;
      count: number;
      revenue: number;
    }>();
    
    filteredBookings.forEach(booking => {
      const createdDate = new Date(booking.createdAt).toISOString().split('T')[0];
      
      if (!dailyMap.has(createdDate)) {
        dailyMap.set(createdDate, { date: createdDate, count: 0, revenue: 0 });
      }
      
      const day = dailyMap.get(createdDate)!;
      day.count++;
      day.revenue += booking.finalPrice || booking.totalPrice;
    });
    
    return Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredBookings]);

  // Apply filters to detailed bookings list
  const detailedBookings = useMemo(() => {
    let result = filteredBookings;
    
    // Filter by selected day
    if (selectedDay) {
      result = result.filter(b => {
        const createdDate = new Date(b.createdAt).toISOString().split('T')[0];
        return createdDate === selectedDay;
      });
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.name?.toLowerCase().includes(query) ||
        b.email?.toLowerCase().includes(query) ||
        b.bookingCode?.toLowerCase().includes(query) ||
        b.id?.toLowerCase().includes(query)
      );
    }
    
    // Employee filter
    if (employeeFilter !== "all") {
      result = result.filter(b => {
        const createdBy = getCreatedBy(b);
        const acceptedBy = getAcceptedBy(b);
        return createdBy === employeeFilter || acceptedBy === employeeFilter;
      });
    }
    
    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(b => b.status === statusFilter);
    }
    
    // Payment status filter
    if (paymentStatusFilter !== "all") {
      result = result.filter(b => b.paymentStatus === paymentStatusFilter);
    }
    
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredBookings, selectedDay, searchQuery, employeeFilter, statusFilter, paymentStatusFilter]);

  // Export functions
  const exportAllReservations = () => {
    const headers = [
      "ID Резервация",
      "Дата на създаване",
      "Час на създаване",
      "Име",
      "Email",
      "Телефон",
      "Дата на пристигане",
      "Създадено от",
      "Прието от",
      "Сума",
      "Статус",
      "Статус на плащане"
    ];
    
    const rows = detailedBookings.map(b => {
      const createdDate = new Date(b.createdAt);
      return [
        b.bookingCode || b.id.slice(0, 8),
        formatDateDisplay(createdDate.toISOString().split('T')[0]),
        createdDate.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }),
        b.name,
        b.email,
        b.phone,
        formatDateDisplay(b.arrivalDate),
        getCreatedBy(b),
        getAcceptedBy(b),
        `€${(b.finalPrice || b.totalPrice).toFixed(2)}`,
        b.status,
        b.paymentStatus || "-"
      ];
    });
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `резервации-${dateRange.start.toISOString().split('T')[0]}-${dateRange.end.toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportByEmployee = () => {
    const headers = ["Служител", "Създадени резервации", "Приети резервации", "Обща сум��"];
    const rows = employeePerformance.map(emp => [
      emp.name,
      emp.created,
      emp.accepted,
      `€${emp.revenue.toFixed(2)}`
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `служители-резервации-${dateRange.start.toISOString().split('T')[0]}-${dateRange.end.toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Get unique employees for filter
  const uniqueEmployees = useMemo(() => {
    const employees = new Set<string>();
    filteredBookings.forEach(b => {
      employees.add(getCreatedBy(b));
      const acceptedBy = getAcceptedBy(b);
      if (acceptedBy !== "-") employees.add(acceptedBy);
    });
    return Array.from(employees).sort();
  }, [filteredBookings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">📊 Резервации и Ефективност</h2>
        
        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportAllReservations} variant="outline" className="text-sm">
            <Download className="h-4 w-4 mr-2" />
            Експорт резервации
          </Button>
          <Button onClick={exportByEmployee} variant="default" className="text-sm bg-[#073590]">
            <Download className="h-4 w-4 mr-2" />
            Експорт по служител
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="p-6">
        <Label className="text-lg font-semibold mb-4 block">Избран период</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          <Button
            variant={selectedPeriod === "today" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("today")}
            className="text-sm"
          >
            Днес
          </Button>
          <Button
            variant={selectedPeriod === "thisWeek" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("thisWeek")}
            className="text-sm"
          >
            Тази седмица
          </Button>
          <Button
            variant={selectedPeriod === "thisMonth" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("thisMonth")}
            className="text-sm"
          >
            Този ме��ец
          </Button>
          <Button
            variant={selectedPeriod === "lastMonth" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("lastMonth")}
            className="text-sm"
          >
            Миналия месец
          </Button>
          <Button
            variant={selectedPeriod === "last3Months" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("last3Months")}
            className="text-sm"
          >
            Последните 3 месеца
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
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-semibold">Резервации днес</span>
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-4xl font-black text-blue-600">{summaryStats.today}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-semibold">Тази седмица</span>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-4xl font-black text-green-600">{summaryStats.thisWeek}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-semibold">Този месец</span>
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-4xl font-black text-purple-600">{summaryStats.thisMonth}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-semibold text-sm">Средна стойност</span>
            <span className="text-lg">€</span>
          </div>
          <p className="text-4xl font-black text-orange-600">€{summaryStats.averageValue.toFixed(2)}</p>
        </Card>
      </div>

      {/* Employee Performance */}
      <Card className="p-6">
        <button
          onClick={() => setExpandedEmployee(!expandedEmployee)}
          className="w-full flex items-center justify-between mb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors"
        >
          <h3 className="text-xl font-bold text-[#073590]">👤 По служител</h3>
          {expandedEmployee ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
        </button>
        
        {expandedEmployee && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="text-left p-3 font-semibold">Служител</th>
                  <th className="text-center p-3 font-semibold">Създадени</th>
                  <th className="text-center p-3 font-semibold">Приети</th>
                  <th className="text-right p-3 font-semibold">Обща сума</th>
                </tr>
              </thead>
              <tbody>
                {employeePerformance.map((emp, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {emp.name}
                    </td>
                    <td className="p-3 text-center font-semibold text-blue-600">{emp.created}</td>
                    <td className="p-3 text-center font-semibold text-green-600">{emp.accepted}</td>
                    <td className="p-3 text-right font-bold text-[#073590]">€{emp.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Daily Tracking */}
      <Card className="p-6">
        <button
          onClick={() => setExpandedDaily(!expandedDaily)}
          className="w-full flex items-center justify-between mb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors"
        >
          <h3 className="text-xl font-bold text-[#073590]">📅 Резервации по дни</h3>
          {expandedDaily ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
        </button>
        
        {expandedDaily && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="text-left p-3 font-semibold">Дата</th>
                  <th className="text-center p-3 font-semibold">Брой резервации</th>
                  <th className="text-right p-3 font-semibold">Приходи</th>
                  <th className="text-center p-3 font-semibold">Детайли</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.map((day) => (
                  <tr key={day.date} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{formatDateDisplay(day.date)}</td>
                    <td className="p-3 text-center font-bold text-blue-600">{day.count}</td>
                    <td className="p-3 text-right font-bold text-green-600">€{day.revenue.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDay(day.date);
                          setExpandedDetails(true);
                        }}
                        className="text-xs"
                      >
                        Виж детайли
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <Label className="text-lg font-semibold">Филтри за детайлна таблица</Label>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
          
          {/* Employee Filter */}
          <div>
            <Label className="text-sm mb-2">Служител</Label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#073590]"
            >
              <option value="all">Всички служители</option>
              {uniqueEmployees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <Label className="text-sm mb-2">Статус</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#073590]"
            >
              <option value="all">Всички статуси</option>
              <option value="new">Нова</option>
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
          
          {/* Clear filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setEmployeeFilter("all");
                setStatusFilter("all");
                setPaymentStatusFilter("all");
                setSelectedDay(null);
              }}
              className="w-full"
            >
              Изчисти филтри
            </Button>
          </div>
        </div>
        
        {selectedDay && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded text-sm">
            Филтрирано по дата: <strong>{formatDateDisplay(selectedDay)}</strong>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(null)}
              className="ml-2 h-6 text-xs"
            >
              ✕ Премахни
            </Button>
          </div>
        )}
      </Card>

      {/* Detailed Reservation Table */}
      <Card className="p-6">
        <button
          onClick={() => setExpandedDetails(!expandedDetails)}
          className="w-full flex items-center justify-between mb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors"
        >
          <div>
            <h3 className="text-xl font-bold text-[#073590]">📋 Детайлна таблица на резервации</h3>
            <p className="text-sm text-gray-600 mt-1">{detailedBookings.length} резервации</p>
          </div>
          {expandedDetails ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
        </button>
        
        {expandedDetails && (
          <div className="overflow-x-auto">
            {detailedBookings.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Име</th>
                    <th className="text-left p-3 font-semibold">Създадено на</th>
                    <th className="text-left p-3 font-semibold">Пристигане</th>
                    <th className="text-left p-3 font-semibold">Създадено от</th>
                    <th className="text-left p-3 font-semibold">Прието от</th>
                    <th className="text-right p-3 font-semibold">Сума</th>
                    <th className="text-center p-3 font-semibold">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedBookings.map((booking) => {
                    const createdDate = new Date(booking.createdAt);
                    return (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{booking.bookingCode || booking.id.slice(0, 8)}</td>
                        <td className="p-3">{booking.name}</td>
                        <td className="p-3 text-sm">
                          {formatDateDisplay(createdDate.toISOString().split('T')[0])}
                          <br />
                          <span className="text-xs text-gray-500">
                            {createdDate.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="p-3">{formatDateDisplay(booking.arrivalDate)}</td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            {getCreatedBy(booking)}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {getAcceptedBy(booking)}
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold text-[#073590]">
                          €{(booking.finalPrice || booking.totalPrice).toFixed(2)}
                        </td>
                        <td className="p-3 text-center text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'arrived' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'checked-out' ? 'bg-gray-100 text-gray-700' :
                            booking.status === 'no-show' ? 'bg-red-100 text-red-700' :
                            booking.status === 'cancelled' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status === 'confirmed' ? 'Потвърдена' :
                             booking.status === 'arrived' ? 'Пристигнала' :
                             booking.status === 'checked-out' ? 'Завършена' :
                             booking.status === 'no-show' ? 'No-show' :
                             booking.status === 'cancelled' ? 'Анулирана' :
                             booking.status === 'new' ? 'Нова' : booking.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 py-8">Няма резервации за показване с текущите филтри</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}