/** Returns a Promise that resolves after `ms` milliseconds, or rejects if the signal aborts first. */
function pause(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Run a fetch attempt up to `attempts` times with doubling backoff.
 *
 * Retries on thrown errors and 5xx responses. Does not retry on 4xx.
 * Honors `signal` — if aborted, throws immediately without further attempts.
 */
export async function runQuest(
  doFetch: () => Promise<Response>,
  attempts: number,
  betwixtMs: number,
  signal?: AbortSignal,
): Promise<Response> {
  const total = Math.max(1, Math.floor(attempts));
  let lastErr: unknown;

  for (let i = 0; i < total; i++) {
    if (signal?.aborted) {
      throw signal.reason ?? new DOMException('Aborted', 'AbortError');
    }
    try {
      const response = await doFetch();
      if (response.status < 500 || i === total - 1) {
        return response;
      }
      lastErr = response;
    } catch (err) {
      lastErr = err;
      if (i === total - 1) throw err;
    }
    const delay = betwixtMs * Math.pow(2, i);
    await pause(delay, signal);
  }

  if (lastErr instanceof Response) return lastErr;
  throw lastErr;
}
