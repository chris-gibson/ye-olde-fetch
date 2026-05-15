import type { TomeInitField } from '../manifest.json';
import { el, NATIVE_FOR } from '../utils.js';

export interface FormValues {
  url: string;
  missive: string;
  waxSeals: Array<{ key: string; value: string }>;
  valiantAttempts: number;
  betwixtMs: number;
  letterOfPassage: string;
  archive: string;
  realm: string;
  detour: string;
}

const ENUMS: Record<string, string[]> = {
  letterOfPassage: ['', 'omit', 'same-origin', 'include'],
  archive: ['', 'default', 'no-store', 'reload', 'no-cache', 'force-cache', 'only-if-cached'],
  realm: ['', 'cors', 'no-cors', 'same-origin'],
  detour: ['', 'follow', 'error', 'manual'],
};

export function createParamsForm(
  verb: 'getteth' | 'postith' | 'puttest' | 'deleteth',
  tomeInit: TomeInitField[],
  defaults: Partial<FormValues> = {},
) {
  const values: FormValues = {
    url: defaults.url ?? 'https://jsonplaceholder.typicode.com/posts/1',
    missive: defaults.missive ?? (verb === 'postith' || verb === 'puttest' ? '{"title":"huzzah","body":"hark"}' : ''),
    waxSeals: defaults.waxSeals ?? (verb === 'postith' || verb === 'puttest' ? [{ key: 'Content-Type', value: 'application/json' }] : []),
    valiantAttempts: defaults.valiantAttempts ?? 1,
    betwixtMs: defaults.betwixtMs ?? 250,
    letterOfPassage: defaults.letterOfPassage ?? '',
    archive: defaults.archive ?? '',
    realm: defaults.realm ?? '',
    detour: defaults.detour ?? '',
  };

  const root = el('div', { class: 'params-form' });

  function rerender() {
    root.innerHTML = '';

    root.appendChild(field('URL (destination keep)', 'url', input('text', values.url, (v) => (values.url = v))));

    if (verb !== 'getteth') {
      root.appendChild(field('missive (body)', 'missive', textarea(values.missive, (v) => (values.missive = v))));
    }

    root.appendChild(sealsEditor());

    root.appendChild(field('valiantAttempts', 'valiantAttempts', input('number', String(values.valiantAttempts), (v) => (values.valiantAttempts = Number(v) || 1))));
    root.appendChild(field('betwixtMs', 'betwixtMs', input('number', String(values.betwixtMs), (v) => (values.betwixtMs = Number(v) || 250))));

    for (const k of ['letterOfPassage', 'archive', 'realm', 'detour'] as const) {
      root.appendChild(field(k, k, select(ENUMS[k]!, (values as any)[k], (v) => ((values as any)[k] = v))));
    }
  }

  function field(label: string, themedKey: string, control: HTMLElement): HTMLElement {
    const fieldDoc = tomeInit.find((f) => f.themed === themedKey || f.themed === label);
    const native = NATIVE_FOR[themedKey];
    return el('div', { class: 'field' }, [
      el('label', {}, [
        el('span', { class: 'label-themed' }, [label]),
        native ? el('span', { class: 'label-native' }, ['→ ' + native]) : null,
      ]),
      control,
      fieldDoc ? el('p', { class: 'field-help' }, [fieldDoc.description.split('\n\n')[0] ?? '']) : null,
    ]);
  }

  function input(type: string, value: string, onInput: (v: string) => void): HTMLInputElement {
    const i = el('input', { type, value });
    i.addEventListener('input', () => onInput(i.value));
    return i;
  }

  function textarea(value: string, onInput: (v: string) => void): HTMLTextAreaElement {
    const t = el('textarea', { rows: 4 });
    t.value = value;
    t.addEventListener('input', () => onInput(t.value));
    return t;
  }

  function select(options: string[], value: string, onChange: (v: string) => void): HTMLSelectElement {
    const s = el('select');
    for (const o of options) {
      const opt = el('option', { value: o }, [o || '(default)']);
      if (o === value) opt.setAttribute('selected', 'selected');
      s.appendChild(opt);
    }
    s.addEventListener('change', () => onChange(s.value));
    return s;
  }

  function sealsEditor(): HTMLElement {
    const list = el('div', { class: 'seals-editor' });
    function renderRows() {
      list.innerHTML = '';
      values.waxSeals.forEach((seal, idx) => {
        const k = el('input', { type: 'text', placeholder: 'header name', value: seal.key });
        const v = el('input', { type: 'text', placeholder: 'value', value: seal.value });
        k.addEventListener('input', () => (values.waxSeals[idx]!.key = k.value));
        v.addEventListener('input', () => (values.waxSeals[idx]!.value = v.value));
        const remove = el('button', {
          class: 'btn-tiny',
          onclick: () => {
            values.waxSeals.splice(idx, 1);
            renderRows();
          },
        }, ['×']);
        list.appendChild(el('div', { class: 'seal-row' }, [k, v, remove]));
      });
      list.appendChild(el('button', {
        class: 'btn-small',
        onclick: () => {
          values.waxSeals.push({ key: '', value: '' });
          renderRows();
        },
      }, ['+ Add wax seal']));
    }
    renderRows();
    return el('div', { class: 'field' }, [
      el('label', {}, [
        el('span', { class: 'label-themed' }, ['waxSeals (headers)']),
        el('span', { class: 'label-native' }, ['→ headers']),
      ]),
      list,
    ]);
  }

  rerender();

  return { root, get values() { return values; } };
}
