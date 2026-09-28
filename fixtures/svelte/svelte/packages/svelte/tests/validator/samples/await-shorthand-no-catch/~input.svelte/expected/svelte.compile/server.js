import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let promise;

	$.await($$renderer, promise, () => {}, (data) => {
		$$renderer.push(`<p>Data: ${$.escape(data)}</p>`);
	});

	$$renderer.push(`<!--]-->`);
}