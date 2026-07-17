export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  path: string;
  iconName: string;
  badge?: string;
  isPopular?: boolean;
}

export interface ArticleItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  readTime: string;
  slug: string;
  imageName: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ConcernCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  path: string;
}

export interface DreamSample {
  id: string;
  keyword: string;
  meaning: string;
  category: string;
}

// 1. 빠른 시작 서비스 정보 (Deprecated)
export const SERVICES: ServiceItem[] = [];

// 2. 고민별 시작 카테고리 (Deprecated)
export const CONCERNS: ConcernCategory[] = [];

export interface SubServiceItem {
  label: string;
  href: string;
  desc?: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  items: SubServiceItem[];
}

// 2.5 메인 랜딩용 상단 메뉴 및 서브메뉴 카테고리 데이터
export const LANDING_CATEGORIES: ServiceCategory[] = [
  {
    id: "saju",
    title: "정통 명리학 사주",
    description: "수천 년 검증된 만세력 규칙과 십신 격국 분석을 통해 인생의 사계절을 읽습니다.",
    iconName: "Calendar",
    items: [
      { label: "무료 만세력 조회", href: "/saju?type=manse", desc: "나의 여덟 글자와 오행 분포" },
      { label: "평생 사주 종합", href: "/saju?type=pyungsaeng", desc: "타고난 격국과 오행 비율" },
      { label: "10대 대운 흐름", href: "/saju?type=daewun", desc: "인생의 큰 전환기 타이밍" },
      { label: "신년 신수 비결", href: "/saju?type=tojung", desc: "올해 일어날 주요 사건 예견" },
      { label: "월간 종합 운세", href: "/saju?type=monthly", desc: "달마다 변화하는 길흉화복" },
      { label: "오늘의 일진 상세", href: "/saju?type=today", desc: "가장 알맞은 행동 지침" },
    ],
  },
  {
    id: "tarot",
    title: "AI 신비 타로",
    description: "78장의 아르카나 카드를 통해 당면한 고민의 무의식적 원인과 조언을 탐색합니다.",
    iconName: "Sparkles",
    items: [
      { label: "원 카드 (One Card)", href: "/tarot", desc: "오늘 하루에 대한 원포인트 조언" },
      { label: "쓰리 카드 (과거/현재/미래)", href: "/tarot", desc: "문제 흐름의 종합적 진단" },
      { label: "켈틱 크로스 스프레드", href: "/tarot", desc: "복잡한 문제의 심층 다각도 분석" },
      { label: "그 사람의 속마음", href: "/tarot", desc: "연애운과 관계의 실마리" },
      { label: "금전 이직의 양자택일", href: "/tarot", desc: "선택에 따른 예상 시나리오" },
    ],
  },
  {
    id: "dreams",
    title: "상징 꿈해몽 사전",
    description: "무의식이 보내는 신호를 현대 심리 분석과 동양 길흉 철학으로 번역합니다.",
    iconName: "Moon",
    items: [
      { label: "동물 꿈 (용, 돼지, 뱀)", href: "/dreams", desc: "태몽과 권세를 부르는 꿈" },
      { label: "재물 꿈 (불, 똥, 물)", href: "/dreams", desc: "재수가 대통하는 대표 길몽" },
      { label: "인물 꿈 (부모, 귀인, 연인)", href: "/dreams", desc: "인간관계와 조력의 메시지" },
      { label: "길몽과 흉몽 구별법", href: "/articles", desc: "꿈의 느낌이 좌우하는 징조" },
      { label: "태몽의 상징물 해석", href: "/articles", desc: "아이의 기질을 나타내는 꿈" },
      { label: "심리 억압과 꿈의 관계", href: "/articles", desc: "스트레스가 유발하는 자각몽" },
    ],
  },
  {
    id: "compatibility",
    title: "인연 궁합",
    description: "두 사람의 일간(日干) 대조 및 오행 상생상극을 통한 조화도 및 인연수 분석",
    iconName: "Heart",
    items: [
      { label: "맞춤형 궁합 조회", href: "/compatibility", desc: "나와 상대방의 사주 결합 분석" }
    ]
  },
  {
    id: "articles",
    title: "운세백과",
    description: "명리 칼럼, 오행 정보, 신살 해설 등 방대한 명리 지식 저장소",
    iconName: "BookOpen",
    items: [
      { label: "운세백과 전체 칼럼", href: "/articles", desc: "명리학 지식 및 해몽 팁 등 다양한 리서치" }
    ]
  }
];

