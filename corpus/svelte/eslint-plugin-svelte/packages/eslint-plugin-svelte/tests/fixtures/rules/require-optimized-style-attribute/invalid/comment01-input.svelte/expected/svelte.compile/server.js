import * as $ from 'svelte/internal/server';

export default function Comment01_input($$renderer) {
	let color = 'blue';

	$$renderer.push(`<div style="font-size: 12px; /* comment */ color: blue;"></div>`);
}