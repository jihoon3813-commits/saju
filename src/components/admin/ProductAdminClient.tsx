"use client";

import React, { useState } from "react";
import { toggleProductActiveAction, createPriceVersionAction } from "@/app/actions/admin";

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  active: boolean;
  productType: string;
}

interface PriceVersion {
  id: string;
  productId: string;
  price: number;
  version: string;
  createdAt: Date;
}

interface ProductAdminClientProps {
  initialProducts: Product[];
  priceVersions: Record<string, PriceVersion[]>;
}

export default function ProductAdminClient({ initialProducts, priceVersions }: ProductAdminClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [newPrice, setNewPrice] = useState<Record<string, string>>({});
  const [newVersion, setNewVersion] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const handleToggleActive = async (id: string) => {
    const orig = products.find((p) => p.id === id);
    if (!orig) return;

    try {
      const res = await toggleProductActiveAction(id);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
        );
      } else {
        alert(res.error || "상태 변경 실패");
      }
    } catch (err) {
      alert("서버 연결에 실패했습니다.");
    }
  };

  const handleCreatePriceVersion = async (productId: string) => {
    const priceStr = newPrice[productId] || "";
    const ver = newVersion[productId] || "";

    if (!priceStr || !ver) {
      alert("가격과 버전 명칭을 모두 입력해 주세요.");
      return;
    }

    setLoading((prev) => ({ ...prev, [productId]: true }));

    try {
      const res = await createPriceVersionAction({
        productId,
        price: Number(priceStr),
        version: ver.trim()
      });

      if (res.success) {
        alert("새로운 가격 개정안이 정상 등록되었습니다!");
        window.location.reload(); // 갱신된 버전 리스트 출력을 위해 리로드
      } else {
        alert(res.error || "가격 등록 실패");
        setLoading((prev) => ({ ...prev, [productId]: false }));
      }
    } catch (err) {
      alert("가격 개정 중 에러가 발생했습니다.");
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="space-y-8 font-semibold">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">유료 상품 및 가격 대장</h1>
          <p className="text-navy/60 text-xs mt-1">상점 노출 여부 관리 및 상품별 가격 변동 개정 이력 등록</p>
        </div>
      </div>

      <div className="space-y-6">
        {products.map((prod) => {
          const versions = priceVersions[prod.id] || [];

          return (
            <div
              key={prod.id}
              className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* 왼쪽: 상품 정보 및 토글 */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] bg-cream font-bold px-2 py-0.5 rounded border border-brand-border text-navy/65 uppercase">
                    {prod.productType}
                  </span>
                  <h3 className="text-lg font-bold text-navy mt-1.5">{prod.title}</h3>
                  <p className="text-xs text-navy/40 font-mono mt-0.5">ID: {prod.id}</p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-navy/50 block">현재 가격</span>
                    <span className="text-emerald-600 font-extrabold text-sm">
                      {prod.price.toLocaleString()} 원
                    </span>
                  </div>
                  <div>
                    <span className="text-navy/50 block">노출 유무</span>
                    <button
                      onClick={() => handleToggleActive(prod.id)}
                      className={`px-2.5 py-1 rounded-full font-bold transition text-[10px] cursor-pointer ${
                        prod.active
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-cream text-navy/40 border border-brand-border/60"
                      }`}
                    >
                      {prod.active ? "상점 활성 노출 중" : "비활성 점검 중"}
                    </button>
                  </div>
                </div>
              </div>

              {/* 중앙: 새로운 가격 개정 */}
              <div className="space-y-3 bg-cream/30 p-4 rounded-xl border border-brand-border/60">
                <h4 className="text-xs font-bold text-navy/70">💵 새로운 가격 버전 개정</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={newPrice[prod.id] || ""}
                    onChange={(e) =>
                      setNewPrice((prev) => ({ ...prev, [prod.id]: e.target.value }))
                    }
                    placeholder="개정 가격 (원)"
                    className="bg-white text-navy border border-brand-border rounded-lg p-2 text-xs focus:outline-none placeholder-navy/20"
                  />
                  <input
                    type="text"
                    value={newVersion[prod.id] || ""}
                    onChange={(e) =>
                      setNewVersion((prev) => ({ ...prev, [prod.id]: e.target.value }))
                    }
                    placeholder="버전명 (예: 1.1.0)"
                    className="bg-white text-navy border border-brand-border rounded-lg p-2 text-xs focus:outline-none placeholder-navy/20"
                  />
                </div>
                <button
                  onClick={() => handleCreatePriceVersion(prod.id)}
                  disabled={loading[prod.id]}
                  className="w-full py-2 bg-gold hover:bg-gold/95 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                >
                  {loading[prod.id] ? "등록 처리 중" : "새 가격 등록 및 갱신"}
                </button>
              </div>

              {/* 오른쪽: 이전 가격 변동 이력 */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                <h4 className="text-xs font-bold text-navy/60 mb-2">📅 가격 개정 히스토리</h4>
                {versions.length === 0 ? (
                  <p className="text-[10px] text-navy/40">등록된 과거 가격 이력이 없습니다.</p>
                ) : (
                  <div className="space-y-1.5 text-[10px] text-navy/70">
                    {versions.map((ver) => (
                      <div
                        key={ver.id}
                        className="flex justify-between items-center p-2 bg-cream/15 border border-brand-border/40 rounded-lg"
                      >
                        <span className="font-bold text-navy/80">v{ver.version}</span>
                        <span className="font-semibold">{ver.price.toLocaleString()} 원</span>
                        <span className="text-navy/40">
                          {new Date(ver.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
