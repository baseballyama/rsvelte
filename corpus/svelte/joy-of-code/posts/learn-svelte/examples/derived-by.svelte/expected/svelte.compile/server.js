import * as $ from 'svelte/internal/server';

export default function Derived_by($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let cart = [{ item: '🍎', total: 10 }, { item: '🍌', total: 10 }];

		let total = $.derived(() => {
			let sum = 0;

			for (let item of cart) {
				sum += item.total;
			}

			return sum;
		});

		let price = (Math.random() * 100).toFixed();

		$$renderer.push(`<div class="container svelte-7s141g"><div class="svelte-7s141g"><h2 class="svelte-7s141g">Random Item</h2> <p class="svelte-7s141g">Price: ${$.escape(price)}€</p> <button class="svelte-7s141g">Add to cart</button></div> <hr class="svelte-7s141g"/> <b class="svelte-7s141g">Total: ${$.escape(total())}€</b></div>`);
	});
}