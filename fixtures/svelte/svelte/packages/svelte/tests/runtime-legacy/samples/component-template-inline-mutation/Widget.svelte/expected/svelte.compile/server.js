import * as $ from 'svelte/internal/server';

export default function Widget($$renderer) {
	let count = 0;

	$$renderer.push(`<button>${$.escape(count)}</button>`);
}