import * as $ from 'svelte/internal/server';
import Showcase from "./showcase.svelte";
import Docs from "./docs.svelte";

export default function _page($$renderer) {
	$.head('1uha8ag', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>svelte-fa - Tiny FontAwesome component for Svelte</title>`);
		});
	});

	$$renderer.push(`<div class="container my-4">`);
	Showcase($$renderer, {});
	$$renderer.push(`<!----> `);
	Docs($$renderer, {});
	$$renderer.push(`<!----></div>`);
}