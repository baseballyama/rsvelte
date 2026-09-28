import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$.head('380ha7', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Team - Appwrite</title>`);
		});
	});

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}