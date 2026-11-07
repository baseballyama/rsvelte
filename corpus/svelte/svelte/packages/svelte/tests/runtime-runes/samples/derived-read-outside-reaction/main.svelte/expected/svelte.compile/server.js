import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Item {
			#product;

			get product() {
				return this.#product();
			}

			set product($$value) {
				return this.#product($$value);
			}

			constructor(n) {
				this.#product = $.derived(() => multiplier * n);
			}
		}

		let numbers = [1, 2, 3];
		let multiplier = 1;
		let items = $.derived(() => numbers.map((n) => new Item(n)));
		let products = $.derived(() => items().map((item) => item.product));

		$$renderer.push(`<button>+1</button> <button>add number</button> <p>${$.escape(
			// this is load-bearing — by reading it outside a reaction, we recompute
			// `products`, removing it as a reaction from `Item.product` dependencies,
			// but we don't add it as a reaction to the new `Item.product` dependencies
			products().join(', ')
		)}</p>`);
	});
}