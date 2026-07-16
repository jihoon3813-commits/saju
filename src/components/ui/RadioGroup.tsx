import React from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  selectedValue,
  onChange,
  error,
  className = "",
}) => {
  return (
    <div className="flex flex-col space-y-2 w-full">
      {label && <span className="text-sm font-semibold text-navy/80">{label}</span>}
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex items-center space-x-2.5 px-4 py-2.5 bg-surface border rounded-lg cursor-pointer transition-all hover:bg-[#F2EDE2]/20 min-h-[44px] ${
                isSelected ? "border-gold bg-gold/5 ring-1 ring-gold/30" : "border-brand-border"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="w-4 h-4 text-gold border-brand-border focus:ring-gold bg-surface focus:outline-none"
              />
              <span className="text-sm font-medium text-navy">{opt.label}</span>
            </label>
          );
        })}
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};
