import { useState } from "react";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useLanguage } from "./LanguageContext";

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  label?: string;
  error?: string;
  id?: string;
}

const timeOptions = [
  "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", 
  "03:00", "03:30", "04:00", "04:30", "05:00", "05:30",
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
];

export function TimePicker({ value, onChange, label, error, id }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  
  // Bulgarian translations for the placeholder
  const placeholder = language === 'bg' ? 'Изберете час' : 'Select time';

  const handleSelect = (time: string) => {
    onChange(time);
    setOpen(false); // Auto-close on selection
  };

  return (
    <div className="space-y-2 md:space-y-3">
      {label && (
        <label className="text-sm md:text-base font-medium text-gray-700 block" htmlFor={id}>
          <Clock className="inline h-4 w-4 mr-2" />
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
            <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
            {value ? <span>{value}</span> : <span>{placeholder}</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-white" align="start">
          <div className="max-h-[300px] overflow-y-auto">
            {timeOptions.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleSelect(time)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 ${
                  value === time 
                    ? "bg-[#073590] text-white hover:bg-[#052961] font-semibold" 
                    : "text-gray-900"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
