import type { TomeInit, YeOldeConfig } from './types.js';
import type { Tidings } from './tidings.js';
import { questeth } from './core.js';

/**
 * A configured ye-olde-fetch instance. Same four verbs, but bound to the
 * config provided to {@link createYeOldeFetch}.
 */
export interface YeOldeFetchInstance {
  getteth(url: string, opts?: Omit<TomeInit, 'missive'>): Promise<Tidings>;
  postith(url: string, opts?: TomeInit): Promise<Tidings>;
  puttest(url: string, opts?: TomeInit): Promise<Tidings>;
  deleteth(url: string, opts?: TomeInit): Promise<Tidings>;
}

/**
 * Create a configured ye-olde-fetch instance with defaults baked in.
 *
 * Per-call options override factory defaults. `waxSeals` are **merged** with
 * per-call seals winning on key collisions; everything else is replace-by-call.
 *
 * @param config Optional {@link YeOldeConfig}. All fields are optional.
 * @returns      An object with `getteth`, `postith`, `puttest`, `deleteth` methods.
 *
 * @example
 * const api = createYeOldeFetch({
 *   greatKeep: 'https://api.example.com',
 *   waxSeals: { Authorization: 'Bearer abc' },
 *   valiantAttempts: 3,
 *   towncrier: true,
 * });
 *
 * const tidings = await api.getteth('/users/42');
 * const user = await tidings.readeAsTome();
 */
export function createYeOldeFetch(config: YeOldeConfig = {}): YeOldeFetchInstance {
  return {
    getteth: (url, opts) => questeth('GET', url, opts, config),
    postith: (url, opts) => questeth('POST', url, opts, config),
    puttest: (url, opts) => questeth('PUT', url, opts, config),
    deleteth: (url, opts) => questeth('DELETE', url, opts, config),
  };
}
