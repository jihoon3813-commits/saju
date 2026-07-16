import React from "react";
import Link from "next/link";
import { HeartHandshake, Coins, Briefcase, Home, Hourglass, ArrowUpRight } from "lucide-react";
import { ConcernCategory } from "@/data/mockData";

interface QuestionCardProps {
  concern: ConcernCategory;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ concern }) => {
  const renderIcon = (name: string) => {
    const iconClass = "w-5 h-5 text-sage group-hover:text-gold transition-colors";
    switch (name) {
      case "HeartHandshake":
        return <HeartHandshake className={iconClass} />;
      case "Coins":
        return <Coins className={iconClass} />;
      case "Briefcase":
        return <Briefcase className={iconClass} />;
      case "Home":
        return <Home className={iconClass} />;
      case "Hourglass":
        return <Hourglass className={iconClass} />;
      default:
        return <ArrowUpRight className={iconClass} />;
    }
  };

  return (
    <Link
      href={concern.path}
      className="group flex items-center justify-between p-4.5 bg-surface border border-brand-border rounded-xl hover-lift shadow-xs hover:shadow-md hover:border-gold/45 focus:outline-none focus:ring-2 focus:ring-gold/40"
    >
      <div className="flex items-center space-x-3.5">
        <div className="p-2.5 bg-cream rounded-lg group-hover:bg-gold/10 transition-colors">
          {renderIcon(concern.iconName)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-navy group-hover:text-gold transition-colors">
            {concern.title}
          </h4>
          <p className="text-xs text-navy/60 mt-0.5 max-w-[200px] sm:max-w-xs leading-normal">
            {concern.description}
          </p>
        </div>
      </div>
      
      <div className="p-1 rounded-full bg-cream text-navy/40 group-hover:text-gold group-hover:bg-gold/5 transition-colors">
        <ArrowUpRight className="w-4 h-4" />
      </div>
    </Link>
  );
};
