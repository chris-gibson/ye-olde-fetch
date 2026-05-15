import { getteth, postith, puttest, deleteth, MisfortuneAtTheKeep, type TomeInit } from 'ye-olde-fetch';
import type { VerbDoc, TomeInitField } from '../manifest.json';
import { el, stripWikiLinks, firstParagraph } from '../utils.js';
import { createParamsForm, type FormValues } from './ParamsForm.js';
import { createTidingsViewer } from './TidingsViewer.js';

const VERBS = { getteth, postith, puttest, deleteth };

export function createMethodCard(verb: VerbDoc, tomeInit: TomeInitField[]): HTMLElement {
  const form = createParamsForm(verb.name, tomeInit);
  const viewer = createTidingsViewer();
  const snippet = el('pre', { class: 'snippet' });

  function buildOpts(values: FormValues): TomeInit {
    const opts: any = {};
    if (verb.name !== 'getteth' && values.missive) opts.missive = values.missive;
    const seals = values.waxSeals.filter((s) => s.key.trim());
    if (seals.length) opts.waxSeals = Object.fromEntries(seals.map((s) => [s.key, s.value]));
    if (values.valiantAttempts && values.valiantAttempts !== 1) opts.valiantAttempts = values.valiantAttempts;
    if (values.betwixtMs && values.betwixtMs !== 250) opts.betwixtMs = values.betwixtMs;
    for (const k of ['letterOfPassage', 'archive', 'realm', 'detour'] as const) {
      const v = values[k];
      if (v) opts[k] = v;
    }
    return opts;
  }

  function updateSnippet() {
    const v = form.values;
    const opts = buildOpts(v);
    const optsStr = Object.keys(opts).length
      ? ', ' + JSON.stringify(opts, null, 2).replace(/^/gm, '').replace(/"([^"]+)":/g, '$1:')
      : '';
    snippet.textContent =
      `import { ${verb.name} } from 'ye-olde-fetch';\n\n` +
      `const tidings = await ${verb.name}('${v.url}'${optsStr});\n` +
      `const data = await tidings.readeAsTome();`;
  }

  async function send() {
    const fn = VERBS[verb.name] as (url: string, opts?: TomeInit) => Promise<any>;
    const opts = buildOpts(form.values);
    viewer.setSending();
    try {
      const tidings = await fn(form.values.url, opts);
      viewer.setTidings(tidings);
    } catch (e) {
      if (e instanceof MisfortuneAtTheKeep) viewer.setMisfortune(e);
      else viewer.setError(e instanceof Error ? e.message : String(e));
    }
  }

  const card = el('section', { class: 'method-card', id: 'verb-' + verb.name }, [
    el('header', { class: 'card-head' }, [
      el('h3', {}, [el('code', {}, [verb.name + '()'])]),
      el('p', { class: 'themed-summary' }, [stripWikiLinks(verb.themedSummary)]),
      el('p', { class: 'native-summary' }, [stripWikiLinks(verb.nativeSummary)]),
    ]),
    el('div', { class: 'card-body' }, [
      el('div', { class: 'col' }, [
        el('h4', {}, ['Try it out']),
        form.root,
        el('div', { class: 'actions' }, [
          el('button', { class: 'btn-primary', onclick: send }, ['Send forth!']),
          el('button', {
            class: 'btn-secondary',
            onclick: () => {
              updateSnippet();
              navigator.clipboard?.writeText(snippet.textContent || '');
            },
          }, ['Copy snippet']),
        ]),
        el('h4', {}, ['Snippet']),
        snippet,
      ]),
      el('div', { class: 'col' }, [
        el('h4', {}, ['Tidings']),
        viewer.root,
      ]),
    ]),
  ]);

  // Re-render snippet on any input change
  card.addEventListener('input', updateSnippet);
  card.addEventListener('change', updateSnippet);
  updateSnippet();

  return card;
}
