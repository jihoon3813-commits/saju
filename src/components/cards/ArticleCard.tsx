import React from "react";
import Link from "next/link";
import { ArticleItem } from "@/data/mockData";
import { Badge } from "../ui/Badge";
import { Calendar, Clock } from "lucide-react";

interface ArticleCardProps {
  article: ArticleItem;
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  // 카테고리별 매칭 색상 그라데이션 (플레이스홀더 이미지를 고급스럽게 대체)
  const getGradient = (category: string) => {
    switch (category) {
      case "사주기초":
        return "from-[#17233C] to-[#2B3E5C]";
      case "꿈해몽":
        return "from-[#6F887D] to-[#4D6358]";
      case "오행론":
        return "from-[#B9904B] to-[#997230]";
      case "타로해석":
        return "from-[#4B3B6F] to-[#342750]";
      default:
        return "from-navy to-sage";
    }
  };

  if (featured) {
    return (
      <Link
        href={`/articles`}
        className="group grid grid-cols-1 lg:grid-cols-12 bg-surface border border-brand-border rounded-2xl overflow-hidden shadow-xs hover-lift hover:shadow-md hover:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/40"
      >
        {/* 대표글 왼쪽 비주얼 영역 (5열) */}
        <div className={`lg:col-span-5 bg-gradient-to-br ${getGradient(article.category)} p-8 flex flex-col justify-between text-cream min-h-[220px] lg:min-h-full`}>
          <Badge variant="accent" className="self-start">
            대표 추천 칼럼
          </Badge>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-cream/65 block font-semibold">
              {article.category}
            </span>
            <span className="font-serif text-3xl font-bold tracking-tight block leading-tight text-[#F7F3EA]">
              運
            </span>
          </div>
        </div>

        {/* 대표글 오른쪽 정보 영역 (7열) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <h3 className="text-xl sm:text-2xl font-bold text-navy group-hover:text-gold transition-colors leading-tight">
              {article.title}
            </h3>
            <p className="text-sm text-navy/70 leading-relaxed line-clamp-3">
              {article.summary}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs text-navy/50 font-semibold pt-2">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.publishedAt}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime} 읽기</span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/articles`}
      className="group flex flex-col bg-surface border border-brand-border rounded-2xl overflow-hidden shadow-xs hover-lift hover:shadow-md hover:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/40 h-full"
    >
      {/* 카드 상단 그라데이션 영역 */}
      <div className={`h-40 bg-gradient-to-br ${getGradient(article.category)} p-5 flex flex-col justify-between text-cream`}>
        <Badge variant="accent" className="self-start">
          {article.category}
        </Badge>
        <span className="text-xxs uppercase tracking-widest text-cream/70 font-semibold self-end">
          MAGAZINE
        </span>
      </div>

      {/* 카드 하단 정보 영역 */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-navy group-hover:text-gold transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
          <p className="text-xs text-navy/65 leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-navy/55 pt-1 border-t border-brand-border/40 font-semibold">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{article.publishedAt}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{article.readTime}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
