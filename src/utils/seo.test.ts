import { describe, it, expect } from "vitest";
import { getMetadata, getBreadcrumbSchema } from "./seo";

describe("SEO Utilities 테스트", () => {
  it("정상적인 메타데이터 개체를 생성해야 한다", () => {
    const meta = getMetadata({
      title: "오늘의 운세",
      description: "오늘의 운세 설명글",
      canonicalPath: "/today",
    });
    expect(meta.title).toBe("오늘의 운세 | 꿈과 운의 사전");
    expect(meta.description).toBe("오늘의 운세 설명글");
    expect(meta.alternates?.canonical).toBe("https://dreamfortune.com/today");
    expect((meta.robots as { index?: boolean; follow?: boolean })?.index).toBe(true);
  });

  it("noindex 옵션 설정 시 robots index가 false여야 한다", () => {
    const meta = getMetadata({
      title: "마이페이지",
      description: "개인화 정보",
      canonicalPath: "/my",
      noindex: true,
    });
    const robots = meta.robots as { index?: boolean; follow?: boolean };
    expect(robots?.index).toBe(false);
    expect(robots?.follow).toBe(false);
  });

  it("올바른 Schema.org 브레드크럼 구조를 반환해야 한다", () => {
    const schema = getBreadcrumbSchema([
      { name: "홈", item: "/" },
      { name: "사주", item: "/saju" }
    ]);
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement[0].name).toBe("홈");
    expect(schema.itemListElement[0].item).toBe("https://dreamfortune.com/");
    expect(schema.itemListElement[1].name).toBe("사주");
    expect(schema.itemListElement[1].item).toBe("https://dreamfortune.com/saju");
  });
});
