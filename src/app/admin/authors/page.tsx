import React from "react";
import { db } from "@/lib/db";
import { createAuthorAction } from "@/app/actions/cms";
import { Users, UserPlus, Info } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminAuthorsPage() {
  const authors = await db.authors.findAll();

  // 등록 서버 액션 핸들러 바인딩
  async function handleRegisterAuthor(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const bio = formData.get("bio") as string;
    const avatarUrl = formData.get("avatarUrl") as string;

    if (!name || !role) return;

    await createAuthorAction({
      name,
      role,
      bio: bio || null,
      avatarUrl: avatarUrl || null
    });

    revalidatePath("/admin/authors");
    redirect("/admin/authors");
  }

  return (
    <div className="space-y-8 font-semibold text-navy">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-black">필진·작가 정보 관리</h1>
        <p className="text-sm text-navy/60 mt-1">
          콘텐츠 신뢰성(E-E-A-T) 확립을 위해 참여 전문가 필진의 약력과 아바타를 관리합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 신규 작가 등록 폼 */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 h-max shadow-sm">
          <h2 className="text-lg font-bold text-navy flex items-center space-x-2 border-b border-brand-border pb-4 mb-6">
            <UserPlus className="w-5 h-5 text-gold" />
            <span>신규 작가 프로필 등록</span>
          </h2>

          <form action={handleRegisterAuthor} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-navy/65 font-semibold">필진 성명</label>
              <input
                type="text"
                name="name"
                placeholder="예: 김명리"
                required
                className="w-full bg-white border border-brand-border rounded-xl px-4 py-2.5 text-sm text-navy focus:border-gold transition outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-navy/65 font-semibold">전문 역할 / 직함</label>
              <input
                type="text"
                name="role"
                placeholder="예: 사주명리학 학자"
                required
                className="w-full bg-white border border-brand-border rounded-xl px-4 py-2.5 text-sm text-navy focus:border-gold transition outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-navy/65 font-semibold">아바타 이미지 URL (선택)</label>
              <input
                type="url"
                name="avatarUrl"
                placeholder="https://..."
                className="w-full bg-white border border-brand-border rounded-xl px-4 py-2.5 text-sm text-navy focus:border-gold transition outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-navy/65 font-semibold">소개 약력 (Bio)</label>
              <textarea
                name="bio"
                rows={4}
                placeholder="전문 경력 및 이력을 서술해 주세요."
                className="w-full bg-white border border-brand-border rounded-xl px-4 py-2.5 text-sm text-navy focus:border-gold transition outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold hover:bg-gold/95 text-white rounded-xl font-bold transition text-sm cursor-pointer shadow-sm active:scale-95"
            >
              새 집필진 등록하기
            </button>
          </form>
        </div>

        {/* 작가진 목록 표시 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-navy flex items-center space-x-2 border-b border-brand-border pb-4 mb-6">
              <Users className="w-5 h-5 text-gold" />
              <span>현재 등록된 필진 목록</span>
            </h2>

            {authors.length === 0 ? (
              <div className="text-center py-8 text-navy/40 text-sm">
                등록된 필진 프로필이 없습니다. 왼쪽 폼에서 신규 필진을 등록해 주십시오.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {authors.map((a) => (
                  <div key={a.id} className="bg-cream/15 border border-brand-border/60 rounded-2xl p-4 flex items-start space-x-4 shadow-xxs">
                    {a.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={a.avatarUrl} 
                        alt={a.name} 
                        className="w-12 h-12 rounded-full object-cover border border-brand-border" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 text-gold flex items-center justify-center font-bold text-lg shrink-0">
                        {a.name.slice(0, 1)}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-navy text-sm">{a.name}</span>
                        <span className="text-[10px] px-2.5 py-0.5 bg-gold/10 border border-gold/20 text-gold rounded-full font-semibold">
                          {a.role}
                        </span>
                      </div>
                      <p className="text-xs text-navy/60 line-clamp-2 leading-relaxed">
                        {a.bio || "상세 약력 정보가 기입되지 않았습니다."}
                      </p>
                      <div className="text-[10px] text-navy/40 font-mono select-all">
                        ID: {a.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* E-E-A-T 가이드 배너 */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex items-start space-x-3 text-emerald-800 text-xs shadow-xxs">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-700 block">구글 E-E-A-T 검색 가이드라인 알림</span>
              <p className="leading-relaxed text-navy/70">
                구글의 최신 검색 순위 지침은 YMYL(Your Money or Your Life) 범주인 건강·운세·재무 등의 주제에 대해 공신력 있는 전문가 작가명과 검수자명을 노출하는 것을 필수로 규정합니다. 글 등록 시 각 기사의 도메인 성격에 맞는 전문가(예: 이해몽, 김명리)를 매핑해 주십시오.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
