export interface TarotCard {
  id: number;
  name: string;
  arcana: "major" | "minor";
  suit: "wands" | "cups" | "swords" | "pentacles" | null;
  value: number; // 0~21 for Major, 1~14 for Minor
  meaningUp: string;
  meaningRev: string;
  imagePath: string;
  copyrightField: string;
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
}

// 78장 타로 아르카나 데이터셋 동적 빌더
export function buildTarotDeck(): TarotCard[] {
  const deck: TarotCard[] = [];

  // 1. Major Arcana 22장 (0~21)
  const majorNames = [
    "광대 (The Fool)", "마법사 (The Magician)", "고위 여사제 (The High Priestess)",
    "여황제 (The Empress)", "황제 (The Emperor)", "교황 (The Hierophant)",
    "연인 (The Lovers)", "전차 (The Chariot)", "힘 (Strength)",
    "은둔자 (The Hermit)", "운명의 수레바퀴 (Wheel of Fortune)", "정의 (Justice)",
    "매달린 사람 (The Hanged Man)", "죽음 (Death)", "절제 (Temperance)",
    "악마 (The Devil)", "탑 (The Tower)", "별 (The Star)",
    "달 (The Moon)", "태양 (The Sun)", "심판 (Judgement)", "세계 (The World)"
  ];

  const majorUp = [
    "모험, 순수함, 자유로운 시작", "창조력, 기술, 의지 관철", "직관, 지혜, 내면의 성찰",
    "풍요, 모성애, 물질적 성공", "권위, 규율, 리더십 구축", "전통, 조언, 정신적 가이드",
    "조화, 매력, 중요한 선택", "돌파력, 승리, 통제력 발휘", "인내, 내면의 용기, 조절력",
    "자기 탐색, 성찰, 지혜의 획득", "운명적인 변화, 기회, 행운", "공정함, 진실, 균형 잡힌 결정",
    "과도기, 희생, 관점의 전환", "종결, 새로운 출발, 변혁", "절제, 조화, 타협과 융합",
    "중독, 굴레, 집착, 물질적 유혹", "갑작스러운 붕괴, 경종, 극적 깨달음", "희망, 영감, 긍정적인 비전",
    "불안, 무의식, 착각과 혼돈", "활력, 성공, 기쁨, 명확성", "재평가, 부활, 내면의 부름", "완성, 통합, 성취, 새로운 차원"
  ];

  const majorRev = [
    "무모함, 미숙함, 무책임한 이탈", "사기성, 계획 불비, 재능의 낭비", "비밀, 왜곡, 단절, 감정의 억제",
    "소유욕, 나태함, 생산성 저하", "독단, 통제 상실, 권력 남용", "도덕적 해이, 독선, 잘못된 가르침",
    "불화, 이별, 선택 장애", "폭주, 통제 불능, 추진력 상실", "무력감, 분노 조절 실패, 자신감 부족",
    "고립, 아집, 소통 거부", "불운, 일시적 정체, 거부할 수 없는 변화", "편견, 불합리한 처사, 관계 불균형",
    "소모적인 지체, 헛된 희생", "정체, 두려움으로 인한 거부, 정체기", "불균형, 갈등, 과도한 소비",
    "해방의 시작, 집착 해소, 각성", "해소되는 긴장, 재건의 필요성", "실망, 영감 상실, 회의감",
    "불안 해소, 오해 극복, 진실의 규명", "에너지 침체, 오만함으로 인한 실책", "지체되는 결정, 후회, 정체", "미완성, 지연, 부분적 성공"
  ];

  for (let i = 0; i < 22; i++) {
    deck.push({
      id: i,
      name: majorNames[i],
      arcana: "major",
      suit: null,
      value: i,
      meaningUp: majorUp[i],
      meaningRev: majorRev[i],
      imagePath: `/images/tarot/major_${i}.webp`,
      copyrightField: "Rider-Waite-Smith Art (1909) - Public Domain"
    });
  }

  // 2. Minor Arcana 56장 (4 Suits * 14 Cards)
  const suits = ["wands", "cups", "swords", "pentacles"] as const;
  const suitNames: Record<string, string> = {
    wands: "완즈",
    cups: "컵",
    swords: "소드",
    pentacles: "펜타클"
  };

  const suitUpKeywords: Record<string, string[]> = {
    wands: ["새로운 영감, 시작", "도전 극복, 계획", "확장, 전망", "안정, 축하", "갈등, 경쟁", "승리, 인정", "방어, 소신", "신속함, 메시지", "경계, 인내", "중압감, 책임", "탐구심, 기획", "추진력, 도전", "자신감, 정열", "리더십, 실현"],
    cups: ["사랑의 시작, 치유", "파트너십, 조화", "우정, 결실", "침체, 성찰", "상실, 후회", "추억, 재회", "선택 장애, 환상", "떠남, 포기", "소원 성취, 기쁨", "가정 평화, 완성", "감수성, 소식", "로맨티시스트, 청혼", "공감력, 직관", "현명한 동정심, 조율"],
    swords: ["돌파구, 승리", "선택 장애, 대립", "마음의 상처, 슬픔", "휴식, 명상", "패배, 갈등", "어려움 탈출, 극복", "속임수, 신중함", "고립, 두려움", "악몽, 걱정", "종결, 항복", "호기심, 정보", "용감함, 무모함", "냉철함, 이성", "엄격함, 지혜"],
    pentacles: ["물질적 결실, 기회", "균형, 적응력", "협업, 장인정신", "집착, 소유욕", "결핍, 고난", "나눔, 후원", "수확 평가, 인내", "꾸준함, 숙련", "독립적 풍요, 성공", "가문 번창, 유산", "배움의 시작, 성실", "우직함, 신뢰성", "관대함, 풍요", "자산 통제력, 결실"]
  };

  const suitRevKeywords: Record<string, string[]> = {
    wands: ["의지 부족, 지연", "조급함, 분열", "전망 불투명", "불안정, 갈등", "협력 필요, 해소", "자만심, 지연", "타협 필요, 한계", "혼선, 지연", "포기, 피로", "회피, 과부하", "소심함, 미숙", "충동적 폭주, 정체", "독단적 고집", "독선, 강압"],
    cups: ["감정 억제, 실망", "불화, 관계 냉각", "소외감, 과잉", "새 기회 감지", "상실 극복, 출발", "과거 집착, 단절", "현실 자각, 결정", "방황, 미련", "과도한 탐닉, 과식", "가족 불화, 지연", "변덕, 감정 낭비", "기만, 현실 도피", "감정 기복, 히스테리", "감정 지배, 냉정"],
    swords: ["혼란, 무력감", "진실 규명, 타협", "치유의 시작", "활동 재개, 조급", "패배 수용, 타협", "해결책 부재, 지연", "신뢰 회복, 폭로", "해방의 실마리", "걱정 해소, 치유", "새 출발의 극복", "충동적 비판", "맹목적 대립, 중단", "잔인함, 냉소", "독재적 통제, 아집"],
    pentacles: ["투자 기회 상실", "혼란, 재정 기복", "협력 결여, 미숙", "손실 발생, 탐욕", "고난 극복의 시작", "불공정 대접, 손실", "투자의 실패, 조급", "지루함, 슬럼프", "재정 불안, 낭비", "유산 분쟁, 단절", "게으름, 낭비", "독단적 고집, 지연", "사치, 의심", "물질 집착, 완고"]
  };

  const valNames = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"];

  let idCounter = 22;
  for (const suit of suits) {
    for (let v = 0; v < 14; v++) {
      const isCourt = v >= 10; // Page, Knight, Queen, King
      const valStr = valNames[v];
      const cardName = `${suitNames[suit]} ${valStr} (${isCourt ? "" : `${valStr} of `}${suit.charAt(0).toUpperCase() + suit.slice(1)})`;
      
      deck.push({
        id: idCounter++,
        name: cardName,
        arcana: "minor",
        suit: suit,
        value: v + 1,
        meaningUp: suitUpKeywords[suit][v],
        meaningRev: suitRevKeywords[suit][v],
        imagePath: `/images/tarot/minor_${suit}_${v + 1}.webp`,
        copyrightField: "Rider-Waite-Smith Art (1909) - Public Domain"
      });
    }
  }

  return deck;
}

