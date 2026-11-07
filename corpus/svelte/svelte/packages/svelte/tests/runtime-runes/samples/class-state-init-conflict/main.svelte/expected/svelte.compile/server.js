import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count = 0;
			#count;
			#_count;

			constructor(initial_count) {
				this.count = initial_count;
				this.#count = 100;
				this.#_count = 100;
			}
		}

		const counter = new Counter(0);

		$$renderer.push(`<button>${$.escape(counter.count)}</button>`);
	});
}