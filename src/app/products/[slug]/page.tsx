import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";
import PurchaseSelector from "@/components/products/PurchaseSelector";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. 상품 로드
  const product = await db.products.findBySlug(slug);
  if (!product || !product.active) {
    notFound();
  }

  // 2. 현재 로그인 사용자 또는 익명 세션 정보 획득
  const user = await getCurrentUser();
  const anonSessionId = await getOrCreateAnonymousSession();

  let rawProfiles: any[] = [];
  if (user) {
    rawProfiles = await db.profiles.findByUserId(user.id);
  } else if (anonSessionId) {
    rawProfiles = await db.profiles.findByAnonymousSessionId(anonSessionId);
  }

  const profiles = rawProfiles
    .filter((p) => !p.deletedAt)
    .map((p) => ({
      id: p.id,
      alias: p.alias,
      birthDate: p.birthDate,
      birthTime: p.birthTime || null
    }));

  // 상품별 해결 질문 및 섹션 구조 정의
  const productDetailsMap: Record<string, {
    resolvedQuestions: string[];
    sections: string[];
    sampleLink?: string;
  }> = {
    "basic-saju-premium": {
      resolvedQuestions: [
        "내가 태어난 연월일시의 에너지가 구성하는 '평생의 명리학적 총평'은?",
        "직업적으로 언제 큰 성공을 거두며, 어떤 형태의 조직이나 사업이 어울릴까?",
        "재물운의 극대화 시점과 평생 동안 재산을 지킬 수 있는 방법은?",
        "나의 취약 장기와 기질적 피로도를 해결하기 위한 일상 양생 비책은?"
      ],
      sections: [
        "원국 및 오행의 불균형 분석",
        "일주론 기반 나의 원초 기질 분석",
        "십성 구조 및 현대적 심리 성향 해설",
        "직업적 강점 및 어울리는 기업/조직군",
        "평생의 대운 연표 및 다가올 대운 지침",
        "개운을 위한 하루 3대 행동 실천 과제"
      ]
    },
    "mini-saju-report": {
      resolvedQuestions: [
        "현재 다니는 직장을 이번 가을 이직해야 할까, 내년 봄까지 버텨야 할까?",
        "앞으로 3달 동안 준비하는 대규모 시험이나 투자 계약의 합/충 기류는?",
        "A와 새로운 사업적 동업을 진행해도 될까, 혹은 내 주도로 가야 할까?"
      ],
      sections: [
        "질문 상황에 대한 명리 기저 진단",
        "3개월 이내의 단기 결정 여파 예측",
        "1년 이상의 장기적 파급 효과 분석",
        "최적의 의사결정을 돕는 수단 제시",
        "행동 가이드 및 멘탈 조율책"
      ]
    },
    "premium-compatibility": {
      resolvedQuestions: [
        "우리의 일간 궁합 조화율과 서로의 무의식적 끌림 현상 원인은?",
        "자주 다투는 성격적 충돌 지점과 이를 해결할 소통의 핵심 열쇠는?",
        "두 사람의 사주가 만났을 때 보완되는 오행의 과다/결핍 상태는?",
        "다가오는 3년 동안 두 사람이 함께 맞이할 운세의 공동 상승 지점은?"
      ],
      sections: [
        "두 대상자 각각의 관계 맺기 기질 대조",
        "일간 간 천간합·생극 분석",
        "지지 합·충·해·원진 상호작용 검사",
        "오행 에너지의 조화적 보완 비율 산출",
        "지속적인 신뢰를 위한 3가지 대화 행동 수칙"
      ]
    },
    "annual-planner": {
      resolvedQuestions: [
        "이번 연도의 세운 간지가 나에게 주는 연간 핵심 테마와 성찰 과제는?",
        "가장 기운이 활성화되어 투자나 확장을 펼쳐야 할 '최고의 월'은 언제일까?",
        "반대로 스트레스 지수가 커서 신체적/정신적으로 자제해야 할 '경계의 월'은?",
        "사주 기류에 기초한 월별 실천 캘린더 요령은?"
      ],
      sections: [
        "연간 종합 운세 및 세운 해석",
        "상반기(1~6월) 월별 운세 요약 및 조언",
        "하반기(7~12월) 월별 운세 요약 및 조언",
        "기회 요소 및 조율 위험 요소 표",
        "맞춤 개운 실천 체크리스트"
      ]
    }
  };

  const details = productDetailsMap[product.slug] || {
    resolvedQuestions: ["사용자의 개별 운세 질문 분석"],
    sections: ["정밀 해석 결과 제공"]
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/products" className="text-sm text-indigo-400 hover:text-indigo-300 transition">
            ← 전체 프리미엄 리포트 목록으로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 상품 상세 설명 */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
                {product.title}
              </h1>
              <p className="mt-4 text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* 해결 고민 영역 */}
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
              <h3 className="text-lg font-bold text-slate-200 mb-4">🎯 이 리포트가 해결해 드리는 평생의 질문</h3>
              <ul className="space-y-3">
                {details.resolvedQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start">
                    <span className="text-sky-400 mr-2 font-bold">Q.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 리포트 구조 */}
            <div>
              <h3 className="text-lg font-bold text-slate-200 mb-4">📊 포함되는 상세 해석 섹션 구성</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {details.sections.map((sect, i) => (
                  <div key={i} className="flex items-center p-3 bg-slate-900/20 border border-slate-900 rounded-xl">
                    <span className="text-indigo-400 font-bold mr-3">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm text-slate-300">{sect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 환불 규정 및 안내 */}
            <div className="bg-slate-900/20 p-6 rounded-2xl border border-slate-900 text-xs text-slate-400 space-y-2">
              <h4 className="font-bold text-slate-300">⚠️ 상품 이용 및 디지털 환불 조건</h4>
              <p>본 상품은 전자상거래법 등에서의 소비자보호에 관한 법률에 따른 디지털 콘텐츠 상품입니다.</p>
              <p>구매 직후 백그라운드 AI 해석 엔진이 가동되어 운세 해석 스냅샷 작성을 시작합니다. **해석 생성이 시작되거나 완료된 리포트(completed/report_generating)는 디지털 상품 훼손 방지를 위해 결제 후 청약철회(환불)가 절대 불가합니다.**</p>
              <p>단, 시스템의 일시적 오류나 API 한도 제한 등으로 인해 12시간 내에 결과물이 송출되지 않았거나 결제 도중 중복 승인이 일어난 경우 결제 당일 전액 환불 요청이 가능합니다.</p>
            </div>
          </div>

          {/* 구매 대상 지정 사이드바 */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 sticky top-6">
              <div className="mb-6">
                <span className="text-xs text-slate-400 block mb-1">구매 가격 (VAT 포함)</span>
                <span className="text-3xl font-extrabold text-slate-100">{product.price.toLocaleString()}</span>
                <span className="text-slate-400 ml-1 text-sm">원</span>
              </div>

              {/* 클라이언트 사이드 구매 선택기 연계 */}
              <PurchaseSelector
                productId={product.id}
                productType={product.productType}
                profiles={profiles}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
