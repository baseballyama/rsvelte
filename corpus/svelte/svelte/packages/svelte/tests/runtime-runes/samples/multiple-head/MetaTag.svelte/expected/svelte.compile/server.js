import * as $ from 'svelte/internal/server';

export default function MetaTag($$renderer) {
	let title = 'Hello world';
	let desc = 'Some description';

	$.head('119wqki', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Hello world</title>`);
		});

		$$renderer.push(`<meta name="description"${$.attr('content', desc)}/> <meta name="author" content="@svelteawesome"/>`);
	});
}