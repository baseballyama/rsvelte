import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			#count;

			constructor() {
				const instance = this;

				instance.#count = 1;
			}

			get count() {
				return this.#count;
			}

			get count2() {
				const instance = this;

				return instance.#count;
			}
		}

		const counter = new Counter();

		;;
		;;
	});
}