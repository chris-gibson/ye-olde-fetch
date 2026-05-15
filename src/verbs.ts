import type { TomeInit } from './types.js';
import type { Tidings } from './tidings.js';
import { questeth } from './core.js';

/**
 * Send forth a `getteth` quest — fetches a resource with the GET method.
 *
 * Equivalent to `fetch(url)` with default `method: 'GET'`. Throws
 * {@link MisfortuneAtTheKeep} on any non-2xx response (after retries exhaust).
 *
 * @param url    The destination keep (the URL to call).
 * @param opts   {@link TomeInit} — themed request options. `missive` is not
 *               accepted on GET; GET requests must not carry a body per HTTP spec.
 * @returns      A {@link Tidings} wrapping the response on any 2xx fortune.
 *
 * @example
 * const tidings = await getteth('https://api.github.com/users/octocat');
 * const user = await tidings.readeAsTome<{ login: string }>();
 */
export function getteth(url: string, opts?: Omit<TomeInit, 'missive'>): Promise<Tidings> {
  return questeth('GET', url, opts);
}

/**
 * Send forth a `postith` quest — dispatches a POST request with a missive in hand.
 *
 * Equivalent to `fetch(url, { method: 'POST', body, headers, ... })`. The library
 * does not auto-serialize JSON — pass `JSON.stringify(...)` as the `missive`
 * and set `Content-Type` in `waxSeals` yourself.
 *
 * @param url    The destination keep (the URL to call).
 * @param opts   {@link TomeInit} — themed request options.
 * @returns      A {@link Tidings} wrapping the response on any 2xx fortune.
 *
 * @example
 * const tidings = await postith('https://jsonplaceholder.typicode.com/posts', {
 *   missive: JSON.stringify({ title: 'huzzah', body: 'hark' }),
 *   waxSeals: { 'Content-Type': 'application/json' },
 *   valiantAttempts: 3,
 * });
 * const created = await tidings.readeAsTome<{ id: number }>();
 */
export function postith(url: string, opts?: TomeInit): Promise<Tidings> {
  return questeth('POST', url, opts);
}

/**
 * Send forth a `puttest` quest — dispatches a PUT request to replace a resource.
 *
 * Equivalent to `fetch(url, { method: 'PUT', body, headers, ... })`.
 *
 * @param url    The destination keep (the URL to call).
 * @param opts   {@link TomeInit} — themed request options.
 * @returns      A {@link Tidings} wrapping the response on any 2xx fortune.
 *
 * @example
 * await puttest('https://api.example.com/users/42', {
 *   missive: JSON.stringify({ name: 'Aldric' }),
 *   waxSeals: { 'Content-Type': 'application/json' },
 * });
 */
export function puttest(url: string, opts?: TomeInit): Promise<Tidings> {
  return questeth('PUT', url, opts);
}

/**
 * Send forth a `deleteth` quest — dispatches a DELETE request to remove a resource.
 *
 * Equivalent to `fetch(url, { method: 'DELETE', headers, ... })`.
 *
 * @param url    The destination keep (the URL to call).
 * @param opts   {@link TomeInit} — themed request options.
 * @returns      A {@link Tidings} wrapping the response on any 2xx fortune.
 *
 * @example
 * await deleteth('https://api.example.com/users/42', {
 *   waxSeals: { Authorization: 'Bearer ...' },
 * });
 */
export function deleteth(url: string, opts?: TomeInit): Promise<Tidings> {
  return questeth('DELETE', url, opts);
}
