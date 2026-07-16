import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  params: {
    productId: string;
  };
  searchParams: {
    profileId?: string;
    profileId2?: string;
    question?: string;
    year?: string;
  };
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { productId } = params;
  const { profileId, profileId2, question, year } = searchParams;

  // 1. 상품 및 활성 유무 조회
  const product = await db.products.findById(productId);
  if (!product || !product.active) {
    notFound();
  }

  if (!profileId) {
    redirect(`/products/${product.slug}`);
  }

  // 2. 권한 검증 및 프로필 데이터 로드
  const user = await getCurrentUser();
  const anonSessionId = await getOrCreateAnonymousSession();

  const profile1 = await db.profiles.findById(profileId);
  if (!profile1 || profile1.deletedAt) {
    redirect("/products");
  }

  // 소유권 검증 (해당 프로필이 현재 유저 또는 익명 세션의 소유가 맞는지)
  if (profile1.userId) {
    if (!user || profile1.userId !== user.id) {
      redirect("/products");
    }
  } else if (profile1.anonymousSessionId) {
    if (profile1.anonymousSessionId !== anonSessionId) {
      redirect("/products");
    }
  }

  let profile2 = null;
  if (product.productType === "compatibility" && profileId2) {
    const p2 = await db.profiles.findById(profileId2);
    if (p2 && !p2.deletedAt) {
      // 상대방 소유권 검증 (궁합 상대방도 동일 유저/세션 바운더리 내에 있어야 함)
      if (p2.userId) {
        if (user && p2.userId === user.id) profile2 = p2;
      } else if (p2.anonymousSessionId) {
        if (p2.anonymousSessionId === anonSessionId) profile2 = p2;
      }
    }
  }

  const serializedProduct = {
    id: product.id,
    title: product.title,
    price: product.price,
    productType: product.productType
  };

  const serializedProfile1 = {
    id: profile1.id || "",
    alias: profile1.alias,
    birthDate: profile1.birthDate,
    birthTime: profile1.birthTime || null
  };

  const serializedProfile2 = profile2 ? {
    id: profile2.id || "",
    alias: profile2.alias,
    birthDate: profile2.birthDate,
    birthTime: profile2.birthTime || null
  } : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            결제 주문서 작성
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            신속하고 신뢰성 높은 명리학 분석 리포트 생성을 위해 최종 주문 내역을 확인해 주세요.
          </p>
        </div>

        <CheckoutForm
          product={serializedProduct}
          profile1={serializedProfile1}
          profile2={serializedProfile2}
          question={question}
          year={year ? Number(year) : undefined}
        />
      </div>
    </main>
  );
}
