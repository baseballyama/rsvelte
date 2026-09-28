import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$.head('d7yfve', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Webhook - Appwrite</title>`);
		});
	});

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}