import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const disabled = { dIsAbLeD: false };
	const readonly = { readonly: false };
	const readOnly = { readOnly: false };

	$$renderer.push(`<button${$.attributes({ ...disabled })}>click me</button> <input${$.attributes({ ...readonly }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ ...readOnly }, void 0, void 0, void 0, 4)}/> <custom-element${$.attributes({ ...readonly }, void 0, void 0, void 0, 2)}></custom-element> <custom-element${$.attributes({ ...readOnly }, void 0, void 0, void 0, 2)}></custom-element> <svg${$.attributes({ ...readonly }, void 0, void 0, void 0, 3)}></svg> <svg${$.attributes({ ...readOnly }, void 0, void 0, void 0, 3)}></svg>`);
}