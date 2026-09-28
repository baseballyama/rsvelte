import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			#count = 1;

			double() {
				this.#count *= 2;
			}

			getCount() {
				return this.#count;
			}
		}

		const counter = new Counter();

		$$renderer.push(`<button>${$.escape(counter.getCount())}</button>`);
	});
}