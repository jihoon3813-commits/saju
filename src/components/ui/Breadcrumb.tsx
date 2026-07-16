import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { getBreadcrumbSchema } from "@/utils/seo";

interface BreadcrumbProps {
  items: {
    name: string;
    path: string;
  }[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  // Breadcrumb Schema.org 데이터 생성
  const allItems = [{ name: "홈", path: "/" }, ...items];
  const schemaItems = allItems.map((item) => ({
    name: item.name,
    item: item.path,
  }));
  const schema = getBreadcrumbSchema(schemaItems);

  return (
    <nav aria-label="Breadcrumb" className="py-2.5 text-sm">
      <ol className="flex items-center space-x-2 text-navy/60">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-gold transition-colors focus:ring-1 focus:ring-gold rounded px-1"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>
        
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.path} className="flex items-center space-x-2">
              <ChevronRight className="w-3.5 h-3.5 text-navy/30" />
              {isLast ? (
                <span className="font-semibold text-navy/90" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="hover:text-gold transition-colors focus:ring-1 focus:ring-gold rounded px-1"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      {/* Search Console 크롤러가 읽을 구조화 데이터 주입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </nav>
  );
};
