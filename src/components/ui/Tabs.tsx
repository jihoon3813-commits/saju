import React, { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTabId, className = "" }) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTabId || (tabs.length > 0 ? tabs[0].id : "")
  );

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* 탭 리스트 헤더 */}
      <div className="flex border-b border-brand-border" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial text-center px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-[2px] cursor-pointer min-h-[44px] ${
                isActive
                  ? "border-gold text-gold"
                  : "border-transparent text-navy/55 hover:text-navy hover:border-brand-border"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 탭 패널 컨텐츠 */}
      <div className="py-5">
        {tabs.map((tab) => {
          if (activeTab !== tab.id) return null;
          return (
            <div
              key={tab.id}
              id={`tabpanel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab.id}`}
              className="animate-in fade-in duration-200"
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
