import manifest from './manifest.json';
import { el, NATIVE_FOR } from './utils.js';
import { createMethodCard } from './components/MethodCard.js';
import { createFactoryBuilder } from './components/FactoryBuilder.js';
import { createGlossaryTable } from './components/GlossaryTable.js';
import { createRecipeRunner } from './components/RecipeRunner.js';

const sections: { id: string; label: string }[] = [
  { id: 'hearye', label: 'Hear Ye, Hear Ye' },
  { id: 'verbs', label: 'The Four Verbs' },
  { id: 'factory', label: 'A Bound Servant' },
  { id: 'tidings', label: 'The Tidings' },
  { id: 'errors', label: 'Ill Tidings' },
  { id: 'glossary', label: 'The Glossary' },
  { id: 'recipes', label: 'Recipes' },
];

const app = document.getElementById('app')!;

const sidebar = el('aside', { class: 'sidebar' }, [
  el('h1', { class: 'sigil' }, ['Ye Olde Fetch']),
  el('p', { class: 'sigil-sub' }, ['the interactive spellbook']),
  el('nav', {}, sections.map((s) =>
    el('a', { href: '#' + s.id }, [s.label]),
  )),
  el('footer', { class: 'side-footer' }, [
    el('p', {}, ['ESM-only · Node ≥ 18']),
    el('p', {}, [el('a', { href: 'https://github.com/' }, ['GitHub'])]),
  ]),
]);

const corsBanner = el('div', { class: 'cors-banner' }, [
  'A herald’s warning: live requests run in your browser. Cross-origin keeps may refuse uninvited messengers.',
]);

const hearYe = el('section', { id: 'hearye', class: 'page-section hero' }, [
  el('h2', {}, ['Hear Ye, Hear Ye']),
  el('p', { class: 'lede' }, [
    'A themed envelope over the native fetch API. Same wire behavior, more whimsical surface. ',
    'Throws on non-2xx, retries with doubling backoff, and returns a tidy ',
    el('code', {}, ['Tidings']),
    ' wrapper instead of ',
    el('code', {}, ['Response']),
    '.',
  ]),
  el('p', {}, ['Every section below renders the library’s actual exports — every Try-It-Out invokes the real code.']),
]);

const verbsSection = el('section', { id: 'verbs', class: 'page-section' }, [
  el('h2', {}, ['The Four Verbs']),
  el('p', { class: 'muted' }, ['Each card runs against the real library. Default URLs hit jsonplaceholder.typicode.com so the first click works.']),
  ...manifest.verbs.map((v) => createMethodCard(v, manifest.tomeInit)),
]);

const factorySection = el('section', { id: 'factory-section', class: 'page-section' }, [
  el('h2', {}, ['A Bound Servant']),
  el('p', { class: 'muted' }, ['Configure a ye-olde-fetch instance with defaults baked in. Per-call options always win.']),
  createFactoryBuilder(),
]);

const tidingsSection = el('section', { id: 'tidings', class: 'page-section' }, [
  el('h2', {}, ['The Tidings']),
  el('p', {}, [manifest.tidings.description.split('\n\n')[0] ?? '']),
  el('h4', {}, ['Properties']),
  el('ul', { class: 'members' }, manifest.tidings.members.map((m) =>
    el('li', {}, [el('code', {}, [m.name]), ' — ', m.description]),
  )),
  el('h4', {}, ['Readers']),
  el('ul', { class: 'members' }, manifest.tidings.methods.map((m) =>
    el('li', {}, [el('code', {}, [m.name + '()']), ' — ', m.description]),
  )),
]);

const baseError = manifest.errors.find((e) => e.name === 'MisfortuneAtTheKeep');
const subclassErrors = manifest.errors.filter((e) => e.name !== 'MisfortuneAtTheKeep');

const errorSearch = el('input', { type: 'search', placeholder: 'Search by name, code, or theme…' });
const errorTbody = el('tbody');

function renderErrorTable() {
  const q = errorSearch.value.toLowerCase().trim();
  errorTbody.innerHTML = '';
  for (const e of subclassErrors) {
    const match = e.description.match(/^(\d{3})\s+([^—]+)—\s*(.+?)\.?$/s);
    const code = match ? match[1] : '';
    const httpName = match ? match[2]?.trim() : '';
    const themed = match ? match[3]?.trim() : e.description;
    if (q && ![e.name, code, httpName ?? '', themed ?? ''].join(' ').toLowerCase().includes(q)) continue;
    errorTbody.appendChild(el('tr', {}, [
      el('td', { class: 'code-cell' }, [code]),
      el('td', {}, [el('code', {}, [e.name])]),
      el('td', { class: 'http-name' }, [httpName ?? '']),
      el('td', { class: 'desc-cell' }, [themed ?? '']),
    ]));
  }
}

errorSearch.addEventListener('input', renderErrorTable);
renderErrorTable();

const errorsSection = el('section', { id: 'errors', class: 'page-section' }, [
  el('h2', {}, ['Ill Tidings']),
  baseError ? el('div', { class: 'error-card' }, [
    el('h3', {}, [el('code', {}, [baseError.name])]),
    el('p', {}, [baseError.description.split('\n\n')[0] ?? '']),
    el('h4', {}, ['Properties']),
    el('ul', { class: 'members' }, baseError.members.map((m) =>
      el('li', {}, [el('code', {}, [m.name]), ' — ', m.description]),
    )),
    el('p', { class: 'muted' }, [
      `Every status-code subclass below extends `,
      el('code', {}, ['MisfortuneAtTheKeep']),
      `, so a single catch block can still handle them all.`,
    ]),
  ]) : null,
  el('h3', { class: 'subhead' }, [`Status-code subclasses (${subclassErrors.length})`]),
  el('p', { class: 'muted' }, ['Each HTTP error code has a themed subclass with a story-shaped message.']),
  el('div', { class: 'glossary' }, [
    errorSearch,
    el('table', { class: 'glossary-table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', {}, ['Fortune']),
          el('th', {}, ['Class']),
          el('th', {}, ['HTTP name']),
          el('th', {}, ['Themed message']),
        ]),
      ]),
      errorTbody,
    ]),
  ]),
]);

const glossarySection = el('section', { id: 'glossary', class: 'page-section' }, [
  el('h2', {}, ['The Glossary']),
  el('p', { class: 'muted' }, ['Every themed key paired with its native fetch counterpart. Search to filter.']),
  createGlossaryTable(manifest.tomeInit),
]);

const recipesSection = el('section', { id: 'recipes', class: 'page-section' }, [
  el('h2', {}, ['Recipes']),
  el('p', { class: 'muted' }, ['Common patterns — runnable in this browser.']),
  createRecipeRunner(),
]);

const main = el('main', { class: 'main' }, [
  corsBanner,
  hearYe,
  verbsSection,
  factorySection,
  tidingsSection,
  errorsSection,
  glossarySection,
  recipesSection,
]);

app.appendChild(sidebar);
app.appendChild(main);
