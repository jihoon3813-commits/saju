import { db } from "./index";
import { hashPassword } from "@/utils/hash";
import { Author, Content } from "./types";

// 고정 UUID 참조 보존
const AUTHOR_KIM_ID = "7f1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d";
const AUTHOR_LEE_ID = "8f1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d";

export async function seedDatabase(): Promise<void> {
  try {
    // 1. 일반 유저 확인 및 경쟁 방어 생성
    let user = await db.users.findByEmail("user@example.com");
    if (!user) {
      try {
        user = await db.users.create({
          email: "user@example.com",
          passwordHash: hashPassword("password123"),
          provider: "email",
          role: "user"
        });
      } catch (err) {
        user = await db.users.findByEmail("user@example.com");
        if (!user) throw err;
      }
    } else {
      await db.users.update(user.id, { role: "user" });
    }

    // 2. 어드민 유저 확인 및 경쟁 방어 생성
    let admin = await db.users.findByEmail("admin@example.com");
    if (!admin) {
      try {
        admin = await db.users.create({
          email: "admin@example.com",
          passwordHash: hashPassword("admin123"),
          provider: "email",
          role: "admin"
        });
      } catch (err) {
        admin = await db.users.findByEmail("admin@example.com");
        if (!admin) throw err;
      }
    } else {
      await db.users.update(admin.id, { role: "admin" });
    }

    // 3. 테스트용 출생 프로필 세팅 (이미 있으면 무시)
    const profiles = await db.profiles.findByUserId(user.id);
    if (profiles.length === 0) {
      try {
        await db.profiles.create({
          userId: user.id,
          anonymousSessionId: null,
          alias: "길동(본인)",
          relationship: "self",
          calendarType: "solar",
          lunarLeapMonth: null,
          birthDate: "1995-10-24",
          birthTime: "12:30",
          unknownBirthTime: false,
          birthCountry: "대한민국",
          birthCity: "서울",
          timezone: "Asia/Seoul",
          latitude: 37.5665,
          longitude: 126.9780,
          genderRuleOption: "male",
          calculationPreference: { useTrueSolarTime: false, borderTimeRule: "23" },
          saveConsent: true
        });

        await db.profiles.create({
          userId: user.id,
          anonymousSessionId: null,
          alias: "영희(연인)",
          relationship: "lover",
          calendarType: "lunar",
          lunarLeapMonth: false,
          birthDate: "1997-03-15",
          birthTime: "06:15",
          unknownBirthTime: false,
          birthCountry: "대한민국",
          birthCity: "부산",
          timezone: "Asia/Seoul",
          latitude: 35.1796,
          longitude: 129.0756,
          genderRuleOption: "female",
          calculationPreference: { useTrueSolarTime: false, borderTimeRule: "23" },
          saveConsent: true
        });
      } catch (e) {
        console.log("Birth profiles seeding skipped due to concurrency.");
      }
    }

    // 4. 작성자(Authors) 시딩
    let kimAuthor = await db.authors.findById(AUTHOR_KIM_ID);
    if (!kimAuthor) {
      try {
        const dbType = process.env.DATABASE_TYPE || "json";
        kimAuthor = await db.authors.create({
          name: "김명리",
          role: "사주명리 학자",
          bio: "20년 경력의 동양철학 학자. 시간 보정 및 일주론 분석 전문가.",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
        });
        
        if (dbType !== "postgres") {
          const local = require("./jsonDb").readDb ? require("./jsonDb").readDb() : null;
          if (local && local.authors) {
            const idx = local.authors.findIndex((a: any) => a.name === "김명리");
            if (idx !== -1) {
              local.authors[idx].id = AUTHOR_KIM_ID;
              require("./jsonDb").writeDb(local);
            }
          }
        } else {
          const p = new (require("pg").Pool)({ connectionString: process.env.DATABASE_URL });
          await p.query("UPDATE authors SET id = $1 WHERE name = $2", [AUTHOR_KIM_ID, "김명리"]);
          await p.end();
        }
      } catch (err) {
        kimAuthor = await db.authors.findById(AUTHOR_KIM_ID);
      }
    }

    let leeAuthor = await db.authors.findById(AUTHOR_LEE_ID);
    if (!leeAuthor) {
      try {
        const dbType = process.env.DATABASE_TYPE || "json";
        leeAuthor = await db.authors.create({
          name: "이해몽",
          role: "전통꿈풀이 분석가",
          bio: "정신분석학과 전통 상징 해설을 융합한 15년 경력의 꿈해몽 전문가.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        });
        
        if (dbType !== "postgres") {
          const local = require("./jsonDb").readDb ? require("./jsonDb").readDb() : null;
          if (local && local.authors) {
            const idx = local.authors.findIndex((a: any) => a.name === "이해몽");
            if (idx !== -1) {
              local.authors[idx].id = AUTHOR_LEE_ID;
              require("./jsonDb").writeDb(local);
            }
          }
        } else {
          const p = new (require("pg").Pool)({ connectionString: process.env.DATABASE_URL });
          await p.query("UPDATE authors SET id = $1 WHERE name = $2", [AUTHOR_LEE_ID, "이해몽"]);
          await p.end();
        }
      } catch (err) {
        leeAuthor = await db.authors.findById(AUTHOR_LEE_ID);
      }
    }

    // 5. 콘텐츠(Contents) 시딩
    const contentsCount = await db.contents.findByQuery({});
    if (contentsCount.length === 0) {
      console.log("Seeding database: creating 10 seed content articles...");

      const seedContents: Omit<Content, "id" | "revision" | "createdAt" | "updatedAt" | "deletedAt">[] = [
        // 1. 꿈해몽 해석 규칙 가이드 (guide)
        {
          type: "guide",
          title: "꿈해몽을 해석할 때 확인해야 할 7가지 기준",
          slug: "7-rules-of-dream-interpretation",
          excerpt: "꿈을 단순히 길몽과 흉몽으로 재단하기 전에, 꿈의 본질을 다각도로 꿰뚫어 보는 7가지 명확한 자가 판별 원칙을 전수합니다.",
          body: `<h2>꿈을 해독하는 7가지 황금 기준</h2>
<p>꿈은 무의식의 거울이자 감정의 잔여물입니다. 단순히 '뱀을 보았으니 길몽'이라 단정 지을 수 없는 이유가 여기에 있습니다. 아래의 7가지 기준을 통해 어젯밤 내 꿈의 진의를 파악해 보세요.</p>

<h3>1. 꿈의 주체: 누가 행동의 중심에 서 있는가?</h3>
<p>내가 상징물과 직접 교감하거나 물리적 상호작용을 한 꿈과, 제3자가 하는 행동을 방관하는 꿈은 해석의 세기가 완전히 다릅니다. 자신이 뱀에게 물렸다면 즉각적인 재물 유입 또는 매력을 얻는 길몽이지만, 멀리서 다른 사람이 물리는 것을 보았다면 그 영향력은 현격히 미미합니다.</p>

<h3>2. 꿈의 시각적 선명성</h3>
<p>상징물(예: 돼지, 금반지)의 빛깔และ 상태가 눈이 부실 정도로 빛나거나 선명했다면 현실에서의 실현 가능성이 매우 큽니다. 반대로 형태가 흐릿하거나 안개에 싸인 듯했다면 일시적인 잡몽이나 스트레스성 투영에 불과할 확률이 높습니다.</p>

<h3>3. 깨어난 직후의 감정 상태</h3>
<p>흔히 쫓기는 꿈은 흉몽이라 여겨지지만, 깨어났을 때 개운했거나 공포감이 없었다면 무거운 책임감의 해소나 신분 상승을 예견하는 길몽일 수 있습니다. 반대로 돼지가 찾아왔더라도 불쾌하거나 두려움에 떨었다면 들어온 재물이 되려 근심거리가 될 수 있습니다.</p>

<h3>4. 꿈의 반복 여부</h3>
<p>최근 1~2개월 내에 동일한 장소, 인물, 사물이 주기적으로 반복되어 등장한다면 이는 무의식이 보내는 강력한 주의 시그널입니다. 마음속에 억압된 트라우마나 현실에서 회피하고 있는 문제를 직접 대면하라는 메시지입니다.</p>

<h3>5. 현실의 스트레스 수준 대조</h3>
<p>시험을 망치거나 절벽에서 떨어지는 등의 일반적 악몽은 현실의 극심한 압박감이 그대로 표출된 경우가 많습니다. 이를 예지몽으로 착각해 불필요한 불안감에 시달리지 않도록 현실 속 자신의 마음 상태를 먼저 살펴야 합니다.</p>

<h3>6. 전통적 상징성 vs 개인적 연상</h3>
<p>대중적인 꿈 사전에서는 개를 충성심이나 부하로 보지만, 평소 개를 몹시 두려워하는 사람에게 꿈속의 개는 두려운 장애물이나 적대자로 해석됩니다. 보편적인 사전 해석에 갇히지 말고 본인의 주관적 감정을 개입하세요.</p>

<h3>7. 시간대와 기운의 변화</h3>
<p>새벽녘에 꾼 꿈일수록 의식이 맑아져 정합적인 예지 능력을 띄기 쉽습니다. 초저녁이나 선잠에 꾼 꿈은 당일 낮에 본 잔상이 재조합된 경우가 대부분입니다.</p>`,
          cluster: "꿈해몽 이론",
          category: "꿈해몽 기초",
          tags: ["꿈풀이", "심리학", "무의식", "초보 가이드"],
          searchIntent: "꿈을 올바르게 셀프 해석하고 분석하는 기준 학습",
          primaryKeyword: "꿈해몽 해석 기준",
          relatedServiceIds: [],
          relatedContentIds: [],
          authorId: AUTHOR_LEE_ID,
          reviewerId: AUTHOR_KIM_ID,
          status: "published",
          publishedAt: new Date(),
          canonicalUrl: "/dreams/7-rules-of-dream-interpretation",
          metaTitle: "꿈해몽 해석법: 꿈을 올바르게 풀이하는 7가지 핵심 기준",
          metaDescription: "꿈을 길몽과 흉몽으로 성급히 판단하기 전에 선명성, 주체, 깨어난 직후의 감정 등 7가지 기준으로 셀프 분석하는 정합적 가이드를 만나보세요.",
          ogImage: "https://images.unsplash.com/photo-1511289081367-4ad7f0e57194?w=800",
          schemaType: "TechArticle",
          noindex: false
        },
        // 2. 동물이 나오는 꿈 총정리 (article)
        {
          type: "article",
          title: "동물이 나오는 꿈해몽 총정리",
          slug: "animal-dreams-summary",
          excerpt: "뱀, 돼지, 호랑이, 용 등 꿈속에 동물이 등장할 때 뜻하는 전통적인 사회적 의미와 심리적 길흉 판단 기준을 종합 정리합니다.",
          body: `<h2>꿈에 나타나는 동물의 5대 상징적 의미</h2>
<p>인류 역사에서 동물은 단순한 생명체를 넘어 특정 기운과 사회적 계급, 그리고 내면의 본능을 대변하는 상징이었습니다. 꿈속 동물들의 거대한 흐름을 핵심적으로 정리해 드립니다.</p>

<h3>1. 돼지: 행운과 비옥함, 물질적 대가</h3>
<p>돼지는 전통 농경 사회에서 번식력과 재물을 의미해 왔습니다. 돼지 꿈의 핵심 판별법은 '소유성'입니다. 돼지가 방 안이나 집안으로 들어오거나 품에 직접 들어온다면 1등급 길몽이며, 횡재수나 사업 계약 성립을 예고합니다. 반면, 돼지가 집 밖으로 도망치거나 검은 돼지가 공격하는 것은 예기치 못한 금전적 유출을 경고합니다.</p>

<h3>2. 뱀: 지혜, 권력, 성적 에너지, 그리고 적대자</h3>
<p>뱀은 재생의 힘(탈피)과 지혜를 뜻하기도 하지만, 사기와 교활함을 대변하기도 합니다. 뱀이 치마 밑으로 들어오거나 몸을 감싸 안는 꿈은 훌륭한 자손을 얻는 강력한 태몽 또는 매력의 상승으로 연애운의 도래를 뜻합니다. 하지만 독사에게 물리거나 뱀이 길을 가로막고 쉭쉭거리는 것은 신용 사기나 배신에 대한 엄중 경고입니다.</p>

<h3>3. 호랑이와 용: 명예, 고위직, 압도적인 권위</h3>
<p>상상의 동물인 용과 백수지왕 호랑이는 명예와 합격을 의미합니다. 수험생이나 취업 준비생이 호랑이를 타거나 용이 여의주를 물고 하늘로 승천하는 꿈을 꾼다면, 일신이 높은 자리에 오르고 명성을 떨치는 대길몽입니다.</p>

<h3>4. 고양이와 개: 대인 관계와 심리적 안착</h3>
<p>개와 고양이는 주로 주변의 지인, 부하 직원, 혹은 심리적 유대 관계를 나타냅니다. 영리한 개가 앞장서서 나를 길잡이 해 주는 꿈은 훌륭한 귀인을 만날 예시이나, 고양이가 할퀴거나 개의 눈빛이 붉고 사나워 짖어대는 것은 아끼던 사람에게 뒤통수를 맞거나 구설수에 오를 암시입니다.</p>`,
          cluster: "동물 꿈 사전",
          category: "동물",
          tags: ["동물꿈", "돼지꿈", "뱀꿈", "호랑이꿈", "길몽 총정리"],
          searchIntent: "동물 꿈의 거시적 상징성 파악 및 길흉 판단 흐름 습득",
          primaryKeyword: "동물 꿈해몽",
          relatedServiceIds: [],
          relatedContentIds: ["snake-dream-interpretation", "pig-dream-interpretation"],
          authorId: AUTHOR_LEE_ID,
          reviewerId: AUTHOR_KIM_ID,
          status: "published",
          publishedAt: new Date(),
          canonicalUrl: "/articles/animal-dreams-summary",
          metaTitle: "동물이 나오는 꿈해몽 총정리: 뱀, 돼지, 호랑이 해석 가이드",
          metaDescription: "돼지, 뱀, 호랑이 등 대표적인 동물이 등장하는 꿈의 길몽과 흉몽을 총정리하고 내면에 잠재된 심리적 동력과 현실 대처법을 전수합니다.",
          ogImage: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800",
          schemaType: "Article",
          noindex: false
        },
        // 3. 뱀 꿈해몽 (dream)
        {
          type: "dream",
          title: "뱀 꿈해몽",
          slug: "snake-dream-interpretation",
          excerpt: "재물, 지혜, 귀인, 태몽 혹은 음해와 질병을 상징하는 뱀 꿈에 대해 상황별로 명쾌하게 풀이합니다.",
          body: `<p>뱀 꿈은 그 형태와 상호작용에 따라 극과 극으로 갈리는 상징을 지니고 있습니다. 동양학적으로 뱀은 지혜와 신성한 신분의 상승을 대변하기도 하지만, 음성적인 질병이나 남들의 모함, 배신을 의미하기도 합니다.</p>
<h3>상황별 뱀 꿈 풀이</h3>
<ul>
  <li><strong>큰 구렁이가 내 방 침대에 똬리를 틀고 있는 꿈:</strong> 훌륭한 중책을 맡거나 큰 재물을 축적할 배우자를 만나게 될 대길몽이며, 가문이 일어설 태몽입니다.</li>
  <li><strong>지나가던 뱀에게 발가락을 물려 피가 철철 흐르는 꿈:</strong> 뜻밖의 협력자나 후원자(귀인)를 만나 막혔던 사업 자금이 뚫리고 행운의 기회를 거머쥡니다.</li>
  <li><strong>뱀이 나를 물려고 쫓아와 도망치는 도중 식은땀을 흘리며 깨어난 꿈:</strong> 현실에서 감당하기 버거운 업무 스트레스에 시달리거나, 구설수 및 지인과의 계약 관계에서 큰 손해가 일어날 위험을 경고합니다.</li>
</ul>`,
          cluster: "동물 꿈 사전",
          category: "동물",
          tags: ["뱀꿈", "구렁이꿈", "뱀에 물리는 꿈", "태몽"],
          searchIntent: "뱀이 나오는 꿈의 길몽과 흉몽 상황별 분석",
          primaryKeyword: "뱀 꿈해몽",
          relatedServiceIds: [],
          relatedContentIds: ["animal-dreams-summary"],
          authorId: AUTHOR_LEE_ID,
          reviewerId: AUTHOR_KIM_ID,
          status: "published",
          publishedAt: new Date(),
          canonicalUrl: "/dreams/snake-dream-interpretation",
          metaTitle: "뱀 꿈해몽 상황별 풀이: 뱀에게 물리는 꿈, 구렁이 태몽",
          metaDescription: "뱀이 품에 들어오거나 뱀에 물려 피가 나는 길몽부터 독사에게 쫓기는 위험 경고 흉몽까지, 상황별 뱀 꿈의 핵심 의미와 대처법을 심도 있게 제공합니다.",
          ogImage: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=800",
          schemaType: "TechArticle",
          noindex: false,
          primarySymbol: "뱀",
          action: "물리다 / 품에 들어오다 / 쫓아오다",
          emotion: "설렘 / 놀람 / 두려움",
          setting: "집안 방 / 숲속 길",
          positiveInterpretation: "뜻밖의 계약 성립, 성취, 가문의 경사 및 태몽",
          cautionInterpretation: "지인의 모함이나 건강상의 피로 누적 경고",
          contextVariables: { color: "green", count: 1 }
        },
        // 4. 돼지 꿈해몽 (dream)
        {
          type: "dream",
          title: "돼지 꿈해몽",
          slug: "pig-dream-interpretation",
          excerpt: "뜻밖의 횡재수와 사업 번창을 상징하는 황금 돼지, 아기 돼지 꿈의 종합 풀이를 확인하세요.",
          body: `<p>돼지 꿈은 전통적으로 하늘이 내리는 횡재수의 표상입니다. 그러나 단순히 꿈에서 돼지를 보았다고 모두 로또를 사야 하는 것은 아닙니다. 돼지의 색상과 행동을 정확히 구별해 봅니다.</p>
<h3>돼지 꿈의 핵심 해석</h3>
<ul>
  <li><strong>황금색 돼지가 길을 걷다 내 바지 자락을 물고 끌고 가는 꿈:</strong> 부동산 계약, 복권 당첨, 주식 폭등 등 인생의 거대한 물적 기회가 직결되는 초대형 길몽입니다.</li>
  <li><strong>아기 돼지 떼가 안방으로 우글거리며 밀려 들어오는 꿈:</strong> 가업이 번성하고 재산이 불어나며 투자한 곳에서 연쇄적 수익을 거두어 풍요를 누립니다.</li>
  <li><strong>검고 더러운 돼지가 으르렁거리며 덤벼들어 쫓아내는 꿈:</strong> 굴러들어온 복을 차버리거나, 계약 관계의 갈등으로 다 쥐었던 이권이 새어 나갈 조짐이므로 양보와 차분한 태도가 요구됩니다.</li>
</ul>`,
          cluster: "동물 꿈 사전",
          category: "동물",
          tags: ["돼지꿈", "황금돼지", "복권당첨꿈", "횡재수"],
          searchIntent: "돼지 꿈의 재물 유입 판별과 상황별 행동 해석",
          primaryKeyword: "돼지 꿈해몽",
          relatedServiceIds: [],
          relatedContentIds: ["animal-dreams-summary"],
          authorId: AUTHOR_LEE_ID,
          reviewerId: AUTHOR_KIM_ID,
          status: "published",
          publishedAt: new Date(),
          canonicalUrl: "/dreams/pig-dream-interpretation",
          metaTitle: "돼지 꿈해몽: 황금 돼지 복권 꿈 및 아기 돼지 태몽 풀이",
          metaDescription: "황금 돼지 꿈, 아기 돼지가 집안에 우글거리는 대길몽부터 더러운 돼지를 내쫓는 아쉬운 흉몽까지, 돼지 꿈의 현대적 재무해석을 담아냈습니다.",
          ogImage: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800",
          schemaType: "TechArticle",
          noindex: false,
          primarySymbol: "돼지",
          action: "바지락을 물다 / 방으로 들어오다 / 내쫓다",
          emotion: "환희 / 경이로움 / 불쾌감",
          setting: "안방 / 마당 / 시장",
          positiveInterpretation: "일생일대의 횡재, 사업적 급진 성장, 예기치 못한 보너스",
          cautionInterpretation: "눈앞의 이익 때문에 장기적 신용을 잃지 말라는 경고",
          contextVariables: { color: "gold", count: 10 }
        },
        // 5. 돈을 줍는 꿈 (dream)
        {
          type: "dream",
          title: "돈을 줍는 꿈",
          slug: "picking-up-money-dream",
          excerpt: "동전부터 다발 지폐까지, 길바닥에서 돈을 줍는 꿈의 명쾌한 영양과 명리적 해설.",
          body: `<p>돈을 줍는 행위는 꿈속에서 즉각적인 보상감을 주지만, 실제 인생에서의 해설은 돈의 종류와 마주한 상황에 따라 근심의 씨앗이 되기도 합니다.</p>
<h3>돈의 액수별/형태별 차이</h3>
<ul>
  <li><strong>반짝이는 새 5만 원 지폐 다발을 다량 줍는 꿈:</strong> 실제로 조력자의 도움이나 신규 프로젝트 배정으로 인해 고정 소득이 증대되거나 승진의 기쁨을 누리는 대길몽입니다.</li>
  <li><strong>녹슨 구식 동전 몇 개를 길바닥에서 줍고 호주머니에 넣는 꿈:</strong> 명리학적으로 '작은 근심거리'의 유입입니다. 소액의 불필요한 지출이 연이어 발생하거나 가까운 사람과 사소한 말다툼이 벌어질 수 있습니다.</li>
  <li><strong>내 가방 속에서 남의 돈다발이 발견되는 꿈:</strong> 횡재로 착각하기 쉽지만 타인의 질투를 받거나 모함을 사 업무적 난관에 봉착할 주의몽입니다.</li>
</ul>`,
          cluster: "재물 꿈 사전",
          category: "물건",
          tags: ["돈줍는꿈", "동전꿈", "지폐다발", "재물운"],
          searchIntent: "돈을 줍는 꿈의 현실적 재물 반사와 근심 판별",
          primaryKeyword: "돈 줍는 꿈",
          relatedServiceIds: [],
          relatedContentIds: [],
          authorId: AUTHOR_LEE_ID,
          reviewerId: AUTHOR_KIM_ID,
          status: "published",
          publishedAt: new Date(),
          canonicalUrl: "/dreams/picking-up-money-dream",
          metaTitle: "돈을 줍는 꿈해몽: 지폐 다발 길몽과 녹슨 동전 흉몽 차이",
          metaDescription: "새 지폐를 가득 줍는 꿈의 성취적 예시와 달리, 녹슨 동전이나 낡은 돈을 줍고 마음이 무거웠던 꿈의 근심 경고 해설을 심층 분석합니다.",
          ogImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800",
          schemaType: "TechArticle",
          noindex: false,
          primarySymbol: "돈",
          action: "길에서 줍다",
          emotion: "설렘 / 찝찝함",
          setting: "어두운 길목 / 사무실 복도",
          positiveInterpretation: "새 프로젝트 수주, 가시적인 소득 보전, 입지 상승",
          cautionInterpretation: "공짜 돈을 탐내다가 신용에 오점이 남거나 불필요한 과실 취득 유의",
          contextVariables: { amount: "many", format: "bill" }
        },
        // 6. 불이 나는 꿈 (dream)
        {
          type: "dream",
          title: "불이 나는 꿈",
          slug: "fire-dream-interpretation",
          excerpt: "사업의 확장과 강력한 열정, 번창을 예고하는 화재 꿈의 입체적인 해설서.",
          body: `<p>불은 명리학적으로 '화(火)' 기운이자 문명, 열정, 급격한 확산과 번창을 대변합니다. 불이 세차게 타오를수록 운의 크기가 압도적으로 번창함을 나타냅니다.</p>
<h3>화재 꿈의 판단 원칙</h3>
<ul>
  <li><strong>우리 집이 활활 불타며 하늘 높이 붉은 불꽃과 연기가 치솟는 꿈:</strong> 집안에 큰 경사가 겹치고 본인이나 가족의 사업이 폭발적인 성장을 거두어 부동산 가치가 오르는 최고봉의 행운몽입니다.</li>
  <li><strong>산 전체가 큰 불에 휩싸여 끝없이 타들어 가는 꿈:</strong> 국가적 성격의 시험 합격, 대기업 취직, 혹은 언론과 대중의 집중적인 조명을 받으며 큰 인기를 구가할 명예의 발현입니다.</li>
  <li><strong>검은 연기만 자욱하게 나고 불길은 전혀 보이지 않는 꿈:</strong> 기운의 고립입니다. 추진하던 일이 소문만 요란할 뿐 실속이 없고 내부적인 소통 단절로 답답함에 직면할 주의몽입니다.</li>
</ul>`,
          cluster: "자연 상징 사전",
          category: "자연",
          tags: ["불나는꿈", "화재꿈", "집타는꿈", "명예상승"],
          searchIntent: "불나는 꿈의 기세 분석과 검은 연기 흉몽 판별",
          primaryKeyword: "불이 나는 꿈",
          relatedServiceIds: [],
          relatedContentIds: [],
          authorId: AUTHOR_LEE_ID,
          reviewerId: AUTHOR_KIM_ID,
          status: "published",
          publishedAt: new Date(),
          canonicalUrl: "/dreams/fire-dream-interpretation",
          metaTitle: "불이 나는 꿈해몽: 화재 길몽과 불길 없는 검은 연기 흉몽",
          metaDescription: "집 전체가 타오르는 폭발적 번창 길몽과 달리, 매캐한 검은 연기만 자욱하게 뿜어져 나오던 답답한 흉몽의 의미를 입체적으로 풀이합니다.",
          ogImage: "https://images.unsplash.com/photo-1508873696983-2df519fcc3d5?w=800",
          schemaType: "TechArticle",
          noindex: false,
          primarySymbol: "불",
          action: "불타다 / 검은 연기가 나다",
          emotion: "놀람 / 경이로움 / 공포",
          setting: "집 / 야산 / 건물 지하",
          positiveInterpretation: "소원 성취, 명예와 명성의 비약적 상승, 획기적 가업 번창",
          cautionInterpretation: "기세가 너무 급해 주변 관계를 다 태우지 않도록 완급 조절 필요",
          contextVariables: { size: "large", smoke: "black" }
        },
        // 7. 죽은 사람이 나오는 꿈 (dream)
        {
          type: "dream",
          title: "죽은 사람이 나오는 꿈",
          slug: "deceased-person-dream",
          excerpt: "조상님이나 지인의 환생, 대화, 그리고 안색에 따른 경고와 축복을 분석합니다.",
          body: `<p>돌아가신 부모님이나 조상, 친한 지인이 꿈에 나오는 것은 심리학적으로 깊은 그리움이나 무의식적 죄책감의 발로이기도 하지만, 명리 분석가 관점에서는 중대한 영적 메시지의 전달 통로입니다.</p>
<h3>인물과 얼굴빛에 따른 길흉 해설</h3>
<ul>
  <li><strong>조상님이 밝게 웃으며 나에게 따뜻한 밥을 지어 주는 꿈:</strong> 집안에 조력자(귀인)가 들어와 꼬였던 대출금이나 관재구설이 기적적으로 해결될 은혜로운 조상덕 대길몽입니다.</li>
  <li><strong>죽은 지인이 침통하고 어두운 표정으로 나를 물끄러미 바라보기만 하는 꿈:</strong> 건강의 하락이나 사고수의 경고입니다. 진행하는 계약을 즉각 멈추고 교통질서나 신변 안전에 극도로 유의해야 합니다.</li>
  <li><strong>죽은 사람이 살아나서 함께 여행을 떠나기 위해 짐을 싸는 꿈:</strong> 예기치 못한 질병의 도래나 기력의 저하를 뜻하므로 생활 습관을 면밀히 재정비해야 합니다.</li>
</ul>`,
          cluster: "인물 꿈 사전",
          category: "사람",
          tags: ["죽은사람꿈", "조상님꿈", "돌아가신부모님", "경고몽"],
          searchIntent: "죽은 인물의 표정 분석과 무의식적 경고 징후 해석",
          primaryKeyword: "죽은 사람이 나오는 꿈",
          relatedServiceIds: [],
          relatedContentIds: [],
          authorId: AUTHOR_LEE_ID,
          reviewerId: AUTHOR_KIM_ID,
          status: "published",
          publishedAt: new Date(),
          canonicalUrl: "/dreams/deceased-person-dream",
          metaTitle: "죽은 사람이 나오는 꿈해몽: 부모님 조상 꿈의 미소와 어두운 안색",
          metaDescription: "조상님이 밝게 미소 지어 주는 축복의 길몽부터 슬픈 안색으로 무언가 경고를 보내는 듯했던 안심 대비 요령을 차근차근 전수합니다.",
          ogImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800",
          schemaType: "TechArticle",
          noindex: false,
          primarySymbol: "죽은 사람",
          action: "대화하다 / 미소 짓다 / 경고하다",
          emotion: "그리움 / 편안함 / 불안감",
          setting: "고향집 / 안개 자욱한 강가",
          positiveInterpretation: "귀인의 갑작스러운 지원, 막혔던 부동산 처분 기회 도래",
          cautionInterpretation: "사고나 구설수, 건강 노화 등 평소 생활 리듬의 엄정한 통제 요구",
          contextVariables: { expression: "smiling", relation: "parent" }
        },
        // 8. 물에 빠지는 꿈 (dream)
        {
          type: "dream",
          title: "물에 빠지는 꿈",
          slug: "falling-into-water-dream",
          excerpt: "맑은 물과 탁한 흙탕물의 상징적 격차와 심리적 불안 요인 분석.",
          body: `<p>물은 감정의 깊이와 잠재의식, 그리고 흘러가는 재산을 표상합니다. 물의 정화도와 깊이에 따라 꿈풀이가 180도 선회합니다.</p>
<h3>물의 맑기와 흐름 대조</h3>
<ul>
  <li><strong>수정처럼 맑고 깊은 호수 한가운데에 몸이 둥둥 떠서 편안하게 솟아오르는 꿈:</strong> 예술가나 연구자의 경우 획기적인 창작물을 발표하거나, 회사에서 큰 인정을 받아 고위직으로 영전할 지혜의 대통몽입니다.</li>
  <li><strong>악취가 나고 흙탕물이 소용돌이치는 강물 속으로 발이 빠져 허우적거리는 꿈:</strong> 구설수와 타인의 사기 덫에 걸릴 위험이 큽니다. 투자 사기를 조심하고 주변에 매력적인 조건으로 다가오는 이를 필히 경계해야 합니다.</li>
  <li><strong>거센 홍수가 집으로 밀려 들어와 물바다가 되나 나를 휩쓸어 가지는 않고 고여 있는 꿈:</strong> 큰 기세를 가진 타인의 재화나 인맥이 나를 중심으로 고여드는 대길몽입니다.</li>
</ul>`,
          cluster: "자연 상징 사전",
          category: "장소",
          tags: ["물에빠지는꿈", "호수꿈", "흙탕물꿈", "홍수꿈"],
          searchIntent: "물속에 빠지거나 뜨는 꿈의 맑기별 길흉 판별",
          primaryKeyword: "물에 빠지는 꿈",
          relatedServiceIds: [],
          relatedContentIds: [],
          authorId: AUTHOR_LEE_ID,
          reviewerId: AUTHOR_KIM_ID,
          status: "published",
          publishedAt: new Date(),
          canonicalUrl: "/dreams/falling-into-water-dream",
          metaTitle: "물에 빠지는 꿈해몽: 맑은 호수 길몽과 더러운 흙탕물 흉몽",
          metaDescription: "감정과 무의식을 맑게 정화해 주는 수정 물꿈과, 인간관계와 재산을 매캐하게 흐려놓을 흙탕물 조심 경고 흉몽의 입체 해설입니다.",
          ogImage: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800",
          schemaType: "TechArticle",
          noindex: false,
          primarySymbol: "물",
          action: "빠지다 / 뜨다",
          emotion: "경외감 / 공포 / 평온함",
          setting: "깊은 수영장 / 소용돌이 강물",
          positiveInterpretation: "사회적 이권 쟁취, 통찰력 획득, 큰 세력의 자산 흡수",
          cautionInterpretation: "감정적 우울에 침습당하지 않도록 마인드 컨트롤 철저 관리",
          contextVariables: { clarity: "clear", depth: "deep" }
        },
        // 9. 만세력이란 무엇인가 (glossary)
        {
          type: "glossary",
          title: "만세력이란 무엇인가",
          slug: "what-is-manse-calendar",
          excerpt: "사주명리학에서 생년월일시를 사주팔자의 여덟 글자 간지로 전환하는 동양 우주 좌표 계산기의 본질에 대해 쉽고 상세히 알아봅니다.",
          body: `<h2>동양학의 내비게이션, 만세력(萬歲曆)</h2>
<p>사주를 보기 위해 철학관에 가거나 온라인 운세를 조회할 때 가장 먼저 생성되는 한자 여덟 글자(팔자)의 배경에 바로 <strong>만세력</strong>이 있습니다.</p>

<h3>1. 만세력의 한자적 유래</h3>
<p>만세(萬歲)는 '만 년 동안' 혹은 '아주 오랜 세월'을 뜻합니다. 즉, 오랜 세월 동안의 천문 운동 법칙(태양과 달, 그리고 태양계 행성들의 공전과 자전 주기)을 계산하여 춘하추동 절기와 시간을 간지(60갑자)로 매핑해 둔 동양 고유의 우주 주기 달력 책입니다.</p>

<h3>2. 만세력이 사주 분석에 필수적인 이유</h3>
<p>우리가 일상에서 쓰는 그레고리력(양력)은 단순히 날짜와 요일을 나타낼 뿐, 그 시각 지구에 어떤 계절적 기운과 우주적 중력 작용이 미치고 있는지 묘사하지 못합니다. 만세력은 다음과 같은 작업을 완수해 줍니다.</p>
<ul>
  <li><strong>연월일시를 4개의 기둥(사주)과 8개의 글자(팔자)로 좌표화</strong></li>
  <li><strong>절입 시각(입춘, 경칩 등)의 분 단위 계산을 통해 월주의 정확한 전환 시점 제공</strong></li>
  <li><strong>대운(인생의 10년 단위 대주기 환경)의 시작 시점과 순행/역행 좌표 추적</strong></li>
</ul>

<h3>3. 현대 온라인 만세력의 정밀화</h3>
<p>과거에는 두꺼운 책으로 일일이 찾았으나, 현재는 컴퓨터와 모바일 어플을 통해 위도/경도 시간 보정 및 진태양시(지구 타원 궤도로 인한 정밀 오차 보정)까지 완벽하게 소수점 단위로 자동 연산해 줍니다. 우리 서비스가 지향하는 만세력 도구가 바로 이 정합적인 천문 연산에 기초하고 있습니다.</p>`,
          cluster: "명리 기초 사전",
          category: "사주 기초",
          tags: ["만세력", "사주팔자", "동양철학", "기초이론"],
          searchIntent: "만세력의 원리적 이해 및 사주 대입 방법 분석",
          primaryKeyword: "만세력 원리",
          relatedServiceIds: ["basic-saju"],
          relatedContentIds: ["difference-between-five-elements-and-ten-gods"],
          authorId: AUTHOR_KIM_ID,
          reviewerId: AUTHOR_LEE_ID,
          status: "published",
          publishedAt: new Date(),
          canonicalUrl: "/glossary/what-is-manse-calendar",
          metaTitle: "만세력이란 무엇인가: 사주팔자 8자의 천문학적 원리",
          metaDescription: "사주명리학에서 연월일시를 간지로 변환해 주는 정밀 좌표 변환 도구인 만세력의 정의, 역사 및 대운 결정 과정의 본질을 학문적으로 해설합니다.",
          ogImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
          schemaType: "DefinedTerm",
          noindex: false
        },
        // 10. 오행과 십성의 차이 (glossary)
        {
          type: "glossary",
          title: "오행과 십성의 차이",
          slug: "difference-between-five-elements-and-ten-gods",
          excerpt: "사주 해석의 양대 기둥인 오행(자연적 에너지 상태)과 십성(인간 사회적 육친적 관계 구조)의 핵심적 차이점과 분석 요령.",
          body: `<h2>사주의 뼈대 오행, 사주의 근육 십성</h2>
<p>사주명리학을 처음 접할 때 가장 헷갈리기 쉬운 개념이 '오행(목화토금수)'과 '십성(비겁·식상·재성·관성·인성)'의 유기적 역할 차이입니다. 이 둘의 정의와 입체적 관점을 정리합니다.</p>

<h3>1. 오행(五行): 본질적인 자연 에너지와 심리 기류</h3>
<p>오행은 우주 만물을 구성하는 5가지 원소이자 목(木), 화(火), 토(土), 금(金), 수(水)의 기운을 뜻합니다. 이는 사주를 가진 사람이 타고난 원초적 기질이자 물리적인 신체 장기의 강약, 그리고 자연적 에너지 과다/결핍 상태를 보여줍니다.</p>
<ul>
  <li><strong>목(木):</strong> 솟아오르는 추진력, 시작하는 힘</li>
  <li><strong>화(火):</strong> 발산하는 열정, 문명과 정보</li>
  <li><strong>토(土):</strong> 조율하고 포용하는 완충 지대</li>
  <li><strong>금(金):</strong> 결단하고 수렴하는 규칙과 결실</li>
  <li><strong>수(수):</strong> 가라앉고 저장하는 지혜와 휴식</li>
</ul>

<h3>2. 십성(십성) 또는 육친(六親): 사회적 관계와 역할극</h3>
<p>십성은 오행의 목화토금수 기운을 **나(일간)**를 기준점으로 삼아 사회적 관계(비겁: 동료, 식상: 표현/자식, 재성: 목표/결실/재물, 관성: 규칙/조직/직장, 인성: 문서/학문/어머니)로 재해석한 상대적 좌표입니다.</p>
<p>예를 들어, 나(일간)가 <strong>목(木)</strong> 기운인 사람이라면, <strong>금(金)</strong> 기운은 단순히 단단한 쇠가 아니라 나를 통제하고 책임감을 부여하는 <strong>관성(직장)</strong>이 됩니다. 반대로 나(일간)가 <strong>토(土)</strong> 기운인 사람이라면, <strong>금(金)</strong> 기운은 내 끼를 펼치고 재화를 생산하는 통로인 <strong>식상(표현)</strong>이 됩니다.</p>

<h3>3. 요약: 조화로운 해석의 자세</h3>
<p>오행은 사람의 <strong>'본바탕 성정'</strong>을 진단하며, 십성은 그 바탕이 현실 사회에서 **'어떤 수단과 관계로 발현되는지'**를 분석합니다. 따라서 오행의 과다/결핍 상태를 파악한 뒤, 십성의 상대성을 대입해야만 살아 움직이는 정교한 사주 풀이가 가능해집니다.</p>`,
          cluster: "명리 기초 사전",
          category: "사주 기초",
          tags: ["오행", "십성", "명리용어", "일주론"],
          searchIntent: "오행의 물리적 성질과 십성의 사회적 관계 맵 구별",
          primaryKeyword: "오행 십성 차이",
          relatedServiceIds: ["basic-saju"],
          relatedContentIds: ["what-is-manse-calendar"],
          authorId: AUTHOR_KIM_ID,
          reviewerId: AUTHOR_LEE_ID,
          status: "published",
          publishedAt: new Date(),
          canonicalUrl: "/glossary/difference-between-five-elements-and-ten-gods",
          metaTitle: "오행과 십성의 차이: 동양적 에너지와 사회적 관계의 대칭",
          metaDescription: "목화토금수 5행의 자연과학적 에너지 본질과 비겁·식상·재성·관성·인성 10성의 사회적 관계 매핑 방식의 차이점을 알기 쉽게 조망합니다.",
          ogImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
          schemaType: "DefinedTerm",
          noindex: false
        }
      ];

      for (const item of seedContents) {
        try {
          await db.contents.create(item);
        } catch (e) {
          console.log(`Content seed already created or concurrency conflict: ${item.slug}`);
        }
      }
      console.log("Successfully seeded 10 content documents!");
    } else {
      console.log("Seed database: contents already exist.");
    }

    // 5. 광고 배치 (Ad Placements) 시딩
    const placements = await db.adPlacements.findAll();
    if (placements.length === 0) {
      const seedPlacements = [
        { slotKey: "home_after_cards", pageType: "home", position: "after_cards", deviceTarget: "all" as const, enabled: false, minContentLength: 0, adFormat: "banner" as const, reserveHeight: 120, consentRequired: false },
        { slotKey: "home_after_content", pageType: "home", position: "after_content", deviceTarget: "all" as const, enabled: false, minContentLength: 0, adFormat: "native" as const, reserveHeight: 250, consentRequired: false },
        { slotKey: "content_list_infeed", pageType: "content_list", position: "infeed", deviceTarget: "all" as const, enabled: false, minContentLength: 0, adFormat: "infeed" as const, reserveHeight: 150, consentRequired: false },
        { slotKey: "content_detail_upper", pageType: "content_detail", position: "upper_body", deviceTarget: "all" as const, enabled: false, minContentLength: 1000, adFormat: "banner" as const, reserveHeight: 100, consentRequired: false },
        { slotKey: "content_detail_lower", pageType: "content_detail", position: "lower_body", deviceTarget: "all" as const, enabled: false, minContentLength: 2000, adFormat: "banner" as const, reserveHeight: 100, consentRequired: false },
        { slotKey: "content_detail_sidebar", pageType: "content_detail", position: "sidebar", deviceTarget: "pc" as const, enabled: false, minContentLength: 0, adFormat: "sidebar" as const, reserveHeight: 600, consentRequired: false },
        { slotKey: "result_after_summary", pageType: "free_result", position: "after_summary", deviceTarget: "all" as const, enabled: false, minContentLength: 0, adFormat: "banner" as const, reserveHeight: 120, consentRequired: false },
        { slotKey: "result_before_related", pageType: "free_result", position: "before_related", deviceTarget: "all" as const, enabled: false, minContentLength: 0, adFormat: "banner" as const, reserveHeight: 120, consentRequired: false }
      ];

      for (const item of seedPlacements) {
        try {
          await db.adPlacements.create(item);
        } catch (e) {
          console.log(`AdPlacement seed skipped for: ${item.slotKey}`);
        }
      }
      console.log("Successfully seeded 8 ad placements!");
    }

    // 6. 유료 리포트 상품 (Products) 및 가격 버저닝 (Price Versions) 시딩
    const products = await db.products.findAll();
    if (products.length === 0) {
      const seedProducts = [
        {
          slug: "basic-saju-premium",
          title: "정통사주 평생 분석 리포트",
          description: "일간 분석, 오행 균형, 20가지 이상 심층 명리학 분야(재물, 직업, 건강, 관계 등) 및 세밀 대운 흐름을 수록한 고품격 리포트",
          productType: "saju_report" as const,
          price: 19900,
          currency: "KRW",
          active: true,
          sampleReportId: "sample-basic-saju-premium",
          requiredInputSchema: JSON.stringify({ type: "object", properties: { profileId: { type: "string" } }, required: ["profileId"] }),
          reportTemplateVersion: "1.0.0",
          refundPolicyVersion: "1.0.0"
        },
        {
          slug: "mini-saju-report",
          title: "질문 해결형 미니 운세 리포트",
          description: "이직 vs 잔류, 3개월 단기 재물 기류 등 하나의 구체적 질문을 명리 규칙 기반으로 집중 해설하는 인공지능 명리 도우미",
          productType: "mini_report" as const,
          price: 4900,
          currency: "KRW",
          active: true,
          sampleReportId: null,
          requiredInputSchema: JSON.stringify({ type: "object", properties: { profileId: { type: "string" }, question: { type: "string" } }, required: ["profileId", "question"] }),
          reportTemplateVersion: "1.0.0",
          refundPolicyVersion: "1.0.0"
        },
        {
          slug: "premium-compatibility",
          title: "동반자 심층 2인 궁합 보고서",
          description: "서로 다른 원국의 일간 상호작용, 충/합 대조, 관계 복구 조언 및 다가올 공동 대운 분석을 수록한 2인 맞춤 보고서",
          productType: "compatibility" as const,
          price: 24900,
          currency: "KRW",
          active: true,
          sampleReportId: "sample-compatibility-premium",
          requiredInputSchema: JSON.stringify({ type: "object", properties: { profileId: { type: "string" }, profileId2: { type: "string" } }, required: ["profileId", "profileId2"] }),
          reportTemplateVersion: "1.0.0",
          refundPolicyVersion: "1.0.0"
        },
        {
          slug: "annual-planner",
          title: "연간 길흉화복 플래너 & 캘린더",
          description: "월별 일간 운세 점정 지표와 일자별 피해야 할 기운, 명리학 기반 사용자 맞춤 실천 일정 플래너",
          productType: "planner" as const,
          price: 9900,
          currency: "KRW",
          active: true,
          sampleReportId: null,
          requiredInputSchema: JSON.stringify({ type: "object", properties: { profileId: { type: "string" }, year: { type: "number" } }, required: ["profileId", "year"] }),
          reportTemplateVersion: "1.0.0",
          refundPolicyVersion: "1.0.0"
        }
      ];

      for (const item of seedProducts) {
        try {
          const created = await db.products.create(item);
          // 제품 생성 후 동일 가격으로 1.0.0 가격 버전 등록
          await db.priceVersions.create({
            productId: created.id,
            price: created.price,
            currency: created.currency,
            version: "1.0.0",
            active: true
          });
        } catch (e) {
          console.log(`Product seed skipped for: ${item.slug}`);
        }
      }
      console.log("Successfully seeded 4 premium products and price versions!");
    }

    // 7. 테스트용 쿠폰 (Coupons) 시딩
    const coupons = await db.coupons.findAll();
    if (coupons.length === 0) {
      const seedCoupons = [
        {
          code: "WELCOME10",
          discountType: "percent" as const,
          discountValue: 10,
          maxUses: 1000,
          usedCount: 0,
          active: true,
          productRestrictions: null,
          expiresAt: new Date("2030-12-31T23:59:59Z")
        },
        {
          code: "FREE100",
          discountType: "percent" as const,
          discountValue: 100,
          maxUses: 500,
          usedCount: 0,
          active: true,
          productRestrictions: null,
          expiresAt: new Date("2030-12-31T23:59:59Z")
        },
        {
          code: "DISCOUNT5000",
          discountType: "amount" as const,
          discountValue: 5000,
          maxUses: 100,
          usedCount: 0,
          active: true,
          productRestrictions: null,
          expiresAt: new Date("2030-12-31T23:59:59Z")
        }
      ];

      for (const item of seedCoupons) {
        try {
          await db.coupons.create(item);
        } catch (e) {
          console.log(`Coupon seed skipped for: ${item.code}`);
        }
      }
      console.log("Successfully seeded 3 test coupons!");
    }

      // ==========================================
      // Phase 8: P1 확장 유료 상품 14종 자동 등록
      // ==========================================
      const p1Products = [
        { slug: "monthly-saju", title: "월간 명리 흐름 리포트", description: "매월 바뀌는 나만의 명리 십신 운기 흐름 분석", productType: "monthly", price: 2900 },
        { slug: "three-months-saju", title: "3개월 집중 운세 리포트", description: "가장 영향력이 강한 단기 3개월 집중 행동 전략서", productType: "three_months", price: 3900 },
        { slug: "new-year-saju", title: "신년 종합 대운 리포트", description: "한 해를 설계하는 연간 오행 세운 기류 총망라 분석", productType: "new_year", price: 9900 },
        { slug: "wealth-saju", title: "재물운·자산 평생 해설서", description: "선천적 재물 그릇의 크기와 평생 부의 흐름 총분석", productType: "wealth", price: 4900 },
        { slug: "career-saju", title: "직업·적성 성향 평생 보고서", description: "나에게 최적화된 조직 역할 및 직무 적성 명리학 설계", productType: "career", price: 4900 },
        { slug: "job-change-saju", title: "이직·이동운 집중 조언서", description: "현 직장에서의 리스크 및 이직 결정 최적 타이밍 조율", productType: "job_change", price: 4900 },
        { slug: "business-saju", title: "창업·사업운 평생 설계서", description: "개인 창업 적성 유무 및 동업 리스크, 투자 주기 총망라", productType: "business", price: 4900 },
        { slug: "love-saju", title: "연애·솔로 탈출 조언서", description: "나의 연애 심리 매커니즘과 연애 기류 진입기 분석", productType: "love", price: 4900 },
        { slug: "marriage-saju", title: "결혼·배우자 평생 보고서", description: "배우자 일주론 대조 및 이상적인 혼인 시점 상세 제안", productType: "marriage", price: 4900 },
        { slug: "reunion-saju", title: "관계 재회·연락 인연 분석서", description: "지나간 인연과의 재결합 가능성 및 교신 타이밍 추론", productType: "reunion", price: 4900 },
        { slug: "exam-saju", title: "합격·시험운 단기 집중 분석", description: "고시·자격증 등 중요한 결정을 앞둔 시기의 학업운 분석", productType: "exam", price: 4900 },
        { slug: "moving-saju", title: "이사·방위 개운 행동 가이드", description: "이사할 곳의 방향, 기운 상성 및 안전 이동 시기 제언", productType: "moving", price: 4900 },
        { slug: "child-disposition", title: "자녀 성향·기질 명리 발달서", description: "아이의 오행 기질을 기반으로 한 학습 방향 및 심리 양육 가이드", productType: "child_disposition", price: 7900 },
        { slug: "family-compatibility", title: "가족간 다자 명리 궁합", description: "가족 구성원 3인 이상(부모-자식 등)의 오행 조화 및 관계 조율 지침", productType: "family_compatibility", price: 14900 }
      ];

      for (const item of p1Products) {
        try {
          const created = await db.products.create({
            slug: item.slug,
            title: item.title,
            description: item.description,
            productType: item.productType as any,
            price: item.price,
            currency: "KRW",
            active: true,
            sampleReportId: null,
            requiredInputSchema: null,
            reportTemplateVersion: "1.0.0",
            refundPolicyVersion: "1.0.0"
          });
          await db.priceVersions.create({
            productId: created.id,
            price: item.price,
            currency: "KRW",
            version: "1.0.0",
            active: true
          });
          console.log(`Seeded P1 Product: ${item.slug}`);
        } catch (e) {
          // 이미 존재하는 경우 스킵
        }
      }

      // ==========================================
      // Phase 8: 3대 사이트 기본 동의·약관 정책 버전 자동 등록
      // ==========================================
      const seedPolicies = [
        { title: "서비스 이용약관", version: "1.0.0", content: "본 서비스의 이용 권한 및 결제, 환불 규칙을 명시합니다...", active: true },
        { title: "개인정보 처리방침", version: "1.0.0", content: "개인 생년월일시 데이터 수집 및 안전한 마스킹, 권한 삭제 요청 처리 절차를 명시합니다...", active: true },
        { title: "쿠키 동의 정책", version: "1.0.0", content: "사용자의 브라우저 쿠키 승인 상태에 따른 광고 서빙 및 추적 제어 방침을 명시합니다...", active: true }
      ];

      for (const item of seedPolicies) {
        try {
          const list = await db.policyVersions.findAll();
          const exists = list.some((pv) => pv.title === item.title && pv.version === item.version);
          if (!exists) {
            await db.policyVersions.create(item);
            console.log(`Seeded Policy Version: ${item.title} v${item.version}`);
          }
        } catch (e) {
          console.error("Policy seeding error:", e);
        }
      }
  } catch (err) {
    console.error("Database seeding failure:", err);
    throw err;
  }
}
