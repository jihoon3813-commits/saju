import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "gray";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "primary", className = "" }) => {
  const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase";
  
  const variants = {
    primary: "bg-navy text-cream",
    secondary: "bg-sage text-cream",
    accent: "bg-gold text-navy",
    gray: "bg-brand-border text-navy/70",
  };

  return <span className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</span>;
};
