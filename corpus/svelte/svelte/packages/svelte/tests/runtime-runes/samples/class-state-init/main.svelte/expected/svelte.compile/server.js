import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count = 0;

			constructor(initial_count) {
				this.count = initial_count;
			}
		}

		const counter = new Counter(0);

		$$renderer.push(`<button>${$.escape(counter.count)}</button>`);
	});
}