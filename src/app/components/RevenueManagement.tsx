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
  TrendingDown,
  Calendar,
  Download,
  User,
  RefreshCw
} from "lucide-react";
import { formatDateDisplay } from "../utils/dateFormat";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface Booking {
  id: string;
  arrivalDate: string;
  departureDate: string;
  name: string;
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
}

interface RevenueManagementProps {
  bookings: Booking[];
  users: User[];
}

type PeriodType = "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth" | "last3Months" | "last6Months" | "thisYear" | "next30Days" | "next90Days" | "next6Months" | "next12Months" | "custom";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function RevenueManagement({ bookings, users }: RevenueManagementProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"overview" | "daily" | "operator" | "payment">("overview");

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
        start.setDate(start.getDate() - start.getDay() + 1); // Monday
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

  // Filter bookings by date range and calculate revenue
  const revenueData = useMemo(() => {
    const isPastPeriod = dateRange.end <= new Date();
    const isFuturePeriod = dateRange.start > new Date();
    
    // For past periods, only count completed bookings
    // For future periods, count confirmed and arrived bookings (projected)
    // For mixed periods, count both
    const relevantBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.departureDate);
      const isInRange = bookingDate >= dateRange.start && bookingDate <= dateRange.end;
      
      if (!isInRange) return false;
      
      const now = new Date();
      const isPast = bookingDate < now;
      
      if (isPast) {
        // Past bookings: only completed
        return booking.status === "completed";
      } else {
        // Future bookings: confirmed or arrived (projected)
        return booking.status === "confirmed" || booking.status === "arrived";
      }
    });

    let totalRevenue = 0;
    let cashRevenue = 0;
    let cardRevenue = 0;
    let projectedRevenue = 0;
    let totalLateFees = 0;
    let totalDiscounts = 0;
    let totalBasePrice = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    relevantBookings.forEach(booking => {
      const amount = booking.finalPrice || booking.totalPrice;
      const lateFee = booking.lateFee || 0;
      const discount = booking.discountAmount || 0;
      
      totalRevenue += amount;
      totalLateFees += lateFee;
      totalDiscounts += discount;
      totalBasePrice += booking.totalPrice;

      const now = new Date();
      const bookingDate = new Date(booking.departureDate);
      const isPast = bookingDate < now;
      
      if (isPast) {
        // Past completed bookings
        if (booking.paymentStatus === "paid") {
          paidCount++;
          if (booking.paymentMethod === "cash") {
            cashRevenue += amount;
          } else if (booking.paymentMethod === "card") {
            cardRevenue += amount;
          }
        } else {
          unpaidCount++;
        }
      } else {
        // Future projected bookings
        projectedRevenue += amount;
        unpaidCount++;
      }
    });

    return {
      total: totalRevenue,
      cash: cashRevenue,
      card: cardRevenue,
      projected: projectedRevenue,
      lateFees: totalLateFees,
      discounts: totalDiscounts,
      basePrice: totalBasePrice,
      count: relevantBookings.length,
      paidCount,
      unpaidCount,
      averagePrice: relevantBookings.length > 0 ? totalRevenue / relevantBookings.length : 0,
      bookings: relevantBookings
    };
  }, [bookings, dateRange]);

  // Daily breakdown
  const dailyBreakdown = useMemo(() => {
    const dailyMap = new Map<string, { date: string; revenue: number; count: number; cash: number; card: number; projected: number }>();
    
    revenueData.bookings.forEach(booking => {
      const date = booking.departureDate;
      const amount = booking.finalPrice || booking.totalPrice;
      const now = new Date();
      const bookingDate = new Date(booking.departureDate);
      const isPast = bookingDate < now;
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, revenue: 0, count: 0, cash: 0, card: 0, projected: 0 });
      }
      
      const day = dailyMap.get(date)!;
      day.revenue += amount;
      day.count++;
      
      if (isPast && booking.paymentStatus === "paid") {
        if (booking.paymentMethod === "cash") {
          day.cash += amount;
        } else if (booking.paymentMethod === "card") {
          day.card += amount;
        }
      } else {
        day.projected += amount;
      }
    });
    
    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [revenueData.bookings]);

  // Operator breakdown
  const operatorBreakdown = useMemo(() => {
    const operatorMap = new Map<string, { operator: string; revenue: number; count: number }>();
    
    revenueData.bookings.forEach(booking => {
      const operator = booking.completedBy || booking.operatorName || "Система";
      const amount = booking.finalPrice || booking.totalPrice;
      
      if (!operatorMap.has(operator)) {
        operatorMap.set(operator, { operator, revenue: 0, count: 0 });
      }
      
      const op = operatorMap.get(operator)!;
      op.revenue += amount;
      op.count++;
    });
    
    return Array.from(operatorMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [revenueData.bookings]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const now = new Date();
    const paid = { cash: 0, card: 0 };
    const projected = { total: 0 };
    
    revenueData.bookings.forEach(booking => {
      const amount = booking.finalPrice || booking.totalPrice;
      const bookingDate = new Date(booking.departureDate);
      const isPast = bookingDate < now;
      
      if (isPast && booking.paymentStatus === "paid") {
        if (booking.paymentMethod === "cash") {
          paid.cash += amount;
        } else if (booking.paymentMethod === "card") {
          paid.card += amount;
        }
      } else {
        projected.total += amount;
      }
    });
    
    const data = [];
    if (paid.cash > 0) data.push({ name: "В брой", value: paid.cash });
    if (paid.card > 0) data.push({ name: "С карта", value: paid.card });
    if (projected.total > 0) data.push({ name: "Прогнозно", value: projected.total });
    
    return data;
  }, [revenueData.bookings]);

  const exportData = () => {
    const data = {
      period: selectedPeriod,
      dateRange: {
        start: dateRange.start.toISOString().split('T')[0],
        end: dateRange.end.toISOString().split('T')[0]
      },
      summary: {
        totalRevenue: revenueData.total,
        cashRevenue: revenueData.cash,
        cardRevenue: revenueData.card,
        projectedRevenue: revenueData.projected,
        totalBookings: revenueData.count,
        averagePrice: revenueData.averagePrice
      },
      dailyBreakdown,
      operatorBreakdown,
      paymentBreakdown
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${dateRange.start.toISOString().split('T')[0]}-to-${dateRange.end.toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Управление на приходи</h2>
        <Button onClick={exportData} variant="outline">
          <Download className="h-5 w-5 mr-2" />
          Експортирай
        </Button>
      </div>

      {/* Period Selector */}
      <Card className="p-6">
        <Label className="text-lg font-semibold mb-4 block">Изберете период</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
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
            variant={selectedPeriod === "last3Months" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("last3Months")}
            className="text-sm"
          >
            Последните 3 месеца
          </Button>
          <Button
            variant={selectedPeriod === "last6Months" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("last6Months")}
            className="text-sm"
          >
            Последните 6 месеца
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
            <div className="grid grid-cols-2 gap-4 mt-3">
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
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Избран период:</strong> {formatDateDisplay(dateRange.start.toISOString().split('T')[0])} - {formatDateDisplay(dateRange.end.toISOString().split('T')[0])}
          </p>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Обща сума</span>
            <Euro className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">€{revenueData.total.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{revenueData.count} резервации</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">В брой</span>
            <Banknote className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">€{revenueData.cash.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{revenueData.paidCount > 0 ? `${((revenueData.cash / revenueData.total) * 100).toFixed(1)}%` : '0%'}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">С карта</span>
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">€{revenueData.card.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{revenueData.paidCount > 0 ? `${((revenueData.card / revenueData.total) * 100).toFixed(1)}%` : '0%'}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Прогнозно</span>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">€{revenueData.projected.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{revenueData.unpaidCount} неплатени</p>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Базова цена</h3>
          <p className="text-2xl font-bold">€{revenueData.basePrice.toFixed(2)}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Такси за закъснение</h3>
          <p className="text-2xl font-bold text-red-600">€{revenueData.lateFees.toFixed(2)}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Отстъпки</h3>
          <p className="text-2xl font-bold text-blue-600">-€{revenueData.discounts.toFixed(2)}</p>
        </Card>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-3">
        <Button
          variant={viewMode === "overview" ? "default" : "outline"}
          onClick={() => setViewMode("overview")}
        >
          Обща информация
        </Button>
        <Button
          variant={viewMode === "daily" ? "default" : "outline"}
          onClick={() => setViewMode("daily")}
        >
          По дни
        </Button>
        <Button
          variant={viewMode === "operator" ? "default" : "outline"}
          onClick={() => setViewMode("operator")}
        >
          По оператори
        </Button>
        <Button
          variant={viewMode === "payment" ? "default" : "outline"}
          onClick={() => setViewMode("payment")}
        >
          По метод на плащане
        </Button>
      </div>

      {/* Charts and Breakdowns */}
      {viewMode === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Revenue Chart */}
          {dailyBreakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Приходи по дни</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => formatDateDisplay(value).split(' ')[0]}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDateDisplay(value)}
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Приходи" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Payment Method Pie Chart */}
          {paymentBreakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Разпределение по метод</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: €${value.toFixed(0)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {viewMode === "daily" && dailyBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Детайлна разбивка по дни</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold">Дата</th>
                  <th className="text-center p-3 font-semibold">Резервации</th>
                  <th className="text-right p-3 font-semibold">В брой</th>
                  <th className="text-right p-3 font-semibold">С карта</th>
                  <th className="text-right p-3 font-semibold">Прогнозно</th>
                  <th className="text-right p-3 font-semibold">Обща сума</th>
                </tr>
              </thead>
              <tbody>
                {dailyBreakdown.map((day, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3">{formatDateDisplay(day.date)}</td>
                    <td className="text-center p-3">{day.count}</td>
                    <td className="text-right p-3">€{day.cash.toFixed(2)}</td>
                    <td className="text-right p-3">€{day.card.toFixed(2)}</td>
                    <td className="text-right p-3 text-orange-600">€{day.projected.toFixed(2)}</td>
                    <td className="text-right p-3 font-bold">€{day.revenue.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="p-3">Общо</td>
                  <td className="text-center p-3">{revenueData.count}</td>
                  <td className="text-right p-3">€{revenueData.cash.toFixed(2)}</td>
                  <td className="text-right p-3">€{revenueData.card.toFixed(2)}</td>
                  <td className="text-right p-3 text-orange-600">€{revenueData.projected.toFixed(2)}</td>
                  <td className="text-right p-3">€{revenueData.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Daily Bar Chart */}
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDateDisplay(value).split(' ')[0]}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => formatDateDisplay(value)}
                  formatter={(value: number) => `€${value.toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="cash" fill="#10b981" name="В брой" />
                <Bar dataKey="card" fill="#8b5cf6" name="С карта" />
                <Bar dataKey="projected" fill="#f59e0b" name="Прогнозно" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {viewMode === "operator" && operatorBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Приходи по оператори</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold">Оператор</th>
                  <th className="text-center p-3 font-semibold">Резервации</th>
                  <th className="text-right p-3 font-semibold">Приходи</th>
                  <th className="text-right p-3 font-semibold">Средна цена</th>
                </tr>
              </thead>
              <tbody>
                {operatorBreakdown.map((op, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {op.operator}
                    </td>
                    <td className="text-center p-3">{op.count}</td>
                    <td className="text-right p-3 font-bold">€{op.revenue.toFixed(2)}</td>
                    <td className="text-right p-3 text-gray-600">€{(op.revenue / op.count).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="p-3">Общо</td>
                  <td className="text-center p-3">{revenueData.count}</td>
                  <td className="text-right p-3">€{revenueData.total.toFixed(2)}</td>
                  <td className="text-right p-3">€{revenueData.averagePrice.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Operator Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={operatorBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="operator" />
              <YAxis />
              <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Приходи" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {viewMode === "payment" && paymentBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Разбивка по метод на плащане</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment breakdown table */}
            <div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Метод</th>
                    <th className="text-right p-3 font-semibold">Сума</th>
                    <th className="text-right p-3 font-semibold">%</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentBreakdown.map((payment, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3">{payment.name}</td>
                      <td className="text-right p-3 font-bold">€{payment.value.toFixed(2)}</td>
                      <td className="text-right p-3">{((payment.value / revenueData.total) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td className="p-3">Общо</td>
                    <td className="text-right p-3">€{revenueData.total.toFixed(2)}</td>
                    <td className="text-right p-3">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {/* No Data Message */}
      {revenueData.count === 0 && (
        <Card className="p-12 text-center">
          <TrendingDown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Няма данни за избрания период</h3>
          <p className="text-gray-500">Изберете друг период или проверете дали има резервации.</p>
        </Card>
      )}
    </div>
  );
}
