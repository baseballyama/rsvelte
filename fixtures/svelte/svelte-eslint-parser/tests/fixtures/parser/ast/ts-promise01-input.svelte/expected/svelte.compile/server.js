import * as $ from 'svelte/internal/server';

export default function Ts_promise01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let promise = new Promise((resolve) => resolve({ a: 42 }));

		$.await(
			$$renderer,
			promise,
			() => {
				$$renderer.push(`<p>...waiting</p>`);
			},
			(number) => {
				$$renderer.push(`<p>The number is ${$.escape(number.a)}</p>`);
			}
		);

		$$renderer.push(`<!--]-->`);
	});
}