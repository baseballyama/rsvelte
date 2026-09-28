import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$.head('4b9eaa', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>User - Appwrite</title>`);
		});
	});

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}