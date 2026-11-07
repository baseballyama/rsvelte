import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let promise;

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<p>Loading</p>`);
		},
		(data) => {
			$$renderer.push(`<p>Data: ${$.escape(data)}</p>`);
		}
	);

	$$renderer.push(`<!--]-->`);
}