import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await(
		$$renderer,
		thePromise,
		() => {
			$$renderer.push(`loading`);
		},
		([a, b]) => {
			$$renderer.push(`then`);
		}
	);

	$$renderer.push(`<!--]-->`);
}