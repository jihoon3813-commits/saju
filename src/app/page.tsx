import React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { QuestionCard } from "@/components/cards/QuestionCard";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { TrustCard } from "@/components/cards/TrustCard";
import { Button } from "@/components/ui/Button";
import { AdSlot } from "@/components/ads/AdSlot";
import { SERVICES, CONCERNS, ARTICLES } from "@/data/mockData";
import { Moon, Star, ArrowRight, UserPlus, Sparkles, FolderOpen, Compass, Search } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";
import { calculateManseChart, calculateTenGod, STEM_ELEMENTS } from "@/lib/manse/fourPillarsCalculator";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 대표글(첫 번째 글) 및 추천 글(나머지 5개 또는 6개)
  const featuredArticle = ARTICLES[0];
  const regularArticles = ARTICLES.slice(1);

  // 1. 사용자 세션 및 프로필 조회
  const user = await getCurrentUser();
  const anonSessionId = await getOrCreateAnonymousSession();
  
  let profiles: any[] = [];
  try {
    if (user) {
      profiles = await db.profiles.findByUserId(user.id);
    } else if (anonSessionId) {
      profiles = await db.profiles.findByAnonymousSessionId(anonSessionId);
    }
  } catch (dbErr) {
    console.error("Home profiles load error:", dbErr);
  }
  const activeProfiles = profiles.filter((p) => !p.deletedAt);
  const primaryProfile = activeProfiles[0];

  // 2. 오늘의 천간(일진)과 매칭한 십신 조언 생성
  let manseChart: any = null;
  let dailyTenGod = "";
  let dailyTip = "";

  if (primaryProfile) {
    try {
      manseChart = calculateManseChart({
        alias: primaryProfile.alias,
        genderRuleOption: primaryProfile.genderRuleOption,
        calendarType: primaryProfile.calendarType,
        lunarLeapMonth: primaryProfile.lunarLeapMonth,
        birthDate: primaryProfile.birthDate,
        birthTime: primaryProfile.birthTime,
        unknownBirthTime: primaryProfile.unknownBirthTime,
        birthCountry: primaryProfile.birthCountry || "KR",
        birthCity: primaryProfile.birthCity || "Seoul",
        timezone: primaryProfile.timezone || "Asia/Seoul",
        latitude: primaryProfile.latitude || 37.5665,
        longitude: primaryProfile.longitude || 126.978,
        useTrueSolarTime: false,
        borderTimeRule: "23"
      });

      // 오늘 날짜 기류 추출
      const kstTime = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
      const dateStr = kstTime.toISOString().split("T")[0];
      const todayChart = calculateManseChart({
        alias: "Today",
        genderRuleOption: "unspecified",
        calendarType: "solar",
        lunarLeapMonth: null,
        birthDate: dateStr,
        birthTime: "12:00",
        unknownBirthTime: false,
        birthCountry: "KR",
        birthCity: "Seoul",
        timezone: "Asia/Seoul",
        latitude: 37.5665,
        longitude: 126.978,
        useTrueSolarTime: false,
        borderTimeRule: "23"
      });

      const birthDayStem = manseChart.pillars.day.stem;
      const todayDayStem = todayChart.pillars.day.stem;
      dailyTenGod = calculateTenGod(birthDayStem, todayDayStem);

      const tipsMap: Record<string, string> = {
        비견: "자율성과 추진력이 커지는 날입니다. 스스로 결정하고 행동할 때 빛이 납니다.",
        겁재: "경쟁심이 고취되고 소비 심리가 일 수 있으니, 지출과 대인관계에서 배려를 취하세요.",
        식신: "창의성이 확장되고 기분 좋은 에너지가 유입되는 날입니다. 식도락이나 취미 활동에 제격입니다.",
        상관: "재치와 표현력이 돋보이는 하루입니다. 말실수를 아끼고 내적인 아이디어로 소통하세요.",
        편재: "활동성과 돈의 흐름이 활발해지는 시기입니다. 다만 성급한 계약은 한 템포 조율하세요.",
        정재: "꾸준한 노력의 결실을 거두기 용이한 안정적인 날입니다. 저축과 일상 관리에 집중하세요.",
        편관: "책임감과 업무 압박감이 높아질 수 있습니다. 무리하지 말고 가볍게 호흡을 가다듬으세요.",
        정관: "신뢰와 대접을 받으며 공적인 규율이 잘 잡히는 날입니다. 약속 이행에 최고입니다.",
        편인: "통찰력과 정신적 아이디어가 활발한 하루입니다. 깊이 생각하고 독서하기 길합니다.",
        정인: "인정과 배려를 얻고 문서나 시험 준비에 큰 지지를 받는 편안한 하루입니다."
      };
      dailyTip = tipsMap[dailyTenGod] || "오늘 나만의 고유 에너지를 느끼며 차분하게 하루를 설계해 보세요.";
    } catch (e) {
      console.error("Manse calculate error in home:", e);
    }
  }

  // 3. 최근 주문 리포트 보관 내역 조회
  let recentOrders: any[] = [];
  try {
    const allOrders = await db.orders.findAll();
    if (user) {
      recentOrders = await db.orders.findByUserId(user.id);
    } else if (anonSessionId && activeProfiles.length > 0) {
      const anonProfileIds = activeProfiles.map((p) => p.id);
      recentOrders = allOrders.filter((o) => {
        try {
          const inputs = JSON.parse(o.chartId || "{}");
          return anonProfileIds.includes(inputs.profileId);
        } catch {
          return false;
        }
      });
    }
  } catch (e) {
    console.error("Home orders load error:", e);
  }
  const completedOrders = recentOrders.filter(
    (o) => o.status === "completed" || o.status === "report_generating" || o.status === "paid"
  );

  return (
    <div className="space-y-16 pb-20">
      {/* 1. 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gold text-white pt-16 pb-20 md:py-24 border-b border-brand-border/20">
        {/* 미세한 전통 장식 그래픽 */}
        <div className="absolute top-1/2 left-1/12 transform -translate-y-1/2 opacity-10 pointer-events-none">
          <Moon className="w-48 h-48 text-white" />
        </div>
        <div className="absolute top-1/4 right-1/10 opacity-15 pointer-events-none">
          <Star className="w-10 h-10 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-1/4 right-1/8 opacity-10 pointer-events-none">
          <Star className="w-6 h-6 text-white" />
        </div>

        <Container className="relative z-10 text-center space-y-6 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs text-white font-semibold tracking-wider">
            <span>PREMIUM EASTERN PHILOSOPHY</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            오늘의 흐름부터 평생의 방향까지,
            <br />
            <span className="text-white/95">근거를 확인할 수 있는 운세</span>
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed font-medium">
            막연한 예언 대신, 검증된 전통 명리학 알고리즘 산출 수치와 
            최신 생성형 AI의 품격 있는 상황 분석을 직접 결합하여 확인하세요.
          </p>

          {/* 통합 검색바 입구 */}
          <form action="/search" method="GET" className="max-w-md mx-auto flex gap-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="q"
                placeholder="꿈해몽 사전이나 운세 키워드 검색 (예: 태몽, 이직, 편재)..."
                className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-white text-navy border border-brand-border focus:outline-none focus:ring-1 focus:ring-gold/60 transition-all font-semibold"
              />
            </div>
            <Button type="submit" className="bg-navy text-white hover:bg-navy/90 font-bold text-xs px-5 rounded-xl transition-all">
              검색
            </Button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/today" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full bg-white text-gold hover:bg-white/95 font-bold shadow-md">
                오늘 운세 보기
              </Button>
            </Link>
            <Link href="/saju" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-white/40 text-white hover:bg-white/10 font-bold">
                내 사주 입력하기
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* 2. 빠른 시작 섹션 */}
      <section>
        <Container className="space-y-6">
          <div className="flex items-end justify-between border-b border-brand-border pb-3">
            <div>
              <span className="text-xxs uppercase tracking-wider text-navy/40 font-bold">Quick Start</span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy mt-1">빠른 서비스 시작</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </Container>
      </section>

      {/* 광고 슬롯 예약 1 */}
      <AdSlot slotKey="home_after_cards" />

      {/* 3. 고민별 시작 섹션 */}
      <section>
        <Container className="space-y-6">
          <div className="flex items-end justify-between border-b border-brand-border pb-3">
            <div>
              <span className="text-xxs uppercase tracking-wider text-navy/40 font-bold">Concern Areas</span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy mt-1">고민 해결 중심 시작</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {CONCERNS.map((concern) => (
              <QuestionCard key={concern.id} concern={concern} />
            ))}
          </div>
        </Container>
      </section>

      {/* 4. 개인화 영역 (동적 결합) */}
      <section>
        <Container>
          {primaryProfile && manseChart ? (
            /* 프로필이 이미 등록된 사용자용 스마트 대시보드 */
            <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-4">
                <div>
                  <span className="text-[10px] text-gold font-bold tracking-widest uppercase">PERSONALIZED DASHBOARD</span>
                  <h3 className="text-xl font-bold text-navy mt-1">
                    반갑습니다, <span className="text-gold">{primaryProfile.alias}</span>님
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <Link href="/today">
                    <Button variant="primary" className="text-xs py-2 bg-gold hover:bg-gold/95 text-white font-bold rounded-lg shadow-sm">
                      오늘의 운세 리포트
                    </Button>
                  </Link>
                  <Link href="/my/profiles">
                    <Button variant="outline" className="text-xs py-2 border-brand-border hover:bg-cream/40 text-navy/70 rounded-lg">
                      프로필 관리
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* 왼쪽: 당일 일진 십신 조언 */}
                {dailyTenGod && (
                  <div className="bg-cream/40 border border-brand-border/60 p-5 rounded-2xl space-y-3 relative overflow-hidden">
                    <div className="flex items-center space-x-1.5 text-gold text-xs font-bold">
                      <Sparkles className="w-4 h-4 animate-pulse text-gold" />
                      <span>오늘 하루의 기운 코드: <strong className="text-gold font-extrabold">{dailyTenGod}</strong></span>
                    </div>
                    <p className="text-xs text-navy/80 leading-relaxed font-semibold">
                      {dailyTip}
                    </p>
                    <span className="text-[9px] text-navy/40 block">
                      ※ 내 일간 <strong>({manseChart.pillars.day.stem})</strong> 대비 오늘 천간의 조화성 대조 결과
                    </span>
                  </div>
                )}

                {/* 오른쪽: 사주 명식 요약 */}
                <div className="bg-cream/40 border border-brand-border/60 p-5 rounded-2xl space-y-3">
                  <span className="text-[10px] text-navy/60 font-bold block">나의 기저 원국 명조</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white py-2.5 rounded-lg border border-brand-border/60">
                      <span className="text-[10px] text-navy/40 block">시주</span>
                      <strong className="text-navy font-black">{manseChart.pillars.hour ? `${manseChart.pillars.hour.stem}${manseChart.pillars.hour.branch}` : "미상"}</strong>
                    </div>
                    <div className="bg-white py-2.5 rounded-lg border border-brand-border/60">
                      <span className="text-[10px] text-navy/40 block">일주(나)</span>
                      <strong className="text-gold font-black">{manseChart.pillars.day.stem}{manseChart.pillars.day.branch}</strong>
                    </div>
                    <div className="bg-white py-2.5 rounded-lg border border-brand-border/60">
                      <span className="text-[10px] text-navy/40 block">월주</span>
                      <strong className="text-navy font-black">{manseChart.pillars.month.stem}{manseChart.pillars.month.branch}</strong>
                    </div>
                    <div className="bg-white py-2.5 rounded-lg border border-brand-border/60">
                      <span className="text-[10px] text-navy/40 block">년주</span>
                      <strong className="text-navy font-black">{manseChart.pillars.year.stem}{manseChart.pillars.year.branch}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 보관함 리포트 바로가기 */}
              {completedOrders.length > 0 && (
                <div className="border-t border-brand-border pt-4 space-y-2">
                  <span className="text-[10px] text-navy/50 font-bold flex items-center space-x-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-navy/40" />
                    <span>보관 중인 프리미엄 리포트 결과지</span>
                  </span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {completedOrders.slice(0, 2).map((order) => (
                      <Link href={`/orders/${order.id}/report`} key={order.id} className="block select-none">
                        <div className="p-3 bg-white hover:bg-cream/10 border border-brand-border rounded-xl text-xs flex justify-between items-center transition-all">
                          <div>
                            <strong className="text-navy block">결과 확인서</strong>
                            <span className="text-[10px] text-navy/40 font-mono">주문번호: {order.id.substring(0, 8)}</span>
                          </div>
                          <span className="text-[10px] text-gold font-extrabold flex items-center space-x-0.5 animate-pulse">
                            <span>확인하기</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 프로필 미등록자용 가입 유도 배너 */
            <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-gold/15 rounded-full text-xxs font-bold text-gold">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>회원 혜택</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-navy">
                  사주 프로필을 저장하고 한 번에 조회하세요
                </h3>
                <p className="text-xs sm:text-sm text-navy/70 leading-relaxed max-w-xl">
                  매번 생년월일시를 입력할 필요가 없습니다. 자신을 포함해 소중한 사람(친구, 연인)의 프로필을 보관하고 클릭 한 번으로 매일의 운의 조화를 진단하세요.
                </p>
              </div>

              <Link href="/my/profiles/new" className="w-full md:w-auto shrink-0">
                <Button variant="primary" className="w-full md:w-auto flex items-center justify-center space-x-2 font-bold min-h-[44px]">
                  <span>프로필 등록하러 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* 5. 추천 콘텐츠 섹션 */}
      <section>
        <Container className="space-y-6">
          <div className="flex items-end justify-between border-b border-brand-border pb-3">
            <div>
              <span className="text-xxs uppercase tracking-wider text-navy/40 font-bold">Magazine & Encyclopedia</span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy mt-1">철학 칼럼 및 추천 정보</h2>
            </div>
            <Link href="/articles" className="text-xs font-semibold text-gold hover:underline flex items-center space-x-1">
              <span>백과사전 전체보기</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-8">
            {/* 대표글 */}
            {featuredArticle && <ArticleCard article={featuredArticle} featured={true} />}
            
            {/* 서브 글 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 6. 신뢰 섹션 */}
      <section className="bg-surface border-y border-brand-border py-12">
        <Container className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xxs uppercase tracking-widest text-gold font-bold">OUR COMMITMENT</span>
            <h2 className="text-xl sm:text-2xl font-bold text-navy">꿈과 운의 사전의 3대 신뢰 원칙</h2>
            <p className="text-xs text-navy/60 leading-relaxed">
              본 매거진은 사용자가 객관적이고 유용한 자기 이해의 이정표로 사주를 다룰 수 있도록 돕습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TrustCard
              type="engine"
              title="만세력 공식과 AI의 분리"
              description="정통 절기 명리학을 기반으로 한 음양오행 및 신살 수치 등 객관적 계산 원리와 AI의 해설 문장 레이어를 철저히 이중화하여 결과의 투명성을 확보합니다."
            />
            <TrustCard
              type="privacy"
              title="개인정보의 철저한 보호"
              description="운세 산출을 위해 입력한 생년월일시 정보는 사용자의 동의 없이는 서버에 상시 기록되거나 유출되지 않으며, 암호화 통신(HTTPS)으로 처리됩니다."
            />
            <TrustCard
              type="ethical"
              title="도덕적 가이드라인 준수"
              description="의료 진단, 극단적 파산이나 사망, 질병 등의 공포 유발 마케팅성 예언을 배제하고, 주체적이고 긍정적인 미래 개척을 돕는 해석만을 전달합니다."
            />
          </div>
        </Container>
      </section>

      {/* 광고 슬롯 예약 2 */}
      <AdSlot slotKey="home_after_content" />
    </div>
  );
}
