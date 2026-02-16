import { Resend } from 'npm:resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface BookingEmailData {
  name: string;
  email: string;
  phone: string;
  licensePlate: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  numberOfCars: number;
  passengers: number;
  totalPrice: number;
  bookingId: string; // This will now be the bookingCode (e.g., SP-12345678)
  parkingSpots?: number[];
  carKeys?: boolean;
  needsInvoice?: boolean;
  companyName?: string;
  language?: 'bg' | 'en'; // Add language support
}

// Format date from YYYY-MM-DD to DD/MM/YYYY
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

// Generate confirmation email HTML in Bulgarian
function generateConfirmationEmailHTML_BG(data: BookingEmailData): string {
  const parkingSpotsText = data.parkingSpots && data.parkingSpots.length > 0 
    ? `<p style="margin: 10px 0; font-size: 16px;"><strong>🅿️ Паркинг места:</strong> ${data.parkingSpots.join(', ')}</p>`
    : '';

  const carKeysText = data.carKeys 
    ? `<p style="margin: 10px 0; font-size: 16px; color: #7c3aed;"><strong>🔑 С предаване на ключове</strong></p>`
    : '';

  const invoiceText = data.needsInvoice 
    ? `<p style="margin: 10px 0; font-size: 16px;"><strong>📄 Фактура за:</strong> ${data.companyName || 'фирма'}</p>`
    : '';

  return `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Потвърждение на резервация - SkyParking</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
    
    <!-- Header -->
    <div style="background-color: #f1c933; padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: bold;">✅ SkyParking</h1>
      <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">Вашата резервация е потвърдена!</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      
      <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">
        Здравейте <strong>${data.name}</strong>,
      </p>

      <p style="font-size: 16px; color: #555555; line-height: 1.6;">
        Вашата резервация за паркинг при летище София е потвърдена. Очакваме Ви!
      </p>

      <!-- Booking Details -->
      <div style="background-color: #f9f9f9; border-left: 4px solid #f1c933; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #333333;">📋 Детайли на резервацията</h2>
        
        <p style="margin: 10px 0; font-size: 16px;"><strong>📌 Номер на резервация:</strong> ${data.bookingId}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #ffffff; border-radius: 4px;">
          <p style="margin: 5px 0; font-size: 16px;"><strong>📅 Пристигане:</strong> ${formatDateDisplay(data.arrivalDate)} в ${data.arrivalTime}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>📅 Заминаване:</strong> ${formatDateDisplay(data.departureDate)} в ${data.departureTime}</p>
        </div>

        <p style="margin: 10px 0; font-size: 16px;"><strong>🚗 Рег. номер:</strong> ${data.licensePlate}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>🚙 Брой коли:</strong> ${data.numberOfCars}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>👥 Пътници:</strong> ${data.passengers}</p>
        ${parkingSpotsText}
        ${carKeysText}
        ${invoiceText}
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f1c933; border-radius: 4px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #000000;">💶 Цена: €${data.totalPrice}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #333333;">Плащане на място</p>
        </div>
      </div>

      <!-- Important Info -->
      <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #856404;">⚠️ Важна информация</h3>
        <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.8;">
          <li>Запазете този имейл за вашата референция</li>
          <li>Моля, пристигнете на посочения час</li>
          <li>Плащането се извършва на място при пристигане</li>
          <li>При въпроси се свържете с нас</li>
        </ul>
      </div>

      <!-- Contact -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
        <p style="font-size: 16px; color: #555555;">
          Благодарим Ви, че избрахте SkyParking!
        </p>
        <p style="font-size: 14px; color: #777777; margin-top: 15px;">
          При въпроси или промени, моля свържете се с нас:<br>
          📞 Телефон: ${data.phone}<br>
          📧 Email: bookings@skyparking.bg
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #333333; color: #ffffff; padding: 20px; text-align: center; font-size: 14px;">
      <p style="margin: 0;">© 2026 SkyParking - Паркинг до летище София</p>
      <p style="margin: 10px 0 0 0; color: #cccccc;">Безопасен и удобен паркинг на достъпна цена</p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

// Generate confirmation email HTML in English
function generateConfirmationEmailHTML_EN(data: BookingEmailData): string {
  const parkingSpotsText = data.parkingSpots && data.parkingSpots.length > 0 
    ? `<p style="margin: 10px 0; font-size: 16px;"><strong>🅿️ Parking Spots:</strong> ${data.parkingSpots.join(', ')}</p>`
    : '';

  const carKeysText = data.carKeys 
    ? `<p style="margin: 10px 0; font-size: 16px; color: #7c3aed;"><strong>🔑 With car key handover</strong></p>`
    : '';

  const invoiceText = data.needsInvoice 
    ? `<p style="margin: 10px 0; font-size: 16px;"><strong>📄 Invoice for:</strong> ${data.companyName || 'company'}</p>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - SkyParking</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
    
    <!-- Header -->
    <div style="background-color: #f1c933; padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: bold;">✅ SkyParking</h1>
      <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">Your reservation is confirmed!</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      
      <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">
        Hello <strong>${data.name}</strong>,
      </p>

      <p style="font-size: 16px; color: #555555; line-height: 1.6;">
        Your parking reservation near Sofia Airport is confirmed. We look forward to seeing you!
      </p>

      <!-- Booking Details -->
      <div style="background-color: #f9f9f9; border-left: 4px solid #f1c933; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #333333;">📋 Booking Details</h2>
        
        <p style="margin: 10px 0; font-size: 16px;"><strong>📌 Booking Number:</strong> ${data.bookingId}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #ffffff; border-radius: 4px;">
          <p style="margin: 5px 0; font-size: 16px;"><strong>📅 Arrival:</strong> ${formatDateDisplay(data.arrivalDate)} at ${data.arrivalTime}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>📅 Departure:</strong> ${formatDateDisplay(data.departureDate)} at ${data.departureTime}</p>
        </div>

        <p style="margin: 10px 0; font-size: 16px;"><strong>🚗 License Plate:</strong> ${data.licensePlate}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>🚙 Number of Cars:</strong> ${data.numberOfCars}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>👥 Passengers:</strong> ${data.passengers}</p>
        ${parkingSpotsText}
        ${carKeysText}
        ${invoiceText}
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f1c933; border-radius: 4px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #000000;">💶 Price: €${data.totalPrice}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #333333;">Payment on arrival</p>
        </div>
      </div>

      <!-- Important Info -->
      <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #856404;">⚠️ Important Information</h3>
        <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.8;">
          <li>Please save this email for your reference</li>
          <li>Please arrive at the specified time</li>
          <li>Payment is made on-site upon arrival</li>
          <li>For questions, please contact us</li>
        </ul>
      </div>

      <!-- Contact -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
        <p style="font-size: 16px; color: #555555;">
          Thank you for choosing SkyParking!
        </p>
        <p style="font-size: 14px; color: #777777; margin-top: 15px;">
          For questions or changes, please contact us:<br>
          📞 Phone: ${data.phone}<br>
          📧 Email: bookings@skyparking.bg
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #333333; color: #ffffff; padding: 20px; text-align: center; font-size: 14px;">
      <p style="margin: 0;">© 2026 SkyParking - Parking near Sofia Airport</p>
      <p style="margin: 10px 0 0 0; color: #cccccc;">Safe and convenient parking at an affordable price</p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

// Send confirmation email
export async function sendConfirmationEmail(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    // Use reservations@skyparking.bg as the FROM email
    const fromEmail = 'SkyParking <reservations@skyparking.bg>';

    // Determine language (default to Bulgarian)
    const language = data.language || 'bg';
    
    // Generate appropriate email template
    const emailHTML = language === 'en' 
      ? generateConfirmationEmailHTML_EN(data) 
      : generateConfirmationEmailHTML_BG(data);

    // Subject line based on language
    const subject = language === 'en'
      ? `✅ Booking Confirmation ${data.bookingId} - SkyParking`
      : `✅ Потвърждение на резервация ${data.bookingId} - SkyParking`;

    // Plain text version based on language
    const textBG = `
Здравейте ${data.name},

Вашата резервация за паркинг при летище София е потвърдена!

Номер на резервация: ${data.bookingId}
Пристигане: ${formatDateDisplay(data.arrivalDate)} в ${data.arrivalTime}
Заминаване: ${formatDateDisplay(data.departureDate)} в ${data.departureTime}
Рег. номер: ${data.licensePlate}
Брой коли: ${data.numberOfCars}
Пътници: ${data.passengers}
Цена: €${data.totalPrice}

Плащане на място при пристигане.

Благодарим Ви, че избрахте SkyParking!

За въпроси: ${data.phone}
Email: bookings@skyparking.bg
    `.trim();

    const textEN = `
Hello ${data.name},

Your parking reservation near Sofia Airport is confirmed!

Booking Number: ${data.bookingId}
Arrival: ${formatDateDisplay(data.arrivalDate)} at ${data.arrivalTime}
Departure: ${formatDateDisplay(data.departureDate)} at ${data.departureTime}
License Plate: ${data.licensePlate}
Number of Cars: ${data.numberOfCars}
Passengers: ${data.passengers}
Price: €${data.totalPrice}

Payment on arrival.

Thank you for choosing SkyParking!

For questions: ${data.phone}
Email: bookings@skyparking.bg
    `.trim();

    const plainText = language === 'en' ? textEN : textBG;

    console.log(`Sending ${language.toUpperCase()} confirmation email to ${data.email} for booking ${data.bookingId}`);

    const result = await resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject: subject,
      html: emailHTML,
      text: plainText,
    });

    console.log('Email sent successfully:', result);

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send confirmation email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email' 
    };
  }
}