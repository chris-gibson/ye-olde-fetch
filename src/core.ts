import type { TomeInit, YeOldeConfig } from './types.js';
import { Tidings } from './tidings.js';
import { misfortuneFor } from './errors.js';
import { runQuest } from './retry.js';

/**
 * The single source of truth for themed-to-native option translation.
 *
 * Keys not in this map (e.g. `valiantAttempts`, `betwixtMs`, `pigeonRecall`)
 * are library-only and never reach native `fetch`.
 */
export const THEMED_TO_NATIVE: Record<string, keyof RequestInit> = {
  missive:         'body',
  waxSeals:        'headers',
  letterOfPassage: 'credentials',
  archive:         'cache',
  realm:           'mode',
  detour:          'redirect',
  whence:          'referrer',
  oath:            'integrity',
  enduring:        'keepalive',
};

function resolveUrl(url: string, greatKeep?: string): string {
  if (!greatKeep) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const base = greatKeep.endsWith('/') ? greatKeep.slice(0, -1) : greatKeep;
  const path = url.startsWith('/') ? url : '/' + url;
  return base + path;
}

function mergeWaxSeals(base?: HeadersInit, override?: HeadersInit): HeadersInit | undefined {
  if (!base && !override) return undefined;
  const merged = new Headers(base);
  if (override) {
    new Headers(override).forEach((value, key) => merged.set(key, value));
  }
  return merged;
}

/**
 * The shared engine that backs every verb (`getteth`, `postith`, `puttest`, `deleteth`).
 *
 * 1. Resolves the URL against `config.greatKeep`.
 * 2. Merges `config.waxSeals` with `opts.waxSeals` (per-call wins).
 * 3. Maps themed keys to native `RequestInit` keys.
 * 4. Runs the fetch via {@link runQuest} for retry handling.
 * 5. Wraps the final response in a {@link Tidings} or throws {@link MisfortuneAtTheKeep}.
 */
export async function questeth(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  opts: TomeInit = {},
  config: YeOldeConfig = {},
): Promise<Tidings> {
  const resolved = resolveUrl(url, config.greatKeep);

  const attempts = opts.valiantAttempts ?? config.valiantAttempts ?? 1;
  const betwixtMs = opts.betwixtMs ?? config.betwixtMs ?? 250;
  const towncrier = config.towncrier ?? false;
  const signal = opts.pigeonRecall?.signal;

  const init: RequestInit = { method };
  const mergedSeals = mergeWaxSeals(config.waxSeals, opts.waxSeals);
  if (mergedSeals) init.headers = mergedSeals;
  if (signal) init.signal = signal;

  for (const [themed, native] of Object.entries(THEMED_TO_NATIVE)) {
    if (themed === 'waxSeals') continue;
    const value = (opts as Record<string, unknown>)[themed];
    if (value !== undefined) {
      (init as Record<string, unknown>)[native] = value;
    }
  }

  const start = towncrier ? Date.now() : 0;
  if (towncrier) {
    console.log(`Hark! A ${method} quest is sent forth unto ${resolved}.`);
  }

  let response: Response;
  try {
    response = await runQuest(() => fetch(resolved, init), attempts, betwixtMs, signal);
  } catch (err) {
    if (towncrier) {
      console.log(`Alas! The pigeon was lost in the storm bound for ${resolved}: ${String(err)}`);
    }
    throw err;
  }

  const tidings = new Tidings(response);

  if (towncrier) {
    const elapsed = Date.now() - start;
    const verb = tidings.didProsper ? 'good' : 'ill';
    console.log(`Lo! The keep at ${resolved} hath returned ${verb} tidings (${tidings.fortune}) in ${elapsed}ms.`);
  }

  if (tidings.metMisfortune) {
    throw misfortuneFor(tidings, resolved);
  }

  return tidings;
}
