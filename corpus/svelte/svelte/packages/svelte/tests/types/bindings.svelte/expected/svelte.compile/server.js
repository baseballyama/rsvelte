import * as $ from 'svelte/internal/server';

export default function Bindings($$renderer) {
	let focused = false;

	$$renderer.push(`<input type="text"/> <textarea></textarea> <select></select> <div></div>`);
}