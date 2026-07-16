import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  // ESC 키 클릭 시 닫기 접근성 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 모달이 열려있을 때 바디 스크롤 차단
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 오버레이 */}
      <div
        className="fixed inset-0 bg-navy/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* 모달 박스 */}
      <div
        className="relative bg-surface w-full max-w-lg rounded-2xl shadow-xl border border-brand-border flex flex-col max-h-[85vh] z-10 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-border">
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-navy/40 hover:text-navy hover:bg-cream/40 transition-colors focus:ring-2 focus:ring-gold/40 focus:outline-none min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="모달 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 */}
        <div className="p-6 overflow-y-auto text-sm text-navy/80 leading-relaxed">
          {children}
        </div>

        {/* 푸터 */}
        {footer && (
          <div className="px-6 py-4 border-t border-brand-border bg-cream/10 flex items-center justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
