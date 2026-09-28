import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-7s141g"><div class="svelte-7s141g"><h2 class="svelte-7s141g">Random Item</h2> <p class="svelte-7s141g"> </p> <button class="svelte-7s141g">Add to cart</button></div> <hr class="svelte-7s141g"/> <b class="svelte-7s141g"> </b></div>`);

export default function Derived_by($$anchor, $$props) {
	$.push($$props, true);

	let cart = $.proxy([{ item: '🍎', total: 10 }, { item: '🍌', total: 10 }]);

	let total = $.derived(() => {
		let sum = 0;

		for (let item of cart) {
			sum += item.total;
		}

		return sum;
	});

	let price = $.state($.proxy((Math.random() * 100).toFixed()));
	var div = root();
	var div_1 = $.child(div);
	var p = $.sibling($.child(div_1), 2);
	var text = $.only_child(p);
	var button = $.sibling(p, 2);

	$.reset(div_1);

	var b = $.sibling(div_1, 4);
	var text_1 = $.only_child(b);

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `Price: ${$.get(price) ?? ''}€`);
		$.set_text(text_1, `Total: ${$.get(total) ?? ''}€`);
	});

	$.delegated('click', button, () => {
		cart.push({ item: '🍌', total: +$.get(price) });
		$.set(price, (Math.random() * 100).toFixed(), true);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);