import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<p>waiting for the promise to resolve...</p>`);
		},
		(value) => {
			$$renderer.push(`<p>The value is ${$.escape(value)}</p>`);
		}
	);

	$$renderer.push(`<!--]-->`);
}