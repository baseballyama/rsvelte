import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count = 0;

			constructor(initial) {
				this.count = initial;
			}
		}

		const counter = new Counter(10);

		$$renderer.push(`<button>${$.escape(counter.count)}</button>`);
	});
}