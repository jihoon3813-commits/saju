"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Content, Author } from "@/lib/db/types";
import { saveContentAction, generateAiContentDraftAction } from "@/app/actions/cms";
import { Sparkles, ArrowLeft, Eye, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ContentFormProps {
  initialData?: Content | null;
  authors: Author[];
}

export default function ContentForm({ initialData, authors }: ContentFormProps) {
  const router = useRouter();

  // 1. 폼 필드 상태 정의
  const [type, setType] = useState<Content["type"]>(initialData?.type || "article");
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [status, setStatus] = useState<Content["status"]>(initialData?.status || "draft");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [cluster, setCluster] = useState(initialData?.cluster || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");
  const [searchIntent, setSearchIntent] = useState(initialData?.searchIntent || "");
  const [primaryKeyword, setPrimaryKeyword] = useState(initialData?.primaryKeyword || "");
  const [authorId, setAuthorId] = useState(initialData?.authorId || (authors[0]?.id || ""));
  const [reviewerId, setReviewerId] = useState(initialData?.reviewerId || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [ogImage, setOgImage] = useState(initialData?.ogImage || "");
  const [schemaType, setSchemaType] = useState(initialData?.schemaType || "Article");
  const [noindex, setNoindex] = useState(initialData?.noindex || false);

  // 꿈해몽(dream) 전용 추가 필드
  const [primarySymbol, setPrimarySymbol] = useState(initialData?.primarySymbol || "");
  const [action, setAction] = useState(initialData?.action || "");
  const [emotion, setEmotion] = useState(initialData?.emotion || "");
  const [setting, setSetting] = useState(initialData?.setting || "");
  const [positiveInterpretation, setPositiveInterpretation] = useState(initialData?.positiveInterpretation || "");
  const [cautionInterpretation, setCautionInterpretation] = useState(initialData?.cautionInterpretation || "");

  // 2. UI 및 로딩 상태
  const [aiSymbolInput, setAiSymbolInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [aiBadge, setAiBadge] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // 3. AI 초안 요청 처리
  const handleGenerateAiDraft = async () => {
    if (!title) {
      alert("AI 초안을 생성하려면 먼저 글 제목을 작성해 주십시오.");
      return;
    }
    setAiLoading(true);
    setErrorMessage("");
    try {
      const res = await generateAiContentDraftAction(type, title, aiSymbolInput || undefined);
      if (res.success && res.draft) {
        const d = res.draft;
        setExcerpt(d.excerpt || "");
        setBody(d.body || "");
        setTagsInput(d.tags?.join(", ") || "");
        setSearchIntent(d.searchIntent || "");
        setPrimaryKeyword(d.primaryKeyword || "");
        setMetaTitle(d.metaTitle || "");
        setMetaDescription(d.metaDescription || "");
        
        if (type === "dream") {
          setPrimarySymbol(d.primarySymbol || aiSymbolInput || "");
          setAction(d.action || "");
          setEmotion(d.emotion || "");
          setSetting(d.setting || "");
          setPositiveInterpretation(d.positiveInterpretation || "");
          setCautionInterpretation(d.cautionInterpretation || "");
        }
        
        setAiBadge(true);
        setSuccessMessage("AI 전문가 초안 정보가 폼에 주입되었습니다! 내용을 검수하고 발행해 주세요.");
      } else {
        setErrorMessage(res.error || "AI 초안 생성 도중 예상치 못한 오류가 발생했습니다.");
      }
    } catch (err) {
      setErrorMessage("네트워크 이상으로 AI 요청 처리에 실패했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  // 4. 슬러그 자동 생성기 (제목 기반)
  const handleAutoSlug = () => {
    if (!title) return;
    const formatted = title
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(formatted);
  };

  // 5. 저장 요청
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      type,
      title,
      slug,
      status,
      excerpt,
      body,
      cluster: cluster || null,
      category: category || null,
      tags,
      searchIntent: searchIntent || null,
      primaryKeyword: primaryKeyword || null,
      authorId,
      reviewerId: reviewerId || null,
      canonicalUrl: canonicalUrl || `/${type}/${slug}`,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      ogImage: ogImage || null,
      schemaType: schemaType || (type === "dream" ? "TechArticle" : "Article"),
      noindex,
      ...(type === "dream" && {
        primarySymbol: primarySymbol || null,
        action: action || null,
        emotion: emotion || null,
        setting: setting || null,
        positiveInterpretation: positiveInterpretation || null,
        cautionInterpretation: cautionInterpretation || null,
        contextVariables: { aiGenerated: aiBadge }
      })
    };

    try {
      const res = await saveContentAction(initialData?.id || null, payload);
      if (res.success) {
        setSuccessMessage("콘텐츠가 성공적으로 데이터베이스에 영구 반영되었습니다!");
        router.push("/admin/content");
        router.refresh();
      } else {
        setErrorMessage(res.error || "저장 처리에 실패했습니다.");
      }
    } catch (err) {
      setErrorMessage("서버 통신 에러가 발생했습니다.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-semibold text-navy">
      {/* 폼 상단 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/content"
            className="p-2.5 bg-white hover:bg-cream/45 border border-brand-border text-navy/60 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black">
              {initialData ? "기존 콘텐츠 수정 및 검수" : "새로운 백과/꿈해몽 콘텐츠 작성"}
            </h1>
            <p className="text-xs text-navy/60 mt-0.5">
              구조화 스키마 매핑 및 지식 기여 집필 프로세스
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-white hover:bg-cream/45 border border-brand-border text-navy/70 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Eye className="w-4 h-4 text-navy/60" />
            <span>{previewMode ? "편집 폼 보기" : "미리보기 모드"}</span>
          </button>
        </div>
      </div>

      {/* 성공/실패 배너 */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-250 rounded-2xl p-4 flex items-start space-x-3 text-rose-600 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-250 rounded-2xl p-4 flex items-start space-x-3 text-emerald-600 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* AI 배지 경고 */}
      {aiBadge && (
        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4 text-xs text-navy/70 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-gold shrink-0" />
          <span><strong>AI 초안 연동 상태:</strong> 본 템플릿의 본문과 핵심 키워드는 AI가 임시 설계한 초안입니다. 발행 전 반드시 팩트 검수 및 수정을 거쳐 주십시오.</span>
        </div>
      )}

      {previewMode ? (
        /* 미리보기 컴포넌트 */
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-xs font-bold rounded-full uppercase">
              {type}
            </span>
            <h2 className="text-3xl font-extrabold text-navy">{title || "(제목 없음)"}</h2>
            <div className="text-xs text-navy/50 flex items-center space-x-4">
              <span>슬러그: /{type}/{slug || "slug-here"}</span>
              <span>•</span>
              <span>상태: {status}</span>
            </div>
          </div>
          
          <div className="p-4 bg-cream/20 border border-brand-border rounded-2xl text-navy/70 italic text-sm">
            요약: {excerpt || "요약문이 비어있습니다."}
          </div>

          <article 
            className="prose prose-slate max-w-none text-navy/80 border-t border-brand-border pt-6 font-semibold leading-relaxed"
            dangerouslySetInnerHTML={{ __html: body || "<p class='text-navy/40'>본문이 아직 채워지지 않았습니다.</p>" }}
          />
        </div>
      ) : (
        /* 실제 편집 폼 */
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 왼쪽 컬럼: 주요 본문 영역 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-6 shadow-sm">
              <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
                <span className="w-2 h-2 bg-gold rounded-full" />
                <span>기본 작성 영역</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-navy/60">콘텐츠 타입</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Content["type"])}
                    className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none cursor-pointer"
                  >
                    <option value="article">기사·칼럼 (article)</option>
                    <option value="dream">꿈해몽 (dream)</option>
                    <option value="glossary">용어 정의 (glossary)</option>
                    <option value="guide">가이드·방법론 (guide)</option>
                    <option value="policy">정책·신뢰성 (policy)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-navy/60">발행 상태</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Content["status"])}
                    className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none cursor-pointer"
                  >
                    <option value="draft">임시 저장 (draft)</option>
                    <option value="review">검수 요청 (review)</option>
                    <option value="scheduled">예약 발행 (scheduled)</option>
                    <option value="published">공개 발행 (published)</option>
                    <option value="archived">아카이브 (archived)</option>
                  </select>
                </div>
              </div>

              {/* AI 초안 작성 위젯 */}
              <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-gold">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>AI 초안 도우미 (Gemini-2.5)</span>
                </div>
                <p className="text-xs text-navy/60 leading-normal">
                  제목을 먼저 작성한 뒤, 꿈 상징어나 오행 개념을 넣고 생성을 클릭하면 상세한 본문 초안을 완성해 폼을 채워줍니다.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiSymbolInput}
                    onChange={(e) => setAiSymbolInput(e.target.value)}
                    placeholder="예: 뱀, 돼지, 오행 (선택사항)"
                    className="flex-1 bg-white border border-brand-border rounded-xl px-3 py-2 text-xs text-navy outline-none"
                  />
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleGenerateAiDraft}
                    className="px-4 py-2 bg-gold hover:bg-gold/95 disabled:bg-navy/20 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>초안 자동 완성</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">글 제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 뱀 꿈해몽 상황별 완벽 분석"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-navy/60">검색 노출 슬러그 (Slug)</label>
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    className="text-xs text-gold hover:text-gold/90 font-bold transition cursor-pointer"
                  >
                    제목 기준으로 자동 변환
                  </button>
                </div>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="소문자, 숫자, 하이픈만 사용 (예: snake-dream-interpretation)"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">글 요약 (Excerpt / MetaDescription 용도)</label>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="검색 유도용으로 노출될 1~2개 문장 요약글을 적어주세요."
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">글 본문 (HTML 지원)</label>
                <textarea
                  rows={14}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="본문 내용을 HTML 형식(h3, p, strong, ul, li 등)으로 작성해 주세요."
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none font-mono"
                  required
                />
              </div>
            </div>

            {/* 꿈해몽 전용 파트 */}
            {type === "dream" && (
              <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-4 shadow-sm">
                <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full" />
                  <span>꿈 상징 구조적 변수 입력 (Dream Entries)</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-navy/60">주요 상징 (Symbol)</label>
                    <input
                      type="text"
                      value={primarySymbol}
                      onChange={(e) => setPrimarySymbol(e.target.value)}
                      placeholder="예: 뱀"
                      className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-navy/60">수행 동작 (Action)</label>
                    <input
                      type="text"
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      placeholder="예: 물리다"
                      className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-navy/60">동반 감정 (Emotion)</label>
                    <input
                      type="text"
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      placeholder="예: 두려움"
                      className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-navy/60">배경 장소 (Setting)</label>
                    <input
                      type="text"
                      value={setting}
                      onChange={(e) => setSetting(e.target.value)}
                      placeholder="예: 안방"
                      className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-navy/60">긍정적 측면 해석</label>
                  <textarea
                    rows={2}
                    value={positiveInterpretation}
                    onChange={(e) => setPositiveInterpretation(e.target.value)}
                    placeholder="길운의 측면을 명쾌하게 정의하세요."
                    className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-navy/60">주의 경고 측면 해석</label>
                  <textarea
                    rows={2}
                    value={cautionInterpretation}
                    onChange={(e) => setCautionInterpretation(e.target.value)}
                    placeholder="조심하고 대비해야 할 위험을 경고하세요."
                    className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 컬럼: SEO 및 메타 데이터 설정 */}
          <div className="space-y-6">
            <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-6 shadow-sm">
              <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
                <span className="w-2 h-2 bg-gold rounded-full" />
                <span>분류 및 SEO 메타 필드</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">콘텐츠 대그룹 (Cluster)</label>
                <input
                  type="text"
                  value={cluster}
                  onChange={(e) => setCluster(e.target.value)}
                  placeholder="예: 동물 꿈 사전, 명리 입문"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">중그룹 카테고리 (Category)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="예: 동물, 사주 기초"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">태그 목록 (콤마 분리)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="예: 뱀꿈, 태몽, 재물운"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                />
              </div>

              <hr className="border-brand-border/60" />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">대표 타겟 키워드</label>
                <input
                  type="text"
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  placeholder="예: 뱀 꿈해몽"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">검색 의도 요약 (Search Intent)</label>
                <input
                  type="text"
                  value={searchIntent}
                  onChange={(e) => setSearchIntent(e.target.value)}
                  placeholder="예: 뱀에게 물려 피나는 길몽 상황 파악"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                />
              </div>

              <hr className="border-brand-border/60" />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">대표 집필자 (Author)</label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none cursor-pointer"
                  required
                >
                  <option value="">집필진 선택</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">검수 감수자 (Reviewer)</label>
                <select
                  value={reviewerId}
                  onChange={(e) => setReviewerId(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none cursor-pointer"
                >
                  <option value="">감수 담당 없음</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <hr className="border-brand-border/60" />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">SEO 대표 주소 (Canonical URL)</label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="자동 생성되지 않을 때 지정 (예: /dreams/snake-dream)"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">SEO 검색창 메타 제목</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="비워두면 글 제목 사용"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">SEO 검색창 메타 설명문</label>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="비워두면 요약문 사용"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy/60">구조화 스키마 타입 (Schema.org)</label>
                <select
                  value={schemaType}
                  onChange={(e) => setSchemaType(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-navy focus:border-gold transition outline-none cursor-pointer"
                >
                  <option value="Article">일반 아티클 (Article)</option>
                  <option value="TechArticle">전문 기술 해설 (TechArticle)</option>
                  <option value="DefinedTerm">사전 용어 정의 (DefinedTerm)</option>
                  <option value="WebPage">단순 웹페이지 (WebPage)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="noindex-check"
                  checked={noindex}
                  onChange={(e) => setNoindex(e.target.checked)}
                  className="w-4 h-4 accent-gold rounded bg-white border-brand-border"
                />
                <label htmlFor="noindex-check" className="text-xs font-semibold text-navy/70 cursor-pointer">
                  검색 엔진 차단 설정 (noindex)
                </label>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="w-full py-4 bg-gold hover:bg-gold/95 disabled:bg-navy/20 text-white rounded-2xl font-bold transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer active:scale-95"
              >
                {saveLoading && <RefreshCw className="w-5 h-5 animate-spin" />}
                <span>{initialData ? "콘텐츠 변경사항 업데이트" : "새 콘텐츠 발행 및 저장"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
