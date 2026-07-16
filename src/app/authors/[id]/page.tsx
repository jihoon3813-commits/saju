import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Award } from "lucide-react";

interface AuthorDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AuthorDetailPageProps) {
  const { id } = await params;
  const author = await db.authors.findById(id);

  if (!author) {
    return { title: "필진 정보를 찾을 수 없음 - 꿈과 운의 사전" };
  }

  return {
    title: `${author.name} 전문가 프로필 - 꿈과 운의 사전`,
    description: author.bio || `${author.name} 에디터의 프로필 및 작성한 글 목록입니다.`,
    robots: { index: true, follow: true }
  };
}

export default async function AuthorDetailPage({ params }: AuthorDetailPageProps) {
  const { id } = await params;
  const author = await db.authors.findById(id);

  if (!author) {
    notFound();
  }

  // 이 필진이 작성한 공개 발행 글 목록 조회
  const allContents = await db.contents.findByQuery({ status: "published" });
  const authoredContents = allContents.filter((c) => c.authorId === author.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* 뒤로가기 */}
        <Link href="/articles" className="inline-flex items-center space-x-1.5 text-xs text-slate-450 hover:text-indigo-400 transition font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>백과사전 홈으로</span>
        </Link>

        {/* 작가 프로필 카드 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-2xl">
          {author.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/20 shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-950 border-2 border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-3xl shrink-0">
              {author.name.slice(0, 1)}
            </div>
          )}

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-extrabold text-white">{author.name}</h1>
                <span className="px-2.5 py-0.5 bg-indigo-950 border border-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full w-max mx-auto sm:mx-0">
                  {author.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-600 font-mono">
                E-E-A-T Verified Author
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {author.bio || "작가의 상세 학술 약력 정보가 아직 입력되지 않았습니다."}
            </p>
          </div>
        </div>

        {/* 집필 문서 현황 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>{author.name} 필진의 집필 콘텐츠</span>
            <span className="text-xs text-slate-500 font-normal">({authoredContents.length}편)</span>
          </h2>

          {authoredContents.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/30 border border-slate-900 rounded-2xl text-slate-500 text-sm">
              아직 발행 완료된 집필 글이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {authoredContents.map((c) => {
                const pathType = c.type === "dream" ? "dreams" : c.type === "glossary" ? "glossary" : "articles";
                return (
                  <Link
                    key={c.id}
                    href={`/${pathType}/${c.slug}`}
                    className="block bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-2xl p-5 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-full font-bold uppercase">
                        {c.type}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {c.updatedAt.toISOString().split("T")[0]}
                      </span>
                    </div>
                    <h3 className="font-bold text-white hover:text-indigo-400 transition text-sm sm:text-base">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {c.excerpt}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
