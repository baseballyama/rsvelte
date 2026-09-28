import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			#count = 1;

			bump(other) {
				other.#count++;
			}

			drop(other) {
				--other.#count;
			}

			getCount() {
				return this.#count;
			}
		}

		const a = new Counter();
		const b = new Counter();

		$$renderer.push(`<button>${$.escape(b.getCount())}</button> <button>drop</button>`);
	});
}