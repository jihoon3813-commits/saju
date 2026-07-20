"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics/tracker";

function TrackerCore() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    // Next.js static rendering / hydration 매칭
    if (typeof window === "undefined") return;

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;

    // 페이지 타입을 서비스 형태에 맞게 정밀 매핑
    let pageType = "other";
    if (pathname === "/") {
      pageType = "home";
    } else if (pathname.startsWith("/saju")) {
      const typeParam = searchParams.get("type");
      pageType = typeParam || "pyungsaeng";
    } else if (pathname.startsWith("/compatibility")) {
      pageType = "compatibility";
    } else if (pathname.startsWith("/tarot")) {
      pageType = "tarot";
    } else if (pathname.startsWith("/dreams")) {
      pageType = "dreams";
    } else if (pathname.startsWith("/today")) {
      pageType = "today";
    } else if (pathname.startsWith("/manse")) {
      pageType = "manse";
    } else {
      pageType = pathname.split("/")[1] || "home";
    }

    // force=true를 사용하여 관리자 통계 수집 우회 허용 (PII는 sanitizeProperties에 의해 마스킹 처리됨)
    trackEvent("page_view", pageType, {
      url: window.location.href,
      referrer: document.referrer || "direct",
    }, true).catch(err => {
      console.error("Failed to track page view event:", err);
    });
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerCore />
    </Suspense>
  );
}
