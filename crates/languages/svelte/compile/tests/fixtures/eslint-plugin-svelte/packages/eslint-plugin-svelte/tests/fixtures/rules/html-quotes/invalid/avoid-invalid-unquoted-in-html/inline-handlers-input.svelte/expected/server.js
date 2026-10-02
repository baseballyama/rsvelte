import * as $ from 'svelte/internal/server';

export default function Inline_handlers_input($$renderer) {
	let m = { x: 0, y: 0 };

	$$renderer.push(`<div class="svelte-5gzxax">The mouse position is ${$.escape(m.x)} x ${$.escape(m.y)}</div>`);
}