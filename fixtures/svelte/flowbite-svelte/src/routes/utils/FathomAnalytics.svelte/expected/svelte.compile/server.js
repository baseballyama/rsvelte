import * as $ from 'svelte/internal/server';

export default function FathomAnalytics($$renderer, $$props) {
	let { FATHOM_ID = "" } = $$props;

	$.head('m1cvrr', $$renderer, ($$renderer) => {
		$$renderer.push(`<script src="https://cdn.usefathom.com/script.js"${$.attr('data-site', FATHOM_ID)} defer=""></script>`);
		$$renderer.push(`<!---->`);
	});

	if (!FATHOM_ID) {
		$$renderer.push(`<!--[0--><h2>You need to provide FATHOM_ID in .env file.</h2>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}