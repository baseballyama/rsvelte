import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let promise = Promise.resolve();

	$$renderer.push(`<div class="a svelte-qoj5zv"></div> `);

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<div class="b svelte-qoj5zv"></div>`);
		},
		(value) => {
			$$renderer.push(`<div class="c svelte-qoj5zv"></div>`);
		}
	);

	$$renderer.push(`<!--]--> <div class="e svelte-qoj5zv"></div>`);
}