# Ye Olde Fetch

> _Hear ye, hear ye — a themed wrapper around `fetch`._

A thin, well-mannered envelope over the native `fetch` API. Same wire behavior, more whimsical surface. Throws on non-2xx, retries with doubling backoff, and returns a tidy `Tidings` wrapper instead of `Response`.

```bash
npm install ye-olde-fetch
```

## Thy First Quest

```ts
import { getteth } from 'ye-olde-fetch';

const tidings = await getteth('https://api.github.com/users/octocat');

console.log(tidings.fortune);              // 200
console.log(tidings.didProsper);           // true
const user = await tidings.readeAsTome();  // .json() under the hood
```

## A Bound Servant

```ts
import { createYeOldeFetch, MisfortuneAtTheKeep } from 'ye-olde-fetch';

const api = createYeOldeFetch({
  greatKeep: 'https://api.example.com',
  waxSeals: { Authorization: 'Bearer abc' },
  valiantAttempts: 3,
  towncrier: true,
});

try {
  const tidings = await api.postith('/users', {
    missive: JSON.stringify({ name: 'Aldric' }),
    waxSeals: { 'Content-Type': 'application/json' },
  });
  console.log(await tidings.readeAsTome());
} catch (e) {
  if (e instanceof MisfortuneAtTheKeep) {
    console.error(`The keep returned ${e.fortune}`);
  }
}
```

## The Full Spellbook

The complete API surface — every verb, every option, every error — is documented in the **interactive docs site**, where you can also run real requests from your browser.

→ See `docs-site/` in this repo, or run `npm run docs:dev` to launch it locally.

## Compatibility

- Node.js ≥ 18 (native `fetch`)
- Any modern browser with `fetch` + `AbortController`
- ESM only

## License

MIT
