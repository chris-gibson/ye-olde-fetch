import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getteth, MisfortuneAtTheKeep } from '../src/index.js';

describe('retry — valiantAttempts + betwixtMs', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('retries on 5xx up to valiantAttempts times', async () => {
    fetchSpy
      .mockResolvedValueOnce(new Response('boom', { status: 503 }))
      .mockResolvedValueOnce(new Response('boom', { status: 503 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const tidings = await getteth('https://example.com/x', { valiantAttempts: 3, betwixtMs: 1 });
    expect(tidings.fortune).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('does NOT retry on 4xx', async () => {
    fetchSpy.mockResolvedValue(new Response('nope', { status: 404 }));
    await expect(
      getteth('https://example.com/x', { valiantAttempts: 5, betwixtMs: 1 }),
    ).rejects.toBeInstanceOf(MisfortuneAtTheKeep);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('throws MisfortuneAtTheKeep after exhausting retries on 5xx', async () => {
    fetchSpy.mockResolvedValue(new Response('boom', { status: 502 }));
    await expect(
      getteth('https://example.com/x', { valiantAttempts: 3, betwixtMs: 1 }),
    ).rejects.toBeInstanceOf(MisfortuneAtTheKeep);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('retries on network errors and eventually re-throws', async () => {
    const netErr = new TypeError('Network error');
    fetchSpy.mockRejectedValue(netErr);
    await expect(
      getteth('https://example.com/x', { valiantAttempts: 3, betwixtMs: 1 }),
    ).rejects.toBe(netErr);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('uses doubling backoff between attempts', async () => {
    vi.useFakeTimers();
    fetchSpy
      .mockResolvedValueOnce(new Response('boom', { status: 500 }))
      .mockResolvedValueOnce(new Response('boom', { status: 500 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const promise = getteth('https://example.com/x', { valiantAttempts: 3, betwixtMs: 100 });

    await vi.advanceTimersByTimeAsync(0);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(100);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(200);
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    const tidings = await promise;
    expect(tidings.fortune).toBe(200);
  });

  it('aborts immediately when pigeonRecall fires mid-backoff', async () => {
    vi.useFakeTimers();
    fetchSpy.mockResolvedValueOnce(new Response('boom', { status: 500 }));

    const controller = new AbortController();
    const promise = getteth('https://example.com/x', {
      valiantAttempts: 5,
      betwixtMs: 100,
      pigeonRecall: controller,
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    controller.abort();
    await expect(promise).rejects.toThrow();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
