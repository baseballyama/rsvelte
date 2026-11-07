import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let promise = Promise.resolve();

	$$renderer.push(`<div class="a svelte-19m6ymp"></div> `);

	$.await($$renderer, promise, () => {}, (value) => {
		$$renderer.push(`<div class="b svelte-19m6ymp"></div>`);
	});

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<div class="d svelte-19m6ymp"></div>`);
		},
		() => {}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<div class="f svelte-19m6ymp"></div>`);
		},
		(error) => {
			$$renderer.push(`<div class="g svelte-19m6ymp"></div>`);
		}
	);

	$$renderer.push(`<!--]--> <div class="h svelte-19m6ymp"></div>`);
}