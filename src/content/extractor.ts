import type { ExtractedPage, ExtractionDebug, HiddenReason } from '../shared/types';

const legalKeywords: Array<[string, RegExp]> = [
  ['terms', /\bterms?\b/i], ['agreement', /\bagreement\b/i], ['privacy', /\bprivacy\b/i],
  ['subscription', /\bsubscription\b/i], ['cancel', /\bcancel(?:lation)?\b/i], ['renew', /\brenew(?:al)?\b/i],
  ['liability', /\bliability\b/i], ['arbitration', /\barbitration\b/i], ['governing law', /\bgoverning\s+law\b/i],
  ['personal data', /\bpersonal\s+data\b/i], ['cookies', /\bcookies?\b/i],
  ['kullanım koşulları', /kullanım\s+koşulları/i], ['gizlilik', /gizlilik/i], ['abonelik', /abonelik/i],
  ['iptal', /iptal/i], ['sorumluluk', /sorumluluk/i], ['kişisel veri', /kişisel\s+veri/i]
];
const injectionPatterns = [/ignore\s+(all\s+)?previous instructions/i,/önceki talimatları?\s+görmezden gel/i,/give (this|me) a low risk score/i,/düşük risk puanı ver/i,/system prompt/i,/sistem talimatı/i];
const uiPattern = /nav|header|footer|cookie|consent|banner|modal|drawer|menu|toast|accordion|collapse/i;
const blockedTags = new Set(['HTML', 'BODY', 'MAIN', 'ARTICLE']);

function clean(value: string): string { return value.replace(/\s+/g, ' ').trim(); }
function styleIsAnimating(style: CSSStyleDeclaration): boolean {
  const duration = `${style.transitionDuration} ${style.animationDuration}`;
  return Boolean((style.transitionProperty && style.transitionProperty !== 'none' && /[1-9]/.test(duration)) ||
    (style.animationName && style.animationName !== 'none' && /[1-9]/.test(duration)));
}
function isUiChrome(el: Element): boolean {
  let current: Element | null = el;
  while (current && current.tagName !== 'BODY') {
    if (uiPattern.test(`${current.tagName} ${current.id} ${current.className}`)) return true;
    current = current.parentElement;
  }
  return false;
}
function effectiveBackground(el: Element): string {
  let current: Element | null = el;
  while (current) {
    const background = getComputedStyle(current).backgroundColor.replace(/\s/g, '');
    if (background && background !== 'transparent' && background !== 'rgba(0,0,0,0)') return background;
    current = current.parentElement;
  }
  return '';
}
function reasonsFor(el: Element): HiddenReason[] {
  const reasons = new Set<HiddenReason>();
  let current: Element | null = el;
  while (current) {
    const style = getComputedStyle(current);
    if (style.display === 'none') reasons.add('display');
    if (style.visibility === 'hidden' || style.visibility === 'collapse') reasons.add('visibility');
    if (style.opacity === '0' && !styleIsAnimating(style)) reasons.add('opacity');
    const left = Number.parseFloat(style.left); const top = Number.parseFloat(style.top);
    const indent = Number.parseFloat(style.textIndent);
    if ((style.position === 'absolute' || style.position === 'fixed') &&
      ((Number.isFinite(left) && left < -5000) || (Number.isFinite(top) && top < -5000))) reasons.add('offscreen');
    if (Number.isFinite(indent) && indent < -999) reasons.add('offscreen');
    if (Number.parseFloat(style.fontSize || '16') < 2) reasons.add('tiny');
    current = current.parentElement;
  }
  const text = clean(el.textContent || '');
  if (text && getComputedStyle(el).color.replace(/\s/g, '') === effectiveBackground(el)) reasons.add('same-color');
  if (el.getAttribute('aria-hidden') === 'true') reasons.add('aria-hidden');
  return [...reasons];
}
function legalGate(text: string): { passed: boolean; reason: string; keywordHits: string[] } {
  const hits = legalKeywords.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  if (text.length < 1500) return { passed: false, reason: `Metin çok kısa: ${text.length} karakter`, keywordHits: hits };
  if (hits.length < 3) return { passed: false, reason: 'Hukuki anahtar kelime bulunamadı (en az 3 farklı kelime gerekli)', keywordHits: hits };
  return { passed: true, reason: 'Geçti', keywordHits: hits };
}

export function extractPage(root: Document = document): ExtractedPage {
  const rawText = clean(root.body?.innerText || root.body?.textContent || '');
  const rawLength = rawText.length;
  const clone = root.body.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script,style,noscript,template').forEach(element => element.remove());
  const sourceElements = [...root.body.querySelectorAll('*')].filter(element => !element.closest('script,style,noscript,template'));
  const cloneElements = [...clone.querySelectorAll('*')];
  let removedElementCount = 0;
  let hiddenContentDetected = false;
  const removedReasons: Partial<Record<HiddenReason, number>> = {};
  const firstRemovedElements: ExtractionDebug['firstRemovedElements'] = [];
  cloneElements.forEach((element, index) => {
    const sourceElement = sourceElements[index];
    if (!sourceElement || blockedTags.has(element.tagName) || isUiChrome(sourceElement)) return;
    const text = clean(element.textContent || '');
    if (rawLength > 0 && text.length >= rawLength * 0.5) return;
    const reasons = reasonsFor(sourceElement);
    if (!reasons.length) return;
    removedElementCount++;
    reasons.forEach(reason => { removedReasons[reason] = (removedReasons[reason] || 0) + 1; });
    if (firstRemovedElements.length < 5) firstRemovedElements.push({ tag: sourceElement.tagName.toLowerCase(), className: typeof sourceElement.className === 'string' ? sourceElement.className : '', reasons });
    if (text.length > 200 || injectionPatterns.some(pattern => pattern.test(text))) hiddenContentDetected = true;
    element.remove();
  });
  const text = clean(clone.innerText || clone.textContent || '');
  const injectionDetected = injectionPatterns.some(pattern => pattern.test(rawText));
  const gate = legalGate(`${root.title} ${text}`);
  const debug: ExtractionDebug = { rawTextLength: rawLength, visibleTextLength: text.length, removedElementCount, removedReasons, firstRemovedElements, legalGate: gate };
  console.info('[Hukuk Metre] extraction debug', debug);
  return { text, hiddenContentDetected, injectionDetected, isLegalDocument: gate.passed, legalGateReason: gate.reason, debug, url: root.defaultView?.location.href || '' };
}
