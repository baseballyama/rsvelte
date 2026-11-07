import * as $ from 'svelte/internal/server';

export default function _4_input($$renderer) {
	$.await($$renderer, promise, () => {}, (value) => {
		$$renderer.push(`<p>The value is ${$.escape(value)}</p>`);
	});

	$$renderer.push(`<!--]-->`);
}