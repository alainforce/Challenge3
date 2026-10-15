export const CATEGORIES = ['auto_renewal','hard_to_cancel','data_sharing_third_parties','data_retention','arbitration_waiver','unilateral_changes','liability_limitation','content_license_ip','tracking_profiling','refund_restrictions','other'] as const;
export type RiskCategory = typeof CATEGORIES[number];
export type Severity = 1|2|3|4|5;
export interface LlmClause { category: RiskCategory; severity: Severity; explanation: string; quote: string; }
export interface LlmResponse { isLegalDocument: boolean; confidence: number; uncertainty: string; clauses: LlmClause[]; }
export interface VerifiedClause extends LlmClause { verified: true; }
export interface RiskReport { status: 'ready'|'uncertain'|'error'; score: number|null; label: 'Düşük'|'Orta'|'Yüksek'|'Belirsiz'; clauses: VerifiedClause[]; uncertainty: string; rejectedUnverified: number; hiddenContentDetected: boolean; injectionDetected: boolean; error?: string; }
export type HiddenReason = 'display'|'visibility'|'opacity'|'offscreen'|'tiny'|'same-color'|'aria-hidden';
export interface ExtractionDebug { rawTextLength: number; visibleTextLength: number; removedElementCount: number; removedReasons: Partial<Record<HiddenReason, number>>; firstRemovedElements: Array<{ tag: string; className: string; reasons: HiddenReason[] }>; legalGate: { passed: boolean; reason: string; keywordHits: string[] }; }
export interface ExtractedPage { text: string; hiddenContentDetected: boolean; injectionDetected: boolean; isLegalDocument: boolean; legalGateReason?: string; debug?: ExtractionDebug; url?: string; }
