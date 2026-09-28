import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			#count = 0;

			constructor() {}

			getCount() {
				return this.#count;
			}

			increment() {
				this.#count++;
			}
		}

		const counter = new Counter();

		$$renderer.push(`<button>${$.escape(counter.getCount())}</button>`);
	});
}