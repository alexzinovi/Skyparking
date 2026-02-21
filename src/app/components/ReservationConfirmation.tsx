import { CheckCircle, Calendar, Clock, User, Car, Phone, Euro, Bus, Printer, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useLanguage } from "./LanguageContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef, useEffect } from "react";
import { eurToBgn } from "../utils/currency";

interface ReservationConfirmationProps {
  booking: {
    bookingCode: string;
    name: string;
    phone: string;
    email: string;
    arrivalDate: string;
    arrivalTime: string;
    departureDate: string;
    departureTime: string;
    numberOfCars: number;
    licensePlate: string;
    licensePlate2?: string;
    licensePlate3?: string;
    licensePlate4?: string;
    licensePlate5?: string;
    passengers: number;
    totalPrice: number;
  };
  onBackToHome: () => void;
}

export function ReservationConfirmation({ booking, onBackToHome }: ReservationConfirmationProps) {
  const { t, language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top of this component when it mounts
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('reservation-card');
    if (element) {
      try {
        // Show loading state
        const originalText = element.querySelector('button')?.textContent;
        
        // Capture the element as a canvas with better options
        const canvas = await html2canvas(element, {
          scale: 2, // Higher quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          foreignObjectRendering: false,
          imageTimeout: 0,
          removeContainer: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF with simpler approach - just add the image
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4'
        });
        
        // Get page dimensions
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate image dimensions to fit page with margins
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        
        const scaledWidth = imgWidth * ratio;
        const scaledHeight = imgHeight * ratio;
        
        // Center the image
        const x = (pageWidth - scaledWidth) / 2;
        const y = margin;
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight, undefined, 'FAST');
        
        // Save with reservation number in filename
        pdf.save(`SkyParking-Reservation-${booking.bookingCode}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert(language === 'bg' 
          ? 'Грешка при генериране на PDF. Моля, опитайте отново.' 
          : 'Failed to generate PDF. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const licensePlates = [
    booking.licensePlate,
    booking.licensePlate2,
    booking.licensePlate3,
    booking.licensePlate4,
    booking.licensePlate5
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-32 pb-12 px-4" ref={containerRef}>{/* Added pt-24 md:pt-32 for header clearance */}
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {language === 'bg' ? 'Резервацията е получена!' : 'Reservation Received!'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'bg' 
              ? 'Благодарим ви за резервацията! Наш представител ще се свърже с вас възможно най-скоро за потвърждение.'
              : 'Thank you for your reservation! A representative will reach out to you as soon as possible for confirmation.'}
          </p>
        </div>

        {/* Reservation Card */}
        <Card className="p-8 mb-6 print:shadow-none bg-white" id="reservation-card" style={{ backgroundColor: '#ffffff' }}>
          <div className="space-y-6">
            {/* Reservation Number */}
            <div style={{ backgroundColor: '#073590', color: '#ffffff' }} className="p-4 rounded-lg text-center">
              <p className="text-sm font-medium mb-1">
                {language === 'bg' ? 'НОМЕР НА РЕЗЕРВАЦИЯ' : 'RESERVATION NUMBER'}
              </p>
              <p className="text-3xl font-bold tracking-wider">{booking.bookingCode}</p>
            </div>

            {/* Dates and Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2" style={{ color: '#111827' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#073590' }} />
                  {language === 'bg' ? 'Пристигане' : 'Arrival'}
                </h3>
                <div style={{ backgroundColor: '#f9fafb' }} className="p-4 rounded-lg">
                  <p className="text-lg font-medium" style={{ color: '#111827' }}>{formatDate(booking.arrivalDate)}</p>
                  <p className="flex items-center gap-2 mt-1" style={{ color: '#4b5563' }}>
                    <Clock className="w-4 h-4" />
                    {booking.arrivalTime}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2" style={{ color: '#111827' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#073590' }} />
                  {language === 'bg' ? 'Заминаване' : 'Departure'}
                </h3>
                <div style={{ backgroundColor: '#f9fafb' }} className="p-4 rounded-lg">
                  <p className="text-lg font-medium" style={{ color: '#111827' }}>{formatDate(booking.departureDate)}</p>
                  <p className="flex items-center gap-2 mt-1" style={{ color: '#4b5563' }}>
                    <Clock className="w-4 h-4" />
                    {booking.departureTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #e5e7eb' }}></div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg" style={{ color: '#111827' }}>
                {language === 'bg' ? 'Данни за клиента' : 'Customer Details'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 mt-1" style={{ color: '#073590' }} />
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>{language === 'bg' ? 'Име' : 'Name'}</p>
                    <p className="font-medium" style={{ color: '#111827' }}>{booking.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-1" style={{ color: '#073590' }} />
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>{language === 'bg' ? 'Телефон' : 'Phone'}</p>
                    <p className="font-medium" style={{ color: '#111827' }}>{booking.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: '#111827' }}>
                <Car className="w-5 h-5" style={{ color: '#073590' }} />
                {language === 'bg' ? 'Информация за превозните средства' : 'Vehicle Information'}
              </h3>
              
              <div style={{ backgroundColor: '#f9fafb' }} className="p-4 rounded-lg">
                <p className="text-sm mb-2" style={{ color: '#4b5563' }}>
                  {language === 'bg' ? 'Регистрационни номера' : 'License Plates'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {licensePlates.map((plate, index) => (
                    <span key={index} style={{ backgroundColor: '#ffffff', border: '2px solid #d1d5db', color: '#111827' }} className="px-4 py-2 rounded font-mono font-bold">
                      {plate}
                    </span>
                  ))}
                </div>
                <p className="text-sm mt-3" style={{ color: '#4b5563' }}>
                  {booking.numberOfCars} {booking.numberOfCars === 1 ? (language === 'bg' ? 'автомобил' : 'car') : (language === 'bg' ? 'автомобила' : 'cars')} • {booking.passengers} {booking.passengers === 1 ? (language === 'bg' ? 'пътник' : 'passenger') : (language === 'bg' ? 'пътника' : 'passengers')}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #e5e7eb' }}></div>

            {/* Price */}
            <div style={{ backgroundColor: '#073590', color: '#ffffff' }} className="p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ opacity: 0.9 }}>
                    {language === 'bg' ? 'ОБЩА ЦЕНА' : 'TOTAL PRICE'}
                  </p>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold flex items-center gap-2">
                      <Euro className="w-8 h-8" />
                      {booking.totalPrice}
                    </p>
                    <p className="text-2xl font-semibold" style={{ opacity: 0.95 }}>
                      {eurToBgn(booking.totalPrice).toFixed(2)} лв
                    </p>
                  </div>
                  {booking.numberOfCars > 1 && (
                    <p className="text-sm mt-2" style={{ opacity: 0.9 }}>
                      €{(booking.totalPrice / booking.numberOfCars).toFixed(2)} ({eurToBgn(booking.totalPrice / booking.numberOfCars).toFixed(2)} лв) {language === 'bg' ? 'на автомобил' : 'per car'}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm" style={{ opacity: 0.9 }}>
                    {language === 'bg' ? 'Плащане на място' : 'Pay on arrival'}
                  </p>
                </div>
              </div>
            </div>

            {/* Free Shuttle Service Notice */}
            <div style={{ backgroundColor: '#f1c933' }} className="p-4 rounded-lg flex items-start gap-3">
              <Bus className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#073590' }} />
              <div>
                <p className="font-semibold mb-1" style={{ color: '#073590' }}>
                  {language === 'bg' ? 'Безплатен трансфер до летище София' : 'Free Shuttle Service to Sofia Airport'}
                </p>
                <p className="text-sm" style={{ color: '#374151' }}>
                  {language === 'bg' 
                    ? 'Включен безплатен трансфер от паркинга до терминала и обратно при пристигане и заминаване.'
                    : 'Free transfer from parking to terminal and back included on arrival and departure.'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
          <Button
            onClick={handleDownloadPDF}
            size="lg"
            className="flex-1 h-14 text-base font-semibold bg-[#073590] hover:bg-[#073590]/90 text-white transition-colors"
          >
            <Printer className="w-5 h-5 mr-2" />
            {language === 'bg' ? 'Свалете PDF' : 'Download PDF'}
          </Button>
          
          <Button
            onClick={onBackToHome}
            size="lg"
            className="flex-1 h-14 text-base font-semibold bg-[#f1c933] hover:bg-[#f5d54a] text-[#073590] transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            {language === 'bg' ? 'Обратно към начална страница' : 'Back to Home'}
          </Button>
        </div>
      </div>
    </div>
  );
}