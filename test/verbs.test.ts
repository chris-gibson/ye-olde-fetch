import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getteth, postith, puttest, deleteth, Tidings, MisfortuneAtTheKeep } from '../src/index.js';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('verbs — happy path', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getteth returns a Tidings on 200', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ ok: true }));
    const tidings = await getteth('https://example.com/x');
    expect(tidings).toBeInstanceOf(Tidings);
    expect(tidings.fortune).toBe(200);
    expect(tidings.didProsper).toBe(true);
    expect(await tidings.readeAsTome<{ ok: boolean }>()).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledWith('https://example.com/x', expect.objectContaining({ method: 'GET' }));
  });

  it('postith sends body and headers', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ id: 1 }, { status: 201 }));
    await postith('https://example.com/posts', {
      missive: JSON.stringify({ name: 'Aldric' }),
      waxSeals: { 'Content-Type': 'application/json' },
    });
    const [, init] = fetchSpy.mock.calls[0]!;
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"name":"Aldric"}');
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
  });

  it('puttest sets PUT method', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));
    await puttest('https://example.com/x');
    expect(fetchSpy.mock.calls[0]![1].method).toBe('PUT');
  });

  it('deleteth sets DELETE method', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));
    await deleteth('https://example.com/x');
    expect(fetchSpy.mock.calls[0]![1].method).toBe('DELETE');
  });

  it('throws MisfortuneAtTheKeep on 404', async () => {
    fetchSpy.mockResolvedValue(new Response('not found', { status: 404, statusText: 'Not Found' }));
    await expect(getteth('https://example.com/missing')).rejects.toBeInstanceOf(MisfortuneAtTheKeep);
    try {
      await getteth('https://example.com/missing');
    } catch (e) {
      expect(e).toBeInstanceOf(MisfortuneAtTheKeep);
      const err = e as MisfortuneAtTheKeep;
      expect(err.fortune).toBe(404);
      expect(err.url).toBe('https://example.com/missing');
      expect(err.tidings.fortune).toBe(404);
      expect(err.message).toContain('no such keep');
    }
  });

  it('throws MisfortuneAtTheKeep on 500 after single attempt (default no retry)', async () => {
    fetchSpy.mockResolvedValue(new Response('boom', { status: 500 }));
    await expect(getteth('https://example.com/x')).rejects.toBeInstanceOf(MisfortuneAtTheKeep);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('passes through letterOfPassage, archive, realm, detour, oath, enduring', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({}));
    await getteth('https://example.com/x', {
      letterOfPassage: 'include',
      archive: 'no-store',
      realm: 'cors',
      detour: 'follow',
      oath: 'sha256-abc',
      enduring: true,
    });
    const init = fetchSpy.mock.calls[0]![1];
    expect(init.credentials).toBe('include');
    expect(init.cache).toBe('no-store');
    expect(init.mode).toBe('cors');
    expect(init.redirect).toBe('follow');
    expect(init.integrity).toBe('sha256-abc');
    expect(init.keepalive).toBe(true);
  });

  it('does not pass library-only keys to fetch', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({}));
    await getteth('https://example.com/x', { valiantAttempts: 2, betwixtMs: 10 });
    const init = fetchSpy.mock.calls[0]![1];
    expect(init).not.toHaveProperty('valiantAttempts');
    expect(init).not.toHaveProperty('betwixtMs');
    expect(init).not.toHaveProperty('pigeonRecall');
  });
});
