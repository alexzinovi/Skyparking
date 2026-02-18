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
  const carKeysText = data.carKeys 
    ? `<tr>
         <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
           <span style="color: #6b7280; font-size: 15px;">🔑 Предаване на ключове</span>
         </td>
         <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
           <span style="color: #111827; font-size: 15px; font-weight: 500;">Да</span>
         </td>
       </tr>`
    : '';

  const invoiceText = data.needsInvoice 
    ? `<tr>
         <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
           <span style="color: #6b7280; font-size: 15px;">📄 Фактура за</span>
         </td>
         <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
           <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.companyName || 'фирма'}</span>
         </td>
       </tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Потвърждение на резервация - SkyParking</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="padding: 50px 40px 40px; text-align: center; background-color: #ffffff;">
      <img src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/email.png" alt="SkyParking" style="max-width: 180px; height: auto; margin-bottom: 30px;" />
      <div style="height: 1px; background: linear-gradient(to right, transparent, rgba(5, 55, 144, 0.1), transparent); margin: 0 auto; max-width: 100%;"></div>
    </div>

    <!-- Confirmation Statement -->
    <div style="padding: 40px 40px 30px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 600; color: #053790; letter-spacing: -0.5px;">
        Резервацията ви е потвърдена
      </h1>
      <p style="margin: 0; font-size: 16px; color: #6b7280; font-weight: 400;">
        Благодарим ви, че избрахте SkyParking.
      </p>
    </div>

    <!-- Reservation Details Card -->
    <div style="padding: 0 40px 40px;">
      <div style="background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%); border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #f0f0f0;">
        
        <!-- Price Section (Prominent) -->
        <div style="text-align: center; padding: 24px; background: linear-gradient(135deg, #053790 0%, #073ea0 100%); border-radius: 10px; margin-bottom: 28px;">
          <div style="font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
            Обща цена
          </div>
          <div style="font-size: 42px; font-weight: 700; color: #f1c933; letter-spacing: -1px;">
            €${data.totalPrice}
          </div>
          <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 4px;">
            Плащане на място
          </div>
        </div>

        <!-- Reservation Details Table -->
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Номер на резервация</span>
            </td>
            <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #053790; font-size: 15px; font-weight: 600; font-family: 'Courier New', monospace;">${data.bookingId}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Дата на пристигане</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${formatDateDisplay(data.arrivalDate)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Час на пристигане</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.arrivalTime}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Дата на заминаване</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${formatDateDisplay(data.departureDate)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Час на заминаване</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.departureTime}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Име на резервация</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.name}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Брой автомобили</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.numberOfCars}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <span style="color: #6b7280; font-size: 15px;">Регистрационни номера</span>
            </td>
            <td style="padding: 12px 0; text-align: right;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.licensePlate}</span>
            </td>
          </tr>
          ${carKeysText}
          ${invoiceText}
        </table>
      </div>
    </div>

    <!-- Location Section -->
    <div style="padding: 0 40px 40px;">
      <div style="background-color: #fafafa; border-radius: 12px; padding: 28px; border: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 20px; margin-right: 8px;">📍</span>
          <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">Локация на паркинга</h2>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
          Ulitsa Nedelcho Bonchev 30
        </p>
        
        <!-- Navigation Buttons -->
        <div style="display: block;">
          <!-- Primary Button -->
          <a href="https://waze.com/ul?ll=42.6977,23.4063&navigate=yes" style="display: block; text-align: center; background-color: #053790; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(5, 55, 144, 0.15);">
            🧭 Навигация с Waze
          </a>
          <!-- Secondary Button -->
          <a href="https://www.google.com/maps/dir/?api=1&destination=42.6977,23.4063" style="display: block; text-align: center; background-color: #ffffff; color: #053790; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; border: 2px solid #053790; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
            🗺️ Навигация с Google Maps
          </a>
        </div>
      </div>
    </div>

    <!-- Helpful Information -->
    <div style="padding: 0 40px 50px;">
      <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827;">Важна информация</h2>
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 15px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Моля, пристигнете поне 10 минути по-рано.</li>
          <li style="margin-bottom: 8px;">Запазете този имейл за справка.</li>
          <li>При нужда от съдействие, свържете се с нас.</li>
        </ul>
      </div>

      <!-- Contact Details -->
      <div style="background-color: #f9fafb; border-radius: 10px; padding: 24px;">
        <div style="margin-bottom: 16px;">
          <div style="display: inline-block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 6px;">
            📞 Телефон
          </div>
          <div>
            <a href="tel:+359886616991" style="color: #053790; font-size: 16px; font-weight: 600; text-decoration: none;">
              +359 886 616 991
            </a>
          </div>
        </div>
        <div>
          <div style="display: inline-block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 6px;">
            📧 Имейл
          </div>
          <div>
            <a href="mailto:info@skyparking.bg" style="color: #053790; font-size: 16px; font-weight: 600; text-decoration: none;">
              info@skyparking.bg
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
      <div style="font-size: 16px; font-weight: 600; color: #053790; margin-bottom: 8px;">
        SkyParking
      </div>
      <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
        <a href="tel:+359886616991" style="color: #6b7280; text-decoration: none;">+359 886 616 991</a>
        <span style="margin: 0 8px; color: #d1d5db;">•</span>
        <a href="mailto:info@skyparking.bg" style="color: #6b7280; text-decoration: none;">info@skyparking.bg</a>
      </div>
      <div style="font-size: 13px; color: #9ca3af; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        Това е автоматично генериран имейл. Моля, не отговаряйте на него.
      </div>
    </div>

  </div>
</body>
</html>
  `.trim();
}