// 3. 추천 콘텐츠 (운세백과)
export const ARTICLES: ArticleItem[] = [
  {
    id: "art-1",
    title: "대운이 바뀌기 직전 나타나는 5가지 징조",
    summary: "인생의 큰 흐름인 10년 대운이 교체되는 교운기(交運期)에 신체와 주변 환경, 인간관계에서 흔히 나타나는 뚜렷한 징후를 동양 철학적 관점에서 풀어냅니다.",
    category: "사주기초",
    publishedAt: "2026-07-10",
    readTime: "5분",
    slug: "signs-of-major-fortune-change",
    imageName: "fortune_change",
  },
  {
    id: "art-2",
    title: "하늘을 나는 꿈, 과연 길몽일까? 꿈속 상황별 총정리",
    summary: "하늘을 자유롭게 날아다니는 꿈은 신분 상승이나 자유를 뜻하지만, 날다가 추락하거나 장애물에 부딪히는 꿈은 다르게 해석됩니다. 상황별 상세 해몽을 공개합니다.",
    category: "꿈해몽",
    publishedAt: "2026-07-12",
    readTime: "4분",
    slug: "flying-dream-interpretation",
    imageName: "flying_dream",
  },
  {
    id: "art-3",
    title: "내 사주에 물(水)이 많다면? 오행의 조화와 대처법",
    summary: "사주팔자 중 특정 오행이 과다할 때 삶의 성향과 건강에 미치는 영향, 그리고 이를 보완하기 위한 색상, 음식, 인테리어 등 일상생활 속 오행 조절 팁을 소개합니다.",
    category: "오행론",
    publishedAt: "2026-07-14",
    readTime: "6분",
    slug: "water-rich-saju-guide",
    imageName: "water_element",
  },
  {
    id: "art-4",
    title: "타로 메이저 카드 0번 '광대(The Fool)'가 가진 모험의 의미",
    summary: "새로운 시작과 무한한 가능성, 때로는 무모함을 뜻하는 광대 카드가 질문에 따라 어떻게 다르게 해석되는지 실전 리딩 팁과 함께 깊이 있게 알아봅니다.",
    category: "타로해석",
    publishedAt: "2026-07-15",
    readTime: "4분",
    slug: "the-fool-tarot-meaning",
    imageName: "the_fool",
  },
  {
    id: "art-5",
    title: "사주 십신(十神) 이해하기: 편재와 정재의 차이점",
    summary: "내가 극하는 오행이자 재물을 의미하는 재성(財星). 그중에서도 예기치 않은 큰돈을 뜻하는 편재와 규칙적인 소득을 의미하는 정재의 실제 작용과 성격적 차이를 비교합니다.",
    category: "사주기초",
    publishedAt: "2026-07-08",
    readTime: "7분",
    slug: "difference-between-piancai-and-zhengcai",
    imageName: "wealth_star",
  },
  {
    id: "art-6",
    title: "불을 보는 꿈이 재물운을 불러오는 과학적·철학적 이유",
    summary: "활활 타오르는 불을 보거나 집에 불이 나는 꿈은 강렬한 길몽으로 통합니다. 불이 상징하는 확장과 번영의 에너지가 어떻게 현실의 재물운으로 연결되는지 해설합니다.",
    category: "꿈해몽",
    publishedAt: "2026-07-05",
    readTime: "3분",
    slug: "fire-dream-wealth",
    imageName: "fire_dream",
  },
];

