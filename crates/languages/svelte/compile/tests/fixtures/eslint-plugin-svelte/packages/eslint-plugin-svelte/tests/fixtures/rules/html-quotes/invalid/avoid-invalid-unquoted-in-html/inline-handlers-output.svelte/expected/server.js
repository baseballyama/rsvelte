import * as $ from 'svelte/internal/server';

export default function Inline_handlers_output($$renderer) {
	let m = { x: 0, y: 0 };

	$$renderer.push(`<div class="svelte-1m8xkuk">The mouse position is ${$.escape(m.x)} x ${$.escape(m.y)}</div>`);
}