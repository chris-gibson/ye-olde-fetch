import { createYeOldeFetch, MisfortuneAtTheKeep, type TomeInit } from 'ye-olde-fetch';
import { el } from '../utils.js';
import { createTidingsViewer } from './TidingsViewer.js';

type Seal = { key: string; value: string };
type Verb = 'getteth' | 'postith' | 'puttest' | 'deleteth';

export function createFactoryBuilder(): HTMLElement {
  const config = {
    greatKeep: 'https://jsonplaceholder.typicode.com',
    waxSeals: [{ key: 'X-Realm', value: 'fae' }] as Seal[],
    valiantAttempts: 1,
    betwixtMs: 250,
    towncrier: false,
  };

  const call = {
    verb: 'getteth' as Verb,
    path: '/posts/1',
    missive: '',
    overrideValiantAttempts: '' as string | '',
    extraWaxSeals: [] as Seal[],
  };

  const snippet = el('pre', { class: 'snippet' });
  const viewer = createTidingsViewer();

  function nonEmptySeals(seals: Seal[]): Record<string, string> | null {
    const real = seals.filter((s) => s.key.trim());
    if (!real.length) return null;
    return Object.fromEntries(real.map((s) => [s.key, s.value]));
  }

  function buildConfig() {
    const waxSeals = nonEmptySeals(config.waxSeals);
    return {
      greatKeep: config.greatKeep || undefined,
      waxSeals: waxSeals ?? undefined,
      valiantAttempts: config.valiantAttempts,
      betwixtMs: config.betwixtMs,
      towncrier: config.towncrier,
    };
  }

  function buildCallOpts(): TomeInit {
    const opts: TomeInit = {};
    const extraSeals = nonEmptySeals(call.extraWaxSeals);
    if (extraSeals) opts.waxSeals = extraSeals;
    if (call.overrideValiantAttempts !== '') {
      opts.valiantAttempts = Number(call.overrideValiantAttempts);
    }
    if (call.verb !== 'getteth' && call.missive) opts.missive = call.missive;
    return opts;
  }

  function formatObject(obj: Record<string, unknown>, indent = '  '): string {
    const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
    if (!entries.length) return '{}';
    const lines = entries.map(([k, v]) => {
      let val: string;
      if (typeof v === 'string') val = `'${v.replace(/'/g, "\\'")}'`;
      else if (typeof v === 'boolean' || typeof v === 'number') val = String(v);
      else val = JSON.stringify(v);
      return `${indent}${k}: ${val},`;
    });
    return `{\n${lines.join('\n')}\n${indent.slice(2)}}`;
  }

  function updateSnippet() {
    const cfg = buildConfig();
    const cfgClean: Record<string, unknown> = {};
    if (cfg.greatKeep) cfgClean.greatKeep = cfg.greatKeep;
    if (cfg.waxSeals) cfgClean.waxSeals = cfg.waxSeals;
    if (cfg.valiantAttempts !== 1) cfgClean.valiantAttempts = cfg.valiantAttempts;
    if (cfg.betwixtMs !== 250) cfgClean.betwixtMs = cfg.betwixtMs;
    if (cfg.towncrier) cfgClean.towncrier = cfg.towncrier;

    const opts = buildCallOpts();
    const optsHasContent = Object.keys(opts).length > 0;

    let s = `import { createYeOldeFetch } from 'ye-olde-fetch';\n\n`;
    s += `const api = createYeOldeFetch(${formatObject(cfgClean)});\n\n`;
    if (optsHasContent) {
      s += `const tidings = await api.${call.verb}('${call.path}', ${formatObject(opts as Record<string, unknown>)});\n`;
    } else {
      s += `const tidings = await api.${call.verb}('${call.path}');\n`;
    }
    s += `const data = await tidings.readeAsTome();`;
    snippet.textContent = s;
  }

  async function send() {
    const api = createYeOldeFetch(buildConfig());
    const fn = api[call.verb] as (url: string, opts?: TomeInit) => Promise<any>;
    viewer.setSending();
    try {
      const tidings = await fn(call.path, buildCallOpts());
      viewer.setTidings(tidings);
    } catch (e) {
      if (e instanceof MisfortuneAtTheKeep) viewer.setMisfortune(e);
      else viewer.setError(e instanceof Error ? e.message : String(e));
    }
  }

  function textInput(value: string, placeholder: string, onChange: (v: string) => void) {
    const i = el('input', { type: 'text', value, placeholder });
    i.addEventListener('input', () => { onChange(i.value); updateSnippet(); });
    return i;
  }
  function numberInput(value: number | string, placeholder: string, onChange: (v: string) => void) {
    const i = el('input', { type: 'number', placeholder });
    i.value = String(value);
    i.addEventListener('input', () => { onChange(i.value); updateSnippet(); });
    return i;
  }
  function selectInput<T extends string>(options: T[], value: T, onChange: (v: T) => void) {
    const s = el('select');
    for (const o of options) {
      const opt = el('option', { value: o }, [o]);
      if (o === value) opt.setAttribute('selected', 'selected');
      s.appendChild(opt);
    }
    s.addEventListener('change', () => { onChange(s.value as T); updateSnippet(); });
    return s;
  }
  function textarea(value: string, placeholder: string, onChange: (v: string) => void) {
    const t = el('textarea', { rows: 3, placeholder });
    t.value = value;
    t.addEventListener('input', () => { onChange(t.value); updateSnippet(); });
    return t;
  }

  function sealsEditor(seals: Seal[]): HTMLElement {
    const list = el('div', { class: 'seals-editor' });
    function renderRows() {
      list.innerHTML = '';
      seals.forEach((seal, idx) => {
        const k = el('input', { type: 'text', placeholder: 'header name', value: seal.key });
        const v = el('input', { type: 'text', placeholder: 'value', value: seal.value });
        k.addEventListener('input', () => { seals[idx]!.key = k.value; updateSnippet(); });
        v.addEventListener('input', () => { seals[idx]!.value = v.value; updateSnippet(); });
        const remove = el('button', {
          class: 'btn-tiny',
          type: 'button',
          onclick: () => { seals.splice(idx, 1); renderRows(); updateSnippet(); },
        }, ['×']);
        list.appendChild(el('div', { class: 'seal-row' }, [k, v, remove]));
      });
      list.appendChild(el('button', {
        class: 'btn-small',
        type: 'button',
        onclick: () => { seals.push({ key: '', value: '' }); renderRows(); updateSnippet(); },
      }, ['+ Add wax seal']));
    }
    renderRows();
    return list;
  }

  const towncrierCb = el('input', { type: 'checkbox' });
  towncrierCb.addEventListener('change', () => { config.towncrier = towncrierCb.checked; updateSnippet(); });

  // Build re-rendered field on missive show/hide
  const missiveField = el('div', { class: 'field' }, [
    el('label', {}, [
      el('span', { class: 'label-themed' }, ['missive']),
      el('span', { class: 'label-native' }, ['→ body']),
    ]),
    textarea(call.missive, '{"name":"Aldric"}', (v) => (call.missive = v)),
  ]);

  function updateMissiveVisibility() {
    missiveField.style.display = call.verb === 'getteth' ? 'none' : '';
  }
  updateMissiveVisibility();

  const root = el('section', { class: 'factory-builder', id: 'factory' }, [
    el('header', { class: 'card-head' }, [
      el('h3', {}, [el('code', {}, ['createYeOldeFetch()'])]),
      el('p', { class: 'themed-summary' }, ['A bound servant — configure once, dispatch many quests.']),
      el('p', { class: 'native-summary' }, ['Per-call options always win. waxSeals are merged with per-call seals winning on collision.']),
    ]),
    el('div', { class: 'card-body' }, [
      el('div', { class: 'col' }, [
        el('h4', {}, ['Configure thy servant']),
        el('div', { class: 'field' }, [
          el('label', {}, [
            el('span', { class: 'label-themed' }, ['greatKeep']),
            el('span', { class: 'label-native' }, ['→ base URL']),
          ]),
          textInput(config.greatKeep, 'https://api.example.com', (v) => (config.greatKeep = v)),
          el('p', { class: 'field-help' }, ['Prepended to relative paths. Absolute URLs bypass it.']),
        ]),
        el('div', { class: 'field' }, [
          el('label', {}, [
            el('span', { class: 'label-themed' }, ['waxSeals (default)']),
            el('span', { class: 'label-native' }, ['→ headers (merged per call)']),
          ]),
          sealsEditor(config.waxSeals),
        ]),
        el('div', { class: 'field' }, [
          el('label', {}, [el('span', { class: 'label-themed' }, ['valiantAttempts'])]),
          numberInput(config.valiantAttempts, '1', (v) => (config.valiantAttempts = Number(v) || 1)),
          el('p', { class: 'field-help' }, ['Default retry count for this instance. 1 means no retry.']),
        ]),
        el('div', { class: 'field' }, [
          el('label', {}, [el('span', { class: 'label-themed' }, ['betwixtMs'])]),
          numberInput(config.betwixtMs, '250', (v) => (config.betwixtMs = Number(v) || 250)),
          el('p', { class: 'field-help' }, ['Base delay between attempts. Doubles each retry.']),
        ]),
        el('div', { class: 'field' }, [
          el('label', { class: 'checkbox-label' }, [
            towncrierCb,
            el('span', {}, ['towncrier (log requests/responses)']),
          ]),
        ]),

        el('h4', {}, ['Try a quest']),
        el('div', { class: 'field' }, [
          el('label', {}, [el('span', { class: 'label-themed' }, ['verb'])]),
          selectInput<Verb>(['getteth', 'postith', 'puttest', 'deleteth'], call.verb, (v) => {
            call.verb = v;
            updateMissiveVisibility();
          }),
        ]),
        el('div', { class: 'field' }, [
          el('label', {}, [el('span', { class: 'label-themed' }, ['path (relative to greatKeep)'])]),
          textInput(call.path, '/users/1', (v) => (call.path = v)),
        ]),
        missiveField,

        el('h4', {}, ['Per-call overrides']),
        el('p', { class: 'field-help' }, ['These ride atop the factory defaults. Per-call values win.']),
        el('div', { class: 'field' }, [
          el('label', {}, [el('span', { class: 'label-themed' }, ['valiantAttempts (override)'])]),
          (() => {
            const i = el('input', { type: 'number', placeholder: 'leave blank to use factory default' });
            i.addEventListener('input', () => { call.overrideValiantAttempts = i.value; updateSnippet(); });
            return i;
          })(),
        ]),
        el('div', { class: 'field' }, [
          el('label', {}, [
            el('span', { class: 'label-themed' }, ['waxSeals (extra)']),
            el('span', { class: 'label-native' }, ['→ merged with factory seals']),
          ]),
          sealsEditor(call.extraWaxSeals),
        ]),

        el('div', { class: 'actions' }, [
          el('button', { class: 'btn-primary', type: 'button', onclick: send }, ['Send forth!']),
          el('button', {
            class: 'btn-secondary',
            type: 'button',
            onclick: () => {
              updateSnippet();
              navigator.clipboard?.writeText(snippet.textContent || '');
            },
          }, ['Copy snippet']),
        ]),
      ]),
      el('div', { class: 'col' }, [
        el('h4', {}, ['Generated code']),
        snippet,
        el('h4', {}, ['Tidings']),
        viewer.root,
      ]),
    ]),
  ]);

  updateSnippet();
  return root;
}
