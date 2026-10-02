import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await($$renderer, somePromise, () => {}, (value) => {
		$$renderer.push(`<h1>Promise Pending</h1>`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, somePromise, () => {}, (value) => {
		$$renderer.push(`<h1>Promise Pending</h1>`);
	});

	$$renderer.push(`<!--]-->`);
}