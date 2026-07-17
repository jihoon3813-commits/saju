import { ChartResult } from "../manse/types";
import { StructuredInterpretation, Section, Highlight, TimelineEntry } from "./types";
import { InterpretationRuleRepository } from "./rules";

interface CodeRichData {
  identityParagraph?: string;
  cautionParagraph?: string;
  socialParagraph?: string;
  wealthParagraph?: string;
  positiveSignals: string[];
  cautionSignals: string[];
  actions: string[];
}

const RICH_DATA_MAP: Record<string, CodeRichData> = {
  // 1. 일간 성향
  E_STEM_DAY_KAP: {
    identityParagraph: "하늘을 향해 힘차고 곧게 뻗어나가는 우두머리 기질을 지닌 갑목(甲) 일간으로서, 귀하는 수직적인 리더십과 굽히지 않는 강한 주관을 지니고 있습니다. 타인의 지시를 받기보다 주도적으로 판을 이끌 때 가장 높은 생산성과 몰입도를 나타냅니다. 스스로 인생의 고난을 우직한 뚝심으로 돌파하려는 멋진 개척자 성향을 가집니다.",
    socialParagraph: "조직 내에서 지배적이거나 주도적인 역할을 하려 하므로 때로는 강한 고집으로 보일 수 있지만, 부드럽고 유연한 수평적 의사소통 태도를 조금만 더 기른다면 귀하의 듬직한 카리스마 아래 수많은 따뜻한 지지자와 귀인을 얻어 대성하실 것입니다.",
    positiveSignals: ["강인한 리더십 발휘", "추진력과 개척자 정신"],
    cautionSignals: ["독선적인 태도로 오해받을 우려"],
    actions: ["하루 한 번 타인의 의견에 먼저 맞장구쳐주기", "회의에서 마지막에 발언해보기"]
  },
  E_STEM_DAY_EUL: {
    identityParagraph: "어떠한 거친 환경에서도 끈기 있게 생명을 틔워내는 유연한 적응력을 지닌 을목(乙) 일간으로서, 귀하는 혹독한 겨울을 견디고 새봄을 피워내는 질긴 화초나 넝쿨을 닮았습니다. 부드러운 소통과 타협 속에서 실리를 챙기는 영리함과 강인한 생명력이 돋보이는 분입니다.",
    socialParagraph: "대인관계에서 갈등을 극대화하지 않고 유연하게 비껴가는 처세가 뛰어나며, 사람들에게 친근한 평판을 얻습니다. 다만 남의 의견을 너무 따르기보다 자신만의 주관을 굳건히 지키는 균형을 이룰 때 사회적 가치가 배가됩니다.",
    positiveSignals: ["탁월한 친화성 및 유대감", "위기 상황 대처 능력"],
    cautionSignals: ["주관 없이 주변 의견에 휩쓸릴 우려"],
    actions: ["거절해야 하는 부탁은 정중히 거절해보기", "자신만의 핵심 원칙을 서면 기록해두기"]
  },
  E_STEM_DAY_BYUNG: {
    identityParagraph: "온 천하를 널리 따스하게 비추는 태양 같은 뜨거운 열정을 품은 병화(丙) 일간으로서, 매사에 솔직 담백하고 적극적입니다. 자신을 표현하고 드넣이는 데 주저함이 없으며, 주변 사람들에게 밝고 따뜻한 에너지를 전파하는 매력적인 중심 인물 역할을 수행하십니다.",
    socialParagraph: "솔직하고 열정적인 에너지는 팀원들의 의지를 돋우며, 공과 사를 투명하게 운영하여 사람들에게 높은 신뢰를 받습니다. 다만 감정이 순간적으로 달아올라 성급한 결정을 내릴 수 있으니 한 템포 쉬어가는 화법을 수용하시면 금상첨화입니다.",
    positiveSignals: ["뛰어난 자기표현력", "밝고 긍정적인 파급력"],
    cautionSignals: ["지나치게 감정을 쉽게 표출해 실점할 우려"],
    actions: ["흥분했을 때는 10초간 침묵 후 이야기하기", "조용한 피드백도 기꺼이 수용하기"]
  },
  E_STEM_DAY_JEONG: {
    identityParagraph: "밤하늘의 외로운 나침반이 되어 주는 등대나 따뜻한 모닥불과 같은 정화(丁) 일간으로서, 은은하면서도 깊이 있는 헌신과 사교성을 지니고 있습니다. 세심하고 감수성이 풍부하여 타인의 아픔을 깊이 공감하고, 보이지 않는 곳에서 꼼꼼하게 실속을 챙기는 능력이 탁월합니다.",
    socialParagraph: "일대일이나 소규모 그룹 내에서 매우 강력한 신뢰 관계를 형성하며, 사람들을 부드럽게 지원하고 이끌어내는 조력자 역할을 해냅니다. 혼자 상처를 감내하다가 속으로 앓기 쉬우니 감정을 적절히 표출하는 법을 연습하시는 것이 좋습니다.",
    positiveSignals: ["섬세하고 깊이 있는 공감 능력", "내실 있는 실속 추구"],
    cautionSignals: ["혼자 상처를 감내하다 속으로 앓을 우려"],
    actions: ["자신의 서운함을 솔직하게 말하는 연습하기", "가벼운 취미 생활로 내적 열기를 식히기"]
  },
  E_STEM_DAY_MOO: {
    identityParagraph: "계절의 변화에도 흔들림 없이 우뚝 솟은 거대한 태산과 같은 무토(戊) 일간으로서, 두터운 포용력과 묵직한 주관을 지니고 있습니다. 한결같은 신용과 진중함으로 사람들에게 깊은 안정감을 주지만, 한편으로는 변화에 신중하여 보수적으로 굳어지기 쉬운 면도 있습니다.",
    socialParagraph: "어떤 상황에서도 약속을 끝까지 지키는 의리로 귀감이 되지만, 타인과의 소통 시 다소 완고한 모습을 내려놓고 참신한 변화를 유연하게 수용하신다면 훨씬 더 넓고 다채로운 인간관계를 가꾸실 수 있습니다.",
    positiveSignals: ["두터운 신뢰도 및 의리", "흔들리지 않는 주관"],
    cautionSignals: ["변화에 직면할 때 고집을 피울 우려"],
    actions: ["새로운 규칙이나 변화를 열린 마음으로 한 번 수용하기", "팀원들의 작은 실수에 미소 지어보기"]
  },
  E_STEM_DAY_KI: {
    identityParagraph: "온 갖 생명과 과실을 길러내는 비옥한 논밭과 같은 기토(己) 일간으로서, 현실적인 실속과 생산성을 중시합니다. 어머니와 같은 모성애적 중재력을 갖추고 있어 갈등을 조율하는 데 탁월하며, 세밀하고 꼼꼼하게 내실을 가꾸는 정돈 능력이 뛰어납니다.",
    socialParagraph: "상대방의 필요를 예리하게 파악하여 도움을 주며, 분쟁을 중재하는 뛰어난 완충재 역할을 맡아 조율 능력을 인정받습니다. 다만 생각이 지나치게 많아 결정적 순간에 우유부단해지지 않도록 명확한 기준을 확립하는 것이 좋습니다.",
    positiveSignals: ["갈등 중재 및 적응력", "현실적인 실행 기획력"],
    cautionSignals: ["생각이 너무 많아 결정적 순간에 우유부단할 우려"],
    actions: ["결정 기준을 세 가지 이하로 단축하기", "스스로에게 온전한 휴식을 줄 수 있는 공간 찾기"]
  },
  E_STEM_DAY_KYUNG: {
    identityParagraph: "강인한 원석이나 무쇠를 닮은 경금(庚) 일간으로서, 남다른 의리와 결단력이 돋보입니다. 시비와 공과 사를 명확히 가리며 한번 뱉은 말은 끝까지 책임지는 굳건한 신념의 소유자이며, 난관 앞에서 꺾이지 않고 돌파하는 우직함이 큰 강점입니다.",
    socialParagraph: "의리를 중시하여 아랫사람을 듬직하게 품어주나, 감정적 타협이 다소 서툴러 차갑다는 인상을 주기 쉽습니다. 대화 시 상대방의 입장을 먼저 한 번 공감하고 부드러운 화법을 선택하신다면 대인관계의 번영이 함께할 것입니다.",
    positiveSignals: ["강력한 결단력과 책임감", "의리와 상벌의 명확함"],
    cautionSignals: ["타인의 감정을 배려하지 못하는 거친 화법 유의"],
    actions: ["대화 시 상대의 처지를 먼저 한 번 공감하기", "딱딱한 표현 대신 부드러운 수식어 섞기"]
  },
  E_STEM_DAY_SHIN: {
    identityParagraph: "정밀하게 가공되어 영롱하게 반짝이는 보석과 같은 신금(辛) 일간으로서, 자존심이 맑고 예리합니다. 불필요한 인간관계를 지양하고 자신만의 독자적인 영역을 깔끔하게 가꾸며, 완벽을 추구하는 섬세함과 높은 비판력으로 완성도 높은 성과를 도출해 냅니다.",
    socialParagraph: "탁월한 안목과 디테일로 선망을 한몸에 받으면서도 개인주의적 경향이 강해 주변 사람들을 은근히 긴장시킬 수 있습니다. 때로는 완벽하지 않은 모습도 너그럽게 품는 관용을 발휘할 때 진정한 내면의 기품이 빛납니다.",
    positiveSignals: ["탁월한 디테일 완성도", "독자적 주관과 개성"],
    cautionSignals: ["예민하고 까칠한 반응에 따른 피로 누적"],
    actions: ["'그럴 수도 있지'라는 관용을 생활화하기", "완벽하지 않은 중간 보고서도 공유하기"]
  },
  E_STEM_DAY_IM: {
    identityParagraph: "세상의 모든 물줄기를 받아들여 넓고 고요하게 출렁이는 바다와 같은 임수(壬) 일간으로서, 영민함과 깊은 통찰력을 지니고 있습니다. 대범하게 상황을 조망하고 유연하게 대처하며, 수많은 사람들의 생각과 흐름을 받아들이고 융합하는 포용성이 대단합니다.",
    socialParagraph: "사람들과의 소통에서 큰 강점이 있으며 유유자적한 리더십을 보이나, 속마음을 쉽게 드러내지 않아 비밀이 많다는 평을 받기 쉽습니다. 내적인 감정 억제가 지나쳐 갑자기 폭발하지 않도록 평소에 감정을 맑게 순환해 주십시오.",
    positiveSignals: ["대범한 통찰력과 적응력", "광범위한 포용성 확보"],
    cautionSignals: ["감정을 억제하다 급작스럽게 폭발할 우려"],
    actions: ["자신의 솔직한 소회를 속 깊은 사람에게 털어놓기", "생각의 도돌이표를 멈추고 직접 외출하기"]
  },
  E_STEM_DAY_GYE: {
    identityParagraph: "하늘에서 내리는 맑은 빗방울이나 대지의 생명을 피워내는 신비로운 옹달샘을 닮은 계수(癸) 일간으로서, 사려 깊은 지혜와 유연함이 빛납니다. 감수성이 대단히 풍부하고 눈치가 빠르며, 소리 없이 상황에 스며들어 본질을 통찰하는 침투력과 뛰어난 학습 능력을 가집니다.",
    socialParagraph: "상대방의 마음을 빠르게 읽어 기민하게 대처하며, 깊은 공감 능력으로 따뜻한 조언자의 역할을 수행합니다. 다만 주변 환경의 우울한 감정에 너무 깊이 동화되지 않도록 자신만의 내적 방어선을 건강하게 가꾸시기 바랍니다.",
    positiveSignals: ["기민한 본질 통찰력", "사려 깊은 경청 및 공감"],
    cautionSignals: ["환경의 감정에 지나치게 감화되어 에너지가 소모될 우려"],
    actions: ["일과 개인의 감정 영역을 완전히 분리해 생각하기", "자신만의 정신적 아지트 마련하기"]
  },
  
  // 2. 오행 기운 과다 및 결핍
  E_WOOD_MANY: {
    cautionParagraph: "나무(木)의 기운이 다소 과다하여 생각이 끊임없이 꼬리를 물고, 새로운 시작과 기획에 대한 욕구가 강하게 일어납니다. 다만 여러 우물을 동시에 파다 보면 에너지가 분산되어 맺음이 약해질 수 있으니, 벌려놓은 일들을 차분히 정리하고 하나씩 매듭짓는 마인드 컨트롤이 필요한 시기입니다.",
    wealthParagraph: "왕성한 추진력과 기획력에 비해 재물로 거두어들이는 수렴력이 다소 부칠 수 있습니다. 충동적인 신규 투자나 무리한 계약 확장보다는 정량적인 데이터를 기반으로 수입과 지출을 꼼꼼하게 점검하고 내실을 다져가는 지혜를 발휘하십시오.",
    positiveSignals: ["왕성한 창조적 기획력"],
    cautionSignals: ["벌여놓고 맺지 못하는 마무리의 허점"],
    actions: ["진행 중인 프로젝트를 3개 이하로 압축해 집중하기", "일지 기록을 통해 완료 여부 상시 모니터링"]
  },
  E_WOOD_LACK: {
    cautionParagraph: "나무(木)의 기운이 다소 결핍되어 있어, 어떤 일을 처음 시작하거나 새로운 기회를 향해 용기 있게 나아가는 돌파력이 주저앉기 쉽습니다. 거창한 완벽함을 꿈꾸기보다 아주 사소한 행동부터 가볍게 실행하며 내적 에너지를 깨워내는 연습을 권장합니다.",
    wealthParagraph: "재정적인 측면에서 도전적인 투자나 과감한 수입원 창출에 지레 겁을 먹고 위축될 수 있습니다. 신뢰할 수 있는 전문가의 자문을 구하여 포트폴리오를 다각화하고, 작은 규모의 능동적인 자산 증식법을 일부 시도해 볼 것을 조언합니다.",
    positiveSignals: ["기존 틀의 안정적 고수"],
    cautionSignals: ["새로운 변화 지점에서의 과도한 망설임"],
    actions: ["일단 계획 없이 즉각 실행해보는 5분 미션 해보기", "기획/비즈니스 관련 서적 탐독"]
  },
  E_FIRE_MANY: {
    cautionParagraph: "불(火)의 뜨거운 에너지가 지나치게 가득하여 매사에 조급해지고 승부욕과 감정이 급격히 솟구치기 쉽습니다. 화가 나거나 열정이 과도해질 때 의식적으로 호흡을 깊게 가다듬지 않으면 섣부른 말실수나 감정적 충돌로 큰 실점을 자초할 수 있으니 주의하십시오.",
    wealthParagraph: "일확천금을 노리는 초고위험 투자나 충동적인 지출 욕구가 거세질 수 있는 기류입니다. 중요한 재정 결정이나 계약 건은 최소한 하룻밤 이상 충분히 숙고하고 신뢰도 높은 검증 단계를 거친 뒤에 비로소 서명할 것을 강력히 권해 드립니다.",
    positiveSignals: ["강력한 열정과 추진력"],
    cautionSignals: ["감정 쏠림에 따른 성급한 판단"],
    actions: ["화가 날 때는 찬 물을 마시며 3분 대기하기", "자극적인 투자 유혹 차단하기"]
  },
  E_FIRE_LACK: {
    cautionParagraph: "불(火)의 역동적인 기운이 다소 부족하여, 삶의 활력이 떨어지거나 자신을 대중 앞에 드러내는 활동을 소극적으로 회피할 우려가 있습니다. 내적인 에너지를 밖으로 표출하고 열정을 자극할 수 있는 즐거운 모임이나 신체 활동을 적극적으로 병행해 보십시오.",
    wealthParagraph: "재정적 기회나 투자 제안이 눈앞에 다가와도 과도한 신중함 때문에 결단을 미루다가 좋은 기회를 놓치는 자산 정체 현상이 발생할 수 있습니다. 꼼꼼히 분석하되 확신이 서는 구간에서는 단호하게 베팅해 보는 용기가 요구됩니다.",
    positiveSignals: ["진중하고 차분한 분석력"],
    cautionSignals: ["자신감 부재로 인한 소통 소외"],
    actions: ["하루 20분 이상 유산소 운동으로 체온 올리기", "회의 시 목소리 톤을 약간 높여 스피치하기"]
  },
  E_EARTH_MANY: {
    cautionParagraph: "흙(土)의 기운이 너무 웅장하게 넘쳐나 신용과 진중함은 최고 수준이지만, 한편으로는 고집이 매우 완고해지고 변화를 극도로 거부하는 정체 상태에 빠지기 쉽습니다. 주변의 새로운 트렌드나 타인의 참신한 의견을 유연하게 수용하는 태도가 최고의 삶의 처방입니다.",
    wealthParagraph: "안정지향적인 자산 관리 방식에만 지나치게 경도되어 비효율적인 오래된 자산 수단에 매몰될 위험이 있습니다. 최신 금융 흐름을 면밀히 분석하며 포트폴리오의 유연성을 확보하고 일부 리밸런싱을 과감히 시도하시는 것이 유리합니다.",
    positiveSignals: ["단단한 신뢰도 및 중직함"],
    cautionSignals: ["변화에 대한 완고한 거부 의사"],
    actions: ["기존 신념과 반대되는 견해의 유튜브 영상 1편 시청하기", "정체된 자산 중 하나를 처분해보기"]
  },
  E_EARTH_LACK: {
    cautionParagraph: "흙(土)의 단단한 무게감이 다소 결핍되어, 마음이 쉽게 불안해지고 줏대가 약해져 주변 상황에 이리저리 요동치기 쉽습니다. 한 가지 약속을 끝까지 지키고, 계획된 일정을 성실하게 이행하며 스스로의 내적 안정성을 굳건하게 다잡으셔야 합니다.",
    wealthParagraph: "주변의 달콤한 소문이나 투자 바람에 재정이 쉽게 흔들릴 수 있습니다. 자금을 수시로 이동하며 단기 이익을 좇기보다는, 강제적인 고정 예금이나 장기 신탁 등 자금의 인위적인 묶음 비중을 높여 재정 방패를 세우는 것이 현명합니다.",
    positiveSignals: ["경쾌한 발상의 유연성"],
    cautionSignals: ["산만한 집중력과 가벼운 신의 상실 유의"],
    actions: ["스케줄 관리를 분 단위로 적어 철저히 이행하기", "주기적으로 맨발 흙 밟기(접지) 해보기"]
  },
  E_METAL_MANY: {
    cautionParagraph: "쇠(金)의 예리한 기운이 과다하여 매듭을 짓고 공사 구분을 철저히 하는 데는 탁월하지만, 대인관계에서 다소 냉정하고 융통성이 없는 까다로운 인상을 줄 수 있습니다. 타인의 작은 실수나 서툰 부분을 따뜻하게 감싸 안는 너그러운 융통성을 발휘해 주십시오.",
    wealthParagraph: "리스크에 대한 과도한 방어 집착이나 손실에 대한 엄격한 잣대가 되려 유연한 투자 기회를 가로막을 수 있습니다. 때로는 합리적인 손절을 용인하고 유연하게 흘러가는 거시적 자산 리듬에 내 자금을 편안히 맡겨보는 연습이 유용합니다.",
    positiveSignals: ["예리한 공사 구분 및 통제"],
    cautionSignals: ["냉정하고 융통성 없는 태도에 따른 갈등"],
    actions: ["상대의 말에 '그 말도 일리가 있다'고 먼저 인정하기", "정리정돈에 쓰는 에너지를 취미로 분산하기"]
  },
  E_METAL_LACK: {
    cautionParagraph: "쇠(金)의 결단 기운이 다소 결핍되어 있어, 부드러운 소통 능력은 뛰어나지만 끝을 맺는 결정력이 미흡하고 맺고 끊는 거절을 하지 못해 질질 끌기 쉽습니다. 나에게 해가 되는 관계나 지지부진한 일들을 과감하게 차단하는 단호한 용기가 필요합니다.",
    wealthParagraph: "우유부단한 감정 때문에 금전 거래에서 손해를 보거나 정 때문에 마지못해 빌려주는 재정적 누수가 생길 수 있습니다. 돈과 관련된 모든 약속과 계약은 반드시 확실한 서면 문서와 정밀 서류 작업을 동반하여 엄격하게 처리하십시오.",
    positiveSignals: ["부드럽고 둥글둥글한 소통 기질"],
    cautionSignals: ["질질 끄는 거절 불능의 늪"],
    actions: ["안 되는 것은 '아니오'라고 즉각적으로 말하기", "쓰지 않는 물건들을 즉시 버리는 수거함 정리"]
  },
  E_WATER_MANY: {
    cautionParagraph: "물(水)의 기운이 너무 차올라 지혜와 사색 능력이 뛰어난 반면, 생각의 깊은 수렁에 갇혀 우울감이나 잡생각에 매몰되기 쉽습니다. 햇빛을 충분히 받으며 활동적으로 신체를 움직여, 마음속 음(陰)적인 침전 기류를 맑고 활동적으로 정화해 주셔야 합니다.",
    wealthParagraph: "지나치게 많은 정보 때문에 오히려 결정을 내리지 못하거나, 비공식적인 자금 보관에 지나치게 집착하여 재정 순환을 막을 수 있습니다. 투명하고 양성적인 공식 금융 시스템을 적극 활용하여 재산의 흐름을 건강하게 양지화하십시오.",
    positiveSignals: ["깊고 지혜로운 학술적 사고력"],
    cautionSignals: ["우울감이나 폐쇄적 고립 상태 유발 주의"],
    actions: ["하루 최소 40분 햇빛을 받으며 야외 산책하기", "고민거리를 백지에 적고 곧바로 찢어버리기"]
  },
  E_WATER_LACK: {
    cautionParagraph: "물(水)의 유연한 기운이 다소 결핍되어 장기적인 지구력과 침착함, 그리고 상황에 기민하게 반응하는 융통성이 건조해지기 쉽습니다. 매사 조급하게 반응하여 그르치지 않도록 차분히 물을 마시고 심신을 평온하게 진정시키는 습관을 추천합니다.",
    wealthParagraph: "빨리 이익을 거두어들이려는 단기적 안목 때문에 장기 투자의 든든한 복리 효과를 보지 못하고 조기 회수할 우려가 있습니다. 인위적으로 중도 출금이 제한되는 장기 금융 상품이나 부동산 자산 위주로 비축하여 끈기 있게 묵혀두는 자산 설계가 유리합니다.",
    positiveSignals: ["빠른 응대와 행동의 속도감"],
    cautionSignals: ["끈기 부재로 인한 성과 중도 포기"],
    actions: ["중요한 질문에는 심호흡 3번 하고 천천히 대답하기", "물가나 강변 등 정적인 수변 공원 근방 휴식"]
  },

  // 3. 지지 관계성 및 형살
  E_BRANCH_CLASH: {
    cautionParagraph: "사주 지지 간의 충(沖) 작용이 활성화되어, 귀하의 환경에는 자주 급작스러운 변화나 변동수가 개입될 수 있습니다. 이를 수동적으로 감내하며 스트레스를 받기보다, 적극적인 업무 전환이나 환경 리프레시, 출장 등을 통해 이 역동적인 이동 에너지를 내 성장판으로 건강하게 치환하십시오.",
    socialParagraph: "잦은 대인관계 환경의 마찰과 마주하며 피로를 느끼기 쉽지만, 오히려 이 역동적인 네트워크 속에서 새로운 귀인을 알아채고 능동적으로 관계망을 확장해 나가는 개척 정신을 발휘하신다면 대단한 기회와 번영이 찾아옵니다.",
    positiveSignals: ["환경 변동에 따른 혁신 에너지"],
    cautionSignals: ["잦은 마찰에 따른 피로와 변동 피로도"],
    actions: ["가벼운 가구 재배치나 주기적 출장 시도하기", "정기적인 스트레칭으로 신체 긴장 풀기"]
  },
  E_BRANCH_COMB: {
    identityParagraph: "사주 하부에 합(합)의 따뜻한 융화력이 깊게 깃들어 있어, 대인 소통과 갈등 조율에 있어 하늘이 내린 천부적인 중재 역량을 발휘하게 됩니다.",
    socialParagraph: "조직 내에서 갈등이 터졌을 때 부드러운 완충재 역할을 도맡아 평화를 이루는 훌륭한 평판을 유지합니다. 다만 타인을 지나치게 배려하다 보니 정작 나만의 건강한 권리나 의견을 확실하게 주장하지 못하는 우를 범하지 않도록 스스로를 챙겨주십시오.",
    positiveSignals: ["원만한 분쟁 해결 및 중재력"],
    cautionSignals: ["좋은 사람 콤플렉스로 인한 자기 주장 부재"],
    actions: ["자신만의 분명한 노선을 한 단계씩 표출하기", "타인의 부탁보다 내 우선과제를 먼저 완수하기"]
  },
  E_PUNISH_SELF: {
    cautionParagraph: "스스로를 엄격히 단속하는 형살(刑)의 정밀한 칼날을 품고 계십니다. 이는 본인의 도덕성과 직업적 완성도를 최고 수준으로 다듬는 든든한 힘이지만, 지나친 자기 검열이나 완벽주의 집착으로 인해 스스로 마음의 피로를 과도하게 누적시키기 쉬우니 주의하십시오.",
    wealthParagraph: "금융 거래와 자산 운용에서 1원 한 장의 오차도 불허하는 철두철미한 계획성을 보여 주어 재산의 안정이 보장되나, 가끔은 너무 사소한 지출에 과도하게 스트레스를 받지 않도록 지출 예산에 느슨한 예외 공간을 다소 마련해 두시기를 제안합니다.",
    positiveSignals: ["고도의 분석적 정밀성 확보"],
    cautionSignals: ["주변 사람들과 자신에 대한 과도한 비판 의식"],
    actions: ["가치 중심의 관대함을 생활에서 1일 1회 베풀기", "계획을 조금 느슨하게 짜보는 시도"]
  }
};

