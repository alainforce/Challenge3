import type { RiskCategory, VerifiedClause } from './types';
const weights: Record<RiskCategory, number> = { auto_renewal:1.3, hard_to_cancel:1.4, data_sharing_third_parties:1.2, data_retention:1, arbitration_waiver:1.4, unilateral_changes:1.1, liability_limitation:1.1, content_license_ip:1, tracking_profiling:1.2, refund_restrictions:1.1, other:.8 };
export function calculateScore(clauses: VerifiedClause[]): number { return Math.min(100, Math.round(clauses.reduce((sum,c)=>sum+c.severity*weights[c.category]*4,0))); }
export function scoreLabel(score:number): 'Düşük'|'Orta'|'Yüksek' { return score < 34 ? 'Düşük' : score < 67 ? 'Orta' : 'Yüksek'; }
