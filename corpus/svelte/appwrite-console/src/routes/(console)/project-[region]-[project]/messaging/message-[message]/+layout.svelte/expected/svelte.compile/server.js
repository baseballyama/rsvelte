import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$.head('196ovx6', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Message - Appwrite</title>`);
		});
	});

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}