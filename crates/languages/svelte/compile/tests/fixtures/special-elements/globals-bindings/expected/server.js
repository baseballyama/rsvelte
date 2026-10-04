import * as $ from 'svelte/internal/server';

export default function Globals_bindings($$renderer) {
	let w = 0;
	let scroll = 0;
	let online = true;
	let active = null;
	let visibility = "visible";
	let ratio = 1;
	$$renderer.push(`<p>${$.escape(w)} ${$.escape(scroll)} ${$.escape(online)} ${$.escape(active)} ${$.escape(visibility)} ${$.escape(ratio)}</p>`);
}
