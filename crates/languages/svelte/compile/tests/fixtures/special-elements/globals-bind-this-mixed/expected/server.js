import * as $ from 'svelte/internal/server';

export default function Globals_bind_this_mixed($$renderer) {
	let win = void 0;
	let n = 0;
	$$renderer.push(`<p>${$.escape(n)}</p>`);
}
