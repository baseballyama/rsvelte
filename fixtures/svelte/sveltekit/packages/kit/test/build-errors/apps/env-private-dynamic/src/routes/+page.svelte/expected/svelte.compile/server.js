import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	const p = import('$app/env/private');

	$.await(
		$$renderer,
		p,
		() => {
			$$renderer.push(`<p>Awaiting...</p>`);
		},
		(envModule) => {
			$$renderer.push(`<p>${$.escape(envModule.SHOULD_EXPLODE)}</p>`);
		}
	);

	$$renderer.push(`<!--]-->`);
}