import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let promise = Promise.resolve();

	$$renderer.push(`<div class="a svelte-saribc"></div> `);

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<div class="b svelte-saribc"></div>`);
		},
		(value) => {
			$$renderer.push(`<div class="c svelte-saribc"></div>`);
		}
	);

	$$renderer.push(`<!--]--> <div class="e svelte-saribc"></div>`);
}