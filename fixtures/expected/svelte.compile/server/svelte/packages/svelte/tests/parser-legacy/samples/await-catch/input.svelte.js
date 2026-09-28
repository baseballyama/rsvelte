import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await(
		$$renderer,
		thePromise,
		() => {
			$$renderer.push(`<p>loading...</p>`);
		},
		() => {}
	);

	$$renderer.push(`<!--]-->`);
}