export class RuleBasedFallback {
  /**
   * Gemini API가 장애이거나 파싱 실패 시, 활성 규칙 기반으로 완벽한 품질의 대체 JSON 해석 보고서를 조립합니다.
   */
  static generate(
    serviceType: "basic-saju" | "today" | "compatibility",
    chart1: ChartResult,
    chart2?: ChartResult
  ): StructuredInterpretation {
    const active1 = InterpretationRuleRepository.getActiveEvidenceCodes(chart1);
    const activeCodes1 = active1.map((c) => c.code);

    const isHourUnknown = chart1.calculationBasis.unknownBirthTime || chart1.pillars.hour === null;
    const generatedAt = new Date().toISOString();

    if (serviceType === "basic-saju") {
      // 1. 공통 및 일간 코드 분리 추출
      const dayStemCode = active1.find(c => c.code.startsWith("E_STEM_DAY_"))?.code;
      const elementCodes = active1.filter(c => c.category === "element").map(c => c.code);
      const relationCodes = active1.filter(c => c.category === "relations").map(c => c.code);

      // Section 1: 성향과 자아 강점 (identity)
      const identityParas: string[] = [];
      if (dayStemCode && RICH_DATA_MAP[dayStemCode]?.identityParagraph) {
        identityParas.push(RICH_DATA_MAP[dayStemCode].identityParagraph!);
      }
      elementCodes.forEach(ec => {
        const rule = active1.find(r => r.code === ec);
        if (rule) {
          identityParas.push(`사주 오행 측면에서 ${rule.name}의 영향이 강하게 작동하고 있습니다. ${rule.description}`);
        }
      });
      if (identityParas.length === 0) {
        identityParas.push(`당신의 사주 원국은 ${chart1.pillars.day.stem} 일간을 중심으로 형성되어 있습니다. 오행이 조화롭게 순환되어 내밀한 자생력을 갖추었습니다.`);
      }

      // Section 2: 주의할 행동 쏠림과 완충 조언 (caution)
      const cautionParas: string[] = [];
      elementCodes.forEach(ec => {
        if (RICH_DATA_MAP[ec]?.cautionParagraph) {
          cautionParas.push(RICH_DATA_MAP[ec].cautionParagraph!);
        }
      });
      relationCodes.forEach(rc => {
        if (RICH_DATA_MAP[rc]?.cautionParagraph) {
          cautionParas.push(RICH_DATA_MAP[rc].cautionParagraph!);
        }
      });
      if (cautionParas.length === 0) {
        cautionParas.push("원국의 오행 및 지지의 상호작용이 조율된 균형점을 형성하고 있습니다. 스스로 특정한 고집이나 충동에 사로잡히지만 않는다면 환경 변화에 유연하게 대처할 수 있습니다.");
      }

      // Section 3: 사회적 대인관계 및 직업 성향 (social)
      const socialParas: string[] = [];
      if (dayStemCode && RICH_DATA_MAP[dayStemCode]?.socialParagraph) {
        socialParas.push(RICH_DATA_MAP[dayStemCode].socialParagraph!);
      }
      relationCodes.forEach(rc => {
        if (RICH_DATA_MAP[rc]?.socialParagraph) {
          socialParas.push(RICH_DATA_MAP[rc].socialParagraph!);
        }
      });
      if (socialParas.length === 0) {
        socialParas.push("협력적이며 배려가 넘치는 태도로 조직 내에서 높은 신뢰를 구축합니다. 단독 프로젝트보다 소통과 상생을 도모할 수 있는 영역에서 직업적 성취도가 한층 배가됩니다.");
      }

      // Section 4: 재물 운용 및 생활의 리듬 (wealth)
      const wealthParas: string[] = [];
      elementCodes.forEach(ec => {
        if (RICH_DATA_MAP[ec]?.wealthParagraph) {
          wealthParas.push(RICH_DATA_MAP[ec].wealthParagraph!);
        }
      });
      relationCodes.forEach(rc => {
        if (RICH_DATA_MAP[rc]?.wealthParagraph) {
          wealthParas.push(RICH_DATA_MAP[rc].wealthParagraph!);
        }
      });
      if (wealthParas.length === 0) {
        wealthParas.push("소비 충동을 이성적으로 제어하고 약속된 지출 관리를 설계하여 재정 안정을 추구합니다. 투자 시에는 감정적 분위기에 휩쓸리지 않도록 3인 이상의 객관적 조언을 듣는 흐름을 갖추십시오.");
      }

      // 시그널 및 액션아이템 자동 컴파일
      const positiveSignalsSet = new Set<string>();
      const cautionSignalsSet = new Set<string>();
      const actionsSet = new Set<string>();

      active1.forEach(c => {
        const data = RICH_DATA_MAP[c.code];
        if (data) {
          data.positiveSignals?.forEach(s => positiveSignalsSet.add(s));
          data.cautionSignals?.forEach(s => cautionSignalsSet.add(s));
          data.actions?.forEach(a => actionsSet.add(a));
        }
      });

      // 데이터 미달 시 기본값 보강
      if (positiveSignalsSet.size === 0) {
        positiveSignalsSet.add("오행의 원만한 순환");
        positiveSignalsSet.add("신중한 관찰적 대처");
      }
      if (cautionSignalsSet.size === 0) {
        cautionSignalsSet.add("완고해지기 쉬운 의사결정");
      }
      if (actionsSet.size === 0) {
        actionsSet.add("일일 계획서 수립 후 실천하기");
        actionsSet.add("따뜻한 음료 한 잔으로 마인드 컨트롤");
      }

      const elementSummary = `목(${chart1.elementsDistribution.wood}), 화(${chart1.elementsDistribution.fire}), 토(${chart1.elementsDistribution.earth}), 금(${chart1.elementsDistribution.metal}), 수(${chart1.elementsDistribution.water})`;

      return {
        summary: `${chart1.normalizedInput.alias}님의 일간 성향과 오행 조화에 기반한 안전성 요약본입니다.`,
        highlights: [
          {
            title: "핵심 오행 분포",
            value: elementSummary,
            evidenceCodes: activeCodes1.filter((c) => c.includes("MANY") || c.includes("LACK"))
          },
          {
            title: "중심 기질 (일주 일간)",
            value: `${chart1.pillars.day.stem}(${chart1.pillars.day.branch})의 기운`,
            evidenceCodes: activeCodes1.filter((c) => c.includes("STEM_DAY"))
          }
        ],
        sections: [
          {
            id: "identity",
            title: "1. 자아 성정 및 핵심 강점",
            summary: "귀하의 타고난 본질적 기질과 인생을 주도하는 힘에 대한 해설입니다.",
            paragraphs: identityParas,
            evidenceCodes: activeCodes1,
            positiveSignals: Array.from(positiveSignalsSet).slice(0, 3),
            cautionSignals: Array.from(cautionSignalsSet).slice(0, 2),
            actions: Array.from(actionsSet).slice(0, 3)
          },
          {
            id: "caution",
            title: "2. 조율할 행동 쏠림과 보완 가이드",
            summary: "기운이 치우침에 따라 무의식적으로 범하기 쉬운 실수와 마음가짐을 정리했습니다.",
            paragraphs: cautionParas,
            evidenceCodes: activeCodes1,
            positiveSignals: [],
            cautionSignals: Array.from(cautionSignalsSet).slice(2, 5),
            actions: Array.from(actionsSet).slice(3, 6)
          },
          {
            id: "social",
            title: "3. 대인관계 양식 및 직업 성향",
            summary: "사회 활동, 직장, 지인들과 조율하고 성장해나가는 사회적 유대 전략입니다.",
            paragraphs: socialParas,
            evidenceCodes: activeCodes1,
            positiveSignals: Array.from(positiveSignalsSet).slice(3, 5),
            cautionSignals: [],
            actions: []
          },
          {
            id: "wealth",
            title: "4. 재물 운용 및 자산 관리 습관",
            summary: "충동 제어와 재정 안정을 꾀하여 물질적 기회를 넓히기 위한 지침입니다.",
            paragraphs: wealthParas,
            evidenceCodes: activeCodes1,
            positiveSignals: [],
            cautionSignals: [],
            actions: []
          }
        ],
        timeline: [
          {
            period: `${chart1.luckCycles.startAge}세 대운`,
            intensity: 3,
            opportunity: "인생의 핵심 흐름이 재조정되는 대운 주기에 진입해 있습니다.",
            caution: "대운이 바뀌는 대운수 변곡점 근방에서는 급격한 직업/주거 변동을 서두르지 않는 것이 유리합니다.",
            action: "주변 귀인들과 사소한 신뢰를 다지며 기반을 든든하게 하십시오.",
            evidenceCodes: activeCodes1
          }
        ],
        uncertainty: isHourUnknown
          ? [
              {
                code: "E_HOUR_UNKNOWN",
                message: "태어난 시각을 정확히 알 수 없는 '시간 미상' 조건입니다. 시주(Hour) 기둥 기반의 말년 성향 및 십신 대조는 가상 시각(정오) 기준이므로 다소 차이가 날 수 있습니다.",
                affectedSections: ["identity"]
              }
            ]
          : [],
        safetyFlags: ["SAFE_FALLBACK"],
        engineVersion: "1.0.0",
        ruleVersion: "1.0.0",
        promptVersion: "1.0.0",
        generatedAt
      };
    } else if (serviceType === "today") {
      // 2. 오늘운세 폴백 리포트 작성
      const today = new Date().toLocaleDateString("ko-KR", { weekday: 'long' });

      return {
        summary: `오늘은 차분하고 실천 중심의 마음가짐이 귀하의 행운을 돋아주는 하루입니다. (${today})`,
        highlights: [
          {
            title: "오늘의 핵심 지표",
            value: "신중한 조율과 유연성",
            evidenceCodes: activeCodes1
          }
        ],
        sections: [
          {
            id: "today_general",
            title: "오늘의 영역별 행동 제안",
            summary: "지혜로운 시간 배분과 감정 관리를 위한 가이드라인",
            paragraphs: [
              `귀하의 일주 천간 ${chart1.pillars.day.stem} 기운과 오늘 하루의 시간 순환은 급격한 추진보다는 내실을 채우는 휴식을 환영합니다.`,
              `대인관계에서는 남의 이야기를 먼저 3분 들어주고, 나의 의견은 1분으로 차분히 요약하여 제시할 때 평판과 인기가 상승합니다.`,
              `재물 측면에서는 꼭 사야 할 소비 대상 3가지를 스마트폰 메모장에 먼저 기록한 뒤 지출하여 불필요한 충동 소비를 사전에 원천 차단하십시오.`
            ],
            evidenceCodes: activeCodes1,
            positiveSignals: ["경청 의지 증폭", "이성적 소비 제어력"],
            cautionSignals: ["성급한 판단에 따른 고집"],
            actions: ["커피 대신 카페인 없는 따뜻한 국산 차 마시기", "메모 기반 계획적인 행동 수립"]
          }
        ],
        timeline: [
          {
            period: "오늘 하루",
            intensity: 3,
            opportunity: "지인과의 원만한 협력 기회 확보",
            caution: "섣부른 감정 표출로 인한 가벼운 시비 유의",
            action: "주요 결정 전에 심호흡 세 번 이행하기",
            evidenceCodes: activeCodes1
          }
        ],
        uncertainty: [],
        safetyFlags: ["SAFE_FALLBACK"],
        engineVersion: "1.0.0",
        ruleVersion: "1.0.0",
        promptVersion: "1.0.0",
        generatedAt
      };
    } else {
      // 3. 기본궁합 폴백 리포트 작성
      const partnerAlias = chart2 ? chart2.normalizedInput.alias : "상대방";
      const activeCodes2 = chart2
        ? InterpretationRuleRepository.getActiveEvidenceCodes(chart2).map((c) => c.code)
        : [];

      return {
        summary: `${chart1.normalizedInput.alias}님과 ${partnerAlias}님의 조화와 대인 성향 분석 요약입니다.`,
        highlights: [
          {
            title: "본인 일간 기운",
            value: `${chart1.pillars.day.stem}의 기운`,
            evidenceCodes: activeCodes1
          },
          {
            title: "상대방 일간 기운",
            value: chart2 ? `${chart2.pillars.day.stem}의 기운` : "미상",
            evidenceCodes: activeCodes2
          }
        ],
        sections: [
          {
            id: "compatibility_harmony",
            title: "두 사람의 기질 조화 및 소통 전략",
            summary: "서로 다른 소통 방식을 인지하고 존중하는 방법입니다.",
            paragraphs: [
              `귀하의 ${chart1.pillars.day.stem} 일간적 성향과 ${partnerAlias}님의 ${chart2?.pillars.day.stem || "일주"} 흐름은 개성 강한 개별성을 대변하므로, 가치관의 대립이 발생할 여지가 있습니다.`,
              `소통 시에는 상대방의 문장에 대해 "네 입장에서는 그렇게 생각할 수 있겠구나"라며 1차적 수용의 표현을 먼저 돌려주어 대화의 마찰 열기를 효과적으로 누그러뜨리십시오.`
            ],
            evidenceCodes: [...activeCodes1, ...activeCodes2],
            positiveSignals: ["개인 고유성의 열린 수용", "의식적인 공감 언어 사용"],
            cautionSignals: ["감정적 고집에 의한 비방 주의"],
            actions: ["하루 1회 상대방의 감사한 행동 말해주기", "서로의 사생활 영역을 15% 이상 존중하기"]
          }
        ],
        timeline: [
          {
            period: "유대 형성기",
            intensity: 4,
            opportunity: "충분히 귀 기울일 때 깊은 영적 안정감 공유",
            caution: "나의 잣대로 상대방을 서둘러 평가하는 실수 유의",
            action: "주 1회 서로가 원하는 온전한 대화 시간 갖기",
            evidenceCodes: [...activeCodes1, ...activeCodes2]
          }
        ],
        uncertainty: [],
        safetyFlags: ["SAFE_FALLBACK"],
        engineVersion: "1.0.0",
        ruleVersion: "1.0.0",
        promptVersion: "1.0.0",
        generatedAt
      };
    }
  }
}
