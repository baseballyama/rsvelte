import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await(
		$$renderer,
		thePromise,
		() => {
			$$renderer.push(`loading`);
		},
		({ result, error }) => {
			$$renderer.push(`then`);
		}
	);

	$$renderer.push(`<!--]-->`);
}