# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — The First Quest

### Added
- Four themed verbs: `getteth`, `postith`, `puttest`, `deleteth`.
- `createYeOldeFetch` factory with `greatKeep`, default `waxSeals`, default retries, and an optional `towncrier` logger.
- `Tidings` response wrapper with `fortune`, `waxSeals`, `didProsper`, `metMisfortune`, and `readeAsTome` / `readeAsParchment` / `readeAsRunes` readers.
- `MisfortuneAtTheKeep` error class thrown on non-2xx after retries exhaust, plus 40 themed status-code subclasses (e.g. `KeepNotFound` for 404, `BrigandsAtTheGate` for 502, `PigeonsOverwhelmTheKeep` for 429). Every subclass extends the base so a single catch still handles them all.
- `STATUS_TO_ERROR` dispatch table and `misfortuneFor(tidings, url)` factory for building the right themed error from a Tidings.
- `pigeonRecall` option for `AbortController` cancellation, honored both in-flight and during retry backoff.
- `valiantAttempts` + `betwixtMs` with doubling backoff; retries on 5xx and network errors, never on 4xx.
- Full themed `TomeInit` surface: `missive`, `waxSeals`, `letterOfPassage`, `archive`, `realm`, `detour`, `whence`, `oath`, `enduring`.
- ESM-only build via `tsup`, full `.d.ts`, Node ≥ 18.
