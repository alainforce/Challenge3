import { extractPage } from './extractor';
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => { if (message?.type==='EXTRACT_PAGE') { sendResponse(extractPage()); return true; } return false; });
const signal=/terms|privacy|policy|subscription|agreement|koşul|gizlilik|sözleşme|abonelik/i;
if (signal.test(document.title+' '+location.href+' '+document.body.innerText.slice(0,5000))) chrome.runtime.sendMessage({type:'PAGE_DETECTED'}).catch(()=>undefined);
