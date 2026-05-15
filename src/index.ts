/**
 * Ye Olde Fetch — a themed wrapper around `fetch`.
 *
 * - Throws {@link MisfortuneAtTheKeep} (or a code-specific subclass) on non-2xx
 *   responses (after retries exhaust).
 * - Configurable retries with doubling backoff via `valiantAttempts` and `betwixtMs`.
 * - Returns a {@link Tidings} wrapper instead of `Response`.
 * - Accepts an `AbortController` via `pigeonRecall`.
 *
 * Available as bare verbs ({@link getteth}, {@link postith}, {@link puttest},
 * {@link deleteth}) or via {@link createYeOldeFetch} for shared config.
 */

export { getteth, postith, puttest, deleteth } from './verbs.js';
export { createYeOldeFetch } from './factory.js';
export type { YeOldeFetchInstance } from './factory.js';
export { Tidings } from './tidings.js';
export type { TomeInit, YeOldeConfig } from './types.js';

/* Errors — base + every themed status-code subclass + dispatch helpers. */
export {
  MisfortuneAtTheKeep,
  STATUS_TO_ERROR,
  misfortuneFor,
  // 4xx
  MalformedMissive,
  NoLetterOfPassage,
  CoinsRequired,
  BarredByTheSentry,
  KeepNotFound,
  UnsanctionedDeed,
  UnpalatableTerms,
  BridgeTrollDemandsPapers,
  HourglassRanDry,
  QuarrelsomeKeep,
  KeepAbandoned,
  MissiveSizeUnknown,
  PropheciesUnfulfilled,
  MissiveTooHeavy,
  OverlongInscription,
  UnreadableTongue,
  BeyondTheMargins,
  OathsBroken,
  KeepIsAnEarthenPot,
  MessengerLostHisWay,
  IllegibleMissive,
  Portcullised,
  BrokenAlliance,
  ArrivedBeforeDawn,
  OutmodedTongue,
  RiteUnperformed,
  PigeonsOverwhelmTheKeep,
  SealsTooHeavy,
  ForbiddenByRoyalDecree,
  // 5xx
  ChaosInTheKeep,
  ArtNotYetMastered,
  BrigandsAtTheGate,
  KeepBesieged,
  GateKeeperVanished,
  AncientTongueUnknown,
  MisalignedAccord,
  VaultsAreFull,
  EnchantedLabyrinth,
  RiteIncomplete,
  NetworkSentryDemandsPapers,
} from './errors.js';
