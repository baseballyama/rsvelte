import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await($$renderer, Promise.resolve(), () => {}, (value) => {
		$$renderer.push(`${$.escape(value)}`);
	});

	$$renderer.push(`<!--]-->`);
}