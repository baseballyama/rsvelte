import * as $ from 'svelte/internal/server';

export default function Ts_promise01_type_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let promise = new Promise((resolve) => resolve({ a: 42 })); // promise: Promise<{ a: number; }>, Promise: PromiseConstructor, resolve: (value: { a: number; } | PromiseLike<{ a: number; }>) => void, resolve({a:42}): void

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