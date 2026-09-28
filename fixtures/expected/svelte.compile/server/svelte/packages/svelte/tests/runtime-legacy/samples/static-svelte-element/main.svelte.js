import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div>`);
	$.element($$renderer, "p");
	$$renderer.push(`</div>`);
}