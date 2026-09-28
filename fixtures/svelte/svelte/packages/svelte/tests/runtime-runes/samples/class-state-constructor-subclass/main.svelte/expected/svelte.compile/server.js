import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			constructor(initial) {
				this.count = initial;
			}

			increment = () => {
				this.count++;
			};
		}

		class PluggableCounter extends Counter {
			#custom;

			get custom() {
				return this.#custom();
			}

			set custom($$value) {
				return this.#custom($$value);
			}

			constructor(initial, plugin) {
				super(initial);
				this.#custom = $.derived(() => plugin(this.count));
			}
		}

		const counter = new PluggableCounter(10, (count) => count * 2);

		$$renderer.push(`<button>${$.escape(counter.count)}: ${$.escape(counter.custom)}</button>`);
	});
}