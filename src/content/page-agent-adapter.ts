/**
 * Optional adapter for the documented Page Agent API. It is never required for
 * analysis. If Page Agent is present, it receives the same Gemini BYOK key in
 * memory and Gemini's documented OpenAI-compatible base URL.
 */
export interface PageAgentLike { execute(task:string): Promise<unknown>; }
export async function runOptionalPageAgent(task:string): Promise<unknown|null> {
  const candidate=(window as Window & { PageAgent?: new (config:Record<string,unknown>)=>PageAgentLike }).PageAgent;
  if (!candidate) return null;
  const settings=await chrome.storage.local.get(['apiKey','model']);
  if (!settings.apiKey) return null;
  try {
    const agent=new candidate({apiKey:settings.apiKey,model:settings.model||'gemini-3.8-flash',baseURL:'https://generativelanguage.googleapis.com/v1beta/openai/',language:'tr-TR'});
    return await agent.execute(task);
  } catch { return null; }
}
