export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean> = {},
  children: (Node | string | null | undefined)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') node.className = String(v);
    else if (k.startsWith('on') && typeof v === 'function') (node as any)[k] = v;
    else node.setAttribute(k, String(v));
  }
  for (const child of children) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

/** Native fetch keys → themed names for the glossary. */
export const NATIVE_FOR: Record<string, string> = {
  missive: 'body',
  waxSeals: 'headers',
  pigeonRecall: 'signal (from AbortController)',
  valiantAttempts: '— (retry config, library-only)',
  betwixtMs: '— (retry config, library-only)',
  letterOfPassage: 'credentials',
  archive: 'cache',
  realm: 'mode',
  detour: 'redirect',
  whence: 'referrer',
  oath: 'integrity',
  enduring: 'keepalive',
};

export function stripWikiLinks(s: string): string {
  return s.replace(/\{@link\s+([^}]+)\}/g, (_, x) => x.trim());
}

export function firstParagraph(s: string): string {
  return stripWikiLinks(s.split(/\n\s*\n/)[0] || '');
}
