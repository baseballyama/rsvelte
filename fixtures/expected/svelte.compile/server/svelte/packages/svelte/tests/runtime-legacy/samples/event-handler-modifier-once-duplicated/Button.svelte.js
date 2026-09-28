import * as $ from 'svelte/internal/server';

export default function Button($$renderer) {
	let count = 0;

	$$renderer.push(`<button>${$.escape(count)}</button>`);
}