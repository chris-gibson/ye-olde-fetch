import { Tidings } from './tidings.js';

/**
 * The base class thrown when a request finishes with a non-2xx status after
 * all retry attempts have been exhausted.
 *
 * Every specific HTTP status code has a themed subclass that extends this
 * base — see exports below. `catch (e) { if (e instanceof MisfortuneAtTheKeep) }`
 * catches all of them; narrow with the specific subclass when you want to
 * branch on a particular code.
 *
 * Network errors (where `fetch` itself rejects) are **not** wrapped — they
 * are re-thrown as-is, since they are the messenger's misfortune, not the keep's.
 *
 * @example
 * try {
 *   await getteth('https://api.example.com/missing');
 * } catch (e) {
 *   if (e instanceof KeepNotFound) console.log('404 specifically');
 *   else if (e instanceof MisfortuneAtTheKeep) console.log(e.fortune);
 * }
 */
export class MisfortuneAtTheKeep extends Error {
  /** The HTTP status code returned by the keep. */
  readonly fortune: number;

  /** The full {@link Tidings} wrapper of the failed response, still readable. */
  readonly tidings: Tidings;

  /** The URL that was called. */
  readonly url: string;

  constructor(tidings: Tidings, url: string, themedReason?: string) {
    const statusText = tidings.rawResponse.statusText;
    const reason = themedReason ?? `the keep returned ill tidings (fortune ${tidings.fortune})`;
    const suffix = statusText ? ` — ${statusText}` : '';
    super(`At ${url}: ${reason}${suffix}.`);
    this.name = new.target.name;
    this.fortune = tidings.fortune;
    this.tidings = tidings;
    this.url = url;
  }
}

/* ─────────────────────────────────────────────────────────────────
 *  4xx — Misfortunes of the Traveler
 *  (the caller's request was rejected; not retried by valiantAttempts)
 * ───────────────────────────────────────────────────────────────── */

/** 400 Bad Request — the keep judged thy missive malformed. */
export class MalformedMissive extends MisfortuneAtTheKeep {
  static readonly fortune = 400;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep judged thy missive malformed'); }
}

/** 401 Unauthorized — the sentries demanded a letter of passage. */
export class NoLetterOfPassage extends MisfortuneAtTheKeep {
  static readonly fortune = 401;
  constructor(t: Tidings, url: string) { super(t, url, 'the sentries demanded a letter of passage'); }
}

/** 402 Payment Required — the keep demands coin ere it answer. */
export class CoinsRequired extends MisfortuneAtTheKeep {
  static readonly fortune = 402;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep demands coin ere it answer'); }
}

/** 403 Forbidden — the sentries knew thy face and barred the gate. */
export class BarredByTheSentry extends MisfortuneAtTheKeep {
  static readonly fortune = 403;
  constructor(t: Tidings, url: string) { super(t, url, 'the sentries barred thee from the gate'); }
}

/** 404 Not Found — no such keep stood at the named place. */
export class KeepNotFound extends MisfortuneAtTheKeep {
  static readonly fortune = 404;
  constructor(t: Tidings, url: string) { super(t, url, 'no such keep could be found at the named place'); }
}

/** 405 Method Not Allowed — the deed thou attempted is not sanctioned by this keep. */
export class UnsanctionedDeed extends MisfortuneAtTheKeep {
  static readonly fortune = 405;
  constructor(t: Tidings, url: string) { super(t, url, 'this deed is unsanctioned at the keep'); }
}

/** 406 Not Acceptable — the keep had no answer to thy palate. */
export class UnpalatableTerms extends MisfortuneAtTheKeep {
  static readonly fortune = 406;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep had no answer to thy palate'); }
}

/** 407 Proxy Authentication Required — a bridge troll upon the road demanded papers. */
export class BridgeTrollDemandsPapers extends MisfortuneAtTheKeep {
  static readonly fortune = 407;
  constructor(t: Tidings, url: string) { super(t, url, 'a bridge troll upon the road demanded papers'); }
}

