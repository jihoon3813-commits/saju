"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { handleEmailLogin } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Lock, Mail, AlertOctagon } from "lucide-react";

export default function AdminLoginInlineForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com"); // 테스트용 어드민 자동완성 기입
  const [password, setPassword] = useState("admin123");   // 테스트용 어드민 자동완성 기입
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await handleEmailLogin(null, formData);
      if (result && !result.success) {
        setError(result.error || "이메일 혹은 비밀번호가 일치하지 않습니다.");
        setLoading(false);
        return;
      }
      
      // 로그인 성공 시 router refresh 및 페이지 리로드로 layout의 getCurrentUser()를 갱신
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "로그인 요청에 실패했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-brand-border rounded-3xl p-8 space-y-6 shadow-md text-left font-semibold text-navy">
      <div className="text-center space-y-2">
        <div className="inline-block p-4 rounded-full bg-gold/10 border border-gold/20 text-gold mb-2 shadow-sm">
          <Lock className="w-8 h-8 text-gold" />
        </div>
        <h1 className="text-2xl font-black">관리자 로그인</h1>
        <p className="text-navy/60 text-xs leading-relaxed">
          관리자 권한이 만료되었거나 비로그인 세션입니다.<br />
          어드민 계정 정보를 입력하시면 즉시 진입이 허용됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="text-[10px] font-bold text-navy/60 block mb-1">관리자 이메일</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-navy/40" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full pl-10 pr-4 py-3 border border-brand-border rounded-xl text-xs bg-white text-navy focus:outline-none focus:ring-1 focus:ring-gold/60"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-navy/60 block mb-1">비밀번호</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-navy/40" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border border-brand-border rounded-xl text-xs bg-white text-navy focus:outline-none focus:ring-1 focus:ring-gold/60"
            />
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center space-x-1.5 justify-center">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full font-bold bg-gold hover:bg-gold/95 text-white py-3 rounded-xl shadow-sm transition active:scale-95 text-xs cursor-pointer"
        >
          {loading ? "관리자 자격 증명 대조 중..." : "관리자 로그인"}
        </Button>
      </form>
    </div>
  );
}
