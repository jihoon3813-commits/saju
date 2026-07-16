import fs from "fs";
import path from "path";
import https from "https";
import PDFDocument from "pdfkit";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");
const FONT_PATH = path.join(FONT_DIR, "NanumGothic-Regular.ttf");
const FONT_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/nanumgothic/NanumGothic-Regular.ttf";

/**
 * PDF 생성에 필요한 한글 폰트의 로컬 존재를 확인하고 없을 경우 자동 다운로드합니다.
 */
export function ensureFontDownloaded(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(FONT_PATH)) {
      return resolve(FONT_PATH);
    }

    if (!fs.existsSync(FONT_DIR)) {
      fs.mkdirSync(FONT_DIR, { recursive: true });
    }

    console.info("Downloading NanumGothic-Regular.ttf for Korean PDF support...");
    const file = fs.createWriteStream(FONT_PATH);
    https.get(FONT_URL, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download font: status code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.info("NanumGothic-Regular.ttf successfully downloaded.");
        resolve(FONT_PATH);
      });
    }).on("error", (err) => {
      fs.unlink(FONT_PATH, () => {});
      reject(err);
    });
  });
}

interface GeneratePdfParams {
  orderId: string;
  productTitle: string;
  productType: string;
  amount: number;
  userName: string;
  chart?: any;
  reportData: {
    summary: string;
    highlights: Array<{ title: string; value: string; evidenceCodes: string[] }>;
    sections: Array<{
      id: string;
      title: string;
      summary: string;
      paragraphs: string[];
      evidenceCodes: string[];
      positiveSignals?: string[];
      cautionSignals?: string[];
      actions?: string[];
    }>;
    timeline: Array<{
      period: string;
      intensity: number;
      opportunity: string;
      caution: string;
      action: string;
      evidenceCodes: string[];
    }>;
    uncertainty?: Array<{ code: string; message: string; affectedSections: string[] }>;
  };
}

/**
 * PDFKit을 활용하여 A4 기준의 구조화된 프리미엄 보고서 PDF 바이너리 버퍼를 취득합니다.
 */
