import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { formatDateDisplay, formatDateTimeDisplay } from "../utils/dateFormat";
import {
  User,
  Phone,
  Mail,
  Car,
  Users,
  Calendar,
  Euro,
  FileText,
  Key,
  StickyNote,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  LogIn,
  Check,
  X
} from "lucide-react";

// Unified Booking Interface
export interface ReservationData {
  id: string;
  bookingCode?: string;
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
  finalPrice?: number;
  basePrice?: number;
  discountCode?: string;
  discountApplied?: {
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    code?: string;
    description?: string;
  };
  status: 'new' | 'confirmed' | 'arrived' | 'checked-out' | 'no-show' | 'cancelled' | 'declined';
  paymentStatus?: string;
  paymentMethod?: string;
  paidAt?: string;
  carKeys?: boolean;
  carKeysNotes?: string;
  keyNumber?: string;
  includeInCapacity?: boolean;
  needsInvoice?: boolean;
  invoiceUrl?: string;
  companyName?: string;
  companyOwner?: string;
  taxNumber?: string;
  isVAT?: boolean;
  vatNumber?: string;
  city?: string;
  address?: string;
  notes?: string;
  isLate?: boolean;
  lateSurcharge?: number;
  originalDepartureDate?: string;
  originalDepartureTime?: string;
  capacityOverride?: boolean;
  createdAt?: string;
  updatedAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  noShowReason?: string;
  noShowBy?: string;
  noShowAt?: string;
  declineReason?: string;
  declinedBy?: string;
  declinedAt?: string;
  editHistory?: Array<{
    timestamp: string;
    editor: string;
    changes: string;
  }>;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    actor?: string;
  }>;
}

interface ReservationCardProps {
  reservation: ReservationData;
  showActions?: boolean;
  actions?: React.ReactNode;
  showCapacityInfo?: boolean;
  capacityInfo?: {
    occupied: number;
    total: number;
    percentage: number;
    leaving: number;
  };
  showTimestamps?: boolean;
  showEditHistory?: boolean;
  showStatusHistory?: boolean;
}

