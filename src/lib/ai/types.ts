import { z } from "zod";

// 1. 하이라이트 요약 스키마
export const HighlightSchema = z.object({
  title: z.string(),
  value: z.string(),
  evidenceCodes: z.array(z.string())
});

// 2. 개별 해석 섹션 스키마
export const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  paragraphs: z.array(z.string()),
  evidenceCodes: z.array(z.string()),
  positiveSignals: z.array(z.string()).optional().default([]),
  cautionSignals: z.array(z.string()).optional().default([]),
  actions: z.array(z.string()).optional().default([])
});

// 3. 시간선(시기 흐름) 스키마
export const TimelineEntrySchema = z.object({
  period: z.string(),
  intensity: z.number().min(1).max(5),
  opportunity: z.string(),
  caution: z.string(),
  action: z.string(),
  evidenceCodes: z.array(z.string())
});

// 4. 출생지/시간 불확실성 경고 스키마
export const UncertaintySchema = z.object({
  code: z.string(),
  message: z.string(),
  affectedSections: z.array(z.string())
});

// 5. 전체 AI 해석서 출력 스키마 (JSON 계약서)
export const StructuredInterpretationSchema = z.object({
  summary: z.string(),
  highlights: z.array(HighlightSchema),
  sections: z.array(SectionSchema),
  timeline: z.array(TimelineEntrySchema),
  uncertainty: z.array(UncertaintySchema),
  safetyFlags: z.array(z.string()).default([]),
  engineVersion: z.string(),
  ruleVersion: z.string(),
  promptVersion: z.string(),
  generatedAt: z.string()
});

export type Highlight = z.infer<typeof HighlightSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;
export type Uncertainty = z.infer<typeof UncertaintySchema>;
export type StructuredInterpretation = z.infer<typeof StructuredInterpretationSchema>;