/** 408 Request Timeout — the hourglass ran dry before thy missive arrived in full. */
export class HourglassRanDry extends MisfortuneAtTheKeep {
  static readonly fortune = 408;
  constructor(t: Tidings, url: string) { super(t, url, 'the hourglass ran dry ere thy missive arrived in full'); }
}

/** 409 Conflict — the keep is in quarrel with thy missive. */
export class QuarrelsomeKeep extends MisfortuneAtTheKeep {
  static readonly fortune = 409;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep is in quarrel with thy missive'); }
}

/** 410 Gone — the keep was abandoned long ago. */
export class KeepAbandoned extends MisfortuneAtTheKeep {
  static readonly fortune = 410;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep was abandoned long ago'); }
}

/** 411 Length Required — thy missive bore no measure of its girth. */
export class MissiveSizeUnknown extends MisfortuneAtTheKeep {
  static readonly fortune = 411;
  constructor(t: Tidings, url: string) { super(t, url, 'thy missive bore no measure of its girth'); }
}

/** 412 Precondition Failed — the prophecies upon thy seals were not fulfilled. */
export class PropheciesUnfulfilled extends MisfortuneAtTheKeep {
  static readonly fortune = 412;
  constructor(t: Tidings, url: string) { super(t, url, 'the prophecies upon thy seals were not fulfilled'); }
}

/** 413 Payload Too Large — thy missive proved too heavy for the keep's table. */
export class MissiveTooHeavy extends MisfortuneAtTheKeep {
  static readonly fortune = 413;
  constructor(t: Tidings, url: string) { super(t, url, 'thy missive proved too heavy for the keep’s table'); }
}

/** 414 URI Too Long — the route inscribed upon thy missive ran beyond the parchment. */
export class OverlongInscription extends MisfortuneAtTheKeep {
  static readonly fortune = 414;
  constructor(t: Tidings, url: string) { super(t, url, 'the route inscribed upon thy missive ran beyond the parchment'); }
}

/** 415 Unsupported Media Type — the keep spoke not the tongue of thy missive. */
export class UnreadableTongue extends MisfortuneAtTheKeep {
  static readonly fortune = 415;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep spoke not the tongue of thy missive'); }
}

/** 416 Range Not Satisfiable — thou hast asked for pages beyond the book. */
export class BeyondTheMargins extends MisfortuneAtTheKeep {
  static readonly fortune = 416;
  constructor(t: Tidings, url: string) { super(t, url, 'thou hast asked for pages beyond the book'); }
}

/** 417 Expectation Failed — the oaths sworn upon thy seal could not be kept. */
export class OathsBroken extends MisfortuneAtTheKeep {
  static readonly fortune = 417;
  constructor(t: Tidings, url: string) { super(t, url, 'the oaths sworn upon thy seal could not be kept'); }
}

/** 418 I'm a teapot — the keep is, in fact, an earthen pot for the brewing of tea. */
export class KeepIsAnEarthenPot extends MisfortuneAtTheKeep {
  static readonly fortune = 418;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep is, in truth, but an earthen pot for the brewing of tea'); }
}

/** 421 Misdirected Request — the messenger arrived at the wrong gate. */
export class MessengerLostHisWay extends MisfortuneAtTheKeep {
  static readonly fortune = 421;
  constructor(t: Tidings, url: string) { super(t, url, 'the messenger arrived at the wrong gate'); }
}

/** 422 Unprocessable Entity — the missive was readable, but its meaning unknowable. */
export class IllegibleMissive extends MisfortuneAtTheKeep {
  static readonly fortune = 422;
  constructor(t: Tidings, url: string) { super(t, url, 'the missive was readable, yet its meaning unknowable'); }
}

