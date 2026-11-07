import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count = 0;
			#count = 0;
			increment = () => this.#count += 1;

			get secretCount() {
				return this.#count;
			}
		}

		const counter = new Counter();

		$$renderer.push(`<button>${$.escape(counter.count)}</button> <button>${$.escape(counter.secretCount)}</button>`);
	});
}