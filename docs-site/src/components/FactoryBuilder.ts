import { createYeOldeFetch, MisfortuneAtTheKeep, type YeOldeFetchInstance } from 'ye-olde-fetch';
import { el } from '../utils.js';
import { createTidingsViewer } from './TidingsViewer.js';

export function createFactoryBuilder(): HTMLElement {
  const config = {
    greatKeep: 'https://jsonplaceholder.typicode.com',
    auth: '',
    valiantAttempts: 1,
    betwixtMs: 250,
    towncrier: false,
  };

  const path = { value: '/posts/1' };

  const snippet = el('pre', { class: 'snippet' });
  const viewer = createTidingsViewer();

  function rebuild(): YeOldeFetchInstance {
    return createYeOldeFetch({
      greatKeep: config.greatKeep || undefined,
      waxSeals: config.auth ? { Authorization: config.auth } : undefined,
      valiantAttempts: config.valiantAttempts,
      betwixtMs: config.betwixtMs,
      towncrier: config.towncrier,
    });
  }

  function updateSnippet() {
    const cfgLines = [
      config.greatKeep ? `  greatKeep: '${config.greatKeep}',` : '',
      config.auth ? `  waxSeals: { Authorization: '${config.auth}' },` : '',
      config.valiantAttempts !== 1 ? `  valiantAttempts: ${config.valiantAttempts},` : '',
      config.betwixtMs !== 250 ? `  betwixtMs: ${config.betwixtMs},` : '',
      config.towncrier ? `  towncrier: true,` : '',
    ].filter(Boolean).join('\n');
    snippet.textContent =
      `import { createYeOldeFetch } from 'ye-olde-fetch';\n\n` +
      `const api = createYeOldeFetch({\n${cfgLines}\n});\n\n` +
      `const tidings = await api.getteth('${path.value}');\n` +
      `const data = await tidings.readeAsTome();`;
  }

  function numberInput(value: number, onChange: (v: number) => void) {
    const i = el('input', { type: 'number', value: String(value) });
    i.addEventListener('input', () => { onChange(Number(i.value) || 0); updateSnippet(); });
    return i;
  }

  function textInput(value: string, placeholder: string, onChange: (v: string) => void) {
    const i = el('input', { type: 'text', value, placeholder });
    i.addEventListener('input', () => { onChange(i.value); updateSnippet(); });
    return i;
  }

  const checkboxRef = el('input', { type: 'checkbox' });
  checkboxRef.addEventListener('change', () => { config.towncrier = checkboxRef.checked; updateSnippet(); });

  async function send() {
    const api = rebuild();
    viewer.setSending();
    try {
      const tidings = await api.getteth(path.value);
      viewer.setTidings(tidings);
    } catch (e) {
      if (e instanceof MisfortuneAtTheKeep) viewer.setMisfortune(e);
      else viewer.setError(e instanceof Error ? e.message : String(e));
    }
  }

  const root = el('section', { class: 'factory-builder', id: 'factory' }, [
    el('header', { class: 'card-head' }, [
      el('h3', {}, [el('code', {}, ['createYeOldeFetch()'])]),
      el('p', { class: 'themed-summary' }, ['A bound servant — configure once, dispatch many quests.']),
    ]),
    el('div', { class: 'card-body' }, [
      el('div', { class: 'col' }, [
        el('h4', {}, ['Configure thy servant']),
        el('div', { class: 'field' }, [
          el('label', {}, [el('span', { class: 'label-themed' }, ['greatKeep']), el('span', { class: 'label-native' }, ['→ base URL'])]),
          textInput(config.greatKeep, 'https://api.example.com', (v) => (config.greatKeep = v)),
        ]),
        el('div', { class: 'field' }, [
          el('label', {}, [el('span', { class: 'label-themed' }, ['Authorization seal']), el('span', { class: 'label-native' }, ['→ waxSeals.Authorization'])]),
          textInput(config.auth, 'Bearer abc', (v) => (config.auth = v)),
        ]),
        el('div', { class: 'field' }, [
          el('label', {}, [el('span', { class: 'label-themed' }, ['valiantAttempts'])]),
          numberInput(config.valiantAttempts, (v) => (config.valiantAttempts = v)),
        ]),
        el('div', { class: 'field' }, [
          el('label', {}, [el('span', { class: 'label-themed' }, ['betwixtMs'])]),
          numberInput(config.betwixtMs, (v) => (config.betwixtMs = v)),
        ]),
        el('div', { class: 'field' }, [
          el('label', { class: 'checkbox-label' }, [checkboxRef, ' towncrier (log requests/responses)']),
        ]),
        el('h4', {}, ['Try a quest']),
        el('div', { class: 'field' }, [
          el('label', {}, [el('span', { class: 'label-themed' }, ['Path (relative to greatKeep)'])]),
          textInput(path.value, '/users/1', (v) => (path.value = v)),
        ]),
        el('div', { class: 'actions' }, [
          el('button', { class: 'btn-primary', onclick: send }, ['Send forth!']),
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

  updateSnippet();
  return root;
}
