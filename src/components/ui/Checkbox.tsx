import React from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, onChange, error, className = "", id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col space-y-1 w-full">
        <label className={`flex items-start space-x-2.5 cursor-pointer py-1 select-none min-h-[36px] ${className}`}>
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-0.5 w-4.5 h-4.5 rounded border-brand-border text-gold focus:ring-gold bg-surface transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
            {...props}
          />
          <span className="text-sm text-navy/80 leading-tight">{label}</span>
        </label>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
