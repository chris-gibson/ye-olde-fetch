import { describe, it, expect } from 'vitest';
import { Tidings } from '../src/index.js';

describe('Tidings', () => {
  it('mirrors Response fields onto themed accessors', () => {
    const res = new Response('hi', {
      status: 201,
      headers: { 'X-Realm': 'fae' },
    });
    const tidings = new Tidings(res);
    expect(tidings.fortune).toBe(201);
    expect(tidings.didProsper).toBe(true);
    expect(tidings.metMisfortune).toBe(false);
    expect(tidings.waxSeals.get('X-Realm')).toBe('fae');
    expect(tidings.rawResponse).toBe(res);
  });

  it('didProsper is false for non-2xx', () => {
    const tidings = new Tidings(new Response('', { status: 418 }));
    expect(tidings.didProsper).toBe(false);
    expect(tidings.metMisfortune).toBe(true);
  });

  it('readeAsTome parses JSON', async () => {
    const tidings = new Tidings(new Response(JSON.stringify({ a: 1 })));
    expect(await tidings.readeAsTome<{ a: number }>()).toEqual({ a: 1 });
  });

  it('readeAsParchment returns text', async () => {
    const tidings = new Tidings(new Response('hello'));
    expect(await tidings.readeAsParchment()).toBe('hello');
  });

  it('readeAsRunes returns an ArrayBuffer', async () => {
    const tidings = new Tidings(new Response(new Uint8Array([1, 2, 3])));
    const buf = await tidings.readeAsRunes();
    expect(buf).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(buf)).toEqual(new Uint8Array([1, 2, 3]));
  });
});
