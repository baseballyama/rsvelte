import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let promise = Promise.resolve();

	$$renderer.push(`<div class="a svelte-1x9swqa"></div> `);

	$.await($$renderer, promise, () => {}, (value) => {
		$$renderer.push(`<div class="b svelte-1x9swqa"></div>`);
	});

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<div class="d svelte-1x9swqa"></div>`);
		},
		() => {}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<div class="f svelte-1x9swqa"></div>`);
		},
		(error) => {
			$$renderer.push(`<div class="g svelte-1x9swqa"></div>`);
		}
	);

	$$renderer.push(`<!--]--> <div class="h svelte-1x9swqa"></div>`);
}