// 스프레드 설정 명세
export interface SpreadConfig {
  id: string;
  name: string;
  cardCount: number;
  positions: string[];
}

export const TAROT_SPREADS: Record<string, SpreadConfig> = {
  today: {
    id: "today",
    name: "오늘의 타로",
    cardCount: 1,
    positions: ["오늘 하루의 핵심 조언 및 행동 가이드"]
  },
  mind: {
    id: "mind",
    name: "상대 속마음 점검",
    cardCount: 2,
    positions: ["내가 의식하는 내 마음", "상대방의 무의식적 속마음"]
  },
  reunion: {
    id: "reunion",
    name: "재회 연락 타이밍",
    cardCount: 3,
    positions: ["끊어진 과거 인연의 고리", "현재 관계의 기류", "가까운 재회/연락 성사 타이밍"]
  },
  ab_choice: {
    id: "ab_choice",
    name: "A/B 양자택일",
    cardCount: 3,
    positions: ["현재 질문의 근본 상황", "A 대안 선택 시 전개 상황", "B 대안 선택 시 전개 상황"]
  },
  money_flow: {
    id: "money_flow",
    name: "이번 달 돈의 흐름",
    cardCount: 3,
    positions: ["현재 재정 기류 상태", "유입될 금전 기회", "조심해야 할 재정 손실 요인"]
  },
  seven_days: {
    id: "seven_days",
    name: "7일 주간 흐름",
    cardCount: 7,
    positions: ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
  }
};

