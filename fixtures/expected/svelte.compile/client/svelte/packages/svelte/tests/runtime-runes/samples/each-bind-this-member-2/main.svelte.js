import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button>add item</button> <button>clear</button> <!>`, 1);

export default function Main($$anchor) {
	let items = $.state($.proxy([]));

	function add_item() {
		$.get(items).push({
			id: $.get(items).length,
			text: 'Item ' + ($.get(items).length + 1),
			dom: null
		});
	}

	function clear() {
		$.set(items, [], true);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	$.each(node, 19, () => $.get(items), (item) => item.id, ($$anchor, item, index) => {
		Child($$anchor, {
			get item() {
				return $.get(items)[$.get(index)];
			},

			set item($$value) {
				$.get(items)[$.get(index)] = $$value;
			}
		});
	});

	$.event('click', button, add_item);
	$.event('click', button_1, clear);
	$.append($$anchor, fragment);
}