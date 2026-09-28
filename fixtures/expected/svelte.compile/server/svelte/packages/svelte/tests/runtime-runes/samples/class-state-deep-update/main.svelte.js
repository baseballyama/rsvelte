import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			container = { count: -1 };
			#private = { count: -1 };

			constructor(initial_count) {
				this.container.count = initial_count;
				this.#private.count = initial_count;
			}

			increment() {
				this.container.count += 1;
				this.#private.count += 1;
			}

			get private_count() {
				return this.#private.count;
			}
		}

		const counter = new Counter(0);

		$$renderer.push(`<button>${$.escape(counter.container.count)} / ${$.escape(counter.private_count)}</button> <button>${$.escape(counter.container.count)} / ${$.escape(counter.private_count)}</button>`);
	});
}