import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>add item</button> <button>make span</button> <button>reverse</button> <!>`, 1);

export default function Main($$anchor) {
	let items = $.proxy([]);

	function add_item() {
		items.push({
			id: items.length,
			text: 'Item ' + (items.length + 1),
			html: '<div>Item ' + (items.length + 1) + '</div>',
			dom: null
		});
	}

	function make_span() {
		items.forEach((item) => {
			item.html = item.html.replace(/div/g, 'span');
		});
	}

	function reverse() {
		items.reverse();
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var node = $.sibling(button_2, 2);

	$.each(node, 17, () => items, (item) => item.id, ($$anchor, item) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.html(node_1, () => $.get(item).html);
		$.append($$anchor, fragment_1);
	});

	$.event('click', button, add_item);
	$.event('click', button_1, make_span);
	$.event('click', button_2, reverse);
	$.append($$anchor, fragment);
}