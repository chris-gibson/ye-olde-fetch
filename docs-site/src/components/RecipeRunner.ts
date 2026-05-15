import { getteth, createYeOldeFetch, MisfortuneAtTheKeep } from 'ye-olde-fetch';
import { el } from '../utils.js';

interface Recipe {
  title: string;
  description: string;
  code: string;
  run: () => Promise<string>;
}

const recipes: Recipe[] = [
  {
    title: 'A bound servant with auth',
    description: 'Configure once, dispatch many quests. A shared Authorization seal rides on every request.',
    code: `const api = createYeOldeFetch({
  greatKeep: 'https://jsonplaceholder.typicode.com',
  waxSeals: { 'X-Custom': 'huzzah' },
});

const tidings = await api.getteth('/users/1');
const user = await tidings.readeAsTome();`,
    async run() {
      const api = createYeOldeFetch({
        greatKeep: 'https://jsonplaceholder.typicode.com',
        waxSeals: { 'X-Custom': 'huzzah' },
      });
      const tidings = await api.getteth('/users/1');
      const user = await tidings.readeAsTome();
      return JSON.stringify(user, null, 2);
    },
  },
  {
    title: 'Persisting through misfortune',
    description: 'Retries on 5xx with doubling backoff. 4xx is never retried (it is the caller’s misfortune, not transient).',
    code: `const tidings = await getteth('https://jsonplaceholder.typicode.com/posts/1', {
  valiantAttempts: 3,
  betwixtMs: 200,
});`,
    async run() {
      const tidings = await getteth('https://jsonplaceholder.typicode.com/posts/1', {
        valiantAttempts: 3,
        betwixtMs: 200,
      });
      return `fortune ${tidings.fortune}, didProsper=${tidings.didProsper}`;
    },
  },
  {
    title: 'Recalling the pigeon (abort)',
    description: 'Pass an AbortController via pigeonRecall. Abort cancels both the in-flight request and any pending retry backoff.',
    code: `const controller = new AbortController();
setTimeout(() => controller.abort(), 50);

await getteth('https://jsonplaceholder.typicode.com/posts/1', {
  pigeonRecall: controller,
});`,
    async run() {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 50);
      try {
        await getteth('https://jsonplaceholder.typicode.com/posts/1', {
          pigeonRecall: controller,
        });
        return 'request completed before abort';
      } catch (e) {
        return 'pigeon recalled: ' + (e instanceof Error ? e.name : String(e));
      }
    },
  },
  {
    title: 'Catching MisfortuneAtTheKeep',
    description: 'Non-2xx responses throw a themed error after retries exhaust. The full Tidings is still readable.',
    code: `try {
  await getteth('https://jsonplaceholder.typicode.com/this-doesnt-exist');
} catch (e) {
  if (e instanceof MisfortuneAtTheKeep) {
    console.log(e.fortune, e.url);
  }
}`,
    async run() {
      try {
        await getteth('https://jsonplaceholder.typicode.com/this-doesnt-exist');
        return 'unexpected success';
      } catch (e) {
        if (e instanceof MisfortuneAtTheKeep) {
          return `caught MisfortuneAtTheKeep: fortune=${e.fortune}, url=${e.url}`;
        }
        return 'caught: ' + (e instanceof Error ? e.message : String(e));
      }
    },
  },
];

export function createRecipeRunner(): HTMLElement {
  return el('div', { class: 'recipes' }, recipes.map((r) => {
    const out = el('pre', { class: 'recipe-output' }, [el('span', { class: 'muted' }, ['(not yet run)'])]);
    return el('section', { class: 'recipe' }, [
      el('h4', {}, [r.title]),
      el('p', { class: 'muted' }, [r.description]),
      el('pre', { class: 'snippet' }, [r.code]),
      el('div', { class: 'actions' }, [
        el('button', {
          class: 'btn-primary',
          onclick: async () => {
            out.innerHTML = '';
            out.appendChild(el('span', { class: 'sending' }, ['Running…']));
            try {
              const result = await r.run();
              out.innerHTML = '';
              out.appendChild(document.createTextNode(result));
            } catch (e) {
              out.innerHTML = '';
              out.appendChild(el('span', { class: 'ill' }, [e instanceof Error ? e.message : String(e)]));
            }
          },
        }, ['Run this recipe!']),
      ]),
      out,
    ]);
  }));
}
