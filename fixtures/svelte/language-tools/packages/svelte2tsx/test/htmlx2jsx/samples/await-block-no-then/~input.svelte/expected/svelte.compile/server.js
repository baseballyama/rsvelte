import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await(
		$$renderer,
		aPromise,
		() => {
			$$renderer.push(`<div>Spinner...</div>`);
		},
		() => {}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		aPromise,
		() => {
			$$renderer.push(`<div>Spinner...</div>`);
		},
		() => {}
	);

	$$renderer.push(`<!--]-->`);
}