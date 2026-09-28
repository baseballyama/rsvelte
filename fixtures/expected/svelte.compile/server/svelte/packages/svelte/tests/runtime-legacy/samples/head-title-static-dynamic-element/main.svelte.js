import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let x = 'sveltejs';

	$.head('aq8dss', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>changed</title>`);
		});

		$$renderer.push(`<meta name="twitter:creator" content="@sveltejs"/>`);
	});
}