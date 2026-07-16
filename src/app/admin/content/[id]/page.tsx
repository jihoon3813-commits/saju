import React from "react";
import { db } from "@/lib/db";
import ContentForm from "@/components/admin/ContentForm";
import { notFound } from "next/navigation";

interface EditContentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContentPage({ params }: EditContentPageProps) {
  const { id } = await params;
  const content = await db.contents.findById(id);

  if (!content) {
    notFound();
  }

  // 전체 집필 에디터 목록 조회
  const authors = await db.authors.findAll();

  return (
    <div className="bg-cream min-h-screen">
      <ContentForm initialData={content} authors={authors} />
    </div>
  );
}
