import type { Tidings, MisfortuneAtTheKeep } from 'ye-olde-fetch';
import { el } from '../utils.js';

type ViewerState =
  | { kind: 'idle' }
  | { kind: 'sending'; attempt?: number; total?: number }
  | { kind: 'tidings'; tidings: Tidings }
  | { kind: 'misfortune'; error: MisfortuneAtTheKeep }
  | { kind: 'error'; message: string };

export function createTidingsViewer() {
  const root = el('div', { class: 'tidings-viewer' });
  render({ kind: 'idle' });

  function render(state: ViewerState) {
    root.innerHTML = '';
    if (state.kind === 'idle') {
      root.appendChild(el('p', { class: 'muted' }, ['Awaiting word from the keep…']));
      return;
    }
    if (state.kind === 'sending') {
      const text = state.attempt && state.total
        ? `Pigeon in flight (attempt ${state.attempt} of ${state.total})…`
        : 'Pigeon in flight…';
      root.appendChild(el('p', { class: 'sending' }, [text]));
      return;
    }
    if (state.kind === 'error') {
      root.appendChild(el('div', { class: 'panel ill' }, [
        el('h4', {}, ['Pigeon lost in the storm']),
        el('p', {}, [state.message]),
      ]));
      return;
    }
    if (state.kind === 'misfortune') {
      const { error } = state;
      root.appendChild(buildTidingsBody(error.tidings, true, error.message));
      return;
    }
    root.appendChild(buildTidingsBody(state.tidings, false));
  }

  function buildTidingsBody(t: Tidings, ill: boolean, message?: string): HTMLElement {
    const fortuneBadge = el('span', { class: 'badge ' + (ill ? 'ill' : 'good') }, [
      `fortune ${t.fortune}`,
    ]);
    const sealsList: HTMLElement[] = [];
    t.waxSeals.forEach((v, k) => sealsList.push(el('li', {}, [el('code', {}, [k + ': ' + v])])));

    const bodyArea = el('div', { class: 'body-area' }, [el('p', { class: 'muted' }, ['Body not yet read.'])]);
    const readBtn = el('button', {
      class: 'btn-small',
      onclick: async () => {
        try {
          const tome = await t.readeAsTome();
          bodyArea.innerHTML = '';
          bodyArea.appendChild(el('pre', {}, [JSON.stringify(tome, null, 2)]));
        } catch {
          try {
            const text = await t.readeAsParchment();
            bodyArea.innerHTML = '';
            bodyArea.appendChild(el('pre', {}, [text]));
          } catch (e) {
            bodyArea.innerHTML = '';
            bodyArea.appendChild(el('p', { class: 'muted' }, [String(e)]));
          }
        }
      },
    }, ['readeAsTome()']);
    const readTextBtn = el('button', {
      class: 'btn-small',
      onclick: async () => {
        const text = await t.readeAsParchment();
        bodyArea.innerHTML = '';
        bodyArea.appendChild(el('pre', {}, [text]));
      },
    }, ['readeAsParchment()']);

    return el('div', { class: 'panel ' + (ill ? 'ill' : 'good') }, [
      el('div', { class: 'row' }, [
        fortuneBadge,
        el('span', { class: ill ? 'badge ill-soft' : 'badge good-soft' }, [
          ill ? 'metMisfortune' : 'didProsper',
        ]),
      ]),
      message ? el('p', { class: 'misfortune-msg' }, [message]) : null,
      el('h5', {}, ['waxSeals (response headers)']),
      sealsList.length
        ? el('ul', { class: 'seals' }, sealsList)
        : el('p', { class: 'muted' }, ['(no headers)']),
      el('h5', {}, ['Body']),
      el('div', { class: 'row' }, [readBtn, readTextBtn]),
      bodyArea,
    ]);
  }

  return {
    root,
    setIdle: () => render({ kind: 'idle' }),
    setSending: (attempt?: number, total?: number) => render({ kind: 'sending', attempt, total }),
    setTidings: (tidings: Tidings) => render({ kind: 'tidings', tidings }),
    setMisfortune: (error: MisfortuneAtTheKeep) => render({ kind: 'misfortune', error }),
    setError: (message: string) => render({ kind: 'error', message }),
  };
}
