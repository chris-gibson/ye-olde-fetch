# Contributing

## Local setup

```bash
npm install
npm test
npm run build
```

## The theme-naming bar

If you introduce a new public option, method, or property:

1. **It must be themed.** The voice of the library is consistent — `body` is not an option name, `missive` is.
2. **Its JSDoc must include a plain-English line** stating the native fetch equivalent. The docs site reads this to populate the interactive glossary.
3. **The themed-to-native map** in `src/core.ts` is the single source of truth. If you add a passthrough option, add the entry there.

## Tests

`vitest` with a stubbed `globalThis.fetch`. Cover:

- The happy path (verb resolves to a `Tidings`).
- The throw path (`MisfortuneAtTheKeep` on non-2xx).
- Per-call config and factory defaults where applicable.
- Backoff timing via `vi.useFakeTimers()` for any retry change.

Run `npm test` before opening a PR.

## Style

- No emojis in source files.
- Prefer terse but vivid themed prose in JSDoc. The bit must land on the first read.
- Don't theme native concepts that callers never see (internal variables, private methods).