// Generate confirmation email HTML in English
function generateConfirmationEmailHTML_EN(data: BookingEmailData): string {
  const carKeysText = data.carKeys 
    ? `<tr>
         <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
           <span style="color: #6b7280; font-size: 15px;">🔑 Car Key Handover</span>
         </td>
         <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
           <span style="color: #111827; font-size: 15px; font-weight: 500;">Yes</span>
         </td>
       </tr>`
    : '';

  const invoiceText = data.needsInvoice 
    ? `<tr>
         <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
           <span style="color: #6b7280; font-size: 15px;">📄 Invoice For</span>
         </td>
         <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
           <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.companyName || 'company'}</span>
         </td>
       </tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - SkyParking</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="padding: 50px 40px 40px; text-align: center; background-color: #ffffff;">
      <img src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/email.png" alt="SkyParking" style="max-width: 180px; height: auto; margin-bottom: 30px;" />
      <div style="height: 1px; background: linear-gradient(to right, transparent, rgba(5, 55, 144, 0.1), transparent); margin: 0 auto; max-width: 100%;"></div>
    </div>

    <!-- Confirmation Statement -->
    <div style="padding: 40px 40px 30px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 600; color: #053790; letter-spacing: -0.5px;">
        Your reservation is confirmed
      </h1>
      <p style="margin: 0; font-size: 16px; color: #6b7280; font-weight: 400;">
        Thank you for choosing SkyParking.
      </p>
    </div>

    <!-- Reservation Details Card -->
    <div style="padding: 0 40px 40px;">
      <div style="background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%); border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #f0f0f0;">
        
        <!-- Price Section (Prominent) -->
        <div style="text-align: center; padding: 24px; background: linear-gradient(135deg, #053790 0%, #073ea0 100%); border-radius: 10px; margin-bottom: 28px;">
          <div style="font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
            Total Price
          </div>
          <div style="font-size: 42px; font-weight: 700; color: #f1c933; letter-spacing: -1px;">
            €${data.totalPrice}
          </div>
          <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 4px;">
            Payment on arrival
          </div>
        </div>

        <!-- Reservation Details Table -->
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Reservation Number</span>
            </td>
            <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #053790; font-size: 15px; font-weight: 600; font-family: 'Courier New', monospace;">${data.bookingId}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Arrival Date</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${formatDateDisplay(data.arrivalDate)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Arrival Time</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.arrivalTime}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Departure Date</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${formatDateDisplay(data.departureDate)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Departure Time</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.departureTime}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Reservation Name</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.name}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #6b7280; font-size: 15px;">Number of Cars</span>
            </td>
            <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.numberOfCars}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <span style="color: #6b7280; font-size: 15px;">License Plates</span>
            </td>
            <td style="padding: 12px 0; text-align: right;">
              <span style="color: #111827; font-size: 15px; font-weight: 500;">${data.licensePlate}</span>
            </td>
          </tr>
          ${carKeysText}
          ${invoiceText}
        </table>
      </div>
    </div>

    <!-- Location Section -->
    <div style="padding: 0 40px 40px;">
      <div style="background-color: #fafafa; border-radius: 12px; padding: 28px; border: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 20px; margin-right: 8px;">📍</span>
          <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">Parking Location</h2>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
          Ulitsa Nedelcho Bonchev 30
        </p>
        
        <!-- Navigation Buttons -->
        <div style="display: block;">
          <!-- Primary Button -->
          <a href="https://waze.com/ul?ll=42.6977,23.4063&navigate=yes" style="display: block; text-align: center; background-color: #053790; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(5, 55, 144, 0.15);">
            🧭 Navigate with Waze
          </a>
          <!-- Secondary Button -->
          <a href="https://www.google.com/maps/dir/?api=1&destination=42.6977,23.4063" style="display: block; text-align: center; background-color: #ffffff; color: #053790; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; border: 2px solid #053790; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
            🗺️ Navigate with Google Maps
          </a>
        </div>
      </div>
    </div>

    <!-- Helpful Information -->
    <div style="padding: 0 40px 50px;">
      <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827;">Important Information</h2>
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 15px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Please arrive at least 10 minutes early.</li>
          <li style="margin-bottom: 8px;">Please save this email for your reference.</li>
          <li>If you need assistance, please contact us.</li>
        </ul>
      </div>

      <!-- Contact Details -->
      <div style="background-color: #f9fafb; border-radius: 10px; padding: 24px;">
        <div style="margin-bottom: 16px;">
          <div style="display: inline-block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 6px;">
            📞 Phone
          </div>
          <div>
            <a href="tel:+359886616991" style="color: #053790; font-size: 16px; font-weight: 600; text-decoration: none;">
              +359 886 616 991
            </a>
          </div>
        </div>
        <div>
          <div style="display: inline-block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 6px;">
            📧 Email
          </div>
          <div>
            <a href="mailto:info@skyparking.bg" style="color: #053790; font-size: 16px; font-weight: 600; text-decoration: none;">
              info@skyparking.bg
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
      <div style="font-size: 16px; font-weight: 600; color: #053790; margin-bottom: 8px;">
        SkyParking
      </div>
      <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
        <a href="tel:+359886616991" style="color: #6b7280; text-decoration: none;">+359 886 616 991</a>
        <span style="margin: 0 8px; color: #d1d5db;">•</span>
        <a href="mailto:info@skyparking.bg" style="color: #6b7280; text-decoration: none;">info@skyparking.bg</a>
      </div>
      <div style="font-size: 13px; color: #9ca3af; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        This is an automatically generated email. Please do not reply to it.
      </div>
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

// Generate admin notification email HTML
function generateAdminNotificationEmailHTML(data: BookingEmailData): string {
  const carKeysText = data.carKeys 
    ? `<p style=\"margin: 10px 0; font-size: 16px; color: #7c3aed;\"><strong>🔑 С предаване на ключове</strong></p>`
    : '';

  const invoiceText = data.needsInvoice 
    ? `<p style=\"margin: 10px 0; font-size: 16px;\"><strong>📄 Фактура за:</strong> ${data.companyName || 'фирма'}</p>`
    : '';

  return `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Нова резервация - SkyParking</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
    
    <!-- Header -->
    <div style="background-color: #073590; padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔔 Нова резервация</h1>
      <p style="margin: 5px 0 0 0; color: #f1c933; font-size: 16px;">SkyParking Admin Notification</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      
      <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">
        Нова резервация е направена през сайта:
      </p>

      <!-- Booking Details -->
      <div style="background-color: #f9f9f9; border-left: 4px solid #073590; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #333333;">📋 Детайли на резервацията</h2>
        
        <p style="margin: 10px 0; font-size: 16px;"><strong>📌 Номер:</strong> ${data.bookingId}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #ffffff; border-radius: 4px;">
          <p style="margin: 5px 0; font-size: 16px;"><strong>📅 Пристигане:</strong> ${formatDateDisplay(data.arrivalDate)} в ${data.arrivalTime}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>📅 Заминаване:</strong> ${formatDateDisplay(data.departureDate)} в ${data.departureTime}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #f1c933; border-radius: 4px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #000000;">💶 Цена: €${data.totalPrice}</p>
        </div>
      </div>

      <!-- Customer Details -->
      <div style="background-color: #e8f4fd; border-left: 4px solid #073590; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333333;">👤 Клиент</h3>
        <p style="margin: 10px 0; font-size: 16px;"><strong>Име:</strong> ${data.name}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>📧 Email:</strong> ${data.email}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>📞 Телефон:</strong> ${data.phone}</p>
      </div>

      <!-- Vehicle Details -->
      <div style="background-color: #f0f0f0; border-left: 4px solid #f1c933; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333333;">🚗 Превозно средство</h3>
        <p style="margin: 10px 0; font-size: 16px;"><strong>Рег. номер:</strong> ${data.licensePlate}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>Брой коли:</strong> ${data.numberOfCars}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>Пътници:</strong> ${data.passengers}</p>
        ${carKeysText}
        ${invoiceText}
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://dbybybmjjeeocoecaewv.supabase.co/functions/v1/make-server-47a4914e" 
           style="display: inline-block; background-color: #073590; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
          Виж в админ панела
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #333333; color: #ffffff; padding: 20px; text-align: center; font-size: 14px;">
      <p style="margin: 0;">© 2026 SkyParking - Admin Notification System</p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

// Send admin notification email
export async function sendAdminNotificationEmail(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = 'SkyParking <reservations@skyparking.bg>';
    const adminEmail = 'reservations@skyparking.bg';
    
    const emailHTML = generateAdminNotificationEmailHTML(data);

    const subject = `🔔 Нова резервация ${data.bookingId} - €${data.totalPrice}`;

    const plainText = `
Нова резервация - SkyParking

Номер: ${data.bookingId}
Пристигане: ${formatDateDisplay(data.arrivalDate)} в ${data.arrivalTime}
Заминаване: ${formatDateDisplay(data.departureDate)} в ${data.departureTime}

КЛИЕНТ:
Име: ${data.name}
Email: ${data.email}
Телефон: ${data.phone}

ПРЕВОЗНО СРЕДСТВО:
Рег. номер: ${data.licensePlate}
Брой коли: ${data.numberOfCars}
Пътници: ${data.passengers}
${data.carKeys ? 'С предаване на ключове: ДА' : ''}
${data.needsInvoice ? `Фактура за: ${data.companyName || 'фирма'}` : ''}

Цена: €${data.totalPrice}
    `.trim();

    console.log(`Sending admin notification email to ${adminEmail} for booking ${data.bookingId}`);

    const result = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: subject,
      html: emailHTML,
      text: plainText,
    });

    console.log('Admin notification email sent successfully:', result);

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send admin notification email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send admin notification' 
    };
  }
}