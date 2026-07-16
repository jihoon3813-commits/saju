import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false }) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className="space-y-3 w-full">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="bg-surface border border-brand-border rounded-xl overflow-hidden shadow-xs transition-all duration-200"
          >
            <h3>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${item.id}`}
                className="w-full flex items-center justify-between text-left px-5 py-4.5 font-semibold text-base text-navy hover:text-gold hover:bg-[#F2EDE2]/10 transition-colors focus:outline-none focus:bg-[#F2EDE2]/20 cursor-pointer"
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={`w-5 h-5 text-navy/40 transition-transform duration-200 ${
                    isOpen ? "transform rotate-180 text-gold" : ""
                  }`}
                />
              </button>
            </h3>
            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-button-${item.id}`}
              className={`transition-all duration-200 overflow-hidden ${
                isOpen ? "max-h-[500px] border-t border-brand-border/60" : "max-h-0"
              }`}
            >
              <div className="p-5 text-sm text-navy/70 leading-relaxed bg-[#F7F3EA]/10">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
