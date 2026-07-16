import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "오류가 발생했습니다",
  description,
  retryLabel = "다시 시도",
  onRetry,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-surface border border-red-100 rounded-2xl max-w-md mx-auto shadow-sm ${className}`}>
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-navy mb-1.5">{title}</h3>
      <p className="text-sm text-navy/70 mb-5 leading-relaxed">{description}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="bg-red-900 hover:bg-red-800">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
