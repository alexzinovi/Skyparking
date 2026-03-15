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
  Building2,
  Hash
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
      <Badge variant="outline" className={`${status.className} text-sm py-0.5 px-2 font-semibold`}>
        {status.label}
      </Badge>
    );
  };

  // Payment status badge helper
  const getPaymentStatusBadge = () => {
    if (reservation.paymentStatus === 'paid') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-sm py-0.5 px-2 font-semibold">
          <CheckCircle className="h-3 w-3 mr-1" />
          Платено
        </Badge>
      );
    } else if (reservation.paymentStatus === 'pending') {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-sm py-0.5 px-2 font-semibold">
          <Clock className="h-3 w-3 mr-1" />
          Очаква плащане
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      {/* ROW 1: Reservation ID, Customer Name, Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Reservation ID Badge */}
          {reservation.bookingCode && (
            <Badge className="bg-[#f1c933] text-[#073590] font-bold text-sm px-2 py-0.5 flex-shrink-0">
              {reservation.bookingCode}
            </Badge>
          )}
          
          {/* Customer Name */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="font-bold text-base text-gray-900 truncate">{reservation.name}</span>
          </div>
        </div>
        
        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
          {getStatusBadge()}
          {getPaymentStatusBadge()}
          
          {/* Payment Method Badge */}
          {reservation.paymentMethod && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs py-0.5 px-1.5">
              {reservation.paymentMethod === 'cash' && '💰'}
              {reservation.paymentMethod === 'card' && '💳'}
              {reservation.paymentMethod === 'pay-on-leave' && '⏰'}
            </Badge>
          )}
          
          {/* Car Keys Badge */}
          {reservation.carKeys && (
            <Badge 
              variant="outline" 
              className={`${reservation.includeInCapacity === false ? 'bg-orange-50 text-orange-700 border-orange-300' : 'bg-purple-50 text-purple-700 border-purple-300'} text-xs py-0.5 px-1.5`}
            >
              <Key className="h-3 w-3 mr-0.5" />
              {reservation.keyNumber || 'Ключове'}
              {reservation.includeInCapacity === false && ' 🚫'}
            </Badge>
          )}
          
          {/* Capacity Override Badge */}
          {reservation.capacityOverride && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs py-0.5 px-1.5">
              <AlertTriangle className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </div>

      {/* ROW 2: Contact & Vehicle */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700 mb-2">
        <div className="flex items-center gap-1">
          <Phone className="h-3.5 w-3.5 text-gray-500" />
          <span className="font-medium">{reservation.phone}</span>
        </div>
        <div className="flex items-center gap-1">
          <Mail className="h-3.5 w-3.5 text-gray-500" />
          <span className="font-medium truncate max-w-[200px]">{reservation.email}</span>
        </div>
        <div className="flex items-center gap-1">
          <Car className="h-3.5 w-3.5 text-gray-500" />
          <span className="font-bold">{reservation.licensePlate}</span>
          {reservation.licensePlate2 && <span className="text-gray-500">+{(reservation.numberOfCars || 1) - 1}</span>}
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-gray-500" />
          <span>{reservation.passengers} пътник • {reservation.numberOfCars || 1} кола</span>
        </div>
      </div>

      {/* ROW 3: Reservation Period */}
      <div className="flex items-center gap-2 text-sm mb-2 bg-blue-50 border border-blue-200 rounded px-2 py-1">
        <Calendar className="h-3.5 w-3.5 text-blue-700 flex-shrink-0" />
        <div className="flex items-center gap-1.5 font-medium text-blue-900">
          <span className="whitespace-nowrap">{formatDateDisplay(reservation.arrivalDate)} {reservation.arrivalTime}</span>
          <span className="text-blue-500">→</span>
          <span className="whitespace-nowrap">{formatDateDisplay(reservation.departureDate)} {reservation.departureTime}</span>
        </div>
      </div>

      {/* ROW 4: Payment and Invoice */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-2">
        {/* Price */}
        <div className="flex items-center gap-1">
          <Euro className="h-3.5 w-3.5 text-gray-500" />
          <span className="font-bold text-lg text-gray-900">€{reservation.finalPrice || reservation.totalPrice}</span>
          {reservation.basePrice && reservation.discountApplied && (
            <span className="text-xs text-green-600 font-semibold">
              (-{reservation.discountApplied.discountType === 'percentage' 
                ? `${reservation.discountApplied.discountValue}%` 
                : `€${reservation.discountApplied.discountValue}`})
            </span>
          )}
        </div>

        {/* Invoice Info Inline */}
        {reservation.needsInvoice && (
          <>
            <span className="text-gray-400">|</span>
            {reservation.invoiceUrl ? (
              <a 
                href={reservation.invoiceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-yellow-700 hover:text-yellow-900 font-medium hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="text-xs">Фактура ✔</span>
              </a>
            ) : (
              <div className="flex items-center gap-1 text-yellow-700">
                <FileText className="h-3.5 w-3.5" />
                <span className="text-xs">Фактура ✔</span>
              </div>
            )}
            {reservation.companyName && (
              <>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1 text-xs">
                  <Building2 className="h-3 w-3 text-gray-500" />
                  <span className="font-medium truncate max-w-[150px]">{reservation.companyName}</span>
                </div>
              </>
            )}
            {reservation.taxNumber && (
              <>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1 text-xs">
                  <Hash className="h-3 w-3 text-gray-500" />
                  <span className="font-medium">{reservation.taxNumber}</span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Additional Information Sections (Compact) */}
      {reservation.isLate && (
        <div className="bg-red-100 border border-red-400 rounded px-2 py-1 mb-2">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-700" />
            <span className="font-bold text-red-900">ЗАКЪСНЯВА</span>
            <span className="text-red-800">€{reservation.lateSurcharge || 0}</span>
          </div>
        </div>
      )}

      {reservation.carKeysNotes && (
        <div className="bg-purple-50 border border-purple-200 rounded px-2 py-1 mb-2">
          <div className="flex items-start gap-1.5 text-xs">
            <Key className="h-3.5 w-3.5 text-purple-700 flex-shrink-0 mt-0.5" />
            <span className="text-purple-800">{reservation.carKeysNotes}</span>
          </div>
        </div>
      )}

      {reservation.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
          <div className="flex items-start gap-1.5 text-xs">
            <StickyNote className="h-3.5 w-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
            <span className="text-amber-800 line-clamp-2">{reservation.notes}</span>
          </div>
        </div>
      )}

      {showCapacityInfo && capacityInfo && (
        <div className="text-xs text-gray-600 mb-2">
          Капацитет: {capacityInfo.occupied}/{capacityInfo.total} ({capacityInfo.percentage}%)
          {capacityInfo.leaving > 0 && (
            <span className="text-green-600 ml-1">(-{capacityInfo.leaving})</span>
          )}
        </div>
      )}

      {/* Cancellation/No-show/Decline Reasons (Compact) */}
      {reservation.cancellationReason && (
        <div className="bg-red-50 border border-red-200 rounded px-2 py-1 mb-2">
          <div className="text-xs text-red-700">
            <span className="font-semibold">Причина:</span> {reservation.cancellationReason}
          </div>
        </div>
      )}

      {reservation.noShowReason && (
        <div className="bg-gray-100 border border-gray-300 rounded px-2 py-1 mb-2">
          <div className="text-xs text-gray-700">
            <span className="font-semibold">Причина:</span> {reservation.noShowReason}
          </div>
        </div>
      )}

      {reservation.declineReason && (
        <div className="bg-red-50 border border-red-200 rounded px-2 py-1 mb-2">
          <div className="text-xs text-red-700">
            <span className="font-semibold">Отхвърлена:</span> {reservation.declineReason}
          </div>
        </div>
      )}

      {/* Edit History (Compact) */}
      {showEditHistory && reservation.editHistory && reservation.editHistory.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 mb-2">
          <div className="text-xs text-blue-900">
            <span className="font-semibold">История:</span> {reservation.editHistory.length} промени
          </div>
        </div>
      )}

      {/* Timestamps (Compact) */}
      {showTimestamps && reservation.createdAt && (
        <div className="text-xs text-gray-500 mb-2">
          Създадена: {formatDateTimeDisplay(reservation.createdAt)}
        </div>
      )}

      {/* ROW 5: Actions */}
      {showActions && actions && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
          {actions}
        </div>
      )}

      {/* Additional License Plates (Expandable Info) */}
      {(reservation.licensePlate2 || reservation.licensePlate3 || reservation.licensePlate4 || reservation.licensePlate5) && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-600 space-y-0.5">
            {reservation.licensePlate2 && <div>🚗 {reservation.licensePlate2}</div>}
            {reservation.licensePlate3 && <div>🚗 {reservation.licensePlate3}</div>}
            {reservation.licensePlate4 && <div>🚗 {reservation.licensePlate4}</div>}
            {reservation.licensePlate5 && <div>🚗 {reservation.licensePlate5}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
