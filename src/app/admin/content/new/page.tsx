import React from "react";
import { db } from "@/lib/db";
import ContentForm from "@/components/admin/ContentForm";

export default async function NewContentPage() {
  // 전체 집필 에디터 목록 조회
  const authors = await db.authors.findAll();

  return (
    <div className="bg-cream min-h-screen">
      <ContentForm authors={authors} />
    </div>
  );
}
