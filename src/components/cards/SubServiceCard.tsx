import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SubServiceItem } from "@/data/mockData";

interface SubServiceCardProps {
  item: SubServiceItem;
}

export const SubServiceCard: React.FC<SubServiceCardProps> = ({ item }) => {
  return (
    <Link
      href={item.href}
      className="group block bg-cream/30 hover:bg-white border border-brand-border/60 hover:border-gold/50 rounded-2xl p-4.5 transition-all duration-300 hover:-translate-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-gold/30"
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-navy text-sm sm:text-base group-hover:text-gold transition-colors duration-200">
          {item.label}
        </h4>
        <ArrowUpRight className="w-3.5 h-3.5 text-navy/30 group-hover:text-gold transition-colors duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transform" />
      </div>
      {item.desc && (
        <p className="text-xs text-navy/55 leading-relaxed mt-1.5 font-medium">
          {item.desc}
        </p>
      )}
    </Link>
  );
};
