import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$.head('nz8tn8', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Site - Appwrite</title>`);
		});
	});

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}