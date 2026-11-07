import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await($$renderer, somePromise, () => {}, (value) => {
		$$renderer.push(`<h1>Promise Resolved</h1>`);
	});

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		somePromise,
		() => {
			$$renderer.push(`<h1>Loading...</h1>`);
		},
		() => {
			$$renderer.push(`<h1>Promise Resolved</h1>`);
		}
	);

	$$renderer.push(`<!--]-->`);
}