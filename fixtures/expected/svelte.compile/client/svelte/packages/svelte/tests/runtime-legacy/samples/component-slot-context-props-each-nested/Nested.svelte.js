import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Nested($$anchor, $$props) {
	let keys = ['a', 'b'];
	let items = ['c', 'd'];

	function setKey(key, value, item) {
		console.log(`setKey(${key}, ${value}, ${item})`);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, (item) => item, ($$anchor, item) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.each(node_1, 16, () => keys, (key) => key, ($$anchor, key) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.slot(
				node_2,
				$$props,
				'default',
				{
					get key() {
						return key;
					},

					get item() {
						return item;
					},
					set: (value) => setKey(key, value, item)
				},
				null
			);

			$.append($$anchor, fragment_2);
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}