import { useState, useEffect } from "react";

export const LOGO_TYPES = {
  default: "https://res.cloudinary.com/lyjyvy54/image/upload/v1784642722/120%ED%8C%8C%EC%9D%B4_%EC%BB%A4%ED%94%BC_%EA%B8%88%EC%A0%95%EC%A0%90_%EC%B1%84%EB%84%90%EC%82%AC%EC%9D%B8_%EB%94%94%EC%9E%90%EC%9D%B8_250828_j3kejm.png",
  "two-line-horizontal": "https://res.cloudinary.com/lyjyvy54/image/upload/v1784730823/Group_1_6_cm1oeu.png",
  symbol: "https://res.cloudinary.com/lyjyvy54/image/upload/v1784730823/120%ED%8C%8C%EC%9D%B4_%EC%BB%A4%ED%94%BC_%EA%B8%88%EC%A0%95%EC%A0%90_%EC%B1%84%EB%84%90%EC%82%AC%EC%9D%B8_%EB%94%94%EC%9E%90%EC%9D%B8_250828_5_eadptv.png",
  "two-line-symbol": "https://res.cloudinary.com/lyjyvy54/image/upload/v1784730823/Group_2_2_atzhmu.png",
};

export type LogoType = keyof typeof LOGO_TYPES;

export const LOGO_OPTIONS = [
  { value: "default" as LogoType, label: "기본형" },
  { value: "two-line-horizontal" as LogoType, label: "두줄가로형" },
  { value: "symbol" as LogoType, label: "심볼형" },
  { value: "two-line-symbol" as LogoType, label: "두줄 심볼형" }
];

export function useLogoType() {
  const [logoType, setLogoType] = useState<LogoType>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("active_logo_type") as LogoType;
    if (saved && LOGO_TYPES[saved]) {
      setLogoType(saved);
    }

    const handleLogoChange = (e: CustomEvent<LogoType>) => {
      if (e.detail && LOGO_TYPES[e.detail]) {
        setLogoType(e.detail);
      }
    };

    window.addEventListener("logo_type_changed", handleLogoChange as EventListener);
    return () => {
      window.removeEventListener("logo_type_changed", handleLogoChange as EventListener);
    };
  }, []);

  const changeLogoType = (type: LogoType) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("active_logo_type", type);
    setLogoType(type);
    window.dispatchEvent(new CustomEvent("logo_type_changed", { detail: type }));
  };

  return { 
    logoType, 
    logoUrl: LOGO_TYPES[logoType], 
    changeLogoType 
  };
}
