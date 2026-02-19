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
  companyEIK?: string;
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
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">🔑 Предаване на ключове</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">Да</span>
         </td>
       </tr>`
    : '';

  const invoiceText = data.needsInvoice 
    ? `<tr>
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">📄 Фактура за</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.companyName || 'фирма'}</span>
         </td>
       </tr>
       ${data.companyEIK ? `<tr>
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">🏢 ЕИК</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.companyEIK}</span>
         </td>
       </tr>` : ''}`
    : '';

  return `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Потвърждение на резервация - SkyParking - Паркинг Летище София</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    @media only screen and (max-width: 600px) {
      .mobile-padding { padding: 20px !important; }
      .mobile-text-large { font-size: 32px !important; }
      .nav-button-container { max-width: 100% !important; }
      .email-header { padding: 30px 20px !important; }
      .header-logo { max-width: 220px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header - Compact with Solid Brand Blue -->
    <div class="email-header" style="background-color: #053790; padding: 18px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
      <img class="header-logo" src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/email_header.png" alt="SkyParking" style="max-width: 160px; height: auto; display: inline-block;" />
    </div>

    <!-- Confirmation Statement -->
    <div style="padding: 32px 20px 24px; text-align: center; background-color: #ffffff;">
      <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #053790; letter-spacing: -0.3px;">
        Резервацията ви е потвърдена
      </h1>
      <p style="margin: 0; font-size: 15px; color: #6b7280; font-weight: 400; line-height: 1.5;">
        Благодарим ви, че избрахте SkyParking.
      </p>
    </div>

    <!-- Reservation Details Card -->
    <div class="mobile-padding" style="padding: 0 20px 32px;">
      <div style="background-color: #fafafa; border-radius: 12px; padding: 0; border: 1px solid #e5e7eb; overflow: hidden;">
        
        <!-- Price Row with Free Transfer -->
        <div style="background-color: #ffffff; padding: 24px 24px 20px; border-bottom: 2px solid #f1c933;">
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #9ca3af; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
              Обща цена
            </div>
            <div class="mobile-text-large" style="font-size: 36px; font-weight: 700; color: #f1c933; letter-spacing: -1px; line-height: 1; margin-bottom: 8px;">
              €${data.totalPrice}
            </div>
            <div style="font-size: 14px; color: #d4a929; font-weight: 500;">
              Безплатен трансфер
            </div>
          </div>
        </div>

        <!-- Reservation Details Table -->
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Номер на резервация</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #053790; font-size: 14px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 0.5px;">${data.bookingId}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Дата на пристигане</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${formatDateDisplay(data.arrivalDate)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Час на пристигане</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.arrivalTime}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Дата на заминаване</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${formatDateDisplay(data.departureDate)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Час на заминаване</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.departureTime}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Име на резервация</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Брой автомобили</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.numberOfCars}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Регистрационни номера</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.licensePlate}</span>
              </td>
            </tr>
            ${carKeysText}
            ${invoiceText}
          </table>
          
          <!-- Payment Note -->
          <div style="margin-top: 16px; text-align: center;">
            <span style="font-size: 13px; color: #9ca3af; font-style: italic;">Плащане на място</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Location Section -->
    <div class="mobile-padding" style="padding: 0 20px 28px;">
      <div style="background-color: #fafafa; border-radius: 10px; padding: 24px 20px; border: 1px solid #e5e7eb;">
        <div style="margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
            📍 Локация на паркинга
          </h2>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
          Ulitsa Nedelcho Bonchev 30
        </p>
        
        <!-- Navigation Buttons - Centered, Not Full Width -->
        <div style="text-align: center;">
          <div class="nav-button-container" style="display: inline-block; max-width: 340px; width: 100%;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom: 12px;">
                  <a href="https://ul.waze.com/ul?ll=42.67683570,23.40003810&navigate=yes" style="display: block; text-align: center; background-color: #053790; color: #ffffff; padding: 14px 20px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; height: 48px; line-height: 20px; box-sizing: border-box;">
                    <img src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/waze-icon.png" alt="Waze" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" />
                    Навигация с Waze
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <a href="https://www.google.com/maps?q=42.6768423,23.4002030&entry=gps" style="display: block; text-align: center; background-color: #ffffff; color: #053790; padding: 14px 20px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; border: 2px solid #053790; height: 48px; line-height: 20px; box-sizing: border-box;">
                    <img src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/google-map-icon.png" alt="Google Maps" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" />
                    Навигация с Google Maps
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Important Information -->
    <div class="mobile-padding" style="padding: 0 20px 28px;">
      <h2 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 600; color: #111827;">Важна информация</h2>
      <div style="background-color: #fffbeb; border-left: 3px solid #f59e0b; padding: 16px 18px; border-radius: 8px; margin-bottom: 20px;">
        <ul style="margin: 0; padding-left: 18px; color: #92400e; font-size: 14px; line-height: 1.7;">
          <li style="margin-bottom: 6px;">Моля, пристигнете поне 10 минути по-рано.</li>
          <li style="margin-bottom: 6px;">Запазете този имейл за справка.</li>
          <li>При нужда от съдействие, свържете се с нас.</li>
        </ul>
      </div>

      <!-- Contact Details -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 18px;">
        <div style="margin-bottom: 14px;">
          <div style="color: #6b7280; font-size: 12px; font-weight: 500; margin-bottom: 4px;">
            📞 Телефон
          </div>
          <div>
            <a href="tel:+359886616991" style="color: #053790; font-size: 15px; font-weight: 600; text-decoration: none;">
              +359 886 616 991
            </a>
          </div>
        </div>
        <div>
          <div style="color: #6b7280; font-size: 12px; font-weight: 500; margin-bottom: 4px;">
            📧 Имейл
          </div>
          <div>
            <a href="mailto:info@skyparking.bg" style="color: #053790; font-size: 15px; font-weight: 600; text-decoration: none;">
              info@skyparking.bg
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer - Restored -->
    <div style="background-color: #f3f4f6; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <div style="font-size: 15px; font-weight: 600; color: #053790; margin-bottom: 8px;">
        SkyParking
      </div>
      <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
        <a href="tel:+359886616991" style="color: #6b7280; text-decoration: none;">+359 886 616 991</a>
        <span style="margin: 0 6px; color: #d1d5db;">•</span>
        <a href="mailto:info@skyparking.bg" style="color: #6b7280; text-decoration: none;">info@skyparking.bg</a>
      </div>
      <div style="font-size: 12px; color: #9ca3af; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
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
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">🔑 Car Key Handover</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">Yes</span>
         </td>
       </tr>`
    : '';

  const invoiceText = data.needsInvoice 
    ? `<tr>
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">📄 Invoice For</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.companyName || 'company'}</span>
         </td>
       </tr>
       ${data.companyEIK ? `<tr>
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">🏢 EIK</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.companyEIK}</span>
         </td>
       </tr>` : ''}`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - SkyParking - Sofia Airport Parking</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    @media only screen and (max-width: 600px) {
      .mobile-padding { padding: 20px !important; }
      .mobile-text-large { font-size: 32px !important; }
      .nav-button-container { max-width: 100% !important; }
      .email-header { padding: 30px 20px !important; }
      .header-logo { max-width: 220px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header - Compact with Solid Brand Blue -->
    <div class="email-header" style="background-color: #053790; padding: 18px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
      <img class="header-logo" src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/email_header.png" alt="SkyParking" style="max-width: 160px; height: auto; display: inline-block;" />
    </div>

    <!-- Confirmation Statement -->
    <div style="padding: 32px 20px 24px; text-align: center; background-color: #ffffff;">
      <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #053790; letter-spacing: -0.3px;">
        Your reservation is confirmed
      </h1>
      <p style="margin: 0; font-size: 15px; color: #6b7280; font-weight: 400; line-height: 1.5;">
        Thank you for choosing SkyParking.
      </p>
    </div>

    <!-- Reservation Details Card -->
    <div class="mobile-padding" style="padding: 0 20px 32px;">
      <div style="background-color: #fafafa; border-radius: 12px; padding: 0; border: 1px solid #e5e7eb; overflow: hidden;">
        
        <!-- Price Row with Free Transfer -->
        <div style="background-color: #ffffff; padding: 24px 24px 20px; border-bottom: 2px solid #f1c933;">
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #9ca3af; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
              Total Price
            </div>
            <div class="mobile-text-large" style="font-size: 36px; font-weight: 700; color: #f1c933; letter-spacing: -1px; line-height: 1; margin-bottom: 8px;">
              €${data.totalPrice}
            </div>
            <div style="font-size: 14px; color: #d4a929; font-weight: 500;">
              Free Transfer
            </div>
          </div>
        </div>

        <!-- Reservation Details Table -->
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Reservation Number</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #053790; font-size: 14px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 0.5px;">${data.bookingId}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Arrival Date</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${formatDateDisplay(data.arrivalDate)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Arrival Time</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.arrivalTime}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Departure Date</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${formatDateDisplay(data.departureDate)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Departure Time</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.departureTime}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Reservation Name</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">Number of Cars</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.numberOfCars}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
                <span style="color: #6b7280; font-size: 14px;">License Plates</span>
              </td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.licensePlate}</span>
              </td>
            </tr>
            ${carKeysText}
            ${invoiceText}
          </table>
          
          <!-- Payment Note -->
          <div style="margin-top: 16px; text-align: center;">
            <span style="font-size: 13px; color: #9ca3af; font-style: italic;">Payment on arrival</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Location Section -->
    <div class="mobile-padding" style="padding: 0 20px 28px;">
      <div style="background-color: #fafafa; border-radius: 10px; padding: 24px 20px; border: 1px solid #e5e7eb;">
        <div style="margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
            📍 Parking Location
          </h2>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
          Ulitsa Nedelcho Bonchev 30
        </p>
        
        <!-- Navigation Buttons - Centered, Not Full Width -->
        <div style="text-align: center;">
          <div class="nav-button-container" style="display: inline-block; max-width: 340px; width: 100%;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom: 12px;">
                  <a href="https://ul.waze.com/ul?ll=42.67683570,23.40003810&navigate=yes" style="display: block; text-align: center; background-color: #053790; color: #ffffff; padding: 14px 20px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; height: 48px; line-height: 20px; box-sizing: border-box;">
                    <img src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/waze-icon.png" alt="Waze" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" />
                    Navigate with Waze
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <a href="https://www.google.com/maps?q=42.6768423,23.4002030&entry=gps" style="display: block; text-align: center; background-color: #ffffff; color: #053790; padding: 14px 20px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; border: 2px solid #053790; height: 48px; line-height: 20px; box-sizing: border-box;">
                    <img src="https://dbybybmjjeeocoecaewv.supabase.co/storage/v1/object/public/assets/google-map-icon.png" alt="Google Maps" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" />
                    Navigate with Google Maps
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Important Information -->
    <div class="mobile-padding" style="padding: 0 20px 28px;">
      <h2 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 600; color: #111827;">Important Information</h2>
      <div style="background-color: #fffbeb; border-left: 3px solid #f59e0b; padding: 16px 18px; border-radius: 8px; margin-bottom: 20px;">
        <ul style="margin: 0; padding-left: 18px; color: #92400e; font-size: 14px; line-height: 1.7;">
          <li style="margin-bottom: 6px;">Please arrive at least 10 minutes early.</li>
          <li style="margin-bottom: 6px;">Please save this email for your reference.</li>
          <li>If you need assistance, please contact us.</li>
        </ul>
      </div>

      <!-- Contact Details -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 18px;">
        <div style="margin-bottom: 14px;">
          <div style="color: #6b7280; font-size: 12px; font-weight: 500; margin-bottom: 4px;">
            📞 Phone
          </div>
          <div>
            <a href="tel:+359886616991" style="color: #053790; font-size: 15px; font-weight: 600; text-decoration: none;">
              +359 886 616 991
            </a>
          </div>
        </div>
        <div>
          <div style="color: #6b7280; font-size: 12px; font-weight: 500; margin-bottom: 4px;">
            📧 Email
          </div>
          <div>
            <a href="mailto:info@skyparking.bg" style="color: #053790; font-size: 15px; font-weight: 600; text-decoration: none;">
              info@skyparking.bg
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer - Restored -->
    <div style="background-color: #f3f4f6; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <div style="font-size: 15px; font-weight: 600; color: #053790; margin-bottom: 8px;">
        SkyParking
      </div>
      <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
        <a href="tel:+359886616991" style="color: #6b7280; text-decoration: none;">+359 886 616 991</a>
        <span style="margin: 0 6px; color: #d1d5db;">•</span>
        <a href="mailto:info@skyparking.bg" style="color: #6b7280; text-decoration: none;">info@skyparking.bg</a>
      </div>
      <div style="font-size: 12px; color: #9ca3af; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
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
  <title>Нова резервация - SkyParking - Паркинг Летище София</title>
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