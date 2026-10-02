import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List from './List.svelte';
import Item from './Item.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <button>Change Selection</button>`, 1);

export default function Main($$anchor) {
	let selectedIndex = $.state(0);
	let selectedValue = $.derived(() => `${$.get(selectedIndex)}`);

	const changeSelection = () => {
		$.set(selectedIndex, ($.get(selectedIndex) + 1) % 3);
	};

	var fragment = root_1();
	var node = $.first_child(fragment);

	List(node, {
		get selectedValue() {
			return $.get(selectedValue);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Item(node_1, {
				value: '0',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('First');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Item(node_2, {
				value: '1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Second');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Item(node_3, {
				value: '2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Third');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var button = $.sibling(node, 2);

	$.delegated('click', button, changeSelection);
	$.append($$anchor, fragment);
}

$.delegate(['click']);