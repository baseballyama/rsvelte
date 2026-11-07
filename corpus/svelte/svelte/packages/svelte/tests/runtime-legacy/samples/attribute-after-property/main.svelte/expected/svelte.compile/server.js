import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let step = "any";

	$$renderer.push(`<input${$.attributes({ type: 'range', ...{ step } }, void 0, void 0, void 0, 4)}/> <button>change step</button>`);
}