/**
 * 타로 드로우 및 역방향 판정 (조작 없는 셔플링 엔진)
 * userSelectedIndices: 사용자가 78장 카드덱 중에서 탭하여 고른 인덱스 번호 배열 (예: [5, 42, 70])
 */
export function drawTarotCards(
  spreadId: string,
  userSelectedIndices?: number[]
): DrawnCard[] {
  const spread = TAROT_SPREADS[spreadId];
  if (!spread) {
    throw new Error(`지원하지 않는 스프레드 타입입니다: ${spreadId}`);
  }

  const deck = buildTarotDeck();
  const cardCount = spread.cardCount;

  // 1. 피셔-예이츠 셔플로 조작 없이 셔플링 진행
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 2. 사용자가 임의로 고른 탭 인덱스가 있다면 해당 인덱스 순서대로 카드를 수집
  const drawn: DrawnCard[] = [];
  
  if (userSelectedIndices && userSelectedIndices.length >= cardCount) {
    for (let k = 0; k < cardCount; k++) {
      // 0~77 범위로 안전하게 인덱스 맵핑
      const deckIndex = Math.abs(userSelectedIndices[k] || 0) % 78;
      // 정/역방향 판정: 사용자가 카드를 고른 시점의 서버 타임스탬프 또는 무작위 난수로 50:50 분기 처리
      const isReversed = Math.random() < 0.5;
      drawn.push({
        card: deck[deckIndex],
        isReversed
      });
    }
  } else {
    // 3. 없으면 셔플된 덱의 맨 위부터 드로우
    for (let k = 0; k < cardCount; k++) {
      const isReversed = Math.random() < 0.5;
      drawn.push({
        card: shuffled[k],
        isReversed
      });
    }
  }

  return drawn;
}

/**
 * 타로 스프레드 프롬프트 조립 헬퍼
 */
export function buildTarotAIPrompt(
  spreadId: string,
  question: string,
  drawn: DrawnCard[]
): { prompt: string; systemInstruction: string } {
  const spread = TAROT_SPREADS[spreadId];
  const systemInstruction = `
당신은 신비주의적 직관과 칼 융의 분석 심리학을 결합하여 품격 있고 깊이 있는 카운셀링을 제공하는 천재 타로 해석가입니다.

[해석 원칙]
- 절대 미래를 단정적 예언("몇 월 몇 일 반드시 된다/망한다")으로 조장하지 마십시오.
- 상대방의 감정, 무의식, 생각은 "무의식의 투사로 볼 때 ~하게 작용하는 것으로 드러납니다"와 같이 개연성과 조언으로 서술하고, 사실로 백퍼센트 확정하여 타인의 프라이버시를 단정 짓지 마십시오.
- 투자, 도박, 복권 당첨, 중병 사고 등의 극단적 단정 절대 금지.
- 타로 결과를 미끼로 타 결제를 유도하거나 공포감을 조성하지 마십시오.
- 역방향 카드가 나왔다고 해서 두려워할 필요 없으며, 이는 기운의 내부 지향, 반성, 극복을 위한 주의 사항임을 안내하십시오.
`;

  let prompt = `
[요청 타로 스프레드: ${spread?.name || "기본 타로"}]
사용자의 고민 질문: "${question}"

## 드로우된 카드 리스트 및 배치 의미:
`;

  drawn.forEach((item, idx) => {
    const posName = spread?.positions[idx] || `${idx + 1}번 위치`;
    prompt += `- [위치: ${posName}] ${item.card.name} (${item.isReversed ? "역방향 (Reversed)" : "정방향 (Upright)"})
  * 카드 성향: ${item.card.arcana} arcana
  * 키워드: ${item.isReversed ? item.card.meaningRev : item.card.meaningUp}
\n`;
  });

  prompt += `
상기 드로우 결과를 바탕으로 다음 스키마의 JSON 응답만을 만드십시오. Markdown 코드 블록 등 일체의 사설은 생략해야 합니다.

{
  "summary": "타로 전체 스프레드 핵심 조언 요약 한 줄 (50자 내외)",
  "highlights": [
    { "title": "핵심 키워드 카드", "value": "카드 이름 및 정/역 상태 요약" }
  ],
  "sections": [
    {
      "id": "sect_positions",
      "title": "카드 배치별 심층 심리 대조",
      "summary": "각 위치가 가진 고민의 해답 요약",
      "paragraphs": [
        "각 카드가 나타내는 의식/무의식/선택에 대한 심도 깊은 칼 융 심리학적 분석 문단 1",
        "각 카드가 주는 억압된 심리와 주의 기류 해설 문단 2"
      ],
      "positiveSignals": ["희망적 조언 및 기회 지표"],
      "cautionSignals": ["조심해야 할 무의식적 방어기제나 착각"],
      "actions": ["오늘 또는 이번 주 실천해야 할 구체적 심리 처세술"]
    }
  ]
}
`;

  return { prompt, systemInstruction };
}
