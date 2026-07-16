import React from "react";
import { ShieldCheck, Cpu, Scale } from "lucide-react";

interface TrustCardProps {
  type: "engine" | "privacy" | "ethical";
  title: string;
  description: string;
}

export const TrustCard: React.FC<TrustCardProps> = ({ type, title, description }) => {
  const renderIcon = () => {
    const iconClass = "w-6 h-6 text-gold";
    switch (type) {
      case "engine":
        return <Cpu className={iconClass} />;
      case "privacy":
        return <ShieldCheck className={iconClass} />;
      case "ethical":
        return <Scale className={iconClass} />;
    }
  };

  return (
    <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-xs flex items-start space-x-4">
      <div className="p-3 bg-cream rounded-xl shrink-0">
        {renderIcon()}
      </div>
      <div className="space-y-1.5">
        <h4 className="text-base font-bold text-navy">{title}</h4>
        <p className="text-sm text-navy/70 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
