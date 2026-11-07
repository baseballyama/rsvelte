import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, $.index, ($$anchor, items) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.slot(
			node_1,
			$$props,
			'default',
			{
				get a() {
					return items;
				}
			},
			($$anchor) => {
				var text = $.text('Hello');

				$.append($$anchor, text);
			}
		);

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}