import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			#doubled;

			get doubled() {
				return this.#doubled();
			}

			set doubled($$value) {
				return this.#doubled($$value);
			}

			#count;

			constructor(initial) {
				this.#count = initial;
				this.#doubled = $.derived(() => this.#count * 2);
			}

			increment = () => {
				this.#count++;
			};
		}

		const counter = new Counter(10);

		$$renderer.push(`<button>${$.escape(counter.doubled)}</button>`);
	});
}