import React from "react";
import { Info } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-surface border border-brand-border rounded-2xl max-w-md mx-auto shadow-sm ${className}`}>
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cream text-gold mb-4">
        <Info className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-navy mb-1.5">{title}</h3>
      <p className="text-sm text-navy/70 mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
