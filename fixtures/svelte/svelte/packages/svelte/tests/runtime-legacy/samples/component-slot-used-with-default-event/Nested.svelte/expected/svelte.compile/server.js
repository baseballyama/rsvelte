import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	function click() {}

	$$renderer.push(`<p><!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<button>Should not appear</button>`);
	});

	$$renderer.push(`<!--]--></p>`);
}