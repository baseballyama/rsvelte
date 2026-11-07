import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			#count;

			constructor(initial_count) {
				this.#count = { a: initial_count };
			}

			get count() {
				return this.#count;
			}

			set count(val) {
				this.#count = val;
			}
		}

		const counter = new Counter(0);

		$$renderer.push(`<button>${$.escape(counter.count.a)}</button>`);
	});
}