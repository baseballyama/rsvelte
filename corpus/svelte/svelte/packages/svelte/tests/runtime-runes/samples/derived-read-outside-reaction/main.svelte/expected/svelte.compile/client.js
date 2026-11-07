import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>+1</button> <button>add number</button> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Item {
		#product;

		get product() {
			return $.get(this.#product);
		}

		set product(value) {
			$.set(this.#product, value);
		}

		constructor(n) {
			this.#product = $.derived(() => $.get(multiplier) * n);
		}
	}

	let numbers = $.proxy([1, 2, 3]);
	let multiplier = $.state(1);
	let items = $.derived(() => numbers.map((n) => new Item(n)));
	let products = $.derived(() => $.get(items).map((item) => item.product));
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	var // this is load-bearing — by reading it outside a reaction, we recompute
	// `products`, removing it as a reaction from `Item.product` dependencies,
	// but we don't add it as a reaction to the new `Item.product` dependencies
	p = $.sibling(button_1, 2);

	var text = $.only_child(p, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => $.get(products).join(', ')]);

	$.delegated('click', button, () => {
		$.set(multiplier, $.get(multiplier) + 1);
	});

	$.delegated('click', button_1, () => {
		numbers.push(numbers.length + 1);

		// this is load-bearing — by reading it outside a reaction, we recompute
		// `products`, removing it as a reaction from `Item.product` dependencies,
		// but we don't add it as a reaction to the new `Item.product` dependencies
		$.get(products);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);