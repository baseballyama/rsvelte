import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.head('d1l7pt', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>changed</title>`);
		});

		$$renderer.push(`<meta name="twitter:creator" content="@sveltejs"/>`);
	});
}