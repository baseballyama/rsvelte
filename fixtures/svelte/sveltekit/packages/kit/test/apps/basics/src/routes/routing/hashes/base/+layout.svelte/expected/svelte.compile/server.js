import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$.head('obrx4g', $$renderer, ($$renderer) => {
		$$renderer.push(`<base href="/"/>`);
	});

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}