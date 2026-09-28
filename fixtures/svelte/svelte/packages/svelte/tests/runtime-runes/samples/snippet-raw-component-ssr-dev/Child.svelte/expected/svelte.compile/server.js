import * as $ from 'svelte/internal/server';

export default function Child($$renderer) {
	let count = 0;

	$$renderer.push(`<button>clicks: ${$.escape(count)}</button>`);
}