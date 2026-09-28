import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Item from './item.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Main($$anchor) {
	let items = $.proxy([{ name: 'a' }, { name: 'b' }]);
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, (item) => item, ($$anchor, item, $$index) => {
		Item($$anchor, {
			get item() {
				return item;
			},

			get items() {
				return items;
			},
			onclick: () => (item.name = item.name + '+')
		});
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => items, (item) => item.name, ($$anchor, item, $$index_1) => {
		Item($$anchor, {
			get item() {
				return $.get(item);
			},

			get items() {
				return items;
			},
			onclick: () => ($.get(item).name = $.get(item).name + '+')
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => items, $.index, ($$anchor, item, $$index_2) => {
		Item($$anchor, {
			get item() {
				return $.get(item);
			},

			get items() {
				return items;
			},
			onclick: () => ($.get(item).name = $.get(item).name + '+')
		});
	});

	$.append($$anchor, fragment);
}