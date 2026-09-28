import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);

	$.slot($$renderer, $$props, 'foo', {}, () => {
		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'bar', {}, null);
		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(`<!--]--></div>`);
}