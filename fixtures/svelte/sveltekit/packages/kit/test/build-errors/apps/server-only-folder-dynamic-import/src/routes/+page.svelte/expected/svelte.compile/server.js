import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	const mod = import('#lib/blah/server/something/private.js');

	$.await($$renderer, mod, () => {}, (resolved) => {
		$$renderer.push(`<p>${$.escape(resolved.should_explode)}</p>`);
	});

	$$renderer.push(`<!--]-->`);
}