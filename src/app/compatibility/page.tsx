import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { Heart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = getMetadata({
  title: "맞춤형 궁합",
  description: "두 사람의 오행 상생상극과 조화도를 기반으로 조율하는 과학적 매칭 인연수 분석",
  canonicalPath: "/compatibility",
});

export default function CompatibilityPage() {
  const breadcrumbs = [{ name: "맞춤 궁합", path: "/compatibility" }];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center space-y-2 py-6">
          <span className="p-2.5 bg-red-50 text-red-500 rounded-full inline-block mb-2">
            <Heart className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">맞춤형 궁합</h1>
          <p className="text-sm text-navy/70 max-w-md mx-auto leading-relaxed">
            서로의 태어난 날(일간)과 지지의 상호 끌림, 오행의 보완관계를 세밀히 진단하여 관계의 핵심 성향을 알려드립니다.
          </p>
        </div>

        {/* 2단 입력 카드 (A와 B) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 본인 정보 (A) */}
          <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-navy border-b border-brand-border/60 pb-2 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold" />
              <span>본인 정보 (첫 번째 인물)</span>
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="년도(1995)" defaultValue="1995" className="w-full px-2.5 py-2 text-xs border border-brand-border rounded-lg" />
                <input type="number" placeholder="월(10)" defaultValue="10" className="w-full px-2.5 py-2 text-xs border border-brand-border rounded-lg" />
                <input type="number" placeholder="일(24)" defaultValue="24" className="w-full px-2.5 py-2 text-xs border border-brand-border rounded-lg" />
              </div>
              <select className="w-full px-2.5 py-2 text-xs border border-brand-border rounded-lg bg-surface">
                <option>시간 모름</option>
                <option>午시 (11:30 ~ 13:29)</option>
              </select>
              <div className="flex space-x-2 text-xs">
                <label className="flex-1 py-1.5 border border-gold text-gold bg-gold/5 rounded text-center cursor-pointer font-semibold">
                  <input type="radio" name="g-a" defaultChecked className="sr-only" /> 남성
                </label>
                <label className="flex-1 py-1.5 border border-brand-border text-navy/60 rounded text-center cursor-pointer">
                  <input type="radio" name="g-a" className="sr-only" /> 여성
                </label>
              </div>
            </div>
          </div>

          {/* 상대방 정보 (B) */}
          <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-navy border-b border-brand-border/60 pb-2 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sage" />
              <span>상대방 정보 (두 번째 인물)</span>
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="년도(1997)" defaultValue="1997" className="w-full px-2.5 py-2 text-xs border border-brand-border rounded-lg" />
                <input type="number" placeholder="월(03)" defaultValue="3" className="w-full px-2.5 py-2 text-xs border border-brand-border rounded-lg" />
                <input type="number" placeholder="일(15)" defaultValue="15" className="w-full px-2.5 py-2 text-xs border border-brand-border rounded-lg" />
              </div>
              <select className="w-full px-2.5 py-2 text-xs border border-brand-border rounded-lg bg-surface">
                <option>시간 모름</option>
                <option>卯시 (05:30 ~ 07:29)</option>
              </select>
              <div className="flex space-x-2 text-xs">
                <label className="flex-1 py-1.5 border border-brand-border text-navy/60 rounded text-center cursor-pointer">
                  <input type="radio" name="g-b" className="sr-only" /> 남성
                </label>
                <label className="flex-1 py-1.5 border border-gold text-gold bg-gold/5 rounded text-center cursor-pointer font-semibold">
                  <input type="radio" name="g-b" defaultChecked className="sr-only" /> 여성
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button variant="primary" className="font-bold min-h-[44px] px-10">
            두 사람의 인연 궁합 진단하기
          </Button>
        </div>

        {/* 결과 맛보기 목업 */}
        <div className="bg-[#EAE4D6]/30 border border-brand-border rounded-2xl p-6 shadow-xs text-center space-y-4 max-w-xl mx-auto">
          <div className="text-xs text-red-500 font-bold tracking-widest">AFFINITY SCORE</div>
          <div className="text-4xl font-serif font-bold text-navy flex items-center justify-center space-x-1.5">
            <span>85</span>
            <span className="text-gold text-2xl">%</span>
          </div>
          <h3 className="text-base font-bold text-navy">
            “상생(相生)의 기운이 높아 서로의 모자란 오행을 채워주는 은혜로운 관계입니다.”
          </h3>
          <p className="text-xs text-navy/70 leading-relaxed max-w-md mx-auto">
            일간 대비 서로의 오행 배치가 목화토금수 흐름에 맞춰 상호 보완합니다. 다만, 지지(地支) 간에 미세한 격각이 있으므로 큰 틀에서는 가치관이 일치하나 일상생활 습관 조율에서 양보가 다소 요구됩니다.
          </p>
        </div>
      </div>
    </Container>
  );
}
