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
    identityParagraph: "우두머리 기질을 지닌 갑목(甲) 일간으로서, 귀하는 수직적인 리더십과 굽히지 않는 강한 주관을 지니고 있습니다. 타인의 지시를 받기보다 주도적으로 판을 이끌 때 가장 높은 생산성과 몰입도를 나타냅니다.",
    socialParagraph: "조직 내에서 지배적이거나 주도적인 역할을 하려 하므로, 부드러운 수평적 의사소통 태도를 기른다면 훨씬 더 많은 지지자를 얻을 수 있습니다.",
    positiveSignals: ["강인한 리더십 발휘", "추진력과 개척자 정신"],
    cautionSignals: ["독선적인 태도로 오해받을 우려"],
    actions: ["하루 한 번 타인의 의견에 먼저 맞장구쳐주기", "회의에서 마지막에 발언해보기"]
  },
  E_STEM_DAY_EUL: {
    identityParagraph: "유연한 적응력을 지닌 을목(乙) 일간으로서, 귀하는 혹독한 환경에서도 살아남는 강인한 생명력과 친화력을 가집니다. 부드러운 소통과 타협 속에서 실리를 챙기는 지혜가 돋보입니다.",
    socialParagraph: "환경의 변화에 기민하게 반응하며, 갈등을 극대화하지 않고 유연하게 비껴가는 처세로 조직 내에서 원만한 대인관계를 유지합니다.",
    positiveSignals: ["탁월한 친화성 및 유대감", "위기 상황 대처 능력"],
    cautionSignals: ["주관 없이 주변 의견에 휩쓸릴 우려"],
    actions: ["거절해야 하는 부탁은 정중히 거절해보기", "자신만의 핵심 원칙을 서면 기록해두기"]
  },
  E_STEM_DAY_BYUNG: {
    identityParagraph: "태양 같은 뜨거운 열정을 품은 병화(丙) 일간으로서, 매사에 솔직 담백하고 적극적입니다. 자신을 대중 앞에 노출하고 표현하는 데 주저함이 없으며, 주변 사람들에게 밝고 따뜻한 에너지를 전파하는 중심 인물역을 수행합니다.",
    socialParagraph: "솔직하고 열정적인 에너지는 팀원들의 의지를 돋우며, 공과 사를 투명하게 운영하여 사람들에게 높은 신뢰를 받습니다.",
    positiveSignals: ["뛰어난 자기표현력", "밝고 긍정적인 파급력"],
    cautionSignals: ["지나치게 감정을 쉽게 표출해 실점할 우려"],
    actions: ["흥분했을 때는 10초간 침묵 후 이야기하기", "조용한 피드백도 기꺼이 수용하기"]
  },
  E_STEM_DAY_JEONG: {
    identityParagraph: "밤하늘의 등대와 같은 정화(丁) 일간으로서, 은은하면서도 깊이 있는 헌신과 사교성을 지니고 있습니다. 세심하고 감수성이 풍부하여 타인의 아픔을 깊이 공감하고, 보이지 않는 곳에서 꼼꼼하게 실속을 챙기는 능력이 탁월합니다.",
    socialParagraph: "일대일이나 소규모 그룹 내에서 매우 강력한 신뢰 관계를 형성하며, 사람들을 부드럽게 지원하고 이끌어내는 재능이 있습니다.",
    positiveSignals: ["섬세하고 깊이 있는 공감 능력", "내실 있는 실속 추구"],
    cautionSignals: ["혼자 상처를 감내하다 속으로 앓을 우려"],
    actions: ["자신의 서운함을 솔직하게 말하는 연습하기", "가벼운 취미 생활로 내적 열기를 식히기"]
  },
  E_STEM_DAY_MOO: {
    identityParagraph: "거대한 태산과 같은 무토(戊) 일간으로서, 포용력과 묵직한 주관을 상징합니다. 한결같은 신용과 진중함으로 사람들에게 깊은 안정감을 주지만, 한편으로는 갑작스러운 변화를 극도로 경계하는 보수적 경향을 띠기도 합니다.",
    socialParagraph: "어떤 상황에서도 약속을 끝까지 지키는 의리로 귀감이 되지만, 다소 완고한 모습을 덜어내야 소통의 폭이 넓어집니다.",
    positiveSignals: ["두터운 신뢰도 및 의리", "흔들리지 않는 주관"],
    cautionSignals: ["변화에 직면할 때 고집을 피울 우려"],
    actions: ["새로운 규칙이나 변화를 열린 마음으로 한 번 수용하기", "팀원들의 작은 실수에 미소 지어보기"]
  },
  E_STEM_DAY_KI: {
    identityParagraph: "비옥한 논밭과 같은 기토(己) 일간으로서, 생산적이고 현실적인 실속을 중시합니다. 어머니와 같은 모성애적 중재력을 갖추고 있어 갈등을 조율하는 데 탁월하며, 세밀하고 꼼꼼하게 내부 자산을 가꾸는 재능을 지니고 있습니다.",
    socialParagraph: "상대방의 필요를 예리하게 파악하여 도움을 주며, 분쟁을 중재하는 뛰어난 완충재 역할을 맡아 조율 능력을 인정받습니다.",
    positiveSignals: ["갈등 중재 및 적응력", "현실적인 실행 기획력"],
    cautionSignals: ["생각이 너무 많아 결정적 순간에 우유부단할 우려"],
    actions: ["결정 기준을 세 가지 이하로 단축하기", "스스로에게 온전한 휴식을 줄 수 있는 공간 찾기"]
  },
  E_STEM_DAY_KYUNG: {
    identityParagraph: "강인한 원석이나 무쇠를 닮은 경금(庚) 일간으로서, 의리와 강직함이 돋보입니다. 상벌 관계와 시비를 명확히 가리고 결단력이 뛰어나며, 한번 뱉은 말은 끝까지 책임지는 굳건한 신념의 소유자입니다.",
    socialParagraph: "의리를 중시하여 아랫사람을 듬직하게 품어주나, 감정적 타협이 서툴러 엄격하고 차갑다는 인상을 주지 않도록 유의해야 합니다.",
    positiveSignals: ["강력한 결단력과 책임감", "의리와 상벌의 명확함"],
    cautionSignals: ["타인의 감정을 배려하지 못하는 거친 화법 유의"],
    actions: ["대화 시 상대의 처지를 먼저 한 번 공감하기", "딱딱한 표현 대신 부드러운 수식어 섞기"]
  },
  E_STEM_DAY_SHIN: {
    identityParagraph: "가공된 예리한 보석과 같은 신금(辛) 일간으로서, 자존심이 맑고 예리합니다. 불필요한 인간관계를 지양하고 자신만의 독립적인 영역을 가꾸며, 완벽을 추구하는 섬세함과 날카로운 비판력으로 완성도 높은 성과를 도출합니다.",
    socialParagraph: "선망을 한몸에 받으면서도 개인주의적 경향이 짙어, 독선적인 완벽주의가 팀원들을 압박하지 않도록 배려해야 합니다.",
    positiveSignals: ["탁월한 디테일 완성도", "독자적 주관과 개성"],
    cautionSignals: ["예민하고 까칠한 반응에 따른 피로 누적"],
    actions: ["'그럴 수도 있지'라는 관용을 생활화하기", "완벽하지 않은 중간 보고서도 공유하기"]
  },
  E_STEM_DAY_IM: {
    identityParagraph: "넓은 바다와 같은 임수(壬) 일간으로서, 영민함과 깊이 있는 사색을 지니고 있습니다. 대범하게 상황을 조망하고 유연하게 대처하며, 많은 사람들의 생각과 흐름을 받아들이고 융합하는 포용성이 발달해 있습니다.",
    socialParagraph: "사람들과의 소통에서 큰 강점이 있으며 유유자적한 리더십을 보이나, 속마음을 쉽게 드러내지 않아 비밀이 많다는 평을 받기 쉽습니다.",
    positiveSignals: ["대범한 통찰력과 적응력", "광범위한 포용성 확보"],
    cautionSignals: ["감정을 억제하다 급작스럽게 폭발할 우려"],
    actions: ["자신의 솔직한 소회를 속 깊은 사람에게 털어놓기", "생각의 도돌이표를 멈추고 직접 외출하기"]
  },
  E_STEM_DAY_GYE: {
    identityParagraph: "맑은 빗방울이나 안개와 같은 계수(癸) 일간으로서, 사려 깊은 지혜와 유연함이 빛납니다. 감수성이 대단히 풍부하고 눈치가 빠르며, 소리 없이 상황에 녹아들어 본질을 통찰하는 침투력과 학습 능력을 가집니다.",
    socialParagraph: "상대방의 마음을 빠르게 읽어 기민하게 대처하며, 깊은 공감 능력으로 따뜻한 조언자의 역할을 수행합니다.",
    positiveSignals: ["기민한 본질 통찰력", "사려 깊은 경청 및 공감"],
    cautionSignals: ["환경의 감정에 지나치게 감화되어 에너지가 소모될 우려"],
    actions: ["일과 개인의 감정 영역을 완전히 분리해 생각하기", "자신만의 정신적 아지트 마련하기"]
  },

  // 2. 오행 기운 과다 및 결핍
  E_WOOD_MANY: {
    cautionParagraph: "나무의 기운이 과다하여 생각이 많고 새로운 일을 끊임없이 시도하려는 기질이 발현됩니다. 다만 한 우물을 깊이 파지 못하고 추진하던 일의 마무리가 약해질 수 있으니 매듭을 짓는 연습이 필요합니다.",
    wealthParagraph: "시작하는 기획력에 비해 거두어들이는 수렴력이 다소 부칠 수 있으니, 충동적으로 벌여둔 비즈니스나 투자처를 정비하고 정량 지표를 수립해 관리하는 것이 중요합니다.",
    positiveSignals: ["왕성한 창조적 기획력"],
    cautionSignals: ["벌여놓고 맺지 못하는 마무리의 허점"],
    actions: ["진행 중인 프로젝트를 3개 이하로 압축해 집중하기", "일지 기록을 통해 완료 여부 상시 모니터링"]
  },
  E_WOOD_LACK: {
    cautionParagraph: "나무의 기운이 부족하여 새로운 일을 처음 개시하고 아이디어를 실천으로 밀어붙이는 돌파력이 주저앉기 쉽습니다. 실천 계획을 잘게 쪼개어 가볍게 행동하는 연습을 추천합니다.",
    wealthParagraph: "신규 수입원을 창출하거나 도전적인 재정 계획을 시도하는 과감함이 미흡할 수 있으니, 포트폴리오 다각화에 적극적인 자문을 구해 보완할 것을 권합니다.",
    positiveSignals: ["기존 틀의 안정적 고수"],
    cautionSignals: ["새로운 변화 지점에서의 과도한 망설임"],
    actions: ["일단 계획 없이 즉각 실행해보는 5분 미션 해보기", "기획/비즈니스 관련 서적 탐독"]
  },
  E_FIRE_MANY: {
    cautionParagraph: "불의 기운이 지배적이어서 감정이 급격히 뜨거워지고 승부욕이 대단히 강해집니다. 화가 나거나 열정이 솟구칠 때 호흡을 가다듬지 않으면 섣부른 말실수나 다혈질적 행동으로 실점을 자초할 수 있습니다.",
    wealthParagraph: "급하게 일확천금을 노리는 고위험군 투자나 충동적인 재정 의사결정이 일어나기 쉬운 시기입니다. 중요한 계약은 반드시 하룻밤 생각한 후에 서명하십시오.",
    positiveSignals: ["강력한 열정과 추진력"],
    cautionSignals: ["감정 쏠림에 따른 성급한 판단"],
    actions: ["화가 날 때는 찬 물을 마시며 3분 대기하기", "자극적인 투자 유혹 차단하기"]
  },
  E_FIRE_LACK: {
    cautionParagraph: "불의 기운이 결핍되어 매사에 다소 소극적이거나 자신을 드러내는 일을 꺼릴 수 있습니다. 에너지를 밖으로 표출하고 열정을 불태울 수 있는 취미나 대화 모임에 참여하는 것이 좋습니다.",
    wealthParagraph: "재정적 기회가 찾아와도 너무 조심스럽게 관망하느라 결단을 미루는 자산 동결 현상이 생길 수 있으니 신중하되 단호한 투자를 일부 병행하는 태도를 익히십시오.",
    positiveSignals: ["진중하고 차분한 분석력"],
    cautionSignals: ["자신감 부재로 인한 소통 소외"],
    actions: ["하루 20분 이상 유산소 운동으로 체온 올리기", "회의 시 목소리 톤을 약간 높여 스피치하기"]
  },
  E_EARTH_MANY: {
    cautionParagraph: "흙의 기운이 넘쳐나 신용과 진중함은 최고 수준이나 지나치게 고집스럽고 보수적으로 굳어지기 쉽습니다. 새로운 트렌드를 일부러 수용하고 타인의 피드백을 유연하게 듣는 태도가 핵심입니다.",
    wealthParagraph: "안정지향성에 지나치게 경도되어 낡은 자산 증식 수단에 매몰될 수 있으니 신뢰도 높은 전문가와 교류하며 유행 흐름을 반영한 자산 리밸런싱을 단행하십시오.",
    positiveSignals: ["단단한 신뢰도 및 중직함"],
    cautionSignals: ["변화에 대한 완고한 거부 의사"],
    actions: ["기존 신념과 반대되는 견해의 유튜브 영상 1편 시청하기", "정체된 자산 중 하나를 처분해보기"]
  },
  E_EARTH_LACK: {
    cautionParagraph: "흙의 기운이 없어 마음이 쉬이 붕 떠 흔들리고 줏대가 약해질 우려가 있습니다. 약속을 끝까지 지키고 한 장소에 진득하게 머물며 신뢰를 쌓는 환경 구축이 요구됩니다.",
    wealthParagraph: "주위의 감언이설이나 뜬소문에 재정이 쉽게 요동치기 쉬우므로, 신속히 이리저리 자금을 이동하기보다 한 곳에 묶어놓는 고정식 강제 저축 비중을 대폭 높이십시오.",
    positiveSignals: ["경쾌한 발상의 유연성"],
    cautionSignals: ["산만한 집중력과 가벼운 신의 상실 유의"],
    actions: ["스케줄 관리를 분 단위로 적어 철저히 이행하기", "주기적으로 맨발 흙 밟기(접지) 해보기"]
  },
  E_METAL_MANY: {
    cautionParagraph: "쇠의 기운이 많아 맺고 끊음이 예리하고 공사 구분이 철저하나 냉정하고 까다롭다는 인상을 줄 수 있습니다. 타인의 서툰 모습을 너그럽게 품고 융통성 있게 예외를 허용하는 태도가 필요합니다.",
    wealthParagraph: "한 치의 타협도 없는 엄격함이 과도한 손실 방어 집착으로 발현될 수 있으니, 때로는 합리적인 손절을 용인하고 유연한 리스크 감수를 경험하는 연습이 좋습니다.",
    positiveSignals: ["예리한 공사 구분 및 통제"],
    cautionSignals: ["냉정하고 융통성 없는 태도에 따른 갈등"],
    actions: ["상대의 말에 '그 말도 일리가 있다'고 먼저 인정하기", "정리정돈에 쓰는 에너지를 취미로 분산하기"]
  },
  E_METAL_LACK: {
    cautionParagraph: "쇠의 기운이 부족하여 끝을 맺는 결정력이 미흡하고 맺고 끊지 못해 관계나 업무에서 질질 끄는 경향이 있습니다. 포기해야 할 일과 취해야 할 일을 종이에 명확히 기록해 결단하십시오.",
    wealthParagraph: "우유부단함으로 인해 손해 보는 자산이나 마지못해 빌려주는 채무 관계 등이 생길 수 있으니, 돈에 관한 약속은 공증이나 정밀 서류 작업을 필수로 다루는 절차를 수립해야 합니다.",
    positiveSignals: ["부드럽고 둥글둥글한 소통 기질"],
    cautionSignals: ["질질 끄는 거절 불능의 늪"],
    actions: ["안 되는 것은 '아니오'라고 즉각적으로 말하기", "쓰지 않는 물건들을 즉시 버리는 수거함 정리"]
  },
  E_WATER_MANY: {
    cautionParagraph: "물의 기운이 넘쳐 지적이고 지혜로우나 생각의 심연에 갇혀 우울감이나 잡생각에 잠기기 쉽습니다. 낮 시간에 밝은 햇볕을 쬐며 몸을 거칠게 움직여 음(陰)적인 고립 기류를 몰아내는 것이 좋습니다.",
    wealthParagraph: "정보가 너무 많아 되려 결단을 그르치거나, 자금을 비밀스러운 곳에 숨겨 정체시킬 수 있으니 명확하고 양성적인 금융 투자를 적극 설계하여 재정의 투명성을 가꾸십시오.",
    positiveSignals: ["깊고 지혜로운 학술적 사고력"],
    cautionSignals: ["우울감이나 폐쇄적 고립 상태 유발 주의"],
    actions: ["하루 최소 40분 햇빛을 받으며 야외 산책하기", "고민거리를 백지에 적고 곧바로 찢어버리기"]
  },
  E_WATER_LACK: {
    cautionParagraph: "물의 기운이 부족하여 융통성과 장기적인 끈기, 내실을 기하는 침착함이 약해질 수 있습니다. 상황이 급박할 때 조급하게 반응하지 말고, 하루 생수 2L 이상을 마시며 심신을 차분히 진정시키십시오.",
    wealthParagraph: "빠른 결실만 추구하다가 장기적인 자산 투자의 단 맛을 보지 못하고 조기 회수할 수 있으니 10년 만기 예금이나 부동산 등 환금성이 인위적으로 제약되는 상품을 중심으로 묵혀두십시오.",
    positiveSignals: ["빠른 응대와 행동의 속도감"],
    cautionSignals: ["끈기 부재로 인한 성과 중도 포기"],
    actions: ["중요한 질문에는 심호흡 3번 하고 천천히 대답하기", "물가나 강변 등 정적인 수변 공원 근방 휴식"]
  },

  // 3. 지지 관계성 및 형살
  E_BRANCH_CLASH: {
    cautionParagraph: "지지 충(沖)의 발현으로 귀하의 환경에는 자주 변화의 요구나 변동수가 개입될 수 있습니다. 이를 가만히 앉아 견디려 하기보다 적극적으로 출장, 업무 전환, 리프레시 등으로 활용하십시오.",
    socialParagraph: "변동이 잦은 대인관계 환경에서 오히려 주도적으로 소통 영역을 넓혀 귀인을 만나는 역동적인 네트워크 관리가 이익이 됩니다.",
    positiveSignals: ["환경 변동에 따른 혁신 에너지"],
    cautionSignals: ["잦은 마찰에 따른 피로와 변동 피로도"],
    actions: ["가벼운 가구 재배치나 주기적 출장 시도하기", "정기적인 스트레칭으로 신체 긴장 풀기"]
  },
  E_BRANCH_COMB: {
    identityParagraph: "사주 하부에 합(合)의 융화력이 깊어 대인 소통과 갈등 조율에 천부적인 자질이 돋보입니다.",
    socialParagraph: "분쟁을 매개하고 중재하는 화합의 리더십을 갖추었으며, 적대자가 없이 두루두루 우호적인 평판을 유지하는 강점을 가집니다.",
    positiveSignals: ["원만한 분쟁 해결 및 중재력"],
    cautionSignals: ["좋은 사람 콤플렉스로 인한 자기 주장 부재"],
    actions: ["자신만의 분명한 노선을 한 단계씩 표출하기", "타인의 부탁보다 내 우선과제를 먼저 완수하기"]
  },
  E_PUNISH_SELF: {
    cautionParagraph: "형살(刑) 기운의 세심한 칼날을 품고 있습니다. 이는 타인에게 엄격하기보다 자신의 도덕성과 원칙을 지키는 힘이기도 하지만, 지나친 검열로 인한 피로를 유발하기 쉽습니다.",
    wealthParagraph: "금융 거래나 재정 계획에서 1원 한 장 틀리지 않는 꼼꼼한 가계 관리 능력을 입증하지만, 가끔은 지나친 사소한 지출 검열로 인한 스트레스에 유의하십시오.",
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
