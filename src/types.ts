/**
 * The themed options bag passed to every verb (`getteth`, `postith`, etc.).
 *
 * Every key is themed; their JSDoc descriptions give the plain-English fetch
 * equivalent so IDE tooltips serve as an inline glossary.
 */
export interface TomeInit {
  /**
   * The request body / payload.
   *
   * Equivalent to fetch's `body`. JSON callers must `JSON.stringify` themselves —
   * this library does not auto-serialize. Accepts strings, `FormData`, `Blob`,
   * `ArrayBuffer`, `URLSearchParams`, or `ReadableStream`.
   */
  missive?: BodyInit | null;

  /**
   * Request headers, sent alongside the missive like wax seals on a letter.
   *
   * Equivalent to fetch's `headers`. Accepts a `Headers` instance, a plain
   * record, or an array of `[name, value]` tuples.
   */
  waxSeals?: HeadersInit;

  /**
   * An `AbortController` whose signal cancels the in-flight request and aborts
   * any remaining retry attempts.
   *
   * Equivalent to constructing fetch with `signal: controller.signal`. Pass the
   * whole controller — the library reads `.signal` internally.
   */
  pigeonRecall?: AbortController;

  /**
   * How many total attempts before surrendering. Defaults to `1` (no retry).
   *
   * Retries fire on network errors and 5xx responses; 4xx responses are not
   * retried (they are the caller's misfortune, not transient).
   */
  valiantAttempts?: number;

  /**
   * Base delay in milliseconds between retry attempts. Defaults to `250`.
   *
   * Backoff doubles each attempt: `betwixtMs`, `betwixtMs * 2`, `betwixtMs * 4`, ...
   */
  betwixtMs?: number;

  /**
   * Whether to send credentials (cookies, auth headers).
   *
   * Equivalent to fetch's `credentials`. Values: `'omit' | 'same-origin' | 'include'`.
   */
  letterOfPassage?: RequestCredentials;

  /**
   * Cache mode for the request.
   *
   * Equivalent to fetch's `cache`. Values: `'default' | 'no-store' | 'reload' |
   * 'no-cache' | 'force-cache' | 'only-if-cached'`.
   */
  archive?: RequestCache;

  /**
   * Cross-origin mode for the request.
   *
   * Equivalent to fetch's `mode`. Values: `'cors' | 'no-cors' | 'same-origin' | 'navigate'`.
   */
  realm?: RequestMode;

  /**
   * How to handle redirects.
   *
   * Equivalent to fetch's `redirect`. Values: `'follow' | 'error' | 'manual'`.
   */
  detour?: RequestRedirect;

  /**
   * The referrer URL to send with the request.
   *
   * Equivalent to fetch's `referrer`. Pass `''` to omit, a same-origin URL, or `'about:client'`.
   */
  whence?: string;

  /**
   * Subresource Integrity hash to verify the response body against.
   *
   * Equivalent to fetch's `integrity`.
   */
  oath?: string;

  /**
   * Whether the request may outlive the page that issued it.
   *
   * Equivalent to fetch's `keepalive`. Useful for analytics beacons on unload.
   */
  enduring?: boolean;
}

/**
 * Configuration for a bound `createYeOldeFetch` instance.
 *
 * Every option here becomes a default for calls made through this instance.
 * Per-call options always win; `waxSeals` are merged (per-call wins on collision).
 */
export interface YeOldeConfig {
  /**
   * A base URL prepended to relative request URLs.
   *
   * e.g. `greatKeep: 'https://api.example.com'` lets you call `getteth('/users')`
   * and have it resolved to `'https://api.example.com/users'`. Absolute URLs
   * passed to verbs bypass the great keep.
   */
  greatKeep?: string;

  /**
   * Default `valiantAttempts` for every call on this instance.
   * Overridable per-call.
   */
  valiantAttempts?: number;

  /**
   * Default `betwixtMs` for every call on this instance.
   * Overridable per-call.
   */
  betwixtMs?: number;

  /**
   * Default `waxSeals` merged with per-call seals. Per-call wins on key collision.
   *
   * Useful for setting an `Authorization` header once on a configured instance.
   */
  waxSeals?: HeadersInit;

  /**
   * When `true`, prints themed log lines on every request and response.
   *
   * Defaults to `false`. Disable in production. Output goes to `console.log`.
   */
  towncrier?: boolean;
}
