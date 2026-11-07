import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await(
		$$renderer,
		somePromise,
		() => {
			$$renderer.push(`<h1>Promise Pending</h1>`);
		},
		(value) => {
			$$renderer.push(`<h1>Promise Resolved ${$.escape(value)}</h1>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		somePromise,
		() => {
			$$renderer.push(`<h1>Promise Pending</h1>`);
		},
		(value) => {
			$$renderer.push(`<h1>Promise Resolved ${$.escape(value)}</h1>`);
		}
	);

	$$renderer.push(`<!--]-->`);
}