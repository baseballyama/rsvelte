import * as $ from 'svelte/internal/server';

export default function Head_only($$renderer) {
	$.head('85k2v7', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Hello</title>`);
		});
	});
}
