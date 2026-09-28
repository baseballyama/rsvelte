import * as $ from 'svelte/internal/server';

export default function Component($$renderer) {
	$.head('1wdpkwr', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Title</title>`);
		});
	});

	$$renderer.push(`<main>There should be one</main>`);
}