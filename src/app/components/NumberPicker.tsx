import { useState } from "react";
import { Hash } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface NumberPickerProps {
  value?: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
  label?: string;
  placeholder?: string;
  error?: string;
  id?: string;
  icon?: React.ReactNode;
}

export function NumberPicker({ 
  value, 
  onChange, 
  options, 
  label, 
  placeholder, 
  error, 
  id,
  icon 
}: NumberPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedValue: number) => {
    onChange(selectedValue);
    setOpen(false); // Auto-close on selection
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayIcon = icon || <Hash className="h-4 w-4" />;

  return (
    <div className="space-y-2 md:space-y-3">
      {label && (
        <label className="text-sm md:text-base font-medium text-gray-700 block" htmlFor={id}>
          {displayIcon && <span className="inline-flex items-center mr-2">{displayIcon}</span>}
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
            <span className="mr-2 flex-shrink-0">{displayIcon}</span>
            {selectedOption ? (
              <span>{selectedOption.label}</span>
            ) : (
              <span>{placeholder || "Select..."}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-white" align="start">
          <div className="max-h-[300px] overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 ${
                  value === option.value 
                    ? "bg-[#073590] text-white hover:bg-[#052961] font-semibold" 
                    : "text-gray-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
