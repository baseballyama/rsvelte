import * as $ from 'svelte/internal/server';

export default function A($$renderer) {
	$.head('idjjbq', $$renderer, ($$renderer) => {
		$$renderer.push(`<meta name="description" content="A"/>`);
	});

	$$renderer.push(`<!---->A`);
}