import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$.head('1v6snj2', $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="alternate" href="/path-base/rss.xml"/>`);
	});

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}