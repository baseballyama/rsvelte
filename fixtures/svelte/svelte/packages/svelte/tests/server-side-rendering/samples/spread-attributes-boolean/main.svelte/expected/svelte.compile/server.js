import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<input${$.attributes({ ...{ readonly: 1 } }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ ...{ readonly: 0 } }, void 0, void 0, void 0, 4)}/>`);
}