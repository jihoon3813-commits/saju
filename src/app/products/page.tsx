import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await db.products.findAll();
  const activeProducts = products.filter((p) => p.active);

  // 4종 상품의 부가 상세 카드 메타데이터 바인딩
  const extraMetadataMap: Record<string, {
    icon: string;
    benefits: string[];
    badge: string;
    gradient: string;
  }> = {
    "basic-saju-premium": {
      icon: "📜",
      badge: "베스트셀러",
      gradient: "from-indigo-600 to-purple-600",
      benefits: ["20개 명리 분석 섹션", "대운·세운 평생 연대표 제공", "A4 고품질 PDF 소장 가치", "Yin-Yang 조화율"]
    },
    "mini-saju-report": {
      icon: "🎯",
      badge: "가성비 극강",
      gradient: "from-sky-500 to-indigo-600",
      benefits: ["개인 질문 1:1 맞춤 집중 풀이", "3개월 단기 기류 진단", "5분 이내 고속 발급", "개운 실천 행동"]
    },
    "premium-compatibility": {
      icon: "💖",
      badge: "연인 필독",
      gradient: "from-rose-500 to-pink-600",
      benefits: ["동반자 성향 완전 대조", "합(合)과 충(沖)의 상호 작용", "갈등 예방 소통 지침", "대운 조화도"]
    },
    "annual-planner": {
      icon: "📅",
      badge: "시즌 스페셜",
      gradient: "from-amber-500 to-orange-600",
      benefits: ["연간 세운 종합 총평", "월별 월운 길일 캘린더", "주의해야 할 리듬 경보", "월별 실천 플래너"]
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm px-3 py-1 bg-indigo-950/50 rounded-full border border-indigo-900/50">
            Premium Report Hub
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 tracking-tight">
            인생의 지도를 넓히는 프리미엄 명리 분석
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
            무료 요약 결과로는 풀리지 않던 핵심 고민들을 명리 원국 정밀 분석 및 대규모 섹션을 통해 속 시원하게 해결해 드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:max-w-5xl lg:mx-auto">
          {activeProducts.map((prod) => {
            const meta = extraMetadataMap[prod.slug] || {
              icon: "💎",
              badge: "신규 상품",
              gradient: "from-indigo-600 to-purple-600",
              benefits: ["명리 분석 보고서"]
            };

            return (
              <div
                key={prod.id}
                className="relative flex flex-col justify-between p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-2xl hover:border-indigo-500/50 transition-all duration-300 hover:shadow-indigo-950/20 group"
              >
                {prod.sampleReportId && (
                  <span className="absolute top-4 right-4 bg-indigo-900/80 border border-indigo-700/50 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full">
                    {meta.badge}
                  </span>
                )}
                <div>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                    {meta.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">
                    {prod.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-extrabold text-slate-100">
                      {prod.price.toLocaleString()}
                    </span>
                    <span className="text-slate-400 ml-1 text-sm">원</span>
                  </div>

                  <ul className="space-y-3 mb-8 border-t border-slate-800/80 pt-6">
                    {meta.benefits.map((b, i) => (
                      <li key={i} className="flex items-center text-sm text-slate-300">
                        <span className="text-indigo-400 mr-2">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/products/${prod.slug}`}
                  className="w-full text-center py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                >
                  리포트 상세 구성 보기
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center text-slate-500 text-xs">
          <p>디지털 콘텐츠 특성상 운세 리포트 생성이 완료된 후에는 원칙적으로 청약철회(환불)가 불가능합니다.</p>
          <p className="mt-1">결제 전 각 상품별 상세 페이지의 약관 및 예시 자료를 꼼꼼히 확인해 주세요.</p>
        </div>
      </div>
    </main>
  );
}