/** 423 Locked — the chamber thou seekest is held behind a portcullis. */
export class Portcullised extends MisfortuneAtTheKeep {
  static readonly fortune = 423;
  constructor(t: Tidings, url: string) { super(t, url, 'the chamber thou seekest is held behind a portcullis'); }
}

/** 424 Failed Dependency — an alliance upon which thy quest depended hath broken. */
export class BrokenAlliance extends MisfortuneAtTheKeep {
  static readonly fortune = 424;
  constructor(t: Tidings, url: string) { super(t, url, 'an alliance upon which thy quest depended hath broken'); }
}

/** 425 Too Early — thou hast arrived ere the cock hath crowed. */
export class ArrivedBeforeDawn extends MisfortuneAtTheKeep {
  static readonly fortune = 425;
  constructor(t: Tidings, url: string) { super(t, url, 'thou hast arrived ere the cock hath crowed'); }
}

/** 426 Upgrade Required — thy tongue is outmoded; the keep speaks a newer one. */
export class OutmodedTongue extends MisfortuneAtTheKeep {
  static readonly fortune = 426;
  constructor(t: Tidings, url: string) { super(t, url, 'thy tongue is outmoded; the keep speaks a newer one'); }
}

/** 428 Precondition Required — a rite must be performed before thou mayst pass. */
export class RiteUnperformed extends MisfortuneAtTheKeep {
  static readonly fortune = 428;
  constructor(t: Tidings, url: string) { super(t, url, 'a rite must be performed ere thou mayst pass'); }
}

/** 429 Too Many Requests — thy pigeons have overwhelmed the keep's roost. */
export class PigeonsOverwhelmTheKeep extends MisfortuneAtTheKeep {
  static readonly fortune = 429;
  constructor(t: Tidings, url: string) { super(t, url, 'thy pigeons have overwhelmed the keep’s roost'); }
}

/** 431 Request Header Fields Too Large — thy wax seals weigh more than the missive itself. */
export class SealsTooHeavy extends MisfortuneAtTheKeep {
  static readonly fortune = 431;
  constructor(t: Tidings, url: string) { super(t, url, 'thy wax seals weigh more than the missive itself'); }
}

/** 451 Unavailable For Legal Reasons — the keep is forbidden by royal decree. */
export class ForbiddenByRoyalDecree extends MisfortuneAtTheKeep {
  static readonly fortune = 451;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep is forbidden by royal decree'); }
}

/* ─────────────────────────────────────────────────────────────────
 *  5xx — Misfortunes of the Keep
 *  (the keep itself faltered; eligible for valiantAttempts retries)
 * ───────────────────────────────────────────────────────────────── */

/** 500 Internal Server Error — chaos reigns within the keep. */
export class ChaosInTheKeep extends MisfortuneAtTheKeep {
  static readonly fortune = 500;
  constructor(t: Tidings, url: string) { super(t, url, 'chaos reigns within the keep'); }
}

/** 501 Not Implemented — the art thou askest hath not yet been mastered. */
export class ArtNotYetMastered extends MisfortuneAtTheKeep {
  static readonly fortune = 501;
  constructor(t: Tidings, url: string) { super(t, url, 'the art thou askest hath not yet been mastered'); }
}

/** 502 Bad Gateway — brigands have waylaid the messenger between gates. */
export class BrigandsAtTheGate extends MisfortuneAtTheKeep {
  static readonly fortune = 502;
  constructor(t: Tidings, url: string) { super(t, url, 'brigands have waylaid the messenger between gates'); }
}

/** 503 Service Unavailable — the keep is besieged and cannot answer. */
export class KeepBesieged extends MisfortuneAtTheKeep {
  static readonly fortune = 503;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep is besieged and cannot answer'); }
}

/** 504 Gateway Timeout — the gatekeeper hath vanished, and no answer returns. */
export class GateKeeperVanished extends MisfortuneAtTheKeep {
  static readonly fortune = 504;
  constructor(t: Tidings, url: string) { super(t, url, 'the gatekeeper hath vanished, and no answer returns'); }
}

