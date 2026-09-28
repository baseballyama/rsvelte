import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function foo() {
			let x = 0;

			queueMicrotask(() => {
				x++;
			});

			return {
				wut() {
					return x;
				}
			};
		}

		const wut = foo().wut;
		const x = $.derived(wut);

		$$renderer.push(`<span>${$.escape(x())}</span>`);
	});
}