import React from "react";
import Link from "next/link";
import { getAdminContentListAction } from "@/app/actions/cms";
import { 
  Plus, 
  FileText, 
  AlertTriangle, 
  Link2, 
  Edit, 
  Link2Off,
  UserCheck
} from "lucide-react";
import DeleteContentButton from "@/components/admin/DeleteContentButton";

export default async function AdminContentPage() {
  const res = await getAdminContentListAction();

  if (!res.success || !res.list) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center text-rose-600 font-bold">
        데이터를 불러오는 중 오류가 발생했습니다: {res.error}
      </div>
    );
  }

  const list = res.list;
  const analysis = res.analysis;

  // 통계 계산
  const totalCount = list.length;
  const publishedCount = list.filter((c) => c.status === "published").length;
  const draftCount = list.filter((c) => c.status === "draft").length;
  const isolatedCount = list.filter((c) => c.isIsolated).length;
  const brokenCount = analysis?.brokenLinks?.length || 0;

  return (
    <div className="space-y-8 font-semibold text-navy">
      {/* 어드민 대시보드 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">콘텐츠·해몽 백과 관리</h1>
          <p className="text-sm text-navy/60 mt-1">
            검색 유입 극대화와 애드센스 규격 준수를 위한 전문가 지식 허브 구축 대시보드
          </p>
        </div>
        <Link 
          href="/admin/content/new" 
          className="inline-flex items-center space-x-1.5 px-5 py-3 bg-gold hover:bg-gold/95 text-white rounded-2xl font-bold transition shadow-sm cursor-pointer active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>신규 콘텐츠 작성</span>
        </Link>
      </div>

      {/* 요약 통계 그리드 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-1 shadow-sm">
          <div className="text-xs text-navy/55 font-semibold">전체 문항</div>
          <div className="text-2xl font-black text-navy">{totalCount}편</div>
        </div>
        <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-1 shadow-sm border-l-emerald-500/20">
          <div className="text-xs text-emerald-600 font-semibold">발행됨 (SEO 노출)</div>
          <div className="text-2xl font-black text-emerald-600">{publishedCount}편</div>
        </div>
        <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-1 shadow-sm">
          <div className="text-xs text-navy/50 font-semibold">임시저장초안</div>
          <div className="text-2xl font-black text-navy/70">{draftCount}편</div>
        </div>
        <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-1 shadow-sm border-l-amber-500/20">
          <div className="text-xs text-amber-600 font-semibold">고립(외톨이) 문서</div>
          <div className="text-2xl font-black text-amber-600">{isolatedCount}편</div>
        </div>
        <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-1 shadow-sm border-l-rose-500/20">
          <div className="text-xs text-rose-600 font-semibold">깨진 내부링크</div>
          <div className="text-2xl font-black text-rose-600">{brokenCount}건</div>
        </div>
      </div>

      {/* 링크 정합성 이상 경고 배너 */}
      {(isolatedCount > 0 || brokenCount > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4 shadow-sm text-amber-900">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>검색엔진 가시성(SEO) 링크 경고 경보</span>
          </div>
          
          <ul className="text-xs text-navy/70 space-y-2 list-disc pl-5">
            {isolatedCount > 0 && (
              <li>
                외부에서 자신을 향한 인카밍 링크가 0개인 <strong>고립(Orphan) 페이지</strong>가 {isolatedCount}개 검출되었습니다. 
                중요 글의 슬러그 링크를 타 콘텐츠 본문(예: 총정리 가이드 글 등)에 추가로 앵커 연결해 주시기 바랍니다.
              </li>
            )}
            {brokenCount > 0 && (
              <li>
                실재하지 않는 슬러그 주소를 본문에 링크한 <strong>깨진 링크(Broken Link)</strong>가 {brokenCount}개 확인되었습니다. 
                아래 대시보드 리스트의 적색 링크 표시 글들을 즉시 편집하여 교정하십시오.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* 콘텐츠 테이블 카드 */}
      <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gold" />
            <span>전체 콘텐츠 현황</span>
          </h2>
          <span className="text-xs text-navy/50">데이터 수: {list.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy/85">
            <thead className="bg-cream/50 text-navy/60 text-xs font-semibold uppercase border-b border-brand-border">
              <tr>
                <th className="px-6 py-4">제목 및 경로</th>
                <th className="px-6 py-4">구분 / 카테고리</th>
                <th className="px-6 py-4">발행 상태</th>
                <th className="px-6 py-4 text-center">개정 차수</th>
                <th className="px-6 py-4 text-center">내부링크 수 (유입 / 유출)</th>
                <th className="px-6 py-4">작성자 / 최종 수정일</th>
                <th className="px-6 py-4 text-right">제어</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-cream/10 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-navy hover:text-gold transition">
                      <Link href={`/admin/content/${c.id}`}>{c.title}</Link>
                    </div>
                    <div className="text-xs text-navy/40 font-mono mt-0.5 break-all max-w-xs select-all">
                      slug: {c.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs px-2.5 py-0.5 bg-cream border border-brand-border/60 text-navy/70 rounded-full w-max">
                        {c.type}
                      </span>
                      {c.category && (
                        <span className="text-xs text-navy/50 mt-1 pl-1">
                          {c.category}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      c.status === "published" 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : c.status === "draft" 
                        ? "bg-cream text-navy/50 border border-brand-border/60" 
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-semibold text-navy/50">
                    {c.revision}회
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-3 text-xs">
                      {/* 들어오는 링크 */}
                      <span className={`flex items-center space-x-1 ${c.isIsolated ? "text-amber-600 font-bold" : "text-navy/55"}`}>
                        <Link2 className="w-3.5 h-3.5" />
                        <span>{c.incomingCount}</span>
                      </span>
                      <span className="text-navy/20">/</span>
                      {/* 나가는 링크 */}
                      <span className="flex items-center space-x-1 text-navy/55">
                        <Link2Off className="w-3.5 h-3.5" />
                        <span>{c.outgoingCount}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-navy/70 flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5 text-navy/40" />
                      <span>{c.authorName}</span>
                    </div>
                    <div className="text-xs text-navy/40 mt-0.5">
                      {c.updatedAt.split("T")[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link 
                        href={`/admin/content/${c.id}`} 
                        className="p-2 bg-white hover:bg-cream/35 border border-brand-border text-navy/70 rounded-lg transition"
                        title="편집하기"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      
                      {/* 클라이언트 컴포넌트로 전사 교체한 삭제 단축 버튼 */}
                      <DeleteContentButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
