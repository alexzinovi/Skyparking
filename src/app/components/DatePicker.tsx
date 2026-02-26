import { useState } from "react";
import { format } from "date-fns";
import { bg, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useLanguage } from "./LanguageContext";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  label?: string;
  error?: string;
  id?: string;
  defaultMonth?: Date; // Optional: specify which month to show initially when picker opens
}

export function DatePicker({ value, onChange, minDate, label, error, id, defaultMonth }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  
  // Select locale based on language
  const locale = language === 'bg' ? bg : enUS;
  
  // Bulgarian translations for the placeholder
  const placeholder = language === 'bg' ? 'Изберете дата' : 'Pick a date';

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false); // Auto-close on selection
  };

  return (
    <div className="space-y-2 md:space-y-3">
      {label && (
        <label className="text-sm md:text-base font-medium text-gray-700 block" htmlFor={id}>
          <CalendarIcon className="inline h-4 w-4 mr-2" />
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            className={`w-full h-11 md:h-12 flex items-center justify-start px-3 md:px-4 text-sm md:text-base text-left rounded-lg border bg-white transition-colors hover:bg-accent hover:text-accent-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none ${
              !value && "text-gray-500"
            } ${error ? "border-red-500" : "border-gray-300"}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            {value ? format(value, "PPP", { locale }) : <span>{placeholder}</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            locale={locale}
            defaultMonth={defaultMonth || value || minDate || new Date()} // Show month based on defaultMonth, current value, minDate, or today
            disabled={(date) => {
              if (minDate) {
                // Compare dates only (ignore time) - allow today, block past dates
                const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                if (dateOnly < minDateOnly) return true;
              }
              return false;
            }}
            initialFocus
            className="rdp-custom"
            modifiersClassNames={{
              selected: "rdp-day_selected",
              today: "rdp-day_today"
            }}
            styles={{
              root: {
                padding: "1rem"
              },
              months: {
                position: "relative"
              },
              month: {
                width: "100%"
              },
              caption: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "1rem",
                color: "#073590",
                fontWeight: "bold"
              },
              nav: {
                display: "flex",
                gap: "0.5rem",
                position: "absolute",
                top: 0,
                right: 0
              },
              nav_button: {
                width: "2rem",
                height: "2rem",
                borderRadius: "0.375rem",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                cursor: "pointer"
              },
              table: {
                width: "100%",
                borderCollapse: "collapse"
              },
              head_cell: {
                width: "2.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#6b7280",
                padding: "0.5rem 0"
              },
              cell: {
                textAlign: "center",
                padding: "0.25rem"
              },
              day: {
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: "400",
                cursor: "pointer",
                border: "none",
                backgroundColor: "transparent",
                color: "#111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              },
              day_selected: {
                backgroundColor: "#073590 !important",
                color: "white !important",
                fontWeight: "600"
              },
              day_today: {
                fontWeight: "600",
                border: "2px solid #f1c933"
              },
              day_disabled: {
                color: "#d1d5db",
                cursor: "not-allowed",
                opacity: 0.5
              }
            }}
          />
          <style>{`
            .rdp-custom .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
              background-color: #f3f4f6 !important;
            }
            .rdp-custom .rdp-day_selected:hover {
              background-color: #052961 !important;
            }
            .rdp-custom .rdp-nav_button:hover {
              background-color: #f3f4f6;
            }
            .rdp-custom .rdp-nav_button svg {
              width: 1rem;
              height: 1rem;
            }
          `}</style>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}