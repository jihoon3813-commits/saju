import React from "react";
import Link from "next/link";
import { Sun, Calendar, Heart, Sparkles, Moon, ChevronRight, BookOpen } from "lucide-react";
import { ServiceItem } from "@/data/mockData";
import { Badge } from "../ui/Badge";

interface ServiceCardProps {
  service: ServiceItem;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  // 아이콘 매핑
  const renderIcon = (name: string) => {
    const iconClass = "w-6 h-6 text-gold";
    switch (name) {
      case "Sun":
        return <Sun className={iconClass} />;
      case "Calendar":
        return <Calendar className={iconClass} />;
      case "Heart":
        return <Heart className={iconClass} />;
      case "Sparkles":
        return <Sparkles className={iconClass} />;
      case "Moon":
        return <Moon className={iconClass} />;
      case "BookOpen":
        return <BookOpen className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  return (
    <Link
      href={service.path}
      className="group block bg-surface border border-brand-border rounded-2xl p-5 hover-lift shadow-xs hover:shadow-md hover:border-gold/45 focus:outline-none focus:ring-2 focus:ring-gold/40"
    >
      <div className="flex justify-between items-start mb-4.5">
        <div className="p-3 bg-cream rounded-xl group-hover:bg-gold/10 transition-colors">
          {renderIcon(service.iconName)}
        </div>
        {service.badge && (
          <Badge variant="accent">{service.badge}</Badge>
        )}
      </div>

      <h3 className="text-lg font-bold text-navy mb-1.5 flex items-center group-hover:text-gold transition-colors">
        <span>{service.title}</span>
        <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-[-4px] group-hover:translate-x-0" />
      </h3>
      <p className="text-sm text-navy/70 leading-relaxed">
        {service.description}
      </p>
    </Link>
  );
};