export function ReservationCard({
  reservation,
  showActions = false,
  actions,
  showCapacityInfo = false,
  capacityInfo,
  showTimestamps = false,
  showEditHistory = false,
  showStatusHistory = false,
}: ReservationCardProps) {
  
  // Status badge helper
  const getStatusBadge = () => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'new': { label: '🆕 Нова', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      'confirmed': { label: '✅ Потвърдена', className: 'bg-green-100 text-green-800 border-green-300' },
      'arrived': { label: '🚗 Пристигнала', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      'checked-out': { label: '✔️ Приключена', className: 'bg-gray-100 text-gray-800 border-gray-300' },
      'cancelled': { label: '❌ Отказана', className: 'bg-red-100 text-red-800 border-red-300' },
      'declined': { label: '⛔ Отхвърлена', className: 'bg-red-100 text-red-800 border-red-300' },
      'no-show': { label: '⭕ Не се яви', className: 'bg-gray-100 text-gray-800 border-gray-300' },
    };

    const status = statusMap[reservation.status] || { label: reservation.status, className: 'bg-gray-100 text-gray-800 border-gray-300' };
    
    return (
      <Badge variant="outline" className={`${status.className} text-base py-1.5 px-3 font-semibold`}>
        {status.label}
      </Badge>
    );
  };

  // Payment status badge helper
  const getPaymentStatusBadge = () => {
    if (reservation.paymentStatus === 'paid') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-base py-1.5 px-3 font-semibold">
          <CheckCircle className="h-4 w-4 mr-1.5" />
          Платено
        </Badge>
      );
    } else if (reservation.paymentStatus === 'pending') {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-base py-1.5 px-3 font-semibold">
          <Clock className="h-4 w-4 mr-1.5" />
          Очаква плащане
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* TOP SECTION: Booking Code, Name, Status Badges */}
      <div className="mb-5 pb-5 border-b border-gray-200">
        {/* Booking Code */}
        {reservation.bookingCode && (
          <div className="mb-3 inline-block bg-[#f1c933] text-[#073590] font-bold text-lg px-4 py-2 rounded-lg">
            📋 {reservation.bookingCode}
          </div>
        )}

        {/* Name and Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-gray-500 flex-shrink-0" />
            <h3 className="font-bold text-2xl text-gray-900">{reservation.name}</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge()}
            {getPaymentStatusBadge()}
            
            {/* Payment Method Badge */}
            {reservation.paymentMethod && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-base py-1.5 px-3">
                {reservation.paymentMethod === 'cash' && '💰 В брой'}
                {reservation.paymentMethod === 'card' && '💳 С карта'}
                {reservation.paymentMethod === 'pay-on-leave' && '⏰ При напускане'}
              </Badge>
            )}
            
            {/* Car Keys Badge */}
            {reservation.carKeys && (
              <Badge 
                variant="outline" 
                className={`${reservation.includeInCapacity === false ? 'bg-orange-50 text-orange-700 border-orange-300' : 'bg-purple-50 text-purple-700 border-purple-300'} text-base py-1.5 px-3`}
              >
                <Key className="h-4 w-4 mr-1.5" />
                Ключове
                {reservation.keyNumber && ` - ${reservation.keyNumber}`}
                {reservation.includeInCapacity === false && ' 🚫'}
              </Badge>
            )}
            
            {/* Capacity Override Badge */}
            {reservation.capacityOverride && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-base py-1.5 px-3">
                <AlertTriangle className="h-4 w-4 mr-1.5" />
                Capacity Override
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOMER & VEHICLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-5">
        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-base text-gray-700">
            <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <span className="font-medium">{reservation.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-base text-gray-700">
            <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <span className="font-medium break-all">{reservation.email}</span>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-base text-gray-700">
            <Car className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-gray-900">{reservation.licensePlate}</div>
              {reservation.licensePlate2 && <div className="mt-1">{reservation.licensePlate2}</div>}
              {reservation.licensePlate3 && <div className="mt-1">{reservation.licensePlate3}</div>}
              {reservation.licensePlate4 && <div className="mt-1">{reservation.licensePlate4}</div>}
              {reservation.licensePlate5 && <div className="mt-1">{reservation.licensePlate5}</div>}
            </div>
          </div>
          <div className="flex items-center gap-3 text-base text-gray-700">
            <Users className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <span className="font-medium">{reservation.passengers} пътник(а) • {reservation.numberOfCars || 1} кола/коли</span>
          </div>
        </div>
      </div>

      {/* DATES SECTION - Single Row Layout */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-blue-700" />
          <span className="font-semibold text-blue-900 text-base">Период на резервация</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
          <div>
            <span className="text-blue-700 font-medium">Пристигане:</span>
            <div className="font-bold text-blue-900 text-lg mt-1">
              {formatDateDisplay(reservation.arrivalDate)} {reservation.arrivalTime}
            </div>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Заминаване:</span>
            <div className="font-bold text-blue-900 text-lg mt-1">
              {formatDateDisplay(reservation.departureDate)} {reservation.departureTime}
            </div>
          </div>
        </div>
      </div>

      {/* PRICE AND PAYMENT SECTION */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Euro className="h-5 w-5 text-gray-700" />
          <span className="font-semibold text-gray-900 text-base">Плащане</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900">€{reservation.finalPrice || reservation.totalPrice}</span>
          {reservation.basePrice && reservation.discountApplied && (
            <div className="text-base text-green-600 font-semibold">
              🎫 Отстъпка {reservation.discountCode}: 
              {reservation.discountApplied.discountType === 'percentage' 
                ? ` -${reservation.discountApplied.discountValue}%` 
                : ` -€${reservation.discountApplied.discountValue}`}
              {' '}(от €{Number(reservation.basePrice).toFixed(2)})
            </div>
          )}
        </div>
        {reservation.isLate && (
          <div className="mt-3 text-base text-red-600 font-semibold">
            ⚠️ Доплащане за закъснение: €{reservation.lateSurcharge || 0}
          </div>
        )}
      </div>

      {/* INVOICE SECTION */}
      {reservation.needsInvoice && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-yellow-700" />
            <span className="font-semibold text-yellow-900 text-base">Фактура заявена ✔</span>
          </div>
          <div className="space-y-2 text-base text-yellow-900">
            {reservation.companyName && (
              <div>
                <span className="font-medium">Фирма:</span> {reservation.companyName}
              </div>
            )}
            {reservation.companyOwner && (
              <div>
                <span className="font-medium">Собственик:</span> {reservation.companyOwner}
              </div>
            )}
            {reservation.taxNumber && (
              <div>
                <span className="font-medium">ЕИК:</span> {reservation.taxNumber}
              </div>
            )}
            {reservation.isVAT && reservation.vatNumber && (
              <div>
                <span className="font-medium">ДДС номер:</span> <span className="text-green-700 font-semibold">{reservation.vatNumber}</span>
              </div>
            )}
            {reservation.city && (
              <div>
                <span className="font-medium">Град:</span> {reservation.city}
              </div>
            )}
            {reservation.address && (
              <div>
                <span className="font-medium">Адрес:</span> {reservation.address}
              </div>
            )}
            {reservation.invoiceUrl && (
              <div className="mt-3 pt-3 border-t border-yellow-300">
                <a 
                  href={reservation.invoiceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-yellow-700 hover:text-yellow-900 font-medium hover:underline"
                >
                  <FileText className="h-5 w-5" />
                  Отвори фактура (PDF)
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAR KEYS NOTES SECTION */}
      {reservation.carKeysNotes && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-5 w-5 text-purple-700" />
            <span className="font-semibold text-purple-900 text-base">Бележки за ключовете</span>
          </div>
          <p className="text-base text-purple-800">{reservation.carKeysNotes}</p>
        </div>
      )}

      {/* NOTES SECTION */}
      {reservation.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="h-5 w-5 text-amber-700" />
            <span className="font-semibold text-amber-900 text-base">Бележки</span>
          </div>
          <p className="text-base text-amber-800 whitespace-pre-wrap">{reservation.notes}</p>
        </div>
      )}

      {/* LATE WARNING */}
      {reservation.isLate && (
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-5 mb-5">
          <div className="text-red-900 font-bold text-2xl uppercase mb-3">
            ⚠️ ТОЗИ КЛИЕНТ ЗАКЪСНЯВА
          </div>
          <div className="text-red-800 text-xl font-bold">
            Доплащане: €{reservation.lateSurcharge || 0}
          </div>
          {reservation.originalDepartureDate && reservation.originalDepartureTime && (
            <div className="text-red-700 text-base mt-2">
              Оригинална дата на напускане: {formatDateDisplay(reservation.originalDepartureDate)} {reservation.originalDepartureTime}
            </div>
          )}
        </div>
      )}

      {/* CAPACITY INFO */}
      {showCapacityInfo && capacityInfo && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-5">
          <div className="text-base text-gray-700 font-medium">
            Капацитет за {formatDateDisplay(reservation.arrivalDate)}: {capacityInfo.occupied}/{capacityInfo.total} ({capacityInfo.percentage}%)
            {capacityInfo.leaving > 0 && (
              <span className="text-green-600 ml-2">
                (-{capacityInfo.leaving} напускат)
              </span>
            )}
          </div>
        </div>
      )}

      {/* CANCELLATION/NO-SHOW/DECLINE REASONS */}
      {reservation.cancellationReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
          <div>
            <span className="font-semibold text-red-900">Причина за отказ:</span>
            <span className="text-red-700 ml-2">{reservation.cancellationReason}</span>
          </div>
          {reservation.cancelledBy && (
            <div className="text-sm text-red-600 mt-2">
              <span className="font-semibold">Отказана от:</span>
              <span className="ml-2">{reservation.cancelledBy}</span>
              {reservation.cancelledAt && (
                <span className="ml-2">(на {formatDateTimeDisplay(reservation.cancelledAt)})</span>
              )}
            </div>
          )}
        </div>
      )}

      {reservation.noShowReason && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-5">
          <div>
            <span className="font-semibold text-gray-900">Причина:</span>
            <span className="text-gray-700 ml-2">{reservation.noShowReason}</span>
          </div>
          {reservation.noShowBy && (
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">Маркирана като не се яви от:</span>
              <span className="ml-2">{reservation.noShowBy}</span>
              {reservation.noShowAt && (
                <span className="ml-2">(на {formatDateTimeDisplay(reservation.noShowAt)})</span>
              )}
            </div>
          )}
        </div>
      )}

      {reservation.declineReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
          <div>
            <span className="font-semibold text-red-900">Причина за отхвърляне:</span>
            <span className="text-red-700 ml-2">{reservation.declineReason}</span>
          </div>
          {reservation.declinedBy && (
            <div className="text-sm text-red-600 mt-2">
              <span className="font-semibold">Отхвърлена от:</span>
              <span className="ml-2">{reservation.declinedBy}</span>
              {reservation.declinedAt && (
                <span className="ml-2">(на {formatDateTimeDisplay(reservation.declinedAt)})</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* EDIT HISTORY */}
      {showEditHistory && reservation.editHistory && reservation.editHistory.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
          <div className="flex items-center text-base font-semibold text-blue-900 mb-3">
            <Edit className="h-5 w-5 mr-2" />
            История на промените
          </div>
          <div className="space-y-3">
            {reservation.editHistory.map((edit, index) => (
              <div key={index} className="bg-white rounded p-3 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">{edit.editor}</span>
                  <span className="text-sm text-gray-600">{formatDateTimeDisplay(edit.timestamp)}</span>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Промени:</span>
                  <div className="mt-1 ml-2">{edit.changes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TIMESTAMPS */}
      {showTimestamps && reservation.createdAt && (
        <div className="text-sm text-gray-500 pt-3 border-t space-y-1">
          <div>Създадена: {formatDateTimeDisplay(reservation.createdAt)}</div>
          {reservation.updatedAt && (
            <div>Обновена: {formatDateTimeDisplay(reservation.updatedAt)}</div>
          )}
        </div>
      )}

      {/* ACTION BUTTONS */}
      {showActions && actions && (
        <div className="mt-5 pt-5 border-t border-gray-200">
          {actions}
        </div>
      )}
    </div>
  );
}
