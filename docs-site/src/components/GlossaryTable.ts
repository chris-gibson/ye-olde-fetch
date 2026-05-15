import type { TomeInitField } from '../manifest.json';
import { el, NATIVE_FOR } from '../utils.js';

export function createGlossaryTable(tomeInit: TomeInitField[]): HTMLElement {
  const input = el('input', { type: 'search', placeholder: 'Search themed or native names…' });
  const tbody = el('tbody');

  function rerender() {
    const q = input.value.toLowerCase().trim();
    tbody.innerHTML = '';
    for (const f of tomeInit) {
      const native = NATIVE_FOR[f.themed] ?? '';
      if (q && !f.themed.toLowerCase().includes(q) && !native.toLowerCase().includes(q)) continue;
      tbody.appendChild(el('tr', {}, [
        el('td', {}, [el('code', {}, [f.themed])]),
        el('td', {}, [el('code', {}, [native])]),
        el('td', { class: 'type-cell' }, [el('code', {}, [f.type])]),
        el('td', { class: 'desc-cell' }, [f.description.split('\n\n')[0] ?? '']),
      ]));
    }
  }

  input.addEventListener('input', rerender);
  rerender();

  return el('div', { class: 'glossary' }, [
    input,
    el('table', { class: 'glossary-table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', {}, ['Themed']),
          el('th', {}, ['Native fetch key']),
          el('th', {}, ['Type']),
          el('th', {}, ['Description']),
        ]),
      ]),
      tbody,
    ]),
  ]);
}
