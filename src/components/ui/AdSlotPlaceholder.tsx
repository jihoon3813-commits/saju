import React from "react";

interface AdSlotPlaceholderProps {
  id?: string;
  isActive?: boolean;
  size?: "banner" | "sidebar" | "in-feed";
  className?: string;
}

export const AdSlotPlaceholder: React.FC<AdSlotPlaceholderProps> = ({
  id = "ad-slot",
  isActive = false,
  size = "banner",
  className = "",
}) => {
  // 기본 비활성화 상태에서는 레이아웃에 아무것도 노출하지 않습니다. (검색엔진 가독성 및 디자인 해침 방지)
  if (!isActive) {
    return null;
  }

  const sizeStyles = {
    banner: "w-full max-w-[728px] h-[90px] mx-auto",
    sidebar: "w-[300px] h-[600px] mx-auto",
    "in-feed": "w-full h-[250px]",
  };

  return (
    <div
      id={id}
      className={`flex items-center justify-center bg-[#F2EDE2]/40 border border-dashed border-navy/20 rounded-lg text-xs text-navy/40 tracking-wider ${sizeStyles[size]} ${className}`}
      aria-hidden="true"
    >
      <span>[ADSLOT - {size.toUpperCase()}] ({id})</span>
    </div>
  );
};
