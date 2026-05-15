import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getteth,
  MisfortuneAtTheKeep,
  MalformedMissive,
  NoLetterOfPassage,
  BarredByTheSentry,
  KeepNotFound,
  HourglassRanDry,
  QuarrelsomeKeep,
  KeepIsAnEarthenPot,
  IllegibleMissive,
  PigeonsOverwhelmTheKeep,
  ChaosInTheKeep,
  BrigandsAtTheGate,
  KeepBesieged,
  GateKeeperVanished,
  STATUS_TO_ERROR,
  misfortuneFor,
  Tidings,
} from '../src/index.js';

describe('themed errors per status code', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });
  afterEach(() => vi.restoreAllMocks());

  const cases: Array<[number, new (...a: any[]) => MisfortuneAtTheKeep]> = [
    [400, MalformedMissive],
    [401, NoLetterOfPassage],
    [403, BarredByTheSentry],
    [404, KeepNotFound],
    [408, HourglassRanDry],
    [409, QuarrelsomeKeep],
    [418, KeepIsAnEarthenPot],
    [422, IllegibleMissive],
    [429, PigeonsOverwhelmTheKeep],
    [500, ChaosInTheKeep],
    [502, BrigandsAtTheGate],
    [503, KeepBesieged],
    [504, GateKeeperVanished],
  ];

  for (const [status, Ctor] of cases) {
    it(`throws ${Ctor.name} on ${status}`, async () => {
      fetchSpy.mockResolvedValue(new Response('x', { status }));
      try {
        await getteth('https://example.com/x', { valiantAttempts: 1 });
        throw new Error('should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(Ctor);
        expect(e).toBeInstanceOf(MisfortuneAtTheKeep);
        expect((e as MisfortuneAtTheKeep).fortune).toBe(status);
        expect((e as Error).name).toBe(Ctor.name);
      }
    });
  }

  it('falls back to base MisfortuneAtTheKeep for unknown status (e.g. 499)', async () => {
    fetchSpy.mockResolvedValue(new Response('x', { status: 499 }));
    try {
      await getteth('https://example.com/x');
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(MisfortuneAtTheKeep);
      // The base class itself, not a specific subclass.
      expect(e?.constructor).toBe(MisfortuneAtTheKeep);
      expect((e as MisfortuneAtTheKeep).fortune).toBe(499);
    }
  });

  it('STATUS_TO_ERROR keeps every entry in agreement with its class fortune', () => {
    for (const [status, Ctor] of Object.entries(STATUS_TO_ERROR)) {
      const staticFortune = (Ctor as unknown as { fortune: number }).fortune;
      expect(staticFortune).toBe(Number(status));
    }
  });

  it('misfortuneFor returns the dispatched class', () => {
    const t = new Tidings(new Response('x', { status: 404, statusText: 'Not Found' }));
    const e = misfortuneFor(t, 'https://example.com/x');
    expect(e).toBeInstanceOf(KeepNotFound);
    expect(e.message).toContain('no such keep');
    expect(e.message).toContain('Not Found');
  });

  it('error name reflects the subclass name', async () => {
    fetchSpy.mockResolvedValue(new Response('x', { status: 404 }));
    try {
      await getteth('https://example.com/x');
    } catch (e) {
      expect((e as Error).name).toBe('KeepNotFound');
    }
  });
});
