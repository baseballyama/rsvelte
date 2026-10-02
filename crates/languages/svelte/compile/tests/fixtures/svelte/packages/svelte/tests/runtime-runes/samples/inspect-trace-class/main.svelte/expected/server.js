import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			#count;

			constructor() {
				this.#count = 0;
			}

			get count() {
				return this.#count;
			}

			increment = () => {
				this.#count += 1;
			};
		}

		const counter = new Counter();

		$$renderer.push(`<button>clicks: ${$.escape(counter.count)}</button>`);
	});
}