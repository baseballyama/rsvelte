import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, $.index, ($$anchor, item) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.slot(
			node_1,
			$$props,
			'default',
			{
				get a() {
					return item;
				}
			},
			($$anchor) => {
				var text = $.text('Hello');

				$.append($$anchor, text);
			}
		);

		$.append($$anchor, fragment_1);
	});

	var node_2 = $.sibling(node, 2);

	$.each(node_2, 16, () => items2, $.index, ($$anchor, $$item) => {
		let a = () => $$item.a;
		var fragment_2 = $.comment();
		var node_3 = $.first_child(fragment_2);

		$.slot(
			node_3,
			$$props,
			'second',
			{
				get a() {
					return a();
				}
			},
			($$anchor) => {
				var text_1 = $.text('Hello');

				$.append($$anchor, text_1);
			}
		);

		$.append($$anchor, fragment_2);
	});

	$.append($$anchor, fragment);
}