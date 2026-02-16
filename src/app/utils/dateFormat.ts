/**
 * Format a date string from YYYY-MM-DD to DD/MM/YYYY
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date string in DD/MM/YYYY format
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  
  // Handle both YYYY-MM-DD and ISO format
  const date = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const [year, month, day] = date.split('-');
  
  if (!year || !month || !day) return dateStr;
  
  return `${day}/${month}/${year}`;
}

/**
 * Format a datetime string to DD/MM/YYYY HH:MM format
 * @param dateTimeStr - ISO datetime string
 * @returns Formatted datetime string
 */
export function formatDateTimeDisplay(dateTimeStr: string): string {
  if (!dateTimeStr) return '';
  
  const date = new Date(dateTimeStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
