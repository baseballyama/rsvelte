import * as $ from 'svelte/internal/server';

export default function A($$renderer) {
	$.head('zzwr0v', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>A</title>`);
		});
	});
}