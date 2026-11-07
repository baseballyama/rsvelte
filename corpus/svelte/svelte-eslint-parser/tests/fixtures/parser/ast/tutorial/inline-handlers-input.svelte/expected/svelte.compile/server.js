import * as $ from 'svelte/internal/server';

export default function Inline_handlers_input($$renderer) {
	let m = { x: 0, y: 0 };

	function handleMousemove(event) {
		m.x = event.clientX;
		m.y = event.clientY;
	}

	$$renderer.push(`<div class="svelte-17o00mv">The mouse position is ${$.escape(m.x)} x ${$.escape(m.y)}</div>`);
}