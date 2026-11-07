import * as $ from 'svelte/internal/server';

export default function Red($$renderer) {
	function show(node) {
		return { duration: 500, css: (t) => `opacity: ${t}` };
	}

	$$renderer.push(`<div class="red"></div>`);
}