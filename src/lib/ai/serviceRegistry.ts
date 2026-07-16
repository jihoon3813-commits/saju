export interface ServiceSection {
  id: string;
  title: string;
  description: string;
}

export interface FortuneService {
  id: string;
  title: string;
  inputs: string[]; // ['profileId', 'profileId2', 'year', 'month', 'question']
  freePaid: "free" | "paid";
  sections: ServiceSection[];
  systemPromptAddendum?: string;
}

export const FORTUNE_SERVICES: Record<string, FortuneService> = {
  // P0 서비스 매핑
  saju_report: {
    id: "saju_report",
    title: "프리미엄 정통사주 평생 분석 리포트",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "saju_nature", title: "사주 원국과 기본 기질", description: "원국의 오행 및 기본 성향 강단 분석" },
      { id: "saju_elements", title: "음양 및 오행의 조화와 균형", description: "오행의 개수와 조화도 채점 및 부족한 기운" },
      { id: "saju_day", title: "일간(日干) 분석 및 일주론적 특성", description: "본인 일간의 상징과 태생적 성향 상세 기술" },
      { id: "saju_10god", title: "십성(十星) 구성으로 본 심리 분석", description: "십성 비율에 따른 사회적 지향성과 본질 심리" },
      { id: "saju_career_field", title: "사회 활동성 및 추천 직무 영역", description: "적합한 직업군과 직무 종류 분석" },
      { id: "saju_career_strength", title: "직업적 성공을 이끄는 강점과 역량", description: "사회 생활 시 무기가 되는 강점들" },
      { id: "saju_career_conflict", title: "피해야 할 조직 내 갈등 성향", description: "조직이나 대인관계에서 경계해야 할 태도" },
      { id: "saju_wealth_flow", title: "재물 기류의 흐름과 투자 성향", description: "재물을 모으는 패턴과 재산운 기복" },
      { id: "saju_wealth_save", title: "재정적 위기를 넘기는 자산 보존책", description: "재물을 지키는 전략" },
      { id: "saju_health_weak", title: "선천적 건강 취약 영역 및 양생 조언", description: "조심해야 할 신체 계통과 예방" },
      { id: "saju_health_bio", title: "건강 관리를 위한 데일리 바이오리듬", description: "기운에 따른 일상 관리" },
      { id: "saju_love_nature", title: "연애 및 대인관계 성향 분석", description: "관계에서의 태도와 심리" },
      { id: "saju_love_spouse", title: "이상적인 배우자 상 및 관계 조율 지침", description: "배우자궁 분석을 통한 이상향 조언" },
      { id: "saju_family_flow", title: "부모/자식/형제 등 가족간의 육친적 기류", description: "가족과의 인연과 갈등 조율" },
      { id: "saju_life_early", title: "인생의 전반기(초년·청년) 총평", description: "30대 이전까지의 인생 기류" },
      { id: "saju_life_late", title: "인생의 후반기(장년·말년) 총평", description: "40대 이후 및 말년운 기류" },
      { id: "saju_gaeun_guide", title: "사주에 결핍된 기운(용희신)을 채우는 일상 실천 가이드", description: "색상, 방향, 습관 등 개운법" }
    ]
  },
  mini_report: {
    id: "mini_report",
    title: "질문형 미니 리포트",
    inputs: ["profileId", "question"],
    freePaid: "paid",
    sections: [
      { id: "mini_question_focus", title: "고민하신 질문에 대한 명리학적 환경 해설", description: "질문하신 사건이나 고민을 둘러싼 우주적 기류 분석" },
      { id: "mini_question_decision", title: "결정을 돕는 구체적 조언과 최선의 시기", description: "실천 타임라인과 방향 추천" }
    ]
  },
  compatibility: {
    id: "compatibility",
    title: "2인 심층 궁합 리포트",
    inputs: ["profileId", "profileId2"],
    freePaid: "paid",
    sections: [
      { id: "compat_match_score", title: "종합 상성 점수와 에너지 인력 분석", description: "오행 끌림도 및 성격 지각 조화도" },
      { id: "compat_sync_points", title: "서로 시너지를 내는 오행/심리적 일치점", description: "잘 맞는 지점 분석" },
      { id: "compat_conflict_points", title: "성향 차이로 인해 발생할 수 있는 갈등과 해결책", description: "부딪히는 구간과 타협 방안" },
      { id: "compat_gaeun_action", title: "더 건강한 관계를 만드는 커플 행동지침", description: "서로에게 시너지를 주는 개운 행동" }
    ]
  },
  planner: {
    id: "planner",
    title: "연간 플래너 리포트",
    inputs: ["profileId", "year"],
    freePaid: "paid",
    sections: [
      { id: "plan_year_summary", title: "해당 연도 세운(歲運) 종합 운기 총평", description: "한 해 동안의 우세한 에너지 흐름" },
      { id: "plan_quarter_flow", title: "분기별 중점 행동 수립 지표", description: "1~4분기별 기회와 극복 과제" },
      { id: "plan_core_advice", title: "올해 반드시 성취해야 할 핵심 목표와 실천 지침", description: "연도별 추천 행동" }
    ]
  },

  // P1 서비스 매핑
  monthly: {
    id: "monthly",
    title: "월간 명리 흐름 리포트",
    inputs: ["profileId", "year", "month"],
    freePaid: "paid",
    sections: [
      { id: "mon_summary", title: "이번 달 세부 운기 총평", description: "한 달을 지배하는 일간 대비 월운 기류 분석" },
      { id: "mon_10god_flow", title: "월운 십신 작용 및 심리 변화", description: "이번 달 들어오는 십신의 특성과 마인드셋 관리법" },
      { id: "mon_weekly_flow", title: "주차별 에너지 가이드라인", description: "1주차부터 4주차까지의 일상 바이오리듬" },
      { id: "mon_gaeun_tip", title: "이번 달 조심해야 할 기운과 행운의 팁", description: "피해야 할 행동과 끌어올려야 할 행운의 조건" }
    ]
  },
  three_months: {
    id: "three_months",
    title: "3개월 집중 운세 리포트",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "tm_overall", title: "향후 3개월 단기 기류 총평", description: "3개월간의 기운 교차 상태 요약" },
      { id: "tm_month_by_month", title: "월별 핵심 테마 및 미션", description: "1개월차, 2개월차, 3개월차별 실행 포인트" },
      { id: "tm_action_plan", title: "단기 성과 극대화를 위한 행동 수칙", description: "성공과 리스크 관리를 위한 실질적 매뉴얼" }
    ]
  },
  new_year: {
    id: "new_year",
    title: "신년 종합 대운 리포트",
    inputs: ["profileId", "year"],
    freePaid: "paid",
    sections: [
      { id: "ny_summary", title: "신년 세운 핵심 요약", description: "해당 연도의 전체 운기 판도 해설" },
      { id: "ny_five_elements", title: "오행 배치를 통해 본 올해의 기운 분포", description: "목화토금수 흐름과 용희신 기운의 활성도" },
      { id: "ny_10god_manifest", title: "올해 일간이 겪는 십신 작용", description: "직업, 건강, 재물 영역별 십신 현상학적 대입" },
      { id: "ny_gaeun_calendar", title: "신년 월별 길흉 캘린더 요약", description: "가장 길한 달과 가장 신중해야 할 달 정리" }
    ]
  },
  wealth: {
    id: "wealth",
    title: "재물운·자산 평생 해설서",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "wl_base", title: "타고난 재물 그릇과 소비 심리", description: "정재/편재 구성을 통한 선천적 자산 태도" },
      { id: "wl_cycles", title: "평생 대운 흐름 속 재물운 황금기", description: "재정적 팽창 시점과 수축 시점 예측" },
      { id: "wl_action_gaeun", title: "부의 확장을 유도하는 명리 개운 재테크", description: "본인 사주에 길한 업종, 방향 및 리스크 헷징 방침" }
    ]
  },
  career: {
    id: "career",
    title: "직업·적성 성향 평생 보고서",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "cr_aptitude", title: "명리적 직무 재능과 최적 직군", description: "관성, 인성, 식상 조화를 바탕으로 한 직무 분야 추천" },
      { id: "cr_environment", title: "본인에게 맞는 최적의 직장 환경", description: "대기업, 공공기관, 스타트업, 독립 전문직 등 상성" },
      { id: "cr_success_key", title: "직장 생활 내 성공 요인과 자기계발 포인트", description: "핵심 커리어 강화 무기" }
    ]
  },
  job_change: {
    id: "job_change",
    title: "이직·이동운 집중 조언서",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "jc_current_state", title: "현재 직급/직장 내 에너지 부하 상태", description: "직업적 회의감이나 스트레스의 명리적 원인" },
      { id: "jc_best_timing", title: "이직 및 부서 이동 최적 타이밍", description: "세운/월운 상 문서운과 직장 변동운 매칭" },
      { id: "jc_direction_guide", title: "이직할 때 선택해야 할 길한 방향", description: "이직 대상 회사 분위기, 연봉 조율 태도 가이드" }
    ]
  },
  business: {
    id: "business",
    title: "창업·사업운 평생 설계서",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "bs_nature", title: "창업 자질 및 사업가 적성 진단", description: "식신생재, 상관생재 등 자영업/사업가 사주 구조 부합 여부" },
      { id: "bs_partnership", title: "동업 및 프랜차이즈, 지분 구조 상성", description: "비겁의 길흉에 따른 동업 리스크 진단" },
      { id: "bs_investment_timing", title: "사업 확장과 자금 투자 최적 주기", description: "안전 확장기 및 자금 동결기 제안" }
    ]
  },
  love: {
    id: "love",
    title: "연애·솔로 탈출 조언서",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "lv_personality", title: "나의 타고난 연애 심리와 스타일", description: "식상/재성/관성으로 본 본인의 매력 표출 방식" },
      { id: "lv_obstacle", title: "반복되는 연애 문제와 심리적 극복책", description: "관계 단절이나 갈등이 빚어지는 사주적 이면" },
      { id: "lv_timing", title: "새로운 인연이 다가오는 최적의 연애운 활성기", description: "새 인 만남이 길한 대운/세운 분석" }
    ]
  },
  marriage: {
    id: "marriage",
    title: "결혼·배우자 평생 보고서",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "mr_spouse_profile", title: "사주로 본 인연이 닿는 배우자 기질", description: "배우자궁 지장간 대조를 통한 인연 상 기술" },
      { id: "mr_best_age", title: "본인 사주의 길한 결혼 시기 및 나이", description: "안정적인 혼인 성립 운기" },
      { id: "mr_harmony_advice", title: "결혼 생활의 갈등을 다스리는 백년해로 개운 조언", description: "가정 화합을 위한 일상 조율 지침" }
    ]
  },
  reunion: {
    id: "reunion",
    title: "관계 재회·연락 인연 분석서",
    inputs: ["profileId", "question"],
    freePaid: "paid",
    sections: [
      { id: "ru_karmic_flow", title: "상대방과의 현재 기운 연결고리", description: "합/충 관계를 기반으로 한 관계 정체성 분석" },
      { id: "ru_timing_contact", title: "재회 및 연락이 닿을 가능성 높은 시기", description: "대립이 가라앉고 소통운이 열리는 주차/월 분석" },
      { id: "ru_mind_care", title: "인연의 집착을 끊거나 회복하기 위한 명리 심리 조언", description: "사용자의 무의식 치유 행동 지침" }
    ]
  },
  exam: {
    id: "exam",
    title: "합격·시험운 단기 집중 분석",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "ex_study_energy", title: "현재 학업 집중도 및 인성(印星) 기류", description: "뇌 활성 및 문서 기운 상태" },
      { id: "ex_exam_luck", title: "시험 당일 시험운 및 합격 기류", description: "경쟁 운 및 당일 관운 활성화 정도" },
      { id: "ex_mental_coach", title: "최상의 퍼포먼스를 내기 위한 멘탈 조율책", description: "불안감 해소 및 실천 조언" }
    ]
  },
  moving: {
    id: "moving",
    title: "이사·방위 개운 행동 가이드",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "mv_trigger", title: "이동/주거 변동 욕구의 사주적 원인", description: "역마살이나 지지 충으로 본 변동 지수" },
      { id: "mv_directions", title: "나에게 길한 방위 및 지역 기운", description: "오행 희기에 의거한 길방과 흉방 해설" },
      { id: "mv_date_select", title: "이사하기 좋은 행운의 날 선택 요령", description: "안전 이사일 필터링 원리 조언" }
    ]
  },
  child_disposition: {
    id: "child_disposition",
    title: "자녀 성향·기질 명리 발달서",
    inputs: ["profileId"],
    freePaid: "paid",
    sections: [
      { id: "cd_innate_style", title: "자녀의 오행 기질과 성격적 본질", description: "선천적으로 갖고 태어난 심리 성향" },
      { id: "cd_study_method", title: "사주 구성에 맞춘 스트레스 없는 학습 코칭", description: "식상형, 인성형, 관성형 등 맞춤 공부법" },
      { id: "cd_parenting_style", title: "자녀와 부모 간 소통을 돕는 양육 태도 조언", description: "갈등을 최소화하는 훈육 및 대화 팁" }
    ]
  },
  family_compatibility: {
    id: "family_compatibility",
    title: "가족간 다자 명리 궁합",
    inputs: ["profileId", "profileId2"], // 2인 이상을 모의하며 두 프로필 간의 에너지 구조 파악
    freePaid: "paid",
    sections: [
      { id: "fc_energy_balance", title: "가족 전체의 오행 분포 및 조화", description: "가족 구성원들의 기운이 섞여 빚어내는 전체 가문 기류" },
      { id: "fc_interaction_pairs", title: "구성원 간 시너지 포인트와 마찰 관계 해독", description: "부부, 부모-자식 관계의 오행적 상생상극 해설" },
      { id: "fc_household_peace", title: "가정 평화를 위한 각 역할별 실천 행동", description: "가족 관계 개선을 위한 상호 존중 팁" }
    ]
  }
};
