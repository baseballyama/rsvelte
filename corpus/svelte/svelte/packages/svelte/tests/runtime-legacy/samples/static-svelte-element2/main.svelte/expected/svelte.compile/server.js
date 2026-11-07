import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const p = 'p';

	$$renderer.push(`<div>`);
	$.element($$renderer, p);
	$$renderer.push(`</div>`);
}