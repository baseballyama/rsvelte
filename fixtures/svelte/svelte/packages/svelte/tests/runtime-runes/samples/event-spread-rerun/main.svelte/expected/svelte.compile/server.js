import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let rest = undefined;

	$$renderer.push(`<input${$.attributes({ ...rest }, void 0, void 0, void 0, 4)}/> ${$.escape(!rest ? rest = {} : false)}`);
}