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
  language?: 'bg' | 'en' | 'el' | 'tr' | 'sr' | 'mk' | 'ro' | 'uk'; // Language support
  basePrice?: number; // Price before discount
  discountCode?: string;
  discountApplied?: {
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
  vehicleSize?: 'standard' | 'oversized';
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

  const discountText = data.discountApplied && data.basePrice
    ? `<div style="text-align: center; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e5e7eb;">
         <div style="font-size: 13px; color: #059669; font-weight: 600;">
           🎫 Отстъпка (${data.discountCode}): ${data.discountApplied.discountType === 'percentage'
             ? `${data.discountApplied.discountValue}%`
             : `€${data.discountApplied.discountValue}`}
         </div>
         <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
           Първоначална цена: €${data.basePrice.toFixed(2)}
         </div>
       </div>`
    : '';

  const vehicleSizeText = data.vehicleSize === 'oversized'
    ? `<tr>
         <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
           <span style="color: #6b7280; font-size: 14px;">🚐 Размер на МПС</span>
         </td>
         <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">Извънгабаритен</span>
         </td>
       </tr>
       <tr>
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">Добавка за извънгабаритно МПС</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #d97706; font-size: 14px; font-weight: 600;">+50%</span>
         </td>
       </tr>`
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
      <img class="header-logo" src="https://skyparking.bg/logo-email.png" alt="SkyParking" style="max-width: 160px; height: auto; display: inline-block;" />
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
            ${vehicleSizeText}
          </table>

          ${discountText}

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
                  <a href="https://ul.waze.com/ul?place=ChIJ6eb_yAqHqkARRJP7h2zo5AU&ll=42.67676540%2C23.40033890&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location" style="display: block; text-align: center; background-color: #053790; color: #ffffff; padding: 14px 20px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; height: 48px; line-height: 20px; box-sizing: border-box;">
                    <img src="https://skyparking.bg/waze-icon.png" alt="Waze" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" />
                    Навигация с Waze
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <a href="https://maps.app.goo.gl/Yt6YeQN5ECBSjVme8" style="display: block; text-align: center; background-color: #ffffff; color: #053790; padding: 14px 20px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; border: 2px solid #053790; height: 48px; line-height: 20px; box-sizing: border-box;">
                    <img src="https://skyparking.bg/google-maps-icon.png" alt="Google Maps" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" />
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

  const discountText = data.discountApplied && data.basePrice
    ? `<div style="text-align: center; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e5e7eb;">
         <div style="font-size: 13px; color: #059669; font-weight: 600;">
           🎫 Discount (${data.discountCode}): ${data.discountApplied.discountType === 'percentage'
             ? `${data.discountApplied.discountValue}%`
             : `€${data.discountApplied.discountValue}`}
         </div>
         <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
           Original price: €${data.basePrice.toFixed(2)}
         </div>
       </div>`
    : '';

  const vehicleSizeText = data.vehicleSize === 'oversized'
    ? `<tr>
         <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
           <span style="color: #6b7280; font-size: 14px;">🚐 Vehicle Size</span>
         </td>
         <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">Oversized</span>
         </td>
       </tr>
       <tr>
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">Oversized vehicle surcharge</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #d97706; font-size: 14px; font-weight: 600;">+50%</span>
         </td>
       </tr>`
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
      <img class="header-logo" src="https://skyparking.bg/logo-email.png" alt="SkyParking" style="max-width: 160px; height: auto; display: inline-block;" />
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
            ${vehicleSizeText}
          </table>

          ${discountText}

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
                  <a href="https://ul.waze.com/ul?place=ChIJ6eb_yAqHqkARRJP7h2zo5AU&ll=42.67676540%2C23.40033890&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location" style="display: block; text-align: center; background-color: #053790; color: #ffffff; padding: 14px 20px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; height: 48px; line-height: 20px; box-sizing: border-box;">
                    <img src="https://skyparking.bg/waze-icon.png" alt="Waze" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" />
                    Navigate with Waze
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <a href="https://maps.app.goo.gl/Yt6YeQN5ECBSjVme8" style="display: block; text-align: center; background-color: #ffffff; color: #053790; padding: 14px 20px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; border: 2px solid #053790; height: 48px; line-height: 20px; box-sizing: border-box;">
                    <img src="https://skyparking.bg/google-maps-icon.png" alt="Google Maps" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" />
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

// Generate confirmation email for non-BG/EN languages using translated strings
function generateConfirmationEmailHTML_MULTILINGUAL(data: BookingEmailData): string {
  const lang = data.language || 'en';

  const strings: Record<string, {
    subject: string;
    confirmed: string;
    thankYou: string;
    totalPrice: string;
    freeTransfer: string;
    reservationNumber: string;
    arrivalDate: string;
    arrivalTime: string;
    departureDate: string;
    departureTime: string;
    nameLabel: string;
    numberOfCars: string;
    licensePlates: string;
    carKeys: string;
    invoiceFor: string;
    paymentOnArrival: string;
    parkingLocation: string;
    navigateWaze: string;
    navigateGMaps: string;
    importantInfo: string;
    arrive10min: string;
    saveEmail: string;
    contactUs: string;
    phoneLabel: string;
    emailLabel: string;
    autoEmail: string;
    originalPrice: string;
    discount: string;
    vehicleSizeLabel: string;
    oversizedLabel: string;
    oversizedSurcharge: string;
  }> = {
    el: {
      subject: `Η κράτησή σας στο SkyParking ${data.bookingId}`,
      confirmed: 'Η κράτησή σας επιβεβαιώθηκε',
      thankYou: 'Ευχαριστούμε που επιλέξατε το SkyParking.',
      totalPrice: 'Συνολική Τιμή',
      freeTransfer: 'Δωρεάν Μεταφορά',
      reservationNumber: 'Αριθμός Κράτησης',
      arrivalDate: 'Ημερομηνία Άφιξης',
      arrivalTime: 'Ώρα Άφιξης',
      departureDate: 'Ημερομηνία Αναχώρησης',
      departureTime: 'Ώρα Αναχώρησης',
      nameLabel: 'Όνομα Κράτησης',
      numberOfCars: 'Αριθμός Αυτοκινήτων',
      licensePlates: 'Πινακίδες',
      carKeys: 'Παράδοση Κλειδιών',
      invoiceFor: 'Τιμολόγιο για',
      paymentOnArrival: 'Πληρωμή κατά την άφιξη',
      parkingLocation: 'Τοποθεσία Parking',
      navigateWaze: 'Πλοήγηση με Waze',
      navigateGMaps: 'Πλοήγηση με Google Maps',
      importantInfo: 'Σημαντικές Πληροφορίες',
      arrive10min: 'Παρακαλούμε φτάστε τουλάχιστον 10 λεπτά νωρίτερα.',
      saveEmail: 'Παρακαλούμε αποθηκεύστε αυτό το email για αναφορά.',
      contactUs: 'Εάν χρειάζεστε βοήθεια, επικοινωνήστε μαζί μας.',
      phoneLabel: 'Τηλέφωνο',
      emailLabel: 'Email',
      autoEmail: 'Αυτό είναι αυτόματα δημιουργημένο email. Παρακαλούμε μην απαντάτε σε αυτό.',
      originalPrice: 'Αρχική τιμή',
      discount: 'Έκπτωση',
      vehicleSizeLabel: 'Μέγεθος οχήματος',
      oversizedLabel: 'Υπερμέγεθες',
      oversizedSurcharge: 'Επιπλέον χρέωση για υπερμέγεθες όχημα',
    },
    tr: {
      subject: `SkyParking Rezervasyonunuz ${data.bookingId}`,
      confirmed: 'Rezervasyonunuz onaylandı',
      thankYou: 'SkyParking\'i seçtiğiniz için teşekkür ederiz.',
      totalPrice: 'Toplam Ücret',
      freeTransfer: 'Ücretsiz Transfer',
      reservationNumber: 'Rezervasyon Numarası',
      arrivalDate: 'Giriş Tarihi',
      arrivalTime: 'Giriş Saati',
      departureDate: 'Çıkış Tarihi',
      departureTime: 'Çıkış Saati',
      nameLabel: 'Rezervasyon Adı',
      numberOfCars: 'Araç Sayısı',
      licensePlates: 'Plaka',
      carKeys: 'Anahtar Teslimi',
      invoiceFor: 'Fatura İçin',
      paymentOnArrival: 'Gelişte ödeme',
      parkingLocation: 'Park Yeri Konumu',
      navigateWaze: 'Waze ile Yol Tarifi',
      navigateGMaps: 'Google Maps ile Yol Tarifi',
      importantInfo: 'Önemli Bilgiler',
      arrive10min: 'Lütfen en az 10 dakika erken gelin.',
      saveEmail: 'Lütfen bu e-postayı referans için kaydedin.',
      contactUs: 'Yardım için lütfen bize ulaşın.',
      phoneLabel: 'Telefon',
      emailLabel: 'E-posta',
      autoEmail: 'Bu otomatik olarak oluşturulmuş bir e-postadır. Lütfen yanıtlamayın.',
      originalPrice: 'Orijinal fiyat',
      discount: 'İndirim',
      vehicleSizeLabel: 'Araç Boyutu',
      oversizedLabel: 'Büyük Boyut',
      oversizedSurcharge: 'Büyük araç ek ücreti',
    },
    sr: {
      subject: `Vaša SkyParking rezervacija ${data.bookingId}`,
      confirmed: 'Vaša rezervacija je potvrđena',
      thankYou: 'Hvala što ste izabrali SkyParking.',
      totalPrice: 'Ukupna Cena',
      freeTransfer: 'Besplatan Transfer',
      reservationNumber: 'Broj Rezervacije',
      arrivalDate: 'Datum Dolaska',
      arrivalTime: 'Vreme Dolaska',
      departureDate: 'Datum Odlaska',
      departureTime: 'Vreme Odlaska',
      nameLabel: 'Ime Rezervacije',
      numberOfCars: 'Broj Automobila',
      licensePlates: 'Registarski Broj',
      carKeys: 'Predaja Ključeva',
      invoiceFor: 'Faktura Za',
      paymentOnArrival: 'Plaćanje po dolasku',
      parkingLocation: 'Lokacija Parkinga',
      navigateWaze: 'Navigiraj sa Waze',
      navigateGMaps: 'Navigiraj sa Google Maps',
      importantInfo: 'Važne Informacije',
      arrive10min: 'Molimo dođite najmanje 10 minuta ranije.',
      saveEmail: 'Molimo sačuvajte ovaj email za referencu.',
      contactUs: 'Ako vam je potrebna pomoć, kontaktirajte nas.',
      phoneLabel: 'Telefon',
      emailLabel: 'Email',
      autoEmail: 'Ovo je automatski generisani email. Molimo ne odgovarajte na njega.',
      originalPrice: 'Originalna cena',
      discount: 'Popust',
      vehicleSizeLabel: 'Veličina vozila',
      oversizedLabel: 'Velikogabaritno',
      oversizedSurcharge: 'Doplata za velikogabaritno vozilo',
    },
    mk: {
      subject: `Вашата SkyParking резервација ${data.bookingId}`,
      confirmed: 'Вашата резервација е потврдена',
      thankYou: 'Благодариме што го избравте SkyParking.',
      totalPrice: 'Вкупна Цена',
      freeTransfer: 'Бесплатен Трансфер',
      reservationNumber: 'Број на Резервација',
      arrivalDate: 'Датум на Пристигање',
      arrivalTime: 'Час на Пристигање',
      departureDate: 'Датум на Заминување',
      departureTime: 'Час на Заминување',
      nameLabel: 'Ime на Резервација',
      numberOfCars: 'Број на Автомобили',
      licensePlates: 'Регистарски Таблички',
      carKeys: 'Предавање на Клучеви',
      invoiceFor: 'Фактура За',
      paymentOnArrival: 'Плаќање при пристигање',
      parkingLocation: 'Локација на Паркингот',
      navigateWaze: 'Навигирај со Waze',
      navigateGMaps: 'Навигирај со Google Maps',
      importantInfo: 'Важни Информации',
      arrive10min: 'Ве молиме пристигнете барем 10 минути порано.',
      saveEmail: 'Ве молиме зачувајте го овој имејл за референца.',
      contactUs: 'Ако ви е потребна помош, контактирајте нè.',
      phoneLabel: 'Телефон',
      emailLabel: 'Имејл',
      autoEmail: 'Ова е автоматски генериран имејл. Ве молиме не одговарајте на него.',
      originalPrice: 'Оригинална цена',
      discount: 'Попуст',
      vehicleSizeLabel: 'Големина на возилото',
      oversizedLabel: 'Вонгабаритно',
      oversizedSurcharge: 'Доплата за вонгабаритно возило',
    },
    ro: {
      subject: `Rezervarea dvs. SkyParking ${data.bookingId}`,
      confirmed: 'Rezervarea dvs. a fost confirmată',
      thankYou: 'Vă mulțumim că ați ales SkyParking.',
      totalPrice: 'Preț Total',
      freeTransfer: 'Transfer Gratuit',
      reservationNumber: 'Număr Rezervare',
      arrivalDate: 'Data Sosirii',
      arrivalTime: 'Ora Sosirii',
      departureDate: 'Data Plecării',
      departureTime: 'Ora Plecării',
      nameLabel: 'Numele Rezervării',
      numberOfCars: 'Număr de Mașini',
      licensePlates: 'Număr de Înmatriculare',
      carKeys: 'Predare Chei',
      invoiceFor: 'Factură Pentru',
      paymentOnArrival: 'Plata la sosire',
      parkingLocation: 'Locația Parcării',
      navigateWaze: 'Navigați cu Waze',
      navigateGMaps: 'Navigați cu Google Maps',
      importantInfo: 'Informații Importante',
      arrive10min: 'Vă rugăm să sosiți cu cel puțin 10 minute mai devreme.',
      saveEmail: 'Vă rugăm să salvați acest email pentru referință.',
      contactUs: 'Dacă aveți nevoie de asistență, contactați-ne.',
      phoneLabel: 'Telefon',
      emailLabel: 'Email',
      autoEmail: 'Acesta este un email generat automat. Vă rugăm să nu răspundeți la el.',
      originalPrice: 'Preț original',
      discount: 'Reducere',
      vehicleSizeLabel: 'Dimensiunea vehiculului',
      oversizedLabel: 'Supradimensionat',
      oversizedSurcharge: 'Suprataxă vehicul supradimensionat',
    },
    uk: {
      subject: `Ваше бронювання SkyParking ${data.bookingId}`,
      confirmed: 'Ваше бронювання підтверджено',
      thankYou: 'Дякуємо, що обрали SkyParking.',
      totalPrice: 'Загальна Ціна',
      freeTransfer: 'Безкоштовний Трансфер',
      reservationNumber: 'Номер Бронювання',
      arrivalDate: 'Дата Прибуття',
      arrivalTime: 'Час Прибуття',
      departureDate: 'Дата Відправлення',
      departureTime: 'Час Відправлення',
      nameLabel: 'Ім\'я Бронювання',
      numberOfCars: 'Кількість Автомобілів',
      licensePlates: 'Номерні Знаки',
      carKeys: 'Передача Ключів',
      invoiceFor: 'Рахунок-фактура для',
      paymentOnArrival: 'Оплата при прибутті',
      parkingLocation: 'Розташування Парковки',
      navigateWaze: 'Навігація через Waze',
      navigateGMaps: 'Навігація через Google Maps',
      importantInfo: 'Важлива Інформація',
      arrive10min: 'Будь ласка, прибудьте щонайменше за 10 хвилин.',
      saveEmail: 'Будь ласка, збережіть цей лист для довідки.',
      contactUs: 'Якщо вам потрібна допомога, зв\'яжіться з нами.',
      phoneLabel: 'Телефон',
      emailLabel: 'Електронна пошта',
      autoEmail: 'Це автоматично згенерований лист. Будь ласка, не відповідайте на нього.',
      originalPrice: 'Оригінальна ціна',
      discount: 'Знижка',
      vehicleSizeLabel: 'Розмір транспортного засобу',
      oversizedLabel: 'Негабаритний',
      oversizedSurcharge: 'Доплата за негабаритний транспортний засіб',
    },
  };

  const s = strings[lang] ?? strings['el']; // fallback to Greek (shouldn't happen)

  const carKeysText = data.carKeys
    ? `<tr>
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">🔑 ${s.carKeys}</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">✓</span>
         </td>
       </tr>`
    : '';

  const invoiceText = data.needsInvoice
    ? `<tr>
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">📄 ${s.invoiceFor}</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.companyName || ''}</span>
         </td>
       </tr>`
    : '';

  const discountText = data.discountApplied && data.basePrice
    ? `<div style="text-align: center; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e5e7eb;">
         <div style="font-size: 13px; color: #059669; font-weight: 600;">
           🎫 ${s.discount} (${data.discountCode}): ${data.discountApplied.discountType === 'percentage'
             ? `${data.discountApplied.discountValue}%`
             : `€${data.discountApplied.discountValue}`}
         </div>
         <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
           ${s.originalPrice}: €${data.basePrice.toFixed(2)}
         </div>
       </div>`
    : '';

  const vehicleSizeText = data.vehicleSize === 'oversized'
    ? `<tr>
         <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;">
           <span style="color: #6b7280; font-size: 14px;">🚐 ${s.vehicleSizeLabel}</span>
         </td>
         <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;">
           <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${s.oversizedLabel}</span>
         </td>
       </tr>
       <tr>
         <td style="padding: 14px 0;">
           <span style="color: #6b7280; font-size: 14px;">${s.oversizedSurcharge}</span>
         </td>
         <td style="padding: 14px 0; text-align: right;">
           <span style="color: #d97706; font-size: 14px; font-weight: 600;">+50%</span>
         </td>
       </tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${s.confirmed} - SkyParking</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
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
    <div class="email-header" style="background-color: #053790; padding: 18px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <img class="header-logo" src="https://skyparking.bg/logo-email.png" alt="SkyParking" style="max-width: 160px; height: auto; display: inline-block;" />
    </div>
    <div style="padding: 32px 20px 24px; text-align: center; background-color: #ffffff;">
      <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #053790; letter-spacing: -0.3px;">${s.confirmed}</h1>
      <p style="margin: 0; font-size: 15px; color: #6b7280; font-weight: 400; line-height: 1.5;">${s.thankYou}</p>
    </div>
    <div class="mobile-padding" style="padding: 0 20px 32px;">
      <div style="background-color: #fafafa; border-radius: 12px; padding: 0; border: 1px solid #e5e7eb; overflow: hidden;">
        <div style="background-color: #ffffff; padding: 24px 24px 20px; border-bottom: 2px solid #f1c933;">
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #9ca3af; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">${s.totalPrice}</div>
            <div class="mobile-text-large" style="font-size: 36px; font-weight: 700; color: #f1c933; letter-spacing: -1px; line-height: 1; margin-bottom: 8px;">€${data.totalPrice}</div>
            <div style="font-size: 14px; color: #d4a929; font-weight: 500;">${s.freeTransfer}</div>
          </div>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;"><span style="color: #6b7280; font-size: 14px;">${s.reservationNumber}</span></td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;"><span style="color: #053790; font-size: 14px; font-weight: 600; font-family: 'Courier New', monospace;">${data.bookingId}</span></td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;"><span style="color: #6b7280; font-size: 14px;">${s.arrivalDate}</span></td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;"><span style="color: #1f2937; font-size: 14px; font-weight: 500;">${formatDateDisplay(data.arrivalDate)}</span></td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;"><span style="color: #6b7280; font-size: 14px;">${s.arrivalTime}</span></td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;"><span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.arrivalTime}</span></td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;"><span style="color: #6b7280; font-size: 14px;">${s.departureDate}</span></td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;"><span style="color: #1f2937; font-size: 14px; font-weight: 500;">${formatDateDisplay(data.departureDate)}</span></td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;"><span style="color: #6b7280; font-size: 14px;">${s.departureTime}</span></td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;"><span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.departureTime}</span></td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;"><span style="color: #6b7280; font-size: 14px;">${s.nameLabel}</span></td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;"><span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.name}</span></td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;"><span style="color: #6b7280; font-size: 14px;">${s.numberOfCars}</span></td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;"><span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.numberOfCars}</span></td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #eeeeee;"><span style="color: #6b7280; font-size: 14px;">${s.licensePlates}</span></td>
              <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid #eeeeee;"><span style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.licensePlate}</span></td>
            </tr>
            ${carKeysText}
            ${invoiceText}
            ${vehicleSizeText}
          </table>
          ${discountText}
          <div style="margin-top: 16px; text-align: center;">
            <span style="font-size: 13px; color: #9ca3af; font-style: italic;">${s.paymentOnArrival}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="mobile-padding" style="padding: 0 20px 28px;">
      <div style="background-color: #fafafa; border-radius: 10px; padding: 24px 20px; border: 1px solid #e5e7eb;">
        <div style="margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">📍 ${s.parkingLocation}</h2>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">Ulitsa Nedelcho Bonchev 30</p>
        <div style="text-align: center;">
          <div class="nav-button-container" style="display: inline-block; max-width: 340px; width: 100%;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom: 12px;">
                  <a href="https://ul.waze.com/ul?place=ChIJ6eb_yAqHqkARRJP7h2zo5AU&ll=42.67676540%2C23.40033890&navigate=yes" style="display: block; text-align: center; background-color: #053790; color: #ffffff; padding: 14px 20px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; height: 48px; line-height: 20px; box-sizing: border-box;">
                    <img src="https://skyparking.bg/waze-icon.png" alt="Waze" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" />${s.navigateWaze}
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <a href="https://maps.app.goo.gl/Yt6YeQN5ECBSjVme8" style="display: block; text-align: center; background-color: #ffffff; color: #053790; padding: 14px 20px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; border: 2px solid #053790; height: 48px; line-height: 20px; box-sizing: border-box;">
                    <img src="https://skyparking.bg/google-maps-icon.png" alt="Google Maps" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" />${s.navigateGMaps}
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="mobile-padding" style="padding: 0 20px 28px;">
      <h2 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 600; color: #111827;">${s.importantInfo}</h2>
      <div style="background-color: #fffbeb; border-left: 3px solid #f59e0b; padding: 16px 18px; border-radius: 8px; margin-bottom: 20px;">
        <ul style="margin: 0; padding-left: 18px; color: #92400e; font-size: 14px; line-height: 1.7;">
          <li style="margin-bottom: 6px;">${s.arrive10min}</li>
          <li style="margin-bottom: 6px;">${s.saveEmail}</li>
          <li>${s.contactUs}</li>
        </ul>
      </div>
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 18px;">
        <div style="margin-bottom: 14px;">
          <div style="color: #6b7280; font-size: 12px; font-weight: 500; margin-bottom: 4px;">📞 ${s.phoneLabel}</div>
          <div><a href="tel:+359886616991" style="color: #053790; font-size: 15px; font-weight: 600; text-decoration: none;">+359 886 616 991</a></div>
        </div>
        <div>
          <div style="color: #6b7280; font-size: 12px; font-weight: 500; margin-bottom: 4px;">📧 ${s.emailLabel}</div>
          <div><a href="mailto:info@skyparking.bg" style="color: #053790; font-size: 15px; font-weight: 600; text-decoration: none;">info@skyparking.bg</a></div>
        </div>
      </div>
    </div>
    <div style="background-color: #f3f4f6; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <div style="font-size: 15px; font-weight: 600; color: #053790; margin-bottom: 8px;">SkyParking</div>
      <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
        <a href="tel:+359886616991" style="color: #6b7280; text-decoration: none;">+359 886 616 991</a>
        <span style="margin: 0 6px; color: #d1d5db;">•</span>
        <a href="mailto:info@skyparking.bg" style="color: #6b7280; text-decoration: none;">info@skyparking.bg</a>
      </div>
      <div style="font-size: 12px; color: #9ca3af; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">${s.autoEmail}</div>
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
    let emailHTML: string;
    if (language === 'bg') {
      emailHTML = generateConfirmationEmailHTML_BG(data);
    } else if (language === 'en') {
      emailHTML = generateConfirmationEmailHTML_EN(data);
    } else {
      emailHTML = generateConfirmationEmailHTML_MULTILINGUAL(data);
    }

    // Subject line based on language
    const subjectMap: Record<string, string> = {
      bg: `Вашата резервация за SkyParking ${data.bookingId}`,
      en: `Your SkyParking Reservation ${data.bookingId}`,
      el: `Η κράτησή σας στο SkyParking ${data.bookingId}`,
      tr: `SkyParking Rezervasyonunuz ${data.bookingId}`,
      sr: `Vaša SkyParking rezervacija ${data.bookingId}`,
      mk: `Вашата SkyParking резервација ${data.bookingId}`,
      ro: `Rezervarea dvs. SkyParking ${data.bookingId}`,
      uk: `Ваше бронювання SkyParking ${data.bookingId}`,
    };
    const subject = subjectMap[language] ?? subjectMap['en'];

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
Email: reservations@skyparking.bg
Уеб: https://www.skyparking.bg
    `.trim();

    const textEN = `
Hello ${data.name},

Your parking reservation near Sofia Airport has been confirmed.

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
Email: reservations@skyparking.bg
Web: https://www.skyparking.bg
    `.trim();

    const plainText = language === 'bg' ? textBG : textEN;

    console.log(`Sending ${language.toUpperCase()} confirmation email to ${data.email} for booking ${data.bookingId}`);

    const result = await resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject: subject,
      html: emailHTML,
      text: plainText,
      // Add reply-to header for better deliverability
      reply_to: 'reservations@skyparking.bg',
      // Add headers to improve deliverability
      headers: {
        'X-Entity-Ref-ID': data.bookingId,
        'List-Unsubscribe': '<mailto:reservations@skyparking.bg?subject=unsubscribe>',
      }
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
function generateViberMessageHTML(data: BookingEmailData): string {
  const lang = data.language || 'bg';
  const carLabel = data.numberOfCars > 1;

  const strings: Record<string, {
    heading: string;
    instruction: string;
    greeting: string;
    confirmed: string;
    from: string;
    to: string;
    car: string;
    cars: string;
    price: string;
    transfers: string;
    questions: string;
    location: string;
    oversizedVehicle: string;
  }> = {
    bg: {
      heading: '📱 Viber съобщение за клиента',
      instruction: 'Копирайте текста по-долу и го изпратете на клиента във Viber:',
      greeting: 'Здравейте',
      confirmed: '✅ SkyParking потвърждава вашата резервация!',
      from: 'От',
      to: 'До',
      car: 'Автомобил',
      cars: 'Автомобили',
      price: 'Цена',
      transfers: 'с включени 2 трансфера',
      questions: 'Ако имате въпроси или желаете да коригирате резервацията, моля свържете се с нас тук или на',
      location: 'Нашата локация',
      oversizedVehicle: '🚐 Извънгабаритно превозно средство',
    },
    en: {
      heading: '📱 Viber message for the customer',
      instruction: 'Copy the text below and send it to the customer on Viber:',
      greeting: 'Hello',
      confirmed: '✅ SkyParking confirms your reservation!',
      from: 'From',
      to: 'To',
      car: 'Car',
      cars: 'Cars',
      price: 'Price',
      transfers: 'incl. 2 free transfers',
      questions: 'If you have any questions or would like to modify your reservation, please contact us here or at',
      location: 'Our location',
      oversizedVehicle: '🚐 Oversized vehicle',
    },
    el: {
      heading: '📱 Μήνυμα Viber για τον πελάτη',
      instruction: 'Αντιγράψτε το παρακάτω κείμενο και στείλτε το στον πελάτη μέσω Viber:',
      greeting: 'Γεια σας',
      confirmed: '✅ Το SkyParking επιβεβαιώνει την κράτησή σας!',
      from: 'Από',
      to: 'Έως',
      car: 'Αυτοκίνητο',
      cars: 'Αυτοκίνητα',
      price: 'Τιμή',
      transfers: 'συμπεριλαμβάνονται 2 δωρεάν μεταφορές',
      questions: 'Αν έχετε ερωτήσεις ή θέλετε να τροποποιήσετε την κράτησή σας, επικοινωνήστε μαζί μας εδώ ή στο',
      location: 'Η τοποθεσία μας',
      oversizedVehicle: '🚐 Υπερμέγεθες όχημα',
    },
    tr: {
      heading: '📱 Müşteri için Viber mesajı',
      instruction: 'Aşağıdaki metni kopyalayın ve Viber üzerinden müşteriye gönderin:',
      greeting: 'Merhaba',
      confirmed: '✅ SkyParking rezervasyonunuzu onayladı!',
      from: 'Giriş',
      to: 'Çıkış',
      car: 'Araç',
      cars: 'Araçlar',
      price: 'Ücret',
      transfers: '2 ücretsiz servis dahil',
      questions: 'Sorularınız veya rezervasyon değişikliği için buradaki numaradan veya şu numaradan bize ulaşabilirsiniz:',
      location: 'Konumumuz',
      oversizedVehicle: '🚐 Büyük boyutlu araç',
    },
    sr: {
      heading: '📱 Viber poruka za klijenta',
      instruction: 'Kopirajte tekst ispod i pošaljite ga klijentu putem Vibera:',
      greeting: 'Zdravo',
      confirmed: '✅ SkyParking potvrđuje vašu rezervaciju!',
      from: 'Od',
      to: 'Do',
      car: 'Automobil',
      cars: 'Automobili',
      price: 'Cena',
      transfers: 'uključena 2 besplatna transfera',
      questions: 'Ako imate pitanja ili želite da izmenite rezervaciju, kontaktirajte nas ovde ili na',
      location: 'Naša lokacija',
      oversizedVehicle: '🚐 Velikogabaritno vozilo',
    },
    mk: {
      heading: '📱 Viber порака за клиентот',
      instruction: 'Копирајте го текстот подолу и пратете го на клиентот преку Viber:',
      greeting: 'Здраво',
      confirmed: '✅ SkyParking ја потврдува вашата резервација!',
      from: 'Од',
      to: 'До',
      car: 'Автомобил',
      cars: 'Автомобили',
      price: 'Цена',
      transfers: 'вклучени 2 бесплатни трансфери',
      questions: 'Ако имате прашања или сакате да ја измените резервацијата, контактирајте нè овде или на',
      location: 'Нашата локација',
      oversizedVehicle: '🚐 Вонгабаритно возило',
    },
    ro: {
      heading: '📱 Mesaj Viber pentru client',
      instruction: 'Copiați textul de mai jos și trimiteți-l clientului pe Viber:',
      greeting: 'Bună ziua',
      confirmed: '✅ SkyParking confirmă rezervarea dvs.!',
      from: 'De la',
      to: 'Până la',
      car: 'Mașină',
      cars: 'Mașini',
      price: 'Preț',
      transfers: 'incl. 2 transferuri gratuite',
      questions: 'Dacă aveți întrebări sau doriți să modificați rezervarea, contactați-ne aici sau la',
      location: 'Locația noastră',
      oversizedVehicle: '🚐 Vehicul supradimensionat',
    },
    uk: {
      heading: '📱 Viber повідомлення для клієнта',
      instruction: 'Скопіюйте текст нижче та надішліть його клієнту через Viber:',
      greeting: 'Доброго дня',
      confirmed: '✅ SkyParking підтверджує ваше бронювання!',
      from: 'Від',
      to: 'До',
      car: 'Автомобіль',
      cars: 'Автомобілі',
      price: 'Ціна',
      transfers: 'включено 2 безкоштовні трансфери',
      questions: 'Якщо у вас є запитання або ви хочете змінити бронювання, зв\'яжіться з нами тут або за номером',
      location: 'Наше розташування',
      oversizedVehicle: '🚐 Негабаритний транспортний засіб',
    },
  };

  const s = strings[lang] ?? strings['en'];

  return `
    <div style="background-color: #7360f2; border: 3px solid #665dc0; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <img src="https://skyparking.bg/viber-logo.png" alt="Viber" style="width: 32px; height: 32px; margin-right: 12px;" />
        <h3 style="margin: 0; font-size: 20px; color: #ffffff;">${s.heading}</h3>
      </div>
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #e0d9ff; font-style: italic;">
        ${s.instruction}
      </p>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; font-family: Arial, sans-serif; line-height: 1.7; border: 1px solid #665dc0;">
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #1a1a1a;">
          ${s.greeting} <strong>${data.name}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #1a1a1a;">
          ${s.confirmed}
        </p>
        <p style="margin: 0 0 4px 0; font-size: 15px; color: #1a1a1a;">
          📅 <strong>${s.from}:</strong> ${formatDateDisplay(data.arrivalDate)} – ${data.arrivalTime}
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #1a1a1a;">
          📅 <strong>${s.to}:</strong> ${formatDateDisplay(data.departureDate)} – ${data.departureTime}
        </p>
        <p style="margin: 0 0 4px 0; font-size: 15px; color: #1a1a1a;">
          🚗 <strong>${carLabel ? s.cars : s.car}:</strong> ${data.licensePlate}
        </p>
        ${data.vehicleSize === 'oversized' ? `<p style="margin: 0 0 4px 0; font-size: 15px; color: #1a1a1a;">
          ${s.oversizedVehicle}
        </p>` : ''}
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #1a1a1a;">
          💶 <strong>${s.price}:</strong> €${data.totalPrice} (${s.transfers})
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #1a1a1a;">
          ${s.questions} <strong>+359 886 616 991</strong>
        </p>
        <p style="margin: 0; font-size: 15px; color: #1a1a1a;">
          📍 <strong>${s.location}:</strong>
        </p>
        <p style="margin: 0; font-size: 15px; color: #1a1a1a;">
          Google Maps: https://maps.app.goo.gl/Yt6YeQN5ECBSjVme8
        </p>
      </div>
    </div>`;
}

function generateAdminNotificationEmailHTML(data: BookingEmailData): string {
  const carKeysText = data.carKeys 
    ? `<p style=\"margin: 10px 0; font-size: 16px; color: #7c3aed;\"><strong>🔑 С предаване на ключове</strong></p>`
    : '';

  const invoiceText = data.needsInvoice 
    ? `<p style=\"margin: 10px 0; font-size: 16px;\"><strong>📄 Фактура за:</strong> ${data.companyName || 'фирма'}</p>`
    : '';

  const discountText = data.discountApplied && data.basePrice
    ? `<div style=\"margin-top: 15px; padding: 12px; background-color: #d1fae5; border-radius: 4px;\">
         <p style=\"margin: 0; font-size: 14px; color: #059669; font-weight: 600;\">
           🎫 Приложена отстъпка (${data.discountCode}): ${data.discountApplied.discountType === 'percentage' 
             ? `${data.discountApplied.discountValue}%` 
             : `€${data.discountApplied.discountValue}`}
         </p>
         <p style=\"margin: 5px 0 0 0; font-size: 13px; color: #047857;\">
           Първоначална цена: €${data.basePrice.toFixed(2)} → Крайна цена: €${data.totalPrice.toFixed(2)}
         </p>
       </div>`
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
        
        ${discountText}
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

      <!-- Viber Message Template -->
      ${generateViberMessageHTML(data)}

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

// Contact inquiry data interface
interface ContactInquiryData {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  language: 'bg' | 'en';
}

// Send contact inquiry email
export async function sendContactInquiryEmail(data: ContactInquiryData): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = 'SkyParking <reservations@skyparking.bg>';
    const toEmail = 'info@skyparking.bg';
    
    const emailHTML = `
<!DOCTYPE html>
<html lang="${data.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.language === 'bg' ? 'Ново запитване' : 'New Inquiry'} - SkyParking</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background-color: #073590; padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: #f1c933; font-size: 28px;">SkyParking</h1>
      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">
        ${data.language === 'bg' ? 'Ново запитване от клиент' : 'New Customer Inquiry'}
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      
      <h2 style="margin: 0 0 20px 0; color: #073590; font-size: 22px;">
        ${data.language === 'bg' ? '📧 Детайли на запитването' : '📧 Inquiry Details'}
      </h2>

      <!-- Subject Box -->
      <div style="background-color: #f1c933; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #073590;">
          ${data.language === 'bg' ? 'Тема:' : 'Subject:'}
        </h3>
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #000000;">
          ${data.subject}
        </p>
      </div>

      <!-- Customer Details -->
      <div style="background-color: #e8f4fd; border-left: 4px solid #073590; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333333;">
          ${data.language === 'bg' ? '👤 Информация за контакт' : '👤 Contact Information'}
        </h3>
        <p style="margin: 10px 0; font-size: 16px;"><strong>${data.language === 'bg' ? 'Име:' : 'Name:'}</strong> ${data.name}</p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>📧 Email:</strong> <a href="mailto:${data.email}" style="color: #073590;">${data.email}</a></p>
        <p style="margin: 10px 0; font-size: 16px;"><strong>📞 ${data.language === 'bg' ? 'Телефон:' : 'Phone:'}</strong> <a href="tel:${data.phone}" style="color: #073590;">${data.phone}</a></p>
      </div>

      <!-- Message -->
      <div style="background-color: #f9f9f9; border-left: 4px solid #f1c933; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333333;">
          ${data.language === 'bg' ? '💬 Съобщение' : '💬 Message'}
        </h3>
        <p style="margin: 0; font-size: 16px; line-height: 1.6; white-space: pre-wrap; color: #333333;">
          ${data.message}
        </p>
      </div>

      <!-- Action Note -->
      <div style="background-color: #fffbeb; border: 1px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          ${data.language === 'bg' 
            ? '⚠️ Моля, отговорете на този клиент възможно най-скоро.' 
            : '⚠️ Please respond to this customer as soon as possible.'}
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #333333; color: #ffffff; padding: 20px; text-align: center; font-size: 14px;">
      <p style="margin: 0;">© 2026 SkyParking - ${data.language === 'bg' ? 'Система за управление' : 'Management System'}</p>
    </div>

  </div>
</body>
</html>
    `.trim();

    const subject = data.language === 'bg' 
      ? `📨 Ново запитване: ${data.subject}`
      : `📨 New Inquiry: ${data.subject}`;

    const plainText = `
${data.language === 'bg' ? 'Ново запитване' : 'New Inquiry'} - SkyParking

${data.language === 'bg' ? 'Тема:' : 'Subject:'} ${data.subject}

${data.language === 'bg' ? 'Информация за контакт:' : 'Contact Information:'}
${data.language === 'bg' ? 'Име:' : 'Name:'} ${data.name}
Email: ${data.email}
${data.language === 'bg' ? 'Телефон:' : 'Phone:'} ${data.phone}

${data.language === 'bg' ? 'Съобщение:' : 'Message:'}
${data.message}

${data.language === 'bg' 
  ? 'Моля, отговорете на този клиент възможно най-скоро.' 
  : 'Please respond to this customer as soon as possible.'}
    `.trim();

    console.log(`Sending contact inquiry email to ${toEmail}`);

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: emailHTML,
      text: plainText,
    });

    console.log('Contact inquiry email sent successfully:', result);

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send contact inquiry email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send contact inquiry' 
    };
  }
}