export async function generatePremiumReportPDF(params: GeneratePdfParams): Promise<Buffer> {
  // 1. 폰트 다운로드 확인
  const fontPath = await ensureFontDownloaded();

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // 폰트 등록
      doc.registerFont("NanumGothic", fontPath);
      doc.font("NanumGothic");

      // ==========================================
      // PAGE 1: 표지 (Cover Page)
      // ==========================================
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
         .lineWidth(2)
         .strokeColor("#4338ca")
         .stroke();

      doc.moveDown(6);
      doc.fontSize(28)
         .fillColor("#1e1b4b")
         .text("프리미엄 명리 운세 리포트", { align: "center", characterSpacing: 2 });

      doc.moveDown(1.5);
      doc.fontSize(16)
         .fillColor("#4338ca")
         .text(`[ ${params.productTitle} ]`, { align: "center" });

      doc.moveDown(8);
      doc.fontSize(12)
         .fillColor("#334155")
         .text(`분석 대상자: ${params.userName} 님`, { align: "center" })
         .moveDown(0.8)
         .text(`발행 고유 번호: ${params.orderId}`, { align: "center" })
         .moveDown(0.8)
         .text(`작성 시점: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, { align: "center" });

      doc.moveDown(8);
      doc.fontSize(10)
         .fillColor("#64748b")
         .text("ANTIGRAVITY MANSE CLINIC", { align: "center" });

      // ==========================================
      // PAGE 2: 사주 원국 명식표 & 요약
      // ==========================================
      doc.addPage();
      doc.fontSize(18)
         .fillColor("#1e1b4b")
         .text("1. 사주 원국 명식 및 균시차 보정", { underline: true })
         .moveDown(1.5);

      if (params.chart && params.chart.pillars) {
        const { year, month, day, hour } = params.chart.pillars;
        doc.fontSize(12).fillColor("#0f172a").text("■ 천문 계산 보정치 대조표", { oblique: true }).moveDown(0.5);
        
        // 표 헤더
        doc.fontSize(10).fillColor("#ffffff");
        doc.rect(50, 110, 500, 20).fill("#4338ca");
        doc.text("주기", 65, 115)
           .text("천간(天干)", 185, 115)
           .text("지지(地支)", 315, 115)
           .text("특이 비고", 445, 115);

        // 표 바디
        const rows = [
          { name: "년주", stem: year.stem, branch: year.branch, desc: "조상·태생 근원" },
          { name: "월주", stem: month.stem, branch: month.branch, desc: "부모·사회 격국" },
          { name: "일주", stem: day.stem, branch: day.branch, desc: "본인·배우자 일간" },
          { name: "시주", stem: hour?.stem || "미상", branch: hour?.branch || "미상", desc: "자식·말년 기류" }
        ];

        let y = 130;
        doc.fillColor("#334155");
        rows.forEach((row, i) => {
          doc.rect(50, y, 500, 22).strokeColor("#cbd5e1").stroke();
          doc.text(row.name, 65, y + 6)
             .text(row.stem, 185, y + 6)
             .text(row.branch, 315, y + 6)
             .text(row.desc, 445, y + 6);
          y += 22;
        });

        doc.moveDown(6);
      }

      doc.fontSize(12).fillColor("#0f172a").text("■ 리포트 종합 요약", { underline: false }).moveDown(0.5);
      doc.fontSize(11)
         .fillColor("#334155")
         .text(`"${params.reportData.summary}"`, { lineGap: 4, indent: 15 });

      // Highlights
      if (params.reportData.highlights && params.reportData.highlights.length > 0) {
        doc.moveDown(2);
        doc.fontSize(12).fillColor("#0f172a").text("■ 핵심 해석 하이라이트 요약", { underline: false }).moveDown(0.5);
        
        params.reportData.highlights.forEach((hl) => {
          doc.fontSize(10)
             .fillColor("#4338ca")
             .text(`• [${hl.title}] `, { continued: true })
             .fillColor("#334155")
             .text(`${hl.value}`);
          doc.moveDown(0.3);
        });
      }

      // ==========================================
      // PAGES 3+: 상세 분야 해석
      // ==========================================
      params.reportData.sections.forEach((sect, idx) => {
        doc.addPage();
        
        doc.fontSize(16)
           .fillColor("#1e1b4b")
           .text(`${idx + 2}. ${sect.title}`, { underline: true })
           .moveDown(0.5);

        doc.fontSize(11)
           .fillColor("#4338ca")
           .text(`요약: "${sect.summary}"`, { oblique: true })
           .moveDown(1.5);

        // 본문 문단 인쇄
        doc.fontSize(10)
           .fillColor("#334155");
        
        sect.paragraphs.forEach((para) => {
          doc.text(para, { align: "justify", lineGap: 4, paragraphGap: 10 });
        });

        // 긍정/주의 신호
        if ((sect.positiveSignals && sect.positiveSignals.length > 0) || (sect.cautionSignals && sect.cautionSignals.length > 0)) {
          doc.moveDown(1.5);
          
          if (sect.positiveSignals && sect.positiveSignals.length > 0) {
            doc.fontSize(10).fillColor("#059669").text("▶ 긍정적 에너지 흐름");
            sect.positiveSignals.forEach((pSig) => {
              doc.fontSize(9.5).fillColor("#334155").text(`  - ${pSig}`, { lineGap: 3 });
            });
            doc.moveDown(0.5);
          }

          if (sect.cautionSignals && sect.cautionSignals.length > 0) {
            doc.fontSize(10).fillColor("#dc2626").text("▶ 주의 및 조율 리스크 지표");
            sect.cautionSignals.forEach((cSig) => {
              doc.fontSize(9.5).fillColor("#334155").text(`  - ${cSig}`, { lineGap: 3 });
            });
          }
        }

        // 행동 과제
        if (sect.actions && sect.actions.length > 0) {
          doc.moveDown(1.5);
          doc.fontSize(10).fillColor("#4f46e5").text("▶ 개운 실천 가이드라인 (체크리스트)");
          sect.actions.forEach((act) => {
            doc.fontSize(9).fillColor("#334155").text(`  [ ] ${act}`, { lineGap: 3 });
          });
        }
      });

      // ==========================================
      // LAST PAGE: 대운 시간선 연표
      // ==========================================
      if (params.reportData.timeline && params.reportData.timeline.length > 0) {
        doc.addPage();
        
        doc.fontSize(16)
           .fillColor("#1e1b4b")
           .text("부록. 대운 시간선 총평 연표", { underline: true })
           .moveDown(1.5);

        params.reportData.timeline.forEach((time) => {
          doc.fontSize(11).fillColor("#4338ca").text(`■ ${time.period} (강도: ${time.intensity}/5)`);
          doc.fontSize(10)
             .fillColor("#334155")
             .text(`  • 기회: ${time.opportunity}`, { lineGap: 3 })
             .text(`  • 경계: ${time.caution}`, { lineGap: 3 })
             .text(`  • 지침: ${time.action}`, { lineGap: 3 })
             .moveDown(1);
        });
      }

      // ==========================================
      // 2-PASS: 바닥글 및 페이지수 표기
      // ==========================================
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        
        // 1페이지만 표지이므로 바닥글 헤더 생략
        if (i > range.start) {
          // 헤더선
          doc.fontSize(8)
             .fillColor("#94a3b8")
             .text("Antigravity Premium Saju Report", 50, 25)
             .moveTo(50, 35)
             .lineTo(doc.page.width - 50, 35)
             .strokeColor("#e2e8f0")
             .lineWidth(0.5)
             .stroke();

          // 바닥글
          doc.fontSize(8)
             .fillColor("#94a3b8")
             .text(`페이지 ${i + 1} / ${range.count}`, 50, doc.page.height - 35, { align: "center" });
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
