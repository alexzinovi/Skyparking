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
  
  // Status badge helper with strong color signals
  const getStatusBadge = () => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'new': { label: '🆕 Нова', className: 'bg-yellow-100 text-yellow-800 border-yellow-400' },
      'confirmed': { label: '✅ Потвърдена', className: 'bg-blue-100 text-blue-800 border-blue-400' },
      'arrived': { label: '🚗 Пристигнала', className: 'bg-green-100 text-green-800 border-green-400' },
      'checked-out': { label: '✔️ Приключена', className: 'bg-gray-100 text-gray-800 border-gray-300' },
      'cancelled': { label: '❌ Отказана', className: 'bg-red-100 text-red-800 border-red-400' },
      'declined': { label: '⛔ Отхвърлена', className: 'bg-red-100 text-red-800 border-red-400' },
      'no-show': { label: '⭕ Не се яви', className: 'bg-red-100 text-red-800 border-red-400' },
    };

    const status = statusMap[reservation.status] || { label: reservation.status, className: 'bg-gray-100 text-gray-800 border-gray-300' };
    
    return (
      <Badge variant="outline" className={`${status.className} text-sm py-1 px-3 font-bold flex-shrink-0 border-2`}>
        {status.label}
      </Badge>
    );
  };

  // Payment status badge helper with strong color signals
  const getPaymentStatusBadge = () => {
    if (reservation.paymentStatus === 'paid') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400 text-sm py-1 px-3 font-bold flex-shrink-0 border-2">
          <CheckCircle className="h-4 w-4 mr-1" />
          Платено
        </Badge>
      );
    } else if (reservation.paymentStatus === 'pending') {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-400 text-sm py-1 px-3 font-bold flex-shrink-0 border-2">
          <Clock className="h-4 w-4 mr-1" />
          Очаква плащане
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow w-full">
      {/* ROW 1: Booking ID & Status Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {reservation.bookingCode && (
          <Badge className="bg-[#f1c933] text-[#073590] font-bold text-base py-1.5 px-3 flex-shrink-0 border-2 border-[#073590]">
            {reservation.bookingCode}
          </Badge>
        )}
        
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {getStatusBadge()}
          {getPaymentStatusBadge()}
        </div>
      </div>

      {/* ROW 2: LICENSE PLATE - LARGEST, MOST PROMINENT */}
      <div className="mb-3 bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Car className="h-8 w-8 text-gray-700 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-black text-3xl text-gray-900 tracking-wide">
              {reservation.licensePlate}
            </div>
            {reservation.licensePlate2 && (
              <div className="text-sm text-gray-600 mt-1">
                +{(reservation.numberOfCars || 1) - 1} допълнителни коли
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: ARRIVAL TIME - VERY LARGE */}
      <div className="mb-3 bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-7 w-7 text-blue-700 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs text-blue-600 font-semibold mb-1">ПРИСТИГА</div>
            <div className="font-bold text-2xl text-blue-900">
              {formatDateDisplay(reservation.arrivalDate)} {reservation.arrivalTime}
            </div>
            <div className="text-xs text-blue-700 mt-1 flex items-center gap-1">
              <span>→ Напуска:</span>
              <span className="font-semibold">{formatDateDisplay(reservation.departureDate)} {reservation.departureTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: CUSTOMER NAME - LARGE */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-gray-600 flex-shrink-0" />
          <span className="font-bold text-xl text-gray-900">{reservation.name}</span>
        </div>
      </div>

      {/* ROW 5: CONTACT INFO - SMALLER */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2 text-base">
          <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <a href={`tel:${reservation.phone}`} className="font-semibold text-blue-600 underline">
            {reservation.phone}
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-700 truncate">{reservation.email}</span>
        </div>
      </div>

      {/* ROW 6: PASSENGERS & PRICE */}
      <div className="flex items-center justify-between mb-3 bg-gray-50 border border-gray-200 rounded-lg p-2">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-gray-700">{reservation.passengers} пътник • {reservation.numberOfCars || 1} кола</span>
        </div>
        <div className="flex items-center gap-1">
          <Euro className="h-5 w-5 text-gray-600" />
          <span className="font-bold text-xl text-gray-900">€{reservation.finalPrice || reservation.totalPrice}</span>
        </div>
      </div>

      {/* LATE WARNING - PROMINENT */}
      {reservation.isLate && (
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-700 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-black text-lg text-red-900">ЗАКЪСНЯВА</div>
              <div className="text-red-800 font-semibold">Доплащане: €{reservation.lateSurcharge || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* NOTES - PROMINENT IF EXISTS */}
      {reservation.notes && (
        <div className="bg-amber-100 border-2 border-amber-400 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <StickyNote className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-amber-700 font-bold mb-1">БЕЛЕЖКА</div>
              <div className="text-sm text-amber-900 font-medium">{reservation.notes}</div>
            </div>
          </div>
        </div>
      )}

      {/* CAR KEYS */}
      {reservation.carKeys && (
        <div className="bg-purple-100 border-2 border-purple-400 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-purple-700 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-sm text-purple-900">
                Ключове: {reservation.keyNumber || 'Да'}
                {reservation.includeInCapacity === false && ' (Не включено в капацитета)'}
              </div>
              {reservation.carKeysNotes && (
                <div className="text-xs text-purple-800 mt-1">{reservation.carKeysNotes}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INVOICE INFO */}
      {reservation.needsInvoice && (
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <FileText className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="font-bold text-sm text-yellow-900">
                {reservation.invoiceUrl ? (
                  <a 
                    href={reservation.invoiceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Фактура ✔
                  </a>
                ) : (
                  'Фактура изисквана'
                )}
              </div>
              {reservation.companyName && (
                <div className="text-xs text-yellow-800">{reservation.companyName}</div>
              )}
              {reservation.taxNumber && (
                <div className="text-xs text-yellow-800">{reservation.taxNumber}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CAPACITY INFO - SMALL */}
      {showCapacityInfo && capacityInfo && (
        <div className="text-xs text-gray-500 mb-3">
          Капацитет: {capacityInfo.occupied}/{capacityInfo.total} ({capacityInfo.percentage}%)
          {capacityInfo.leaving > 0 && (
            <span className="text-green-600 ml-1">(-{capacityInfo.leaving})</span>
          )}
        </div>
      )}

      {/* CANCELLATION/DECLINE/NO-SHOW REASONS */}
      {reservation.cancellationReason && (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 mb-3">
          <div className="text-sm text-red-800">
            <span className="font-bold">Причина за отказ:</span> {reservation.cancellationReason}
          </div>
        </div>
      )}

      {reservation.noShowReason && (
        <div className="bg-gray-200 border-2 border-gray-400 rounded-lg p-3 mb-3">
          <div className="text-sm text-gray-800">
            <span className="font-bold">Причина:</span> {reservation.noShowReason}
          </div>
        </div>
      )}

      {reservation.declineReason && (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 mb-3">
          <div className="text-sm text-red-800">
            <span className="font-bold">Отхвърлена:</span> {reservation.declineReason}
          </div>
        </div>
      )}

      {/* TIMESTAMPS */}
      {showTimestamps && reservation.createdAt && (
        <div className="text-xs text-gray-500 mb-2">
          Създадена: {formatDateTimeDisplay(reservation.createdAt)}
        </div>
      )}

      {/* ADDITIONAL LICENSE PLATES */}
      {(reservation.licensePlate2 || reservation.licensePlate3 || reservation.licensePlate4 || reservation.licensePlate5) && (
        <div className="mb-3 bg-gray-100 border border-gray-300 rounded-lg p-2">
          <div className="text-xs font-bold text-gray-700 mb-1">Допълнителни номера:</div>
          <div className="space-y-1">
            {reservation.licensePlate2 && <div className="font-bold text-base">🚗 {reservation.licensePlate2}</div>}
            {reservation.licensePlate3 && <div className="font-bold text-base">🚗 {reservation.licensePlate3}</div>}
            {reservation.licensePlate4 && <div className="font-bold text-base">🚗 {reservation.licensePlate4}</div>}
            {reservation.licensePlate5 && <div className="font-bold text-base">🚗 {reservation.licensePlate5}</div>}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS - LARGE TOUCH TARGETS */}
      {showActions && actions && (
        <div className="pt-3 border-t-2 border-gray-200">
          {actions}
        </div>
      )}
    </div>
  );
}
