import {describe,it,expect} from 'vitest';
import {makeReport,verifyQuotes} from '../../src/shared/validation';
import type {LlmResponse} from '../../src/shared/types';

const page={text:('We may renew your subscription automatically unless you cancel before the deadline. You may cancel by contacting support. This agreement explains billing, cancellation, privacy, data use, refunds, service limitations, arbitration, liability, governing law, cookies, and other important legal terms for the customer in detail. Please read every section carefully before continuing to use the service. ').repeat(5),hiddenContentDetected:false,injectionDetected:false,isLegalDocument:true};
const response=(quote:string):LlmResponse=>({isLegalDocument:true,confidence:1,uncertainty:'',clauses:[{category:'auto_renewal',severity:5,explanation:'Açıklama',quote}]});

describe('quote verification',()=>{
  it('accepts an exact quote',()=>expect(verifyQuotes(response('subscription automatically'),page.text).clauses).toHaveLength(1));
  it('accepts normalized whitespace and quote differences',()=>expect(verifyQuotes(response('subscription   automatically'),page.text).clauses).toHaveLength(1));
  it('drops a fabricated quote and counts it',()=>{const result=verifyQuotes(response('the company may secretly change everything'),page.text);expect(result.clauses).toHaveLength(0);expect(result.rejected).toBe(1);});
});

describe('report validation',()=>{
  it('recomputes the score and ignores an LLM-provided score',()=>{const raw={...response('subscription automatically'),score:0};const report=makeReport(raw,page);expect(report.status).toBe('ready');expect(report.score).toBeGreaterThan(0);});
  it('returns uncertain for non-legal or short text',()=>expect(makeReport({isLegalDocument:false,confidence:1,uncertainty:'Belge değil',clauses:[]},{...page,text:'short'}).label).toBe('Belirsiz'));
});
