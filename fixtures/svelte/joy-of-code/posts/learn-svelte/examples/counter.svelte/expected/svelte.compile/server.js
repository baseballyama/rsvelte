import * as $ from 'svelte/internal/server';

export default function Counter($$renderer) {
	let count = 0;

	$$renderer.push(`<div class="container"><button>Count: ${$.escape(count)}</button></div>`);
}