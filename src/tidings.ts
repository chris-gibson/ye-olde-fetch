/**
 * The themed response wrapper returned by every successful (2xx) verb call.
 *
 * Equivalent to a thin wrapper around fetch's `Response`. Exposes themed
 * accessors and reader methods; the raw `Response` is always available via
 * `.rawResponse` as an escape hatch.
 *
 * @example
 * const tidings = await getteth('https://api.example.com/users/1');
 * console.log(tidings.fortune);            // 200
 * console.log(tidings.didProsper);         // true
 * const user = await tidings.readeAsTome<{ id: number }>();
 */
export class Tidings {
  /** The underlying native `Response`. Use this to drop down to raw fetch APIs. */
  readonly rawResponse: Response;

  /** The HTTP status code. Equivalent to `Response.status`. */
  readonly fortune: number;

  /** The response headers. Equivalent to `Response.headers`. */
  readonly waxSeals: Headers;

  /** `true` when the status is in the 200–299 range. Equivalent to `Response.ok`. */
  readonly didProsper: boolean;

  /** `true` when the status is outside the 200–299 range. Equivalent to `!Response.ok`. */
  readonly metMisfortune: boolean;

  constructor(response: Response) {
    this.rawResponse = response;
    this.fortune = response.status;
    this.waxSeals = response.headers;
    this.didProsper = response.ok;
    this.metMisfortune = !response.ok;
  }

  /**
   * Read the body as JSON. Equivalent to `Response.json()`.
   *
   * @returns The parsed body, typed as `T` (defaults to `unknown`).
   */
  readeAsTome<T = unknown>(): Promise<T> {
    return this.rawResponse.json() as Promise<T>;
  }

  /**
   * Read the body as a UTF-8 string. Equivalent to `Response.text()`.
   */
  readeAsParchment(): Promise<string> {
    return this.rawResponse.text();
  }

  /**
   * Read the body as an `ArrayBuffer`. Equivalent to `Response.arrayBuffer()`.
   */
  readeAsRunes(): Promise<ArrayBuffer> {
    return this.rawResponse.arrayBuffer();
  }
}
