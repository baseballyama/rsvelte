import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Table from './Table.svelte';

const header = ($$anchor) => {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
};

const row = ($$anchor, d = $.noop) => {
	var fragment_1 = root_1();
	var td = $.first_child(fragment_1);
	var text = $.only_child(td, true);
	var td_1 = $.sibling(td, 2);
	var text_1 = $.only_child(td_1, true);
	var td_2 = $.sibling(td_1, 2);
	var text_2 = $.only_child(td_2, true);
	var td_3 = $.sibling(td_2, 2);
	var text_3 = $.only_child(td_3, true);

	$.template_effect(() => {
		$.set_text(text, d().name);
		$.set_text(text_1, d().qty);
		$.set_text(text_2, d().price);
		$.set_text(text_3, d().qty * d().price);
	});

	$.append($$anchor, fragment_1);
};

var root = $.from_html(`<th>fruit</th> <th>qty</th> <th>price</th> <th>total</th>`, 1);
var root_1 = $.from_html(`<td> </td> <td> </td> <td> </td> <td> </td>`, 1);

export default function _6_passing_snippets_to_components_input($$anchor) {
	const fruits = [
		{ name: 'apples', qty: 5, price: 2 },
		{ name: 'bananas', qty: 10, price: 1 },
		{ name: 'cherries', qty: 20, price: 0.5 }
	];

	Table($$anchor, {
		get data() {
			return fruits;
		},

		get header() {
			return header;
		},

		get row() {
			return row;
		}
	});
}