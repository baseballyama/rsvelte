import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const x = Promise.resolve(10);

	$$renderer.push(`<div>`);

	$.await(
		$$renderer,
		x,
		() => {
			$$renderer.push(`Loading...`);
		},
		(x) => {
			$$renderer.push(`${$.escape(x)}`);
		}
	);

	$$renderer.push(`<!--]--></div>`);
}