// 4. 자주 묻는 질문 (FAQ)
export const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "태어난 시간을 정확히 모르면 사주를 볼 수 없나요?",
    answer: "태어난 시간을 모를 경우에도 생년월일(삼주)만으로 성향, 연간 흐름, 대운의 큰 줄기를 70% 이상 도출할 수 있습니다. 단, 시지(時支)가 결정하는 말년운이나 자식운, 정밀한 격국 판단에는 오차가 발생할 수 있습니다. 저희 서비스는 태어난 시간을 모를 때 '시간 모름' 옵션을 선택할 수 있도록 지원합니다.",
  },
  {
    id: "faq-2",
    question: "음력과 양력 기준은 어떻게 설정해야 하나요?",
    answer: "본인이 평소에 알고 계시는 생일 종류(음력 평달, 음력 윤달, 양력)를 그대로 입력 폼에 선택해 주시면 됩니다. 계산 엔진이 한국천문연구원 데이터를 바탕으로 자동 변환하여 정밀한 절기 기준의 사주팔자를 산출합니다.",
  },
  {
    id: "faq-3",
    question: "AI가 도출하는 운세 해석의 신뢰도는 어느 정도인가요?",
    answer: "저희 AI는 만세력 엔진이 도출한 오행 점수, 십신 배치, 신살 등 엄밀한 규칙적 철학 데이터만을 프롬프트 주입(RAG) 방식으로 받아 해석합니다. AI가 사주팔자를 임의로 추론하거나 상상하여 지어내는 현상(할루시네이션)을 원천 차단하였으므로, 전통 명리학의 규칙에 충실하면서도 현대적인 문장으로 일목요연하게 해석을 받아보실 수 있습니다.",
  },
  {
    id: "faq-4",
    question: "가족이나 친구의 사주를 여러 개 등록하고 관리할 수 있나요?",
    answer: "회원가입 후 마이페이지를 이용하시면 본인 외에도 가족, 친구, 연인 등 최대 5명의 생년월일시 프로필을 관리할 수 있습니다. 이를 통해 매번 정보를 새로 입력하지 않고 클릭 한 번으로 오늘의 운세나 상대방과의 궁합을 바로 확인할 수 있습니다.",
  },
  {
    id: "faq-5",
    question: "꿈해몽 검색 결과는 어떻게 활용해야 하나요?",
    answer: "꿈은 현실의 예지이기도 하지만, 당면한 심리적 스트레스나 무의식의 보상 작용인 경우가 많습니다. 꿈해몽 결과를 맹신하기보다는 내 마음속에 어떤 감정과 억압이 있었는지 돌아보는 내면적 이정표로 활용하시는 것을 권장합니다.",
  },
];

// 5. 꿈해몽 추천 키워드 및 예시
export const DREAM_SAMPLES: DreamSample[] = [
  { id: "ds-1", keyword: "이빨 빠지는 꿈", meaning: "가족이나 지인의 건강 악화, 혹은 현재 추진 중인 일의 지지부진함을 뜻하는 심리몽", category: "인체" },
  { id: "ds-2", keyword: "똥 밟는 꿈", meaning: "대표적인 재물운 길몽으로, 뜻하지 않은 횡재나 쾌적한 금전적 이득을 예견", category: "생활" },
  { id: "ds-3", keyword: "돼지가 품으로 안기는 꿈", meaning: "태몽이거나 재복이 크게 늘어날 기회를 상징하는 전통적인 대길몽", category: "동물" },
  { id: "ds-4", keyword: "돌아가신 부모님이 웃는 꿈", meaning: "집안에 경사가 생기고 어려운 문제가 귀인의 도움으로 풀리게 됨을 예시", category: "인물" },
  { id: "ds-5", keyword: "도둑 맞는 꿈", meaning: "오히려 골치 아픈 근심 걱정이 사라지거나, 반대로 현실에서의 실수가 생길 수 있음을 경고", category: "사건" },
  { id: "ds-6", keyword: "물에 빠지는 꿈", meaning: "감정적인 혼란이나 건강 불안을 경고하지만, 물에서 구조되는 꿈은 위기 극복을 뜻함", category: "자연" },
];
