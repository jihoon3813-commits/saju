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

// 1. 빠른 시작 서비스 정보
export const SERVICES: ServiceItem[] = [
  {
    id: "today-fortune",
    title: "오늘의 운세",
    description: "생년월일시와 오늘 일진의 상호작용으로 분석하는 정밀 일일 운의 흐름",
    path: "/today",
    iconName: "Sun",
    isPopular: true,
  },
  {
    id: "saju",
    title: "정통 만세력 사주",
    description: "본인의 음양오행 비율, 십신(十神), 대운과 세운의 흐름까지 상세 계산",
    path: "/saju",
    iconName: "Calendar",
    isPopular: true,
  },
  {
    id: "compatibility",
    title: "맞춤형 궁합",
    description: "두 사람의 일간(日干) 대조 및 오행 상생상극을 통한 조화도 및 인연수 분석",
    path: "/compatibility",
    iconName: "Heart",
  },
  {
    id: "tarot",
    title: "AI 타로",
    description: "78장 메이저/마이너 아르카나 카드로 점치는 질문별 당면 과제와 조언",
    path: "/tarot",
    iconName: "Sparkles",
    badge: "인기",
  },
  {
    id: "dreams",
    title: "꿈해몽 사전",
    description: "전통 상징물 분석과 현대 심리학적 의미를 결합한 국내 최다 꿈 키워드 검색",
    path: "/dreams",
    iconName: "Moon",
  },
];

// 2. 고민별 시작 카테고리
export const CONCERNS: ConcernCategory[] = [
  {
    id: "love",
    title: "연애·관계",
    description: "상대방의 속마음, 결혼수, 현재 인연의 깊이와 갈등 해결방안",
    iconName: "HeartHandshake",
    path: "/compatibility",
  },
  {
    id: "money",
    title: "재물·사업",
    description: "투자 타이밍, 평생 재물 그릇 크기, 상업적 번창과 금전운의 향방",
    iconName: "Coins",
    path: "/saju",
  },
  {
    id: "career",
    title: "직장·시험",
    description: "승진운, 이직 시기, 합격수 및 나에게 맞는 진로와 직업 환경",
    iconName: "Briefcase",
    path: "/saju",
  },
  {
    id: "family",
    title: "가족·생활",
    description: "가정 화합, 건강 지표, 이사 및 문서 계약에 길한 방향과 시기",
    iconName: "Home",
    path: "/saju",
  },
  {
    id: "time",
    title: "시간의 흐름",
    description: "올해의 신수, 다가오는 10년 대운의 변화 시점 및 인생의 성수기",
    iconName: "Hourglass",
    path: "/today",
  },
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