/** 505 HTTP Version Not Supported — the ancient tongue is unknown to the keep. */
export class AncientTongueUnknown extends MisfortuneAtTheKeep {
  static readonly fortune = 505;
  constructor(t: Tidings, url: string) { super(t, url, 'the ancient tongue is unknown to the keep'); }
}

/** 506 Variant Also Negotiates — the keep's accords are misaligned. */
export class MisalignedAccord extends MisfortuneAtTheKeep {
  static readonly fortune = 506;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep’s accords are misaligned'); }
}

/** 507 Insufficient Storage — the keep's vaults are full to bursting. */
export class VaultsAreFull extends MisfortuneAtTheKeep {
  static readonly fortune = 507;
  constructor(t: Tidings, url: string) { super(t, url, 'the keep’s vaults are full to bursting'); }
}

/** 508 Loop Detected — thou art trapped in an enchanted labyrinth. */
export class EnchantedLabyrinth extends MisfortuneAtTheKeep {
  static readonly fortune = 508;
  constructor(t: Tidings, url: string) { super(t, url, 'thou art trapped in an enchanted labyrinth'); }
}

/** 510 Not Extended — the rite is incomplete; further oaths are required. */
export class RiteIncomplete extends MisfortuneAtTheKeep {
  static readonly fortune = 510;
  constructor(t: Tidings, url: string) { super(t, url, 'the rite is incomplete; further oaths are required'); }
}

/** 511 Network Authentication Required — the network sentry demands papers. */
export class NetworkSentryDemandsPapers extends MisfortuneAtTheKeep {
  static readonly fortune = 511;
  constructor(t: Tidings, url: string) { super(t, url, 'the network sentry demands papers'); }
}

/* ───────────────────────────────────────────────────── */

/** The dispatch table from HTTP status code to its themed error class. */
export const STATUS_TO_ERROR: Record<number, new (t: Tidings, url: string) => MisfortuneAtTheKeep> = {
  400: MalformedMissive,
  401: NoLetterOfPassage,
  402: CoinsRequired,
  403: BarredByTheSentry,
  404: KeepNotFound,
  405: UnsanctionedDeed,
  406: UnpalatableTerms,
  407: BridgeTrollDemandsPapers,
  408: HourglassRanDry,
  409: QuarrelsomeKeep,
  410: KeepAbandoned,
  411: MissiveSizeUnknown,
  412: PropheciesUnfulfilled,
  413: MissiveTooHeavy,
  414: OverlongInscription,
  415: UnreadableTongue,
  416: BeyondTheMargins,
  417: OathsBroken,
  418: KeepIsAnEarthenPot,
  421: MessengerLostHisWay,
  422: IllegibleMissive,
  423: Portcullised,
  424: BrokenAlliance,
  425: ArrivedBeforeDawn,
  426: OutmodedTongue,
  428: RiteUnperformed,
  429: PigeonsOverwhelmTheKeep,
  431: SealsTooHeavy,
  451: ForbiddenByRoyalDecree,
  500: ChaosInTheKeep,
  501: ArtNotYetMastered,
  502: BrigandsAtTheGate,
  503: KeepBesieged,
  504: GateKeeperVanished,
  505: AncientTongueUnknown,
  506: MisalignedAccord,
  507: VaultsAreFull,
  508: EnchantedLabyrinth,
  510: RiteIncomplete,
  511: NetworkSentryDemandsPapers,
};

/**
 * Build the right themed error for a given Tidings.
 *
 * Returns a specific subclass when the status code has a themed name, or
 * the base {@link MisfortuneAtTheKeep} for unrecognized codes.
 */
export function misfortuneFor(tidings: Tidings, url: string): MisfortuneAtTheKeep {
  const Ctor = STATUS_TO_ERROR[tidings.fortune];
  return Ctor ? new Ctor(tidings, url) : new MisfortuneAtTheKeep(tidings, url);
}
