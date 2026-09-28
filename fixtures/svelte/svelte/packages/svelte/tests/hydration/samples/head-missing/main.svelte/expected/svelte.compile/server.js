import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.head('1w6zkw0', $$renderer, ($$renderer) => {
		$$renderer.push(`<meta name="description" content="some description"/> <meta name="keywords" content="some keywords"/>`);
	});

	$$renderer.push(`<div>Just a dummy page.</div>`);
}