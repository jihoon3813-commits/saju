"use client";

import React, { useTransition } from "react";
import { deleteContentAction } from "@/app/actions/cms";
import { Trash2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteContentButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!confirm("정말 이 콘텐츠를 삭제하시겠습니까? (Soft Delete)")) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteContentAction(id);
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || "삭제 중 오류가 발생했습니다.");
        }
      } catch (err) {
        alert("서버 통신 실패");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 bg-white hover:bg-rose-50 hover:text-rose-600 border border-brand-border hover:border-rose-100 text-navy/70 rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0"
      title="삭제하기"
    >
      {isPending ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
