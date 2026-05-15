import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createYeOldeFetch, MisfortuneAtTheKeep } from '../src/index.js';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('createYeOldeFetch', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prepends greatKeep to relative URLs', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({}));
    const api = createYeOldeFetch({ greatKeep: 'https://api.example.com' });
    await api.getteth('/users/1');
    expect(fetchSpy.mock.calls[0]![0]).toBe('https://api.example.com/users/1');
  });

  it('passes absolute URLs through unchanged', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({}));
    const api = createYeOldeFetch({ greatKeep: 'https://api.example.com' });
    await api.getteth('https://other.example.com/x');
    expect(fetchSpy.mock.calls[0]![0]).toBe('https://other.example.com/x');
  });

  it('merges factory waxSeals with per-call seals; per-call wins on collision', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({}));
    const api = createYeOldeFetch({
      waxSeals: { Authorization: 'Bearer factory', 'X-Trace': 'abc' },
    });
    await api.getteth('https://example.com/x', {
      waxSeals: { Authorization: 'Bearer percall' },
    });
    const headers = new Headers(fetchSpy.mock.calls[0]![1].headers);
    expect(headers.get('Authorization')).toBe('Bearer percall');
    expect(headers.get('X-Trace')).toBe('abc');
  });

  it('uses factory valiantAttempts as default; per-call overrides', async () => {
    fetchSpy.mockResolvedValue(new Response('boom', { status: 500 }));
    const api = createYeOldeFetch({ valiantAttempts: 3, betwixtMs: 1 });

    await expect(api.getteth('https://example.com/x')).rejects.toBeInstanceOf(MisfortuneAtTheKeep);
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    fetchSpy.mockClear();

    await expect(
      api.getteth('https://example.com/x', { valiantAttempts: 1 }),
    ).rejects.toBeInstanceOf(MisfortuneAtTheKeep);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('towncrier logs request and response lines', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    fetchSpy.mockResolvedValue(jsonResponse({}, { status: 200 }));
    const api = createYeOldeFetch({ towncrier: true });
    await api.getteth('https://example.com/x');
    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy.mock.calls[0]![0]).toMatch(/Hark!/);
    expect(logSpy.mock.calls[1]![0]).toMatch(/Lo!/);
  });
});
