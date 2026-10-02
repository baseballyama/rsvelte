import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await(
		$$renderer,
		somePromise,
		() => {
			$$renderer.push(`<h1>Promise Pending</h1>`);
		},
		() => {}
	);

	$$renderer.push(`<!--]-->`);
}