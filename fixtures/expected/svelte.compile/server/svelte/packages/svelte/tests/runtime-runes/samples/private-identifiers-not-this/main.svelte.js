import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Box {
			#value = 0;

			get value() {
				return this.#value;
			}

			constructor(num) {
				this.#value = num;
			}

			swap(other) {
				const value = this.#value;

				this.#value = other.value;
				other.#value = value;
			}
		}

		const a = new Box(42);
		const b = new Box(1337);

		$$renderer.push(`<p>${$.escape(a.value)}</p> <p>${$.escape(b.value)}</p> <button></button>`);
	});
}