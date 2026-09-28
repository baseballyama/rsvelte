import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.head('r55nhh', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Some Title</title>`);
		});

		$$renderer.push(`<link rel="canonical" href="/"/> <meta name="description" content="some description"/> <meta name="keywords" content="some keywords"/>`);
	});

	$$renderer.push(`<div>Just a dummy page.</div>`);
}