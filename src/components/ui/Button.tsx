import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", size = "md", fullWidth = false, className = "", ...props }, ref) => {
    // 테마 기반 스타일 링
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gold/50 active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    
    const variants = {
      primary: "bg-navy text-cream hover:bg-navy/90 hover:shadow-md",
      secondary: "bg-sage text-cream hover:bg-sage/90 hover:shadow-md",
      outline: "border border-gold text-gold bg-transparent hover:bg-gold/10",
      text: "text-navy hover:text-gold bg-transparent hover:bg-navy/5",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm min-h-[36px]",
      md: "px-5 py-2.5 text-base min-h-[44px]", // 최소 터치 영역 44px 준수
      lg: "px-8 py-3.5 text-lg min-h-[52